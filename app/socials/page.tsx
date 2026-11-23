import type { Metadata } from "next";
import { SocialIcon } from "@/components/social-icon";
import { socialChannels } from "@/lib/socials";

export const metadata: Metadata = {
  title: "Socials",
  description: "Find MaheshLabs on YouTube, X, LinkedIn, and Instagram. Full conversations, shorts, clips, and more.",
  alternates: { canonical: "/socials/" },
  openGraph: {
    title: "Follow MaheshLabs",
    description: "Full conversations, quick insights, and everything in between. Find us on your favourite platform.",
    url: "/socials/",
  },
};

export default function SocialsPage() {
  return (
    <main id="main" className="socials-page wrap">
      <div className="socials-intro">
        <p className="eyebrow">FIND US AROUND THE INTERNET</p>
        <h1>The conversation<br /><em>continues here.</em></h1>
        <p>Stay for a full episode. Catch a quick insight. Join the conversation wherever you feel at home.</p>
      </div>
      <section className="socials-grid" aria-label="Our channels and social profiles">
        {socialChannels.map((channel) => (
          <article className="social-card" key={channel.name}>
            <div className="social-card-top">
              <span className="social-platform-icon"><SocialIcon platform={channel.platform} /></span>
              <p className="eyebrow">{channel.category}</p>
            </div>
            <h2>{channel.name}</h2>
            <p className="social-description">{channel.description}</p>
            <div className="social-card-action">
              <div className="social-card-links">
                <a className="text-link" href={channel.url} target="_blank" rel="noopener noreferrer">{channel.action}</a>
                {channel.relatedLinks?.map((link) => (
                  <a className="text-link" key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">{link.name}</a>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
