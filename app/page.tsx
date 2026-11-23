import { Hero, TopicRibbon, OurStory, OurTeam, Connect } from "@/components/home-sections";
import { EpisodeArchive } from "@/components/episode-archive";
import { ChapterSearch } from "@/components/chapter-search";
import { LegacyEpisodeLinks } from "@/components/legacy-episode-links";

export default function HomePage() {
  return <main id="main">
    <Hero />
    <TopicRibbon />
    <EpisodeArchive />
    <OurStory />
    <ChapterSearch />
    <OurTeam />
    <Connect />
    <LegacyEpisodeLinks />
  </main>;
}
