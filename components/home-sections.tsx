import Image from "next/image";
import Link from "next/link";
import { creators } from "@/lib/creators";
import { type Episode, episodePath } from "@/lib/episodes";
import { FeaturedEpisodes } from "./featured-episodes";
import type homepageContent from "@/content/homepage.json";

type HomepageContent = typeof homepageContent;

export function Hero({
  episodes,
  content,
}: {
  episodes: Episode[];
  content: HomepageContent;
}) {
  const releasedEpisodes = episodes
    .filter((episode) => episode.videoId)
    .sort((a, b) => b.number - a.number);
  const latestEpisode = releasedEpisodes[0];
  return (
    <section className="hero wrap" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow">
          <span className="little-mark" aria-hidden="true">
            ✳
          </span>{" "}
          NEW EPISODES EVERY SATURDAY
        </p>
        <h1 id="hero-title" className="hero-mission-title">
          <span className="cms-lines">{content.heroTitle}</span>
          <br />
          <em>{content.heroEmphasis}</em>
        </h1>
        <p className="hero-description">{content.heroDescription}</p>
        <div className="hero-actions">
          {latestEpisode && (
            <Link
              className="button button-blue"
              href={episodePath(latestEpisode.number)}
            >
              <span className="play-icon" aria-hidden="true"></span> Watch
              latest podcast
            </Link>
          )}
          <a className="text-link" href="#episodes">
            Explore the conversations
          </a>
        </div>
        <div
          className="hero-creators"
          aria-label="The people behind MaheshLabs"
        >
          {creators.map((creator) => (
            <a className="hero-creator" href="#team" key={creator.name}>
              <Image
                className={creator.portraitClass}
                src={creator.image}
                width={48}
                height={48}
                alt=""
                priority
              />
              <span>
                <strong>
                  <span>{creator.name.split(" ")[0]}</span>{" "}
                  <span>{creator.name.split(" ").slice(1).join(" ")}</span>
                </strong>
                <span>{creator.role}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
      {releasedEpisodes.length ? (
        <FeaturedEpisodes
          episodes={releasedEpisodes.map(
            ({
              number,
              videoId,
              guest,
              title,
              image,
              duration,
              topics,
              role,
            }) => ({
              number,
              videoId,
              guest,
              title,
              image,
              duration,
              topics,
              role,
            }),
          )}
        />
      ) : (
        <div className="hero-no-episodes">
          <p className="eyebrow">SOMETHING GOOD IS ON THE WAY</p>
          <h2>
            A new conversation
            <br />
            <em>starts here.</em>
          </h2>
          <Link className="button button-blue" href="/#newsletter">
            Get the next update
          </Link>
        </div>
      )}
    </section>
  );
}

export function TopicRibbon() {
  return (
    <div className="topic-ribbon" aria-label="Topics we talk about">
      <div className="wrap ribbon-inner">
        <span>CAREERS &amp; GROWTH</span>
        <span aria-hidden="true">✳</span>
        <span>BUSINESS &amp; IDEAS</span>
        <span aria-hidden="true">✳</span>
        <span>CREATIVITY</span>
        <span aria-hidden="true">✳</span>
        <span>LIFE &amp; CULTURE</span>
        <span aria-hidden="true">✳</span>
        <span>HUMAN STORIES</span>
      </div>
    </div>
  );
}

export function OurStory({ content }: { content: HomepageContent }) {
  return (
    <section
      id="about"
      className="about-section section-space"
      aria-labelledby="about-title"
    >
      <div className="wrap about-layout">
        <div className="story-identity">
          <p className="eyebrow">WHY WE’RE HERE</p>
          <span className="about-asterisk" aria-hidden="true">
            <Image src="/assets/brand-mark.svg" width={160} height={160} alt="" />
          </span>
          <p className="small-note">
            A bit of curiosity
            <br />
            can take you a long way.
          </p>
        </div>
        <div>
          <h2 id="about-title">
            <span className="cms-lines">{content.storyTitle}</span>{" "}
            <em>{content.storyEmphasis}</em>
          </h2>
          <div className="about-prose">
            <p>{content.storyFirst}</p>
            <p>{content.storySecond}</p>
          </div>
          <p className="about-signoff">{content.storySignoff}</p>
        </div>
      </div>
    </section>
  );
}

export function OurTeam({ content }: { content: HomepageContent }) {
  return (
    <section
      id="team"
      className="team-section wrap section-space"
      aria-labelledby="team-title"
    >
      <div className="section-heading team-heading">
        <p className="eyebrow">MEET THE CREATORS</p>
        <h2 id="team-title">
          Two friends.
          <br />
          One shared <em>curiosity.</em>
        </h2>
        <p className="team-intro">{content.teamIntro}</p>
      </div>
      <div className="team-grid">
        {creators.map((creator) => (
          <article className="team-card" key={creator.name}>
            <div className="team-identity">
              <Image
                className={creator.portraitClass}
                src={creator.image}
                width={90}
                height={90}
                alt={creator.name}
              />
              <div>
                <p className="eyebrow">{creator.eyebrow.toUpperCase()}</p>
                <h3>{creator.name}</h3>
                <p>{creator.role}</p>
              </div>
            </div>
            <p>{creator.description}</p>
            <div className="team-links">
              {creator.links.map((link) => (
                <a
                  href={link.url}
                  key={link.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.name}
                </a>
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
    <section id="connect" className="connect-section">
      <div className="wrap connect-layout">
        <div>
          <p className="eyebrow">LET’S KEEP THE CONVERSATION GOING</p>
          <h2>
            Stay curious.
            <br />
            <em>See you Saturday.</em>
          </h2>
          <p>
            New episodes every Saturday on Mahesh Nandigam’s channel.
            <br />
            Subscribe and come along for the next conversation.
          </p>
          <a
            className="button button-blue"
            href="https://www.youtube.com/@MAHESHNANDIGAM-t9z?sub_confirmation=1"
            target="_blank"
            rel="noopener"
          >
            <span className="play-icon" aria-hidden="true"></span> Subscribe on
            YouTube
          </a>
        </div>
        <aside className="conversation-invite">
          <span className="invite-symbol" aria-hidden="true">
            “
          </span>
          <h3>
            Know a story
            <br />
            we should hear?
          </h3>
          <p>
            An interesting journey, a good question, or an idea for a
            conversation. We’d love to hear it.
          </p>
          <a
            className="text-link"
            href="https://x.com/mahesh_labs"
            target="_blank"
            rel="noopener"
          >
            Say hello on X{" "}
            <span className="external-symbol" aria-hidden="true">
              ↗
            </span>
          </a>
        </aside>
      </div>
    </section>
  );
}
