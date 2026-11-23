"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { episodePath, subscribeUrl, videoUrl, type Episode } from "@/lib/episodes";
import { PlayIcon } from "./icons";
import { YouTubePlayer } from "./youtube-player";

export function EpisodePlayer({ episode }: { episode: Episode }) {
  const [playing, setPlaying] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [seekRequest, setSeekRequest] = useState(0);
  const [activeChapter, setActiveChapter] = useState(-1);
  const chaptersRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const list = chaptersRef.current;
    const row = list?.children[activeChapter] as HTMLElement | undefined;
    if (list && row) {
      const offset = row.offsetTop;
      if (offset < list.scrollTop || offset + row.offsetHeight > list.scrollTop + list.clientHeight) {
        list.scrollTo({ top: offset - list.clientHeight / 2 + row.offsetHeight / 2 });
      }
    }
  }, [activeChapter]);

  function selectChapter(index: number) {
    setActiveChapter(index);
    setSeconds(episode.chapters[index].seconds);
    setSeekRequest((request) => request + 1);
    setPlaying(true);
  }

  function updateChapter(currentTime: number) {
    const index = episode.chapters.findIndex((chapter, index) =>
      currentTime >= chapter.seconds && (!episode.chapters[index + 1] || currentTime < episode.chapters[index + 1].seconds),
    );
    setActiveChapter(index);
  }

  return <div className={`episode-watch${episode.chapters.length ? " has-chapters" : ""}`}>
    <div className="episode-media">
    {episode.videoId ? (
      <YouTubePlayer videoId={episode.videoId} title={`${episode.guest || `Episode ${episode.number}`} on MaheshLabs`} poster={episode.image} durationLabel={episode.duration} chapters={episode.chapters} started={playing} onStart={() => setPlaying(true)} seconds={seconds} seekRequest={seekRequest} onTimeChange={updateChapter} />
    ) : <div className="dialog-media">{playing && episode.teaser ? (
      <video className="episode-teaser" controls autoPlay playsInline preload="metadata" poster={episode.image} aria-label={`Episode ${episode.number} teaser with ${episode.guest}`}>
        <source src={episode.teaser} type="video/mp4" />
        <p>Your browser cannot play this video. <a href={episode.teaser}>Open the teaser</a>.</p>
      </video>
    ) : <>
      <Image src={episode.image} alt={episode.guest ? `${episode.guest} and Mahesh Nandigam` : "The first MaheshLabs conversation"} width={1280} height={720} priority sizes="(max-width: 900px) 100vw, (max-width: 1392px) 65vw, 900px" />
      {episode.videoId || episode.teaser ? (
        <button type="button" className="button button-paper" onClick={() => setPlaying(true)}><PlayIcon /> {episode.teaser && !episode.videoId ? "Watch the teaser" : "Play the conversation"}</button>
      ) : <span className="preview-label">Coming soon to MaheshLabs</span>}
    </>}</div>}
    </div>
    {episode.chapters.length > 0 && <aside className="episode-chapters" aria-labelledby="episode-chapters-title">
      <div className="episode-chapters-inner">
        <header className="episode-chapters-header">
          <div><h2 id="episode-chapters-title">Chapters</h2><p>{episode.videoId ? "Jump to a moment" : "In the full conversation"}</p></div>
          <span className="episode-chapter-count">{activeChapter >= 0 ? `${activeChapter + 1} / ` : ""}{episode.chapters.length}</span>
        </header>
        <ol className="episode-chapter-list" ref={chaptersRef} aria-label="Episode chapters">
          {episode.chapters.map((chapter, index) => <li key={chapter.seconds}>
            {episode.videoId ? <button type="button" className="episode-chapter" aria-current={activeChapter === index ? "true" : undefined} aria-label={`Play ${chapter.title} at ${chapter.time}`} onClick={() => selectChapter(index)}>
              <span className="episode-chapter-index" aria-hidden="true">{activeChapter === index ? <PlayIcon /> : String(index + 1).padStart(2, "0")}</span>
              <span className="episode-chapter-copy"><strong>{chapter.title}</strong><time>{chapter.time}</time></span>
            </button> : <div className="episode-chapter chapter-unreleased">
              <span className="episode-chapter-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <span className="episode-chapter-copy"><strong>{chapter.title}</strong><time>{chapter.time}</time></span>
            </div>}
          </li>)}
        </ol>
      </div>
    </aside>}
  </div>;
}

export function EpisodeActions({ episode }: { episode: Episode }) {
  const [copied, setCopied] = useState(false);
  const [fallbackUrl, setFallbackUrl] = useState("");
  const fallback = useRef<HTMLInputElement>(null);

  async function share() {
    const url = `${window.location.origin}${episodePath(episode.number)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setFallbackUrl(url);
    }
  }

  return <>
    <div className="dialog-actions">
      <a className="button button-blue" href={videoUrl(episode) || subscribeUrl} target="_blank" rel="noopener noreferrer">{episode.videoId ? "Watch on YouTube" : "Subscribe on YouTube"}</a>
      {episode.videoId && <button className="button button-outline" type="button" onClick={share}>{copied ? "Link copied" : "Copy episode link"}</button>}
    </div>
    {episode.videoId && <span className="sr-only" role="status">{copied ? "Episode link copied." : ""}</span>}
    {episode.videoId && fallbackUrl && <label className="share-link-label">Copy this episode link<input className="share-fallback" ref={fallback} value={fallbackUrl} readOnly onFocus={(event) => event.target.select()} onClick={() => fallback.current?.select()} /></label>}
  </>;
}
