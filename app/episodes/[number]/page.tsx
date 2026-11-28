import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EpisodeActions, EpisodePlayer } from "@/components/episode-player";
import { episodePath } from "@/lib/episodes";
import { getPublicEpisode } from "@/lib/content-store";
import { getSubscriberEpisode } from "@/lib/subscriber-access";
import { EarlyAccessForm } from "@/components/early-access-form";
import { earlyAccessWindow, releaseTime } from "@/lib/episode-release";
import "@/app/episode-watch.css";

interface Props {
  params: Promise<{ number: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { number } = await params;
  const episode = await getPublicEpisode(Number(number));
  if (!episode) return { title: "Episode not found" };
  return {
    title: episode.guest
      ? `${episode.guest}: ${episode.title}`
      : `Episode ${episode.number}: ${episode.title}`,
    description: episode.description,
    openGraph: {
      title: `${episode.guest || `Episode ${episode.number}`} on MaheshLabs`,
      description: episode.description,
      url: episodePath(episode.number),
      images: [{ url: episode.image, width: 1280, height: 720 }],
    },
  };
}

export default async function EpisodePage({ params }: Props) {
  const { number } = await params;
  const unlocked = await getSubscriberEpisode(Number(number));
  const episode = unlocked || await getPublicEpisode(Number(number));
  if (!episode) notFound();

  return (
    <main id="main" className="episode-page wrap">
      <article className="episode-page-content">
        {unlocked && <p className="preview-note" role="status">Subscriber early access · available to everyone on {new Date(episode.publicReleaseAt!).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })} IST.</p>}
        {!episode.videoId && episode.publicReleaseAt && <p className="preview-note">The full episode arrives on {new Date(episode.publicReleaseAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })} IST. Subscribers can watch one day early using their email link.</p>}
        <EpisodePlayer key={episode.number} episode={episode} />
        {!episode.videoId && episode.publicReleaseAt && Date.now() >= releaseTime(episode) - earlyAccessWindow && Date.now() < releaseTime(episode) && <EarlyAccessForm episode={episode.number} />}
        <div className="dialog-body">
          <p className="eyebrow">
            EPISODE {String(episode.number).padStart(2, "0")} ·{" "}
            {episode.duration}
            {episode.guest && ` · ${episode.guest}`}
          </p>
          <h1>{episode.title}</h1>
          <p className="dialog-description">{episode.description}</p>
          {!episode.videoId && (
            <p className="preview-note">
              {episode.teaser
                ? `Watch the ${episode.teaserDuration}-second teaser. The full conversation is coming soon.`
                : "This conversation is in the works. Subscribe to catch it when it goes live."}
            </p>
          )}
          <EpisodeActions episode={episode} />
          <div className="episode-guest-profile">
            <aside>
              <h2>Meet {episode.guest}</h2>
              <p className="preview-note">{episode.role}</p>
              <div className="guest-links">
                {episode.links.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </article>
    </main>
  );
}
