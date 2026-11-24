"use client";

import { useState } from "react";
import { findChapters, videoUrl, type Episode } from "@/lib/episodes";
import { PlayIcon, SearchIcon } from "./icons";

const suggestions = [
  { label: "GSoC", query: "GSoC" },
  { label: "AI", query: "AI" },
  { label: "DSA", query: "DSA" },
  { label: "Research", query: "research" },
  { label: "Mentorship", query: "mentors" },
];

export function ChapterSearch({ episodes }: { episodes: Episode[] }) {
  const [query, setQuery] = useState("");
  const matches = findChapters(query, episodes);
  const searching = query.trim().length > 0;

  return (
    <section
      id="discover"
      className="discovery-section section-space"
      aria-labelledby="discover-title"
    >
      <div className="wrap">
        <div className="discovery-heading">
          <p className="eyebrow">FOLLOW YOUR CURIOSITY</p>
          <h2 id="discover-title">
            One question can
            <br />
            change your <em>direction.</em>
          </h2>
          <p>Find the part that speaks to where you are right now.</p>
        </div>
        <form
          id="chapter-form"
          role="search"
          onSubmit={(event) => event.preventDefault()}
        >
          <label htmlFor="chapter-search" className="sr-only">
            Search episode chapters
          </label>
          <SearchIcon />
          <input
            type="search"
            id="chapter-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="What’s on your mind? Try GSoC, AI, or DSA…"
            autoComplete="off"
          />
          <button type="submit" className="button button-paper">
            Find a moment
          </button>
        </form>
        <div className="suggested-topics">
          <span>START WITH</span>
          {suggestions.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setQuery(item.query)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="chapter-heading">
          <p>
            {searching
              ? `Moments about “${query.trim()}”`
              : "A few places to start"}
          </p>
          <span>
            {searching
              ? `${matches.length} ${matches.length === 1 ? "moment" : "moments"}`
              : "FROM THE CONVERSATIONS"}
          </span>
        </div>
        <div className="chapter-results" aria-live="polite">
          {matches.length ? (
            matches.slice(0, 12).map(({ episode, chapter }) => (
              <a
                className="chapter-result"
                key={`${episode.number}-${chapter.seconds}`}
                href={videoUrl(episode, chapter.seconds)!}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Watch ${chapter.title} at ${chapter.time}, with ${episode.guest} on YouTube`}
              >
                <time className="chapter-time">{chapter.time}</time>
                <span className="chapter-copy">
                  <strong>{chapter.title}</strong>
                  <small>
                    {episode.guest} · EP.{" "}
                    {String(episode.number).padStart(2, "0")}
                  </small>
                </span>
                <PlayIcon />
              </a>
            ))
          ) : (
            <p className="chapter-empty">
              No matching chapters yet. Try GSoC, AI, DSA, or a guest’s name.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
