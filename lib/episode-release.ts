import type { Episode } from "./episodes";

export const earlyAccessWindow = 24 * 60 * 60 * 1000;
export function releaseTime(episode: Episode) {
  return episode.publicReleaseAt ? Date.parse(episode.publicReleaseAt) : 0;
}
export function isEarlyAccessOpen(episode: Episode, now = Date.now()) {
  const release = releaseTime(episode);
  return Boolean(episode.videoId && release && now >= release - earlyAccessWindow && now < release);
}
export function publicEpisode(episode: Episode, now = Date.now()): Episode {
  if (releaseTime(episode) > now) {
    return { ...episode, videoId: null, chapters: [], externalPlayback: false, status: "Coming soon" };
  }
  // Retire the teaser from the rendered site once the full episode is released.
  if (episode.videoId) return { ...episode, teaser: undefined, teaserDuration: undefined };
  return episode;
}
