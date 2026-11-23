"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { episodePath, sortedEpisodes, videoUrl } from "@/lib/episodes";
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
    <div className="section-heading"><div><p className="eyebrow">PULL UP A CHAIR</p><h2 id="episodes-title">Find your next <em>rabbit hole.</em></h2></div></div>
    <div className="episode-toolbar">
      <div className="filters" role="group" aria-label="Filter conversations by topic">
        {filters.map((item) => <button key={item} type="button" className={`filter${filter === item ? " active" : ""}`} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item === "All" ? "All conversations" : item}</button>)}
      </div>
      <label className="episode-search"><SearchIcon /><span className="sr-only">Search episodes</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a conversation…" autoComplete="off" /></label>
    </div>
    <div className="episode-grid" aria-live="polite">
      {visible.map((episode) => {
        const released = Boolean(episode.videoId);
        const external = Boolean(episode.externalPlayback && episode.videoId);
        const href = external ? videoUrl(episode)! : episodePath(episode.number);
        const linkProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
        const action = released ? "Episode" : episode.teaser ? "Teaser" : "Preview";
        const actionLabel = `${released ? "Watch episode" : episode.teaser ? "Watch teaser for episode" : "Preview episode"} ${episode.number} with ${episode.guest}${external ? " on YouTube" : ""}`;
        return <article className="episode-card" key={episode.number}>
          <Link className={`episode-art${released ? "" : " episode-art-unreleased"}`} href={href} {...linkProps} aria-label={`${actionLabel}${released ? "" : ". Full episode coming soon"}`}>
            <Image src={episode.image} alt={`${episode.guest} and Mahesh Nandigam`} width={1280} height={720} sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 33vw" />
            {released ? <span className="small-play"><PlayIcon /></span> : <span className="episode-coming-soon">Coming soon</span>}
            <span className="duration">{episode.duration}</span>
          </Link>
          <div className="episode-copy">
            <div className="episode-meta"><span className="episode-number">EP. {String(episode.number).padStart(2, "0")}</span><span className="episode-guest">{episode.guest}</span></div>
            <h3><Link className="episode-title" href={href} {...linkProps}>{episode.title}</Link></h3>
            <p className="episode-role">{episode.role}</p>
          </div>
          <div className="episode-card-foot"><span className="topic-label">{episode.topics.slice(0, 2).join(" · ")}</span><Link className="card-open" href={href} {...linkProps} aria-label={actionLabel}>{(released || episode.teaser) && <span className="card-play"><PlayIcon /></span>}<span>{action}</span></Link></div>
        </article>;
      })}
    </div>
    {visible.length === 0 && <p className="empty-state" role="status">No conversations found. Try another name or topic. <button className="inline-button" type="button" onClick={() => { setFilter("All"); setQuery(""); }}>Show all conversations</button></p>}
  </section>;
}
