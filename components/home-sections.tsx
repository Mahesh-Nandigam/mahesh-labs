import Image from "next/image";
import Link from "next/link";
import { creators } from "@/lib/creators";

export function Hero() {
  return (
<section className="hero wrap" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow"><span className="little-mark" aria-hidden="true">✳</span> NEW EPISODES EVERY SATURDAY</p>
        <h1 id="hero-title">Good questions.<br />Real <em>journeys.</em></h1>
        <p className="hero-description">Behind the code, the careers, and the breakthroughs are people figuring it out. Let’s hear their stories.</p>
        <div className="hero-actions"><Link className="button button-blue" href="/episodes/3/"><span className="play-icon" aria-hidden="true"></span> Watch the latest</Link><a className="text-link" href="#episodes">Explore the conversations</a></div>
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
      <div className="hero-feature">
        <div className="feature-topline"><span><span className="live-dot"></span> THE LATEST CONVERSATION</span><span>EP. 03</span></div>
        <Link className="feature-art" aria-label="Watch episode 3 with J Prakash" href="/episodes/3/"><Image src="/assets/episode-03-open-source-to-job.jpg" width={1280} height={720} alt="Mahesh Nandigam and J Prakash on GSoC and LFX" /><span className="feature-play"><span className="play-icon" aria-hidden="true"></span></span><span className="duration">1h 18m</span></Link>
        <div className="feature-caption"><div><p className="eyebrow">OPEN SOURCE · CAREERS</p><h2>It starts with<br />one contribution.</h2><p>J Prakash on GSoC, LFX &amp; remote work</p></div><Link className="round-button" aria-label="Open J Prakash’s episode" href="/episodes/3/"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="1.7"></path></svg></Link></div>
        <div className="feature-footnote"><span className="waveform" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span><span>Less noise. More perspective.</span></div>
      </div>
    </section>
  );
}

export function TopicRibbon() {
  return (
<div className="topic-ribbon" aria-label="Topics we talk about"><div className="wrap ribbon-inner"><span>CODE &amp; CURIOSITY</span><span aria-hidden="true">✳</span><span>OPEN SOURCE</span><span aria-hidden="true">✳</span><span>REAL CAREERS</span><span aria-hidden="true">✳</span><span>AI &amp; WHAT’S NEXT</span><span aria-hidden="true">✳</span><span>YOUR OWN WAY</span></div></div>
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
      <div className="section-heading">
        <div>
          <p className="eyebrow">THE PEOPLE BEHIND THE PODCAST</p>
          <h2 id="team-title">Mahesh &amp; Mahesh.<br />One shared <em>curiosity.</em></h2>
        </div>
        <p className="section-intro">Friends making the kind of conversations<br />we’d want to listen to ourselves.</p>
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

