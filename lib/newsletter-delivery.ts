import "server-only";
import { db } from "./db";
import { draftSchema, type NewsletterDraft } from "./studio-validation";
import { HttpError } from "./admin-auth";
import { emailConfiguration, EmailDeliveryError, requireEmailConfiguration, sendNewsletterEmail } from "./newsletter-email";
import { newsletterTemplate } from "./newsletter-template";
import { signNewsletterToken } from "./newsletter-tokens";
import { earlyAccessWindow, releaseTime } from "./episode-release";
import type { Episode } from "./episodes";

export async function loadNewsletter(id: string) {
  const result = await db().query('SELECT id,title,subject,preheader,body,early_access_url AS "earlyAccessUrl",early_access_episode AS "earlyAccessEpisode",status,updated_at::text AS "updatedAt" FROM newsletter_drafts WHERE id=$1', [id]);
  const row = result.rows[0];
  if (!row) throw new HttpError(404, "Newsletter not found.");
  return { ...draftSchema.parse(row), id: row.id, updatedAt: row.updatedAt } as NewsletterDraft;
}

async function scheduledEpisode(number: number) {
  const result = await db().query("SELECT content FROM studio_episodes WHERE number=$1 AND published=true", [number]);
  const episode = result.rows[0]?.content as Episode | undefined;
  if (!episode?.videoId || !releaseTime(episode)) throw new HttpError(400, "Choose a published episode with a full video and a public release time.");
  return episode;
}

export async function queueNewsletter(id: string, revision: string, sendAt?: string) {
  requireEmailConfiguration();
  const draft = await loadNewsletter(id);
  if (draft.updatedAt !== revision) throw new HttpError(409, "This draft changed. Save and reload before sending.");
  if (draft.status !== "draft" || !draft.subject.trim() || !draft.body.trim()) throw new HttpError(400, "A draft needs a subject and letter before sending.");
  let when = sendAt ? Date.parse(sendAt) : Date.now();
  if (!Number.isFinite(when) || when < Date.now() - 60000) throw new HttpError(400, "Choose a future send time.");
  when = Math.max(when, Date.now());
  if (draft.earlyAccessEpisode) {
    if (draft.earlyAccessUrl) throw new HttpError(400, "Choose an episode or a custom link, rather than both.");
    const episode = await scheduledEpisode(draft.earlyAccessEpisode);
    const release = releaseTime(episode);
    if (!sendAt) when = Math.max(when, release - earlyAccessWindow);
    if (when < release - earlyAccessWindow || when >= release) throw new HttpError(400, "Send early-access emails within the 24 hours before public release.");
  }
  if (when > Date.now() + 60000 && !(await deliverySetup()).schedulerConfigured)
    throw new HttpError(503, "Connect the email scheduler in Settings before scheduling a delivery. You can send manually during the early-access window.");
  // Freeze the letter and recipient list together. A repeated click for the same
  // saved revision returns the existing campaign instead of duplicating it.
  const result = await db().query(`WITH campaign AS (
    INSERT INTO newsletter_campaigns(draft_id,draft_revision,snapshot,send_at)
    SELECT id,updated_at::text,$3::jsonb,$4::timestamptz FROM newsletter_drafts WHERE id=$1 AND updated_at=$2::timestamptz
      AND NOT EXISTS(SELECT 1 FROM newsletter_campaigns WHERE draft_id=$1 AND status IN ('queued','paused'))
    ON CONFLICT DO NOTHING RETURNING id
  ), recipients AS (
    INSERT INTO newsletter_deliveries(campaign_id,subscriber_id)
    SELECT campaign.id,s.id FROM campaign CROSS JOIN newsletter_subscribers s WHERE s.status='subscribed' RETURNING id
  ) SELECT campaign.id,(SELECT count(*) FROM recipients) AS recipients FROM campaign`, [id, revision, JSON.stringify(draft), new Date(when).toISOString()]);
  if (result.rowCount) return { id: result.rows[0].id, recipients: Number(result.rows[0].recipients), sendAt: new Date(when).toISOString() };
  const previous = await db().query("SELECT id,send_at FROM newsletter_campaigns WHERE draft_id=$1 AND draft_revision=$2 ORDER BY created_at DESC LIMIT 1", [id, revision]);
  if (!previous.rowCount) throw new HttpError(409, "This draft changed or an earlier delivery is still queued or paused. Reload, then finish or cancel the earlier delivery before queuing again.");
  return { id: previous.rows[0].id, existing: true, sendAt: new Date(previous.rows[0].send_at).toISOString() };
}

export async function newsletterCampaigns(id: string) {
  const result = await db().query(`SELECT c.id,c.status,c.send_at::text AS "sendAt",c.created_at::text AS "createdAt",
    count(d.id)::int AS total,count(d.id) FILTER(WHERE d.status='accepted')::int AS accepted,
    count(d.id) FILTER(WHERE d.status IN ('pending','sending'))::int AS pending,
    count(d.id) FILTER(WHERE d.status='failed')::int AS failed,
    count(d.id) FILTER(WHERE d.status='unknown')::int AS unknown,
    count(d.id) FILTER(WHERE d.status='skipped')::int AS skipped,
    COALESCE(array_agg(DISTINCT d.last_error) FILTER(WHERE d.last_error IS NOT NULL),'{}') AS errors
    FROM newsletter_campaigns c LEFT JOIN newsletter_deliveries d ON d.campaign_id=c.id WHERE c.draft_id=$1 GROUP BY c.id ORDER BY c.created_at DESC LIMIT 10`, [id]);
  return result.rows as CampaignSummary[];
}
export type CampaignSummary = { id: string; status: string; sendAt: string; createdAt: string; total: number; accepted: number; pending: number; failed: number; unknown: number; skipped: number; errors: string[] };

