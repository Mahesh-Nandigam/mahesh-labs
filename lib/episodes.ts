import records from "@/content/episodes.json";

export interface Chapter {
  time: string;
  seconds: number;
  title: string;
}

export interface Episode {
  number: number;
  guest: string | null;
  title: string;
  description: string;
  topics: string[];
  role: string;
  image: string;
  videoId: string | null;
  duration: string;
  status: string;
  externalPlayback?: boolean;
  teaser?: string;
  teaserDuration?: number;
  chapters: Chapter[];
  links: { name: string; url: string }[];
}

export const episodes: Episode[] = records;
export const channelUrl = "https://www.youtube.com/@MAHESHNANDIGAM-t9z";
export const subscribeUrl = `${channelUrl}?sub_confirmation=1`;
export const episodePath = (number: number) => `/episodes/${number}/`;
export const videoUrl = (episode: Episode, seconds = 0) => {
  if (!episode.videoId) return null;
  return `https://www.youtube.com/watch?v=${episode.videoId}${seconds ? `&t=${seconds}s` : ""}`;
};
export const getEpisode = (number: number) => episodes.find((episode) => episode.number === number);
export const sortedEpisodes = [...episodes].sort((a, b) =>
  Number(Boolean(a.videoId)) - Number(Boolean(b.videoId)) || b.number - a.number,
);

export interface ChapterMatch {
  episode: Episode;
  chapter: Chapter;
}

export function findChapters(query: string): ChapterMatch[] {
  const term = query.trim().toLowerCase();
  const chapters = episodes.filter((episode) => episode.videoId).flatMap((episode) =>
    episode.chapters.map((chapter) => ({ episode, chapter })),
  );
  if (!term) {
    const featured = [
      [3, 1452],
      [2, 1994],
      [3, 4042],
    ];
    return featured.flatMap(([episodeNumber, seconds]) =>
      chapters.filter((item) => item.episode.number === episodeNumber && item.chapter.seconds === seconds),
    );
  }
  return chapters.filter(({ episode, chapter }) => {
    const text = `${chapter.title} ${episode.guest}`.toLowerCase();
    return term === "ai" ? /\bai\b/.test(text) : text.includes(term);
  });
}
