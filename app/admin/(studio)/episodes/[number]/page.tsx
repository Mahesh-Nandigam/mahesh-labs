import { notFound } from "next/navigation";
import { adminDb } from "@/lib/studio-store";
import { EpisodeEditor } from "@/components/admin/episode-editor";
export default async function EditEpisode({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const pool = await adminDb();
  const { number } = await params;
  const result = await pool.query(
    "SELECT content,published,updated_at::text AS revision FROM studio_episodes WHERE number=$1",
    [Number(number) || 0],
  );
  if (!result.rowCount) notFound();
  return (
    <EpisodeEditor
      initial={result.rows[0].content}
      published={result.rows[0].published}
      revision={result.rows[0].revision}
    />
  );
}
