import { apiError, HttpError, requireAdmin } from "@/lib/admin-auth";
import { draftSchema, readJson } from "@/lib/studio-validation";
import { db } from "@/lib/db";
export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const parsed = draftSchema.safeParse(await readJson(request));
    if (!parsed.success)
      throw new HttpError(400, parsed.error.issues[0].message);
    const d = parsed.data;
    const result = await db().query(
      "INSERT INTO newsletter_drafts (title,subject,preheader,body,early_access_url,status,early_access_episode) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id",
      [d.title, d.subject, d.preheader, d.body, d.earlyAccessUrl, d.status, d.earlyAccessEpisode],
    );
    return Response.json({ id: result.rows[0].id }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
