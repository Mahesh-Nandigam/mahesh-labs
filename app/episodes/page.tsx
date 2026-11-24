import type { Metadata } from "next";
import { EpisodeArchive } from "@/components/episode-archive";
import { getPublicEpisodes } from "@/lib/content-store";
import { sortEpisodes } from "@/lib/episodes";
export const metadata: Metadata = {
  title: "All conversations",
  description: "Browse every MaheshLabs podcast by guest, topic, or question.",
};
export default async function EpisodesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; topic?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q || "").slice(0, 200),
    topic = (params.topic || "All").slice(0, 60);
  const items = sortEpisodes(await getPublicEpisodes()).filter(
    (e) =>
      (topic === "All" || e.topics.includes(topic)) &&
      `${e.guest || ""} ${e.title} ${e.description} ${e.topics.join(" ")}`
        .toLowerCase()
        .includes(q.trim().toLowerCase()),
  );
  const requested = Number(params.page);
  const page = Math.min(
    Math.max(1, Math.ceil(items.length / 12)),
    Number.isSafeInteger(requested) && requested > 0 ? requested : 1,
  );
  return (
    <main id="main">
      <EpisodeArchive
        key={`${page}-${q}-${topic}`}
        episodes={items.slice((page - 1) * 12, page * 12)}
        initialQuery={q}
        initialTopic={topic}
        page={page}
        total={items.length}
      />
    </main>
  );
}
