import type { NewsletterDraft } from "./studio-validation";

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
export function newsletterTemplate(draft: NewsletterDraft, options: { watchUrl?: string; unsubscribeUrl?: string; test?: boolean }) {
  const subject = `${options.test ? "[Test] " : ""}${draft.subject}`;
  const paragraphs = draft.body.split(/\n\s*\n/).map((p) => `<p style="margin:0 0 20px;line-height:1.7">${escapeHtml(p).replace(/\n/g, "<br>")}</p>`).join("");
  const link = options.watchUrl || draft.earlyAccessUrl;
  const safeLink = link && /^https?:\/\//i.test(link) ? link : "";
  const footer = options.unsubscribeUrl
    ? `<a href="${escapeHtml(options.unsubscribeUrl)}" style="color:#52627a">Unsubscribe</a>`
    : "Test email · subscriber links are added to live deliveries.";
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f4f7fb;color:#15223b;font-family:Arial,sans-serif"><div style="display:none;max-height:0;overflow:hidden">${escapeHtml(draft.preheader)}</div><table role="presentation" style="width:100%;border-collapse:collapse"><tr><td style="padding:24px 12px"><table role="presentation" style="width:100%;max-width:600px;margin:auto;background:#fff;border-collapse:collapse"><tr><td style="padding:32px"><a href="${escapeHtml(process.env.NEXT_PUBLIC_SITE_URL || "https://maheshlabs.io")}" style="font-size:26px;font-weight:700;text-decoration:none;color:#15223b">Mahesh <span style="color:#2463df">Labs</span></a><h1 style="font-size:28px;line-height:1.25;margin:32px 0 24px">${escapeHtml(draft.subject)}</h1>${paragraphs}${safeLink ? `<p style="margin:28px 0"><a href="${escapeHtml(safeLink)}" style="display:inline-block;padding:14px 22px;background:#2463df;color:white;border-radius:8px;text-decoration:none">Watch early</a></p>` : ""}<p style="font-size:13px;line-height:1.6;color:#52627a;margin:36px 0 0">You signed up for Mahesh Labs news and early podcast access.<br>${footer}</p></td></tr></table></td></tr></table></body></html>`;
  const text = `${draft.body}${safeLink ? `\n\nWatch early: ${safeLink}` : ""}\n\n${options.unsubscribeUrl ? `Unsubscribe: ${options.unsubscribeUrl}` : "Test email · subscriber links are added to live deliveries."}`;
  return { subject, html, text };
}
