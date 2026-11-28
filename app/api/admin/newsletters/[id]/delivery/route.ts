import { z } from "zod";
import { randomUUID } from "node:crypto";
import { apiError, HttpError, rateLimit, requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { emailSchema, readJson } from "@/lib/studio-validation";
import { deliverySetup, loadNewsletter, newsletterCampaigns, processNewsletterQueue, queueNewsletter } from "@/lib/newsletter-delivery";
import { EmailDeliveryError, sendNewsletterEmail } from "@/lib/newsletter-email";
import { newsletterTemplate } from "@/lib/newsletter-template";

const actions = z.discriminatedUnion("action", [
  z.object({ action: z.literal("test"), email: emailSchema, updatedAt: z.string() }),
  z.object({ action: z.literal("queue"), updatedAt: z.string(), sendAt: z.iso.datetime({ offset: true }).optional() }),
  z.object({ action: z.enum(["process", "cancel", "retry", "resume"]), campaignId: z.uuid() }),
]);
async function newsletterId(context: { params: Promise<{ id: string }> }) {
  const id = (await context.params).id;
  if (!z.uuid().safeParse(id).success) throw new HttpError(404, "Newsletter not found.");
  return id;
}
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const id = await newsletterId(context);
    await loadNewsletter(id);
    return Response.json({ setup: await deliverySetup(), campaigns: await newsletterCampaigns(id) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}
export const maxDuration = 60;
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const id = await newsletterId(context);
    const parsed = actions.safeParse(await readJson(request));
    if (!parsed.success) throw new HttpError(400, "Check the delivery details and try again.");
    const action = parsed.data;
    if (action.action === "test") {
      await rateLimit(request, "newsletter-test", 5, 600);
      const draft = await loadNewsletter(id);
      if (draft.updatedAt !== action.updatedAt) throw new HttpError(409, "Save and reload the draft before sending a test.");
      if (!draft.subject || !draft.body.trim()) throw new HttpError(400, "Add an email subject and letter first.");
      const watchUrl = draft.earlyAccessEpisode ? `${process.env.NEXT_PUBLIC_SITE_URL}/episodes/${draft.earlyAccessEpisode}/` : undefined;
      await sendNewsletterEmail({ to: action.email, ...newsletterTemplate(draft, { test: true, watchUrl }), key: `test/${randomUUID()}` });
      return Response.json({ message: "The provider accepted your test email. Check the inbox and spam folder. Test links do not unlock subscriber access." });
    }
    if (action.action === "queue") return Response.json(await queueNewsletter(id, action.updatedAt, action.sendAt));
    const campaigns = await db().query("SELECT id FROM newsletter_campaigns WHERE id=$1 AND draft_id=$2", [action.campaignId, id]);
    if (!campaigns.rowCount) throw new HttpError(404, "Delivery not found.");
    if (action.action === "process") return Response.json(await processNewsletterQueue(action.campaignId));
    if (action.action === "cancel") {
      await db().query("UPDATE newsletter_campaigns SET status='cancelled' WHERE id=$1 AND status IN ('queued','paused')", [action.campaignId]);
      await db().query("UPDATE newsletter_deliveries SET status='skipped' WHERE campaign_id=$1 AND status='pending'", [action.campaignId]);
    } else if (action.action === "resume") {
      await db().query("UPDATE newsletter_campaigns SET status='queued' WHERE id=$1 AND status='paused'", [action.campaignId]);
    } else {
      await db().query(`WITH reopened AS (
        UPDATE newsletter_campaigns SET status='queued',completed_at=NULL WHERE id=$1 AND status<>'cancelled'
        AND NOT EXISTS(SELECT 1 FROM newsletter_campaigns other WHERE other.draft_id=$2 AND other.status IN ('queued','paused') AND other.id<>$1) RETURNING id
      ) UPDATE newsletter_deliveries SET status='pending',last_error=NULL WHERE campaign_id IN(SELECT id FROM reopened) AND status='failed'`, [action.campaignId, id]);
    }
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof EmailDeliveryError) return apiError(new HttpError(503, error.message));
    return apiError(error);
  }
}
