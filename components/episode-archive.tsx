"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { channelUrl, episodePath, sortedEpisodes } from "@/lib/episodes";
import { PlayIcon, SearchIcon } from "./icons";

const filters = ["All", "Open source", "GSoC", "AI & research", "Careers"];

export function EpisodeArchive() {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const visible = sortedEpisodes.filter((episode) =>
    (filter === "All" || episode.topics.includes(filter)) &&
    `${episode.guest ?? ""} ${episode.title} ${episode.description} ${episode.topics.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return <section id="episodes" className="episodes-section wrap section-space" aria-labelledby="episodes-title">
    <div className="section-heading"><div><p className="eyebrow">PULL UP A CHAIR</p><h2 id="episodes-title">Find your next <em>rabbit hole.</em></h2></div><p className="section-intro">Different journeys. Honest lessons.<br />Something to take into your own.</p></div>
    <div className="episode-toolbar">
      <div className="filters" role="group" aria-label="Filter conversations by topic">
        {filters.map((item) => <button key={item} type="button" className={`filter${filter === item ? " active" : ""}`} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item === "All" ? "All conversations" : item}</button>)}
      </div>
      <label className="episode-search"><SearchIcon /><span className="sr-only">Search episodes</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a conversation…" autoComplete="off" /></label>
    </div>
    <div className="episode-grid" aria-live="polite">
      {visible.filter((episode) => !episode.placeholder).map((episode) => <article className="episode-card" key={episode.number}>
        <Link className="episode-art" href={episodePath(episode.number)} aria-label={`Explore episode ${episode.number} with ${episode.guest}`}>
          <Image src={episode.image} alt={`${episode.guest} and Mahesh Nandigam`} width={1280} height={720} sizes="(max-width: 760px) 100vw, 33vw" />
          {episode.videoId ? <span className="small-play"><PlayIcon /></span> : <span className="coming-badge">{episode.teaser ? "TEASER AVAILABLE" : "COMING SOON"}</span>}
          <span className="duration">{episode.duration}</span>
        </Link>
        <div className="episode-meta"><span>EP. {String(episode.number).padStart(2, "0")}</span><span className="meta-dot" aria-hidden="true">/</span><span>{episode.guest?.toUpperCase()}</span></div>
        <h3><Link className="episode-title" href={episodePath(episode.number)}>{episode.title}</Link></h3>
        <p>{episode.role}</p>
        <div className="episode-card-foot"><span className="topic-label">{episode.topics.slice(0, 2).join(" · ")}</span><Link className="card-open" href={episodePath(episode.number)}>{episode.videoId ? "Explore episode" : episode.teaser ? "Watch the teaser" : "Episode preview"}</Link></div>
      </article>)}
    </div>
    {visible.filter((episode) => episode.placeholder).map((episode) => (
      <article className="original-episode" key={episode.number}>
        <Link className="original-episode-art" href={episodePath(episode.number)} aria-label="Explore the first MaheshLabs episode">
          <Image src={episode.image} alt="Episode 1: where MaheshLabs started" width={1280} height={720} sizes="(max-width: 760px) 100vw, 240px" />
        </Link>
        <div className="original-episode-copy">
          <p className="eyebrow">EP. 01 · THE ORIGINAL CONVERSATION</p>
          <h3><Link href={episodePath(episode.number)}>{episode.title}</Link></h3>
          <p>The very first MaheshLabs episode. Full notes coming soon.</p>
        </div>
        <Link className="button button-outline" href={episodePath(episode.number)}><PlayIcon /> Watch Episode 1</Link>
      </article>
    ))}
    {visible.length === 0 && <p className="empty-state" role="status">No conversations found. Try another name or topic. <button className="inline-button" type="button" onClick={() => { setFilter("All"); setQuery(""); }}>Show all conversations</button></p>}
    <div className="archive-bottom"><p>Good conversations don’t have an expiry date.</p><a className="text-link" href={`${channelUrl}/videos`} target="_blank" rel="noopener noreferrer">More on YouTube</a></div>
  </section>;
}
