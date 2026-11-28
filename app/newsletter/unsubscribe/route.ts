import { db } from "@/lib/db";
import { readNewsletterToken } from "@/lib/newsletter-tokens";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex, nofollow", "Content-Type": "text/html; charset=utf-8", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'" };
function page(body: string, status = 200) {
  return new Response(`<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mahesh Labs newsletter</title></head><body style="font:18px/1.6 system-ui;color:#15223b;max-width:560px;margin:12vh auto;padding:24px"><p style="font-weight:700;color:#2463df">Mahesh Labs</p>${body}<p><a href="/">Back to Mahesh Labs</a></p></body></html>`, { status, headers });
}
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") || "";
  if (!readNewsletterToken(token, "unsubscribe")) return page("<h1>Link unavailable.</h1><p>Please use the unsubscribe link in your latest email.</p>", 400);
  // Email security scanners follow GET links. Only an explicit POST changes status.
  return page('<h1>Unsubscribe?</h1><p>You will stop receiving newsletters and subscriber early-access links.</p><form method="post"><button style="font:inherit;border:0;border-radius:8px;background:#2463df;color:white;padding:12px 20px">Unsubscribe</button></form>');
}
export async function POST(request: Request) {
  const data = readNewsletterToken(new URL(request.url).searchParams.get("token") || "", "unsubscribe");
  if (!data) return page("<h1>Link unavailable.</h1><p>Please use the unsubscribe link in your latest email.</p>", 400);
  await db().query("UPDATE newsletter_subscribers SET status='unsubscribed',unsubscribed_at=COALESCE(unsubscribed_at,now()),updated_at=now() WHERE id=$1", [data.subscriber]);
  return page("<h1>You’re unsubscribed.</h1><p>You will no longer receive Mahesh Labs newsletters. Thank you for being part of the journey.</p>");
}
