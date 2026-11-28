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
  publicReleaseAt?: string;
  externalPlayback?: boolean;
  teaser?: string;
  teaserDuration?: number;
  chapters: Chapter[];
  links: { name: string; url: string }[];
}

export const channelUrl = "https://www.youtube.com/@MAHESHNANDIGAM-t9z";
export const subscribeUrl = `${channelUrl}?sub_confirmation=1`;
export const episodePath = (number: number) => `/episodes/${number}/`;
export const videoUrl = (episode: Episode, seconds = 0) => {
  if (!episode.videoId) return null;
  return `https://www.youtube.com/watch?v=${episode.videoId}${seconds ? `&t=${seconds}s` : ""}`;
};
export const sortEpisodes = (episodes: Episode[]) =>
  [...episodes].sort(
    (a, b) =>
      Number(Boolean(a.videoId)) - Number(Boolean(b.videoId)) ||
      b.number - a.number,
  );

export interface ChapterMatch {
  episode: Episode;
  chapter: Chapter;
}

export function findChapters(
  query: string,
  episodes: Episode[],
): ChapterMatch[] {
  const term = query.trim().toLowerCase();
  const chapters = episodes
    .filter((episode) => episode.videoId)
    .flatMap((episode) =>
      episode.chapters.map((chapter) => ({ episode, chapter })),
    );
  if (!term) {
    const featured: [string, number][] = [
      ["4rsdSg4dU9g", 1452],
      ["kMeQgxn6R4w", 1994],
      ["4rsdSg4dU9g", 4042],
    ];
    return featured.flatMap(([videoId, seconds]) =>
      chapters.filter(
        (item) =>
          item.episode.videoId === videoId && item.chapter.seconds === seconds,
      ),
    );
  }
  return chapters.filter(({ episode, chapter }) => {
    const text = `${chapter.title} ${episode.guest}`.toLowerCase();
    return term === "ai" ? /\bai\b/.test(text) : text.includes(term);
  });
}