export async function processNewsletterQueue(campaignId?: string) {
  requireEmailConfiguration();
  const started = Date.now();
  const totals = { accepted: 0, failed: 0, unknown: 0, skipped: 0 };
  // An interrupted request may have reached the provider. Surface it for review;
  // do not automatically reclaim and resend an ambiguous delivery.
  await db().query("UPDATE newsletter_deliveries SET status='unknown',last_error='Delivery interrupted. Check the provider dashboard before resending.' WHERE status='sending' AND claimed_at<now()-interval '10 minutes'");
  for (let i = 0; i < 5 && Date.now() - started < 35000; i++) {
    const result = await db().query(`WITH next AS (
      SELECT d.id FROM newsletter_deliveries d JOIN newsletter_campaigns c ON c.id=d.campaign_id
      WHERE d.status='pending' AND c.status='queued' AND c.send_at<=now() AND ($1::uuid IS NULL OR c.id=$1::uuid)
      ORDER BY c.send_at,d.id FOR UPDATE OF d SKIP LOCKED LIMIT 1
    ) UPDATE newsletter_deliveries d SET status='sending',claimed_at=now() FROM next WHERE d.id=next.id
    RETURNING d.id,d.campaign_id,d.subscriber_id`, [campaignId || null]);
    if (!result.rowCount) break;
    const delivery = result.rows[0];
    let status: keyof typeof totals = "unknown";
    let error = "";
    let acceptedByProvider = false;
    try {
      // Recheck suppression and cancellation immediately before contacting the provider.
      const current = await db().query("SELECT c.snapshot,c.status,s.email,s.status AS subscriber_status FROM newsletter_campaigns c JOIN newsletter_subscribers s ON s.id=$2 WHERE c.id=$1", [delivery.campaign_id, delivery.subscriber_id]);
      const row = current.rows[0];
      if (!row || row.status !== "queued" || row.subscriber_status !== "subscribed") {
        status = "skipped";
      } else {
        const draft = row.snapshot as NewsletterDraft;
        const origin = process.env.NEXT_PUBLIC_SITE_URL!.replace(/\/$/, "");
        const unsubscribeUrl = `${origin}/newsletter/unsubscribe/?token=${signNewsletterToken({ purpose: "unsubscribe", subscriber: delivery.subscriber_id })}`;
        let watchUrl: string | undefined;
        if (draft.earlyAccessEpisode) {
          const episode = await scheduledEpisode(draft.earlyAccessEpisode);
          const release = releaseTime(episode);
          if (Date.now() < release - earlyAccessWindow || Date.now() >= release) throw new HttpError(400, "The episode is outside its early-access window. This delivery was stopped.");
          const token = signNewsletterToken({ purpose: "access", subscriber: delivery.subscriber_id, episode: episode.number, expires: release + 7 * earlyAccessWindow });
          watchUrl = `${origin}/early-access/?token=${token}`;
        }
        const content = newsletterTemplate(draft, { watchUrl, unsubscribeUrl });
        await sendNewsletterEmail({ to: row.email, ...content, key: `newsletter/${delivery.id}`, unsubscribeUrl });
        acceptedByProvider = true;
        status = "accepted";
      }
    } catch (e) {
      status = e instanceof HttpError || (e instanceof EmailDeliveryError && !e.uncertain) ? "failed" : "unknown";
      error = e instanceof HttpError || e instanceof EmailDeliveryError ? e.message : "Delivery interrupted. Check the provider dashboard before resending.";
    }
    // If this persistence fails after provider acceptance, the row stays 'sending'
    // and is later marked unknown, never automatically sent for a second time.
    await db().query("UPDATE newsletter_deliveries SET status=$2,last_error=$3,accepted_at=CASE WHEN $4 THEN now() ELSE NULL END WHERE id=$1", [delivery.id, status, error || null, acceptedByProvider]);
    totals[status]++;
    // Stop on provider trouble instead of failing the entire audience with bad credentials.
    if (status === "failed" || status === "unknown") {
      await db().query("UPDATE newsletter_campaigns SET status='paused' WHERE id=$1 AND status='queued'", [delivery.campaign_id]);
      break;
    }
  }
  await db().query(`UPDATE newsletter_campaigns c SET status='completed',completed_at=now()
    WHERE c.status='queued' AND c.send_at<=now() AND NOT EXISTS(SELECT 1 FROM newsletter_deliveries d WHERE d.campaign_id=c.id AND d.status IN ('pending','sending'))`);
  return totals;
}

export async function deliverySetup() {
  return { ...emailConfiguration(), schedulerConfigured: Boolean(process.env.NEWSLETTER_SCHEDULER_ENABLED === "true" && process.env.CRON_SECRET && process.env.CRON_SECRET.length >= 32) };
}
