"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { episodePath, type Episode } from "@/lib/episodes";
import { PlayIcon } from "./icons";

type FeaturedEpisode = Pick<Episode, "number" | "videoId" | "guest" | "title" | "image" | "duration" | "topics" | "role">;

const captions: Record<string, { topics: string; headline: [string, string]; description: string }> = {
  fuUFEIzRTbM: {
    topics: "DSA · CAREERS",
    headline: ["50 problems.", "Three job offers."],
    description: "Karthik on DSA, development & placements",
  },
  gyVbt46nM00: {
    topics: "GSoC · OPEN SOURCE",
    headline: ["Beyond the PR count.", "Inside a GSoC selection."],
    description: "Yash Bavadiya on Kdenlive, proposals & building projects",
  },
  kMeQgxn6R4w: {
    topics: "GSoC · AI & RESEARCH",
    headline: ["Two GSoCs.", "A path into research."],
    description: "Ria Khatoniar on GSoC, AI & research",
  },
  "4rsdSg4dU9g": {
    topics: "OPEN SOURCE · CAREERS",
    headline: ["It starts with", "one contribution."],
    description: "J Prakash on GSoC, LFX & remote work",
  },
};

function Chevron({ direction }: { direction: "left" | "right" }) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={direction === "left" ? "m14 6-6 6 6 6" : "m10 6 6 6-6 6"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function FeaturedEpisodes({ episodes }: { episodes: FeaturedEpisode[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const pageButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const activeEpisode = episodes[activeIndex];

  if (!activeEpisode) return null;

  function moveTo(index: number) {
    setActiveIndex(Math.max(0, Math.min(episodes.length - 1, index)));
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    swiped.current = false;
    swipeStart.current = event.pointerType === "mouse" ? null : { x: event.clientX, y: event.clientY };
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start) return;
    const distance = event.clientX - start.x;
    if (Math.abs(distance) < 50 || Math.abs(distance) < Math.abs(event.clientY - start.y) * 1.25) return;
    swiped.current = true;
    moveTo(activeIndex + (distance < 0 ? 1 : -1));
  }

  function onNavigationKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const focusedPage = pageButtons.current.findIndex((button) => button === event.target);
    let index = focusedPage < 0 ? activeIndex : focusedPage;
    if (event.key === "ArrowLeft") index--;
    else if (event.key === "ArrowRight") index++;
    else if (event.key === "Home") index = 0;
    else if (event.key === "End") index = episodes.length - 1;
    else return;
    event.preventDefault();
    index = Math.max(0, Math.min(episodes.length - 1, index));
    moveTo(index);
    pageButtons.current[index]?.focus();
  }

  return (
    <div className="hero-feature" role="region" aria-roledescription="carousel" aria-label="Featured conversations">
      <div className="feature-topline">
        <span><span className="live-dot" aria-hidden="true" />{activeIndex === 0 ? "THE LATEST CONVERSATION" : "FROM THE ARCHIVE"}</span>
        <span>EP. {String(activeEpisode.number).padStart(2, "0")}</span>
      </div>
      <div
        className="feature-viewport"
        id="featured-conversations"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { swipeStart.current = null; }}
        onClickCapture={(event) => {
          if (!swiped.current || event.detail === 0) return;
          event.preventDefault();
          event.stopPropagation();
          swiped.current = false;
        }}
      >
        <div className="feature-track" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
          {episodes.map((episode, index) => {
            const caption = episode.videoId ? captions[episode.videoId] : undefined;
            const href = episodePath(episode.number);
            const watchLabel = `Watch episode ${episode.number} with ${episode.guest}`;
            return (
              <div className="feature-slide" key={episode.number} role="group" aria-roledescription="slide" aria-label={`Episode ${episode.number} with ${episode.guest}, ${index + 1} of ${episodes.length}`} aria-hidden={index !== activeIndex} inert={index !== activeIndex}>
                <Link className="feature-art" aria-label={watchLabel} href={href} draggable={false}>
                  <Image src={episode.image} width={1280} height={720} alt={`${episode.guest} on MaheshLabs`} priority={index === 0} sizes="(max-width: 760px) 100vw, 600px" draggable={false} />
                  <span className="feature-play"><PlayIcon /></span>
                  <span className="duration">{episode.duration}</span>
                </Link>
                <div className="feature-caption">
                  <div>
                    <p className="eyebrow">{caption?.topics || episode.topics.join(" · ")}</p>
                    <h2>{caption ? caption.headline.join(" ") : episode.title}</h2>
                    <p>{caption?.description || `${episode.guest} on ${episode.role}`}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="feature-footnote">
        <span className="feature-signoff"><span className="waveform" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></span><span>Less noise. More perspective.</span></span>
        {episodes.length > 1 && <div className="feature-navigation" role="group" aria-label="Browse conversations" onKeyDown={onNavigationKeyDown}>
          <button className="feature-step" type="button" aria-label="Newer episode" aria-controls="featured-conversations" disabled={activeIndex === 0} onClick={() => moveTo(activeIndex - 1)}><Chevron direction="left" /></button>
          <div className="feature-pages">
            {episodes.map((episode, index) => <button className="feature-page" type="button" key={episode.number} ref={(button) => { pageButtons.current[index] = button; }} aria-label={`Show episode ${episode.number} with ${episode.guest}`} aria-pressed={index === activeIndex} aria-controls="featured-conversations" onClick={() => moveTo(index)}><span /></button>)}
          </div>
          <button className="feature-step" type="button" aria-label="Previous episode" aria-controls="featured-conversations" disabled={activeIndex === episodes.length - 1} onClick={() => moveTo(activeIndex + 1)}><Chevron direction="right" /></button>
        </div>}
      </div>
      <p className="sr-only" role="status" aria-atomic="true">Episode {activeEpisode.number} with {activeEpisode.guest}. {activeIndex + 1} of {episodes.length}.</p>
    </div>
  );
}
