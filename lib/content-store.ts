import "server-only";
import { unstable_cache } from "next/cache";
import { db, contentCacheScope } from "./db";
import type { Episode } from "./episodes";
import seedEpisodes from "@/content/episodes.json";

export const getPublicEpisodes = unstable_cache(
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
export async function getPublicEpisode(number: number) {
  return (await getPublicEpisodes()).find(
    (episode) => episode.number === number,
  );
}
