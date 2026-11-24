import {
  Hero,
  TopicRibbon,
  OurStory,
  OurTeam,
  Connect,
} from "@/components/home-sections";
import { EpisodeArchive } from "@/components/episode-archive";
import { ChapterSearch } from "@/components/chapter-search";
import { LegacyEpisodeLinks } from "@/components/legacy-episode-links";
import { getPublicEpisodes } from "@/lib/content-store";
import { NewsletterSignup } from "@/components/newsletter-signup";
import content from "@/content/homepage.json";

import { getBlogPosts } from "@/lib/blog-store";
import { BlogCards } from "@/components/blog-cards";
import Link from "next/link";

export default async function HomePage() {
  const [episodes, posts] = await Promise.all([
    getPublicEpisodes(),
    getBlogPosts(),
  ]);
  return (
    <main id="main">
      <Hero episodes={episodes} content={content} />
      <TopicRibbon />
      <EpisodeArchive episodes={episodes} preview />
      <OurStory content={content} />
      <ChapterSearch episodes={episodes} />
      <OurTeam content={content} />
      {posts.length > 0 && (
        <section className="wrap section-space home-blog">
          <div className="section-heading">
            <div>
              <p className="eyebrow">FROM THE NOTEBOOK</p>
              <h2>
                Beyond the <em>conversation.</em>
              </h2>
            </div>
            <Link className="text-link" href="/blog/">
              Read the blog
            </Link>
          </div>
          <BlogCards posts={posts.slice(0, 3)} />
        </section>
      )}
      <NewsletterSignup
        title={content.newsletterTitle}
        description={content.newsletterDescription}
      />
      <Connect />
      <LegacyEpisodeLinks numbers={episodes.map((episode) => episode.number)} />
    </main>
  );
}
