import { notFound } from "next/navigation";
import { z } from "zod";
import { adminDb } from "@/lib/studio-store";
import { draftSchema } from "@/lib/studio-validation";
import { NewsletterEditor } from "@/components/admin/newsletter-editor";
import { deliverySetup, newsletterCampaigns } from "@/lib/newsletter-delivery";
export default async function NewsletterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const pool = await adminDb();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const result = await pool.query(
    'SELECT id,title,subject,preheader,body,early_access_url AS "earlyAccessUrl",early_access_episode AS "earlyAccessEpisode",status,updated_at::text AS "updatedAt" FROM newsletter_drafts WHERE id=$1',
    [id],
  );
  if (!result.rowCount) notFound();
  const episodes = await pool.query("SELECT number,content->>'title' AS title FROM studio_episodes WHERE published=true AND content->>'videoId' IS NOT NULL AND content->>'publicReleaseAt' IS NOT NULL ORDER BY number DESC");
  return (
    <NewsletterEditor
      episodes={episodes.rows as { number: number; title: string }[]}
      delivery={{ setup: await deliverySetup(), campaigns: await newsletterCampaigns(id) }}
      initial={{
        ...draftSchema.parse(result.rows[0]),
        id: result.rows[0].id,
        updatedAt: result.rows[0].updatedAt,
      }}
    />
  );
}
