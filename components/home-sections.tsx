import Image from "next/image";
import Link from "next/link";
import { creators } from "@/lib/creators";
import { episodes, episodePath } from "@/lib/episodes";
import { FeaturedEpisodes } from "./featured-episodes";

export function Hero() {
  const releasedEpisodes = episodes.filter((episode) => episode.videoId).sort((a, b) => b.number - a.number);
  const latestEpisode = releasedEpisodes[0];
  return (
<section className="hero wrap" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow"><span className="little-mark" aria-hidden="true">✳</span> NEW EPISODES EVERY SATURDAY</p>
        <h1 id="hero-title" className="hero-mission-title">We democratize<br />the knowledge of<br /><em>the top 0.1%.</em></h1>
        <p className="hero-description">The lessons, decisions, and hard-won insights of exceptional people in tech, shared through honest conversations. So you can learn from their experience and build your own path.</p>
        <div className="hero-actions">{latestEpisode && <Link className="button button-blue" href={episodePath(latestEpisode.number)}><span className="play-icon" aria-hidden="true"></span> Watch latest podcast</Link>}<a className="text-link" href="#episodes">Explore the conversations</a></div>
        <div className="hero-creators" aria-label="The people behind MaheshLabs">
          {creators.map((creator) => (
            <a className="hero-creator" href="#team" key={creator.name}>
              <Image className={creator.portraitClass} src={creator.image} width={48} height={48} alt="" priority />
              <span>
                <strong><span>{creator.name.split(" ")[0]}</span>{" "}<span>{creator.name.split(" ").slice(1).join(" ")}</span></strong>
                <span>{creator.role}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
      <FeaturedEpisodes episodes={releasedEpisodes.map(({ number, videoId, guest, title, image, duration, topics, role }) => ({ number, videoId, guest, title, image, duration, topics, role }))} />
    </section>
  );
}

export function TopicRibbon() {
  return (
<div className="topic-ribbon" aria-label="Topics we talk about"><div className="wrap ribbon-inner"><span>CAREERS &amp; GROWTH</span><span aria-hidden="true">✳</span><span>BUSINESS &amp; IDEAS</span><span aria-hidden="true">✳</span><span>CREATIVITY</span><span aria-hidden="true">✳</span><span>LIFE &amp; CULTURE</span><span aria-hidden="true">✳</span><span>HUMAN STORIES</span></div></div>
  );
}

export function OurStory() {
  return (
<section id="about" className="about-section section-space" aria-labelledby="about-title"><div className="wrap about-layout"><div><p className="eyebrow">WHY WE’RE HERE</p><span className="about-asterisk" aria-hidden="true">✳</span><p className="small-note">A bit of curiosity<br />can take you a long way.</p></div><div><h2 id="about-title">The journey is<br />more interesting<br />than the <em>headline.</em></h2><div className="about-prose"><p>“Got into GSoC.” “Landed a remote job.” “Started working in AI.” We see the milestones. We don’t always hear about the first attempts, wrong turns, and small decisions that came before.</p><p>That’s what MaheshLabs is for. We sit down with people building their way through tech and ask the questions we’d want to ask as friends. The practical stuff. The uncertain stuff. The story behind the résumé.</p></div><p className="about-signoff">No perfect roadmaps. Just useful perspectives.</p></div></div></section>
  );
}

export function OurTeam() {
  return (
    <section id="team" className="team-section wrap section-space" aria-labelledby="team-title">
      <div className="section-heading team-heading">
        <p className="eyebrow">MEET THE CREATORS</p>
        <h2 id="team-title">Two friends.<br />One shared <em>curiosity.</em></h2>
        <p className="team-intro">We’re Mahesh Nandigam and Mahesh Moholkar, two friends talking with people about how they found their way in tech.</p>
      </div>
      <div className="team-grid">
        {creators.map((creator) => (
          <article className="team-card" key={creator.name}>
            <div className="team-identity">
              <Image className={creator.portraitClass} src={creator.image} width={90} height={90} alt={creator.name} />
              <div>
                <p className="eyebrow">CO-CREATOR</p>
                <h3>{creator.name}</h3>
                <p>{creator.role}</p>
              </div>
            </div>
            <p>{creator.description}</p>
            <div className="team-links">
              {creator.links.map((link) => (
                <a href={link.url} key={link.name} target="_blank" rel="noopener noreferrer">{link.name}</a>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function Connect() {
  return (
<section id="connect" className="connect-section"><div className="wrap connect-layout"><div><p className="eyebrow">LET’S KEEP THE CONVERSATION GOING</p><h2>Stay curious.<br /><em>See you Saturday.</em></h2><p>New episodes every Saturday on Mahesh Nandigam’s channel.<br />Subscribe and come along for the next conversation.</p><a className="button button-blue" href="https://www.youtube.com/@MAHESHNANDIGAM-t9z?sub_confirmation=1" target="_blank" rel="noopener"><span className="play-icon" aria-hidden="true"></span> Subscribe on YouTube</a></div><aside className="conversation-invite"><span className="invite-symbol" aria-hidden="true">“</span><h3>Know a story<br />we should hear?</h3><p>An interesting journey, a good question, or an idea for a conversation. We’d love to hear it.</p><a className="text-link" href="https://x.com/mahesh_labs" target="_blank" rel="noopener">Say hello on X <span className="external-symbol" aria-hidden="true">↗</span></a></aside></div></section>
  );
}

