import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EpisodeActions, EpisodePlayer } from "@/components/episode-player";
import { episodes, episodePath, getEpisode } from "@/lib/episodes";
import "@/app/episode-watch.css";

interface Props { params: Promise<{ number: string }> }

export const dynamicParams = false;

export function generateStaticParams() {
  return episodes.map((episode) => ({ number: String(episode.number) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { number } = await params;
  const episode = getEpisode(Number(number));
  if (!episode) return { title: "Episode not found" };
  return {
    title: episode.guest ? `${episode.guest}: ${episode.title}` : `Episode ${episode.number}: ${episode.title}`,
    description: episode.description,
    openGraph: { title: `${episode.guest || `Episode ${episode.number}`} on MaheshLabs`, description: episode.description, url: episodePath(episode.number), images: [{ url: episode.image, width: 1280, height: 720 }] },
  };
}

export default async function EpisodePage({ params }: Props) {
  const { number } = await params;
  const episode = getEpisode(Number(number));
  if (!episode) notFound();

  return <main id="main" className="episode-page wrap">
    <article className="episode-page-content">
      <EpisodePlayer key={episode.number} episode={episode} />
      <div className="dialog-body">
        <p className="eyebrow">EPISODE {String(episode.number).padStart(2, "0")} · {episode.duration}{episode.guest && ` · ${episode.guest}`}</p>
        <h1>{episode.title}</h1>
        <p className="dialog-description">{episode.description}</p>
        {!episode.videoId && <p className="preview-note">{episode.teaser ? `Watch the ${episode.teaserDuration}-second teaser. The full conversation is coming soon.` : "This conversation is in the works. Subscribe to catch it when it goes live."}</p>}
        <EpisodeActions episode={episode} />
        <div className="episode-guest">
          <aside><h2>Meet {episode.guest}</h2><p className="preview-note">{episode.role}</p><div className="guest-links">{episode.links.map((link) => <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer">{link.name}</a>)}</div></aside>
        </div>
      </div>
    </article>
  </main>;
}
