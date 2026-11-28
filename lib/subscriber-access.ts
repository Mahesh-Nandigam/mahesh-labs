import "server-only";
import { cookies } from "next/headers";
import { db } from "./db";
import { readNewsletterToken, subscriberCookie } from "./newsletter-tokens";
import { isEarlyAccessOpen } from "./episode-release";
import type { Episode } from "./episodes";

export async function getSubscriberEpisode(number: number): Promise<Episode | null> {
  const value = (await cookies()).get(subscriberCookie)?.value || "";
  const token = readNewsletterToken(value, "reader");
  if (!token || token.episode !== number) return null;
  const result = await db().query(
    "SELECT e.content FROM studio_episodes e WHERE e.number=$1 AND e.published=true AND EXISTS(SELECT 1 FROM newsletter_subscribers s WHERE s.id=$2 AND s.status='subscribed')",
    [number, token.subscriber],
  );
  const episode = result.rows[0]?.content as Episode | undefined;
  return episode && isEarlyAccessOpen(episode) ? { ...episode, teaser: undefined, teaserDuration: undefined } : null;
}
