import { adminDb } from "@/lib/studio-store";
import { EpisodeEditor } from "@/components/admin/episode-editor";
export default async function NewEpisode() {
  const pool = await adminDb();
  const result = await pool.query(
    "SELECT COALESCE(max(number),0)+1 AS number FROM studio_episodes",
  );
  return (
    <EpisodeEditor
      initial={{
        number: result.rows[0].number,
        guest: "",
        title: "",
        description: "",
        topics: [],
        role: "",
        image: "/assets/episode-01-placeholder.jpg",
        videoId: null,
        duration: "Coming soon",
        status: "Coming soon",
        chapters: [],
        links: [],
      }}
      published={false}
      revision=""
      isNew
    />
  );
}
