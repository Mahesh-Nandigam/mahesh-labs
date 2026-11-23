"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { episodePath, subscribeUrl, videoUrl, type Episode } from "@/lib/episodes";
import { PlayIcon } from "./icons";

export function EpisodePlayer({ episode }: { episode: Episode }) {
  const [playing, setPlaying] = useState(false);

  return <div className="dialog-media">
    {playing && episode.videoId ? (
      <iframe src={`https://www.youtube-nocookie.com/embed/${episode.videoId}?autoplay=1&rel=0`} title={`${episode.guest || `Episode ${episode.number}`} on MaheshLabs`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
    ) : playing && episode.teaser ? (
      <video className="episode-teaser" controls autoPlay playsInline preload="metadata" poster={episode.image} aria-label={`Episode ${episode.number} teaser with ${episode.guest}`}>
        <source src={episode.teaser} type="video/mp4" />
        <p>Your browser cannot play this video. <a href={episode.teaser}>Open the teaser</a>.</p>
      </video>
    ) : <>
      <Image src={episode.image} alt={episode.guest ? `${episode.guest} and Mahesh Nandigam` : "The first MaheshLabs conversation"} width={1280} height={720} priority sizes="(max-width: 760px) 100vw, 1000px" />
      {episode.videoId || episode.teaser ? (
        <button type="button" className="button button-paper" onClick={() => setPlaying(true)}><PlayIcon /> {episode.teaser && !episode.videoId ? "Watch the teaser" : "Play the conversation"}</button>
      ) : <span className="preview-label">Coming soon to MaheshLabs</span>}
    </>}
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
      <button className="button button-outline" type="button" onClick={share}>{copied ? "Link copied" : "Copy episode link"}</button>
    </div>
    <span className="sr-only" role="status">{copied ? "Episode link copied." : ""}</span>
    {fallbackUrl && <label className="share-link-label">Copy this episode link<input className="share-fallback" ref={fallback} value={fallbackUrl} readOnly onFocus={(event) => event.target.select()} onClick={() => fallback.current?.select()} /></label>}
  </>;
}
