import "server-only";
import { unstable_cache } from "next/cache";
import { db, contentCacheScope } from "./db";
import type { Episode } from "./episodes";
import seedEpisodes from "@/content/episodes.json";
import { publicEpisode } from "./episode-release";
import { sortEpisodes } from "./episodes";

const getPublishedEpisodes = unstable_cache(
  async (): Promise<Episode[]> => {
    if (!process.env.DATABASE_URL) return seedEpisodes;
    const result = await db().query(
      "SELECT content FROM studio_episodes WHERE published=true ORDER BY (content->>'videoId' IS NOT NULL) ASC, number DESC",
    );
    return result.rows.map((row) => row.content);
  },
  ["public-episodes", contentCacheScope],
  { tags: ["episodes"], revalidate: 300 },
);
export async function getPublicEpisodes(): Promise<Episode[]> {
  // Apply the release boundary after the cache, so a cached private video never leaks
  // and a scheduled release does not wait for the content cache to expire.
  return sortEpisodes((await getPublishedEpisodes()).map((episode) => publicEpisode(episode)));
}
export async function getPublicEpisode(number: number) {
  return (await getPublicEpisodes()).find(
    (episode) => episode.number === number,
  );
}
