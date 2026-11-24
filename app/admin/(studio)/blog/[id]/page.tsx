import { notFound } from "next/navigation";
import { z } from "zod";
import { adminDb } from "@/lib/studio-store";
import { BlogEditor } from "@/components/admin/blog-editor";
export default async function EditPost({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const pool = await adminDb(),
    { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const result = await pool.query(
    "SELECT content,published,updated_at::text AS revision FROM studio_posts WHERE id=$1",
    [id],
  );
  if (!result.rowCount) notFound();
  return (
    <BlogEditor
      id={id}
      initial={result.rows[0].content}
      published={result.rows[0].published}
      revision={result.rows[0].revision}
    />
  );
}
