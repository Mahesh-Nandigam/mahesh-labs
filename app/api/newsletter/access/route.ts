import { z } from "zod";
import { createHash } from "node:crypto";
import { apiError, assertSameOrigin, HttpError, rateLimit } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { emailSchema, readJson, type NewsletterDraft } from "@/lib/studio-validation";
import { isEarlyAccessOpen, releaseTime, earlyAccessWindow } from "@/lib/episode-release";
import { EmailDeliveryError, requireEmailConfiguration, sendNewsletterEmail } from "@/lib/newsletter-email";
import { newsletterTemplate } from "@/lib/newsletter-template";
import { signNewsletterToken } from "@/lib/newsletter-tokens";
import type { Episode } from "@/lib/episodes";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const parsed = z.object({ email: emailSchema, episode: z.number().int().positive() }).safeParse(await readJson(request));
    if (!parsed.success) throw new HttpError(400, "Enter your newsletter email address.");
    requireEmailConfiguration();
    await rateLimit(request, "subscriber-access-ip", 5, 600);
    await rateLimit(request, "subscriber-access-email", 2, 3600, parsed.data.email);
    const result = await db().query("SELECT content FROM studio_episodes WHERE number=$1 AND published=true", [parsed.data.episode]);
    const episode = result.rows[0]?.content as Episode | undefined;
    if (!episode || !isEarlyAccessOpen(episode)) throw new HttpError(400, "This episode is not currently in its early-access window.");
    const subscriber = await db().query("SELECT id FROM newsletter_subscribers WHERE email=$1 AND status='subscribed'", [parsed.data.email]);
    if (subscriber.rowCount) {
      const id = subscriber.rows[0].id as string;
      const origin = process.env.NEXT_PUBLIC_SITE_URL!.replace(/\/$/, "");
      const token = signNewsletterToken({ purpose: "access", subscriber: id, episode: episode.number, expires: releaseTime(episode) + 7 * earlyAccessWindow });
      const unsubscribeUrl = `${origin}/newsletter/unsubscribe/?token=${signNewsletterToken({ purpose: "unsubscribe", subscriber: id })}`;
      const draft: NewsletterDraft = { id: "", updatedAt: "", title: "Requested early access", subject: `Your early access: ${episode.title}`, preheader: "Your subscriber link is inside.", body: `Here is your requested early access to our conversation with ${episode.guest || "our guest"}.\n\nThank you for being part of Mahesh Labs.`, earlyAccessUrl: "", earlyAccessEpisode: episode.number, status: "draft" };
      const key = createHash("sha256").update(`access:${id}:${episode.number}:${Math.floor(Date.now() / 3600000)}`).digest("hex");
      await sendNewsletterEmail({ to: parsed.data.email, ...newsletterTemplate(draft, { watchUrl: `${origin}/early-access/?token=${token}`, unsubscribeUrl }), unsubscribeUrl, key: `access/${key}` });
    }
    return Response.json({ message: "If this address is subscribed, an access link is on its way. Check your inbox and spam folder. New here? Join the newsletter first, then request your link." });
  } catch (error) {
    if (error instanceof EmailDeliveryError) return apiError(new HttpError(503, error.message));
    return apiError(error);
  }
}
