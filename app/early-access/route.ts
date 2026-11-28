import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readNewsletterToken, signNewsletterToken, subscriberCookie } from "@/lib/newsletter-tokens";
import { isEarlyAccessOpen, releaseTime } from "@/lib/episode-release";
import type { Episode } from "@/lib/episodes";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const data = readNewsletterToken(new URL(request.url).searchParams.get("token") || "", "access");
  const headers = { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex, nofollow" };
  if (!data) return new Response("This early-access link is invalid or has expired. Please use the latest email from Mahesh Labs.", { status: 410, headers });
  const result = await db().query("SELECT e.content FROM studio_episodes e WHERE e.number=$1 AND e.published=true AND EXISTS(SELECT 1 FROM newsletter_subscribers WHERE id=$2 AND status='subscribed')", [data.episode, data.subscriber]);
  const episode = result.rows[0]?.content as Episode | undefined;
  if (!episode) return new Response("This early-access link is no longer available.", { status: 410, headers });
  const release = releaseTime(episode);
  if (release > Date.now() && !isEarlyAccessOpen(episode)) return new Response("Subscriber access opens 24 hours before the public release. Please return then.", { status: 403, headers });
  const response = NextResponse.redirect(new URL(`/episodes/${data.episode}/`, request.url), { status: 303, headers });
  if (isEarlyAccessOpen(episode)) {
    const expires = Math.min(release, data.expires!);
    response.cookies.set(subscriberCookie, signNewsletterToken({ purpose: "reader", subscriber: data.subscriber, episode: data.episode, expires }), {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: new Date(expires),
    });
  }
  return response;
}
