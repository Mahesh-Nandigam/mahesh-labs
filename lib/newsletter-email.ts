import "server-only";
import { emailSchema } from "./studio-validation";
import { tokenSecret } from "./newsletter-tokens";

export class EmailDeliveryError extends Error {
  constructor(message: string, public uncertain = false) { super(message); }
}

export function emailConfiguration() {
  const missing: string[] = [];
  if (process.env.EMAIL_PROVIDER !== "resend") missing.push("EMAIL_PROVIDER=resend");
  if (!process.env.EMAIL_API_KEY) missing.push("EMAIL_API_KEY");
  if (!emailSchema.safeParse(process.env.EMAIL_FROM).success) missing.push("EMAIL_FROM");
  if (process.env.EMAIL_REPLY_TO && !emailSchema.safeParse(process.env.EMAIL_REPLY_TO).success) missing.push("EMAIL_REPLY_TO");
  try { tokenSecret(); } catch { missing.push("NEWSLETTER_TOKEN_SECRET (32+ characters)"); }
  try {
    const origin = new URL(process.env.NEXT_PUBLIC_SITE_URL || "");
    if (origin.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1"].includes(origin.hostname))) throw new Error();
    if (origin.username || origin.password || origin.search || origin.hash || origin.pathname !== "/") throw new Error();
  } catch { missing.push("NEXT_PUBLIC_SITE_URL (site origin)"); }
  return { ready: missing.length === 0, missing };
}

export function requireEmailConfiguration() {
  const config = emailConfiguration();
  if (!config.ready) throw new EmailDeliveryError("Email delivery is not configured. Check Studio settings.");
}

export async function sendNewsletterEmail(message: {
  to: string; subject: string; html: string; text: string; key: string; unsubscribeUrl?: string;
}) {
  requireEmailConfiguration();
  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.EMAIL_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": message.key },
      body: JSON.stringify({
        from: `Mahesh Labs <${process.env.EMAIL_FROM}>`, to: [message.to], subject: message.subject,
        html: message.html, text: message.text,
        ...(process.env.EMAIL_REPLY_TO ? { reply_to: process.env.EMAIL_REPLY_TO } : {}),
        ...(message.unsubscribeUrl ? { headers: { "List-Unsubscribe": `<${message.unsubscribeUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } } : {}),
      }),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new EmailDeliveryError("The provider response was interrupted. Check delivery in the provider dashboard before resending.", true);
  }
  // A server error can happen after acceptance. Never blindly retry that outcome.
  if (!response.ok) throw new EmailDeliveryError(`Email provider returned HTTP ${response.status}.`, response.status >= 500 || response.status === 408 || response.status === 409);
  const data = await response.json().catch(() => null);
  if (typeof data?.id !== "string") throw new EmailDeliveryError("The provider response did not confirm acceptance.", true);
  return data.id as string;
}
