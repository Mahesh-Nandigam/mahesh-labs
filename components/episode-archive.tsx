"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  episodePath,
  sortEpisodes,
  type Episode,
} from "@/lib/episodes";
import { PlayIcon, SearchIcon } from "./icons";

const filters = ["All", "Open source", "GSoC", "AI & research", "Careers"];

export function EpisodeArchive({
  episodes,
  preview = false,
  initialQuery = "",
  initialTopic = "All",
  page = 1,
  total = 0,
}: {
  episodes: Episode[];
  preview?: boolean;
  initialQuery?: string;
  initialTopic?: string;
  page?: number;
  total?: number;
}) {
  const [query, setQuery] = useState(initialQuery);
  const Heading = preview ? "h2" : "h1";
  const visible = preview ? sortEpisodes(episodes).slice(0, 6) : episodes;
  const pageUrl = (n: number) =>
    `/episodes/?${new URLSearchParams({ page: String(n), q: initialQuery, topic: initialTopic })}`;

  return (
    <section
      id="episodes"
      className="episodes-section wrap section-space"
      aria-labelledby="episodes-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">PULL UP A CHAIR</p>
          <Heading id="episodes-title">
            Find your next <em>rabbit hole.</em>
          </Heading>
        </div>
      </div>
      {!preview && (
        <form className="episode-toolbar" action="/episodes/" method="get">
          <div
            className="filters"
            role="group"
            aria-label="Filter conversations by topic"
          >
            {filters.map((item) => (
              <Link
                key={item}
                href={`/episodes/?${new URLSearchParams({ q: query, topic: item })}`}
                className={`filter${initialTopic === item ? " active" : ""}`}
                aria-current={initialTopic === item ? "page" : undefined}
              >
                {item === "All" ? "All conversations" : item}
              </Link>
            ))}
            <input type="hidden" name="topic" value={initialTopic} />
          </div>
          <div className="episode-search">
            <SearchIcon />
            <input
              aria-label="Search episodes"
              name="q"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find a conversation…"
              autoComplete="off"
            />
            <button className="archive-search-button" type="submit">
              Search
            </button>
          </div>
        </form>
      )}
      <div
        className={`episode-grid${preview ? " homepage-episodes" : ""}`}
        aria-live="polite"
      >
        {visible.map((episode) => {
          const released = Boolean(episode.videoId);
          const href = episodePath(episode.number);
          const action = released
            ? "Episode"
            : episode.teaser
              ? "Teaser"
              : "Preview";
          const actionLabel = `${released ? "Watch episode" : episode.teaser ? "Watch teaser for episode" : "Preview episode"} ${episode.number} with ${episode.guest}`;
          return (
            <article className="episode-card" key={episode.number}>
              <Link
                className={`episode-art${released ? "" : " episode-art-unreleased"}`}
                href={href}
                aria-label={`${actionLabel}${released ? "" : ". Full episode coming soon"}`}
              >
                <Image
                  src={episode.image}
                  alt={`${episode.guest} and Mahesh Nandigam`}
                  width={1280}
                  height={720}
                  sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 33vw"
                />
                {released ? (
                  <>
                    <span className="small-play">
                      <PlayIcon />
                    </span>
                    <span className="duration">{episode.duration}</span>
                  </>
                ) : (
                  <span className="episode-preview-details">
                    <span className="episode-coming-soon">Coming soon</span>
                    {episode.teaser && (
                      <span className="episode-teaser-cue">
                        <span className="episode-teaser-play">
                          <PlayIcon />
                        </span>
                        <span>
                          {episode.teaserDuration
                            ? `${episode.teaserDuration}s teaser`
                            : "Watch teaser"}
                        </span>
                      </span>
                    )}
                  </span>
                )}
              </Link>
              <div className="episode-copy">
                <div className="episode-meta">
                  <span className="episode-number">
                    EP. {String(episode.number).padStart(2, "0")}
                  </span>
                  <span className="episode-guest">{episode.guest}</span>
                </div>
                <h3>
                  <Link className="episode-title" href={href}>
                    {episode.title}
                  </Link>
                </h3>
                <p className="episode-role">{episode.role}</p>
              </div>
              <div className="episode-card-foot">
                <span className="topic-label">
                  {episode.topics.slice(0, 2).join(" · ")}
                </span>
                <Link
                  className="card-open"
                  href={href}
                  aria-label={actionLabel}
                >
                  {(released || episode.teaser) && (
                    <span className="card-play">
                      <PlayIcon />
                    </span>
                  )}
                  <span>{action}</span>
                </Link>
              </div>
            </article>
          );
        })}
      </div>
      {visible.length === 0 && (
        <p className="empty-state" role="status">
          No conversations found.{" "}
          <Link className="inline-button" href="/episodes/">
            Show all conversations
          </Link>
        </p>
      )}
      {preview ? (
        <div className="archive-more">
          <Link className="button button-outline" href="/episodes/">
            More conversations
          </Link>
        </div>
      ) : (
        <nav className="archive-pagination" aria-label="Episode pages">
          <span>
            {total} conversations · Page {page} of{" "}
            {Math.max(1, Math.ceil(total / 12))}
          </span>
          <div>
            {page > 1 && (
              <Link className="button button-outline" href={pageUrl(page - 1)}>
                Previous
              </Link>
            )}
            {page * 12 < total && (
              <Link className="button button-outline" href={pageUrl(page + 1)}>
                Next
              </Link>
            )}
          </div>
        </nav>
      )}
    </section>
  );
}
