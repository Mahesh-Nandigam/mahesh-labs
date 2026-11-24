import { z } from "zod";
import { apiError, HttpError, requireAdmin } from "@/lib/admin-auth";
import { draftSchema, readJson } from "@/lib/studio-validation";
import { db } from "@/lib/db";
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(request);
    const id = (await context.params).id;
    if (!z.uuid().safeParse(id).success)
      throw new HttpError(404, "Draft not found.");
    const parsed = z
      .object({ draft: draftSchema, updatedAt: z.string() })
      .safeParse(await readJson(request));
    if (!parsed.success)
      throw new HttpError(400, parsed.error.issues[0].message);
    const d = parsed.data.draft;
    const result = await db().query(
      "UPDATE newsletter_drafts SET title=$1,subject=$2,preheader=$3,body=$4,early_access_url=$5,status=$6,updated_at=clock_timestamp() WHERE id=$7 AND updated_at=$8::timestamptz RETURNING updated_at::text",
      [
        d.title,
        d.subject,
        d.preheader,
        d.body,
        d.earlyAccessUrl,
        d.status,
        id,
        parsed.data.updatedAt,
      ],
    );
    if (!result.rowCount)
      throw new HttpError(
        409,
        "This draft changed in another tab. Reload before saving.",
      );
    return Response.json({ updatedAt: result.rows[0].updated_at });
  } catch (error) {
    return apiError(error);
  }
}
