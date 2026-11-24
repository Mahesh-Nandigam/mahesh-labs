import { z } from "zod";
import { revalidateTag } from "next/cache";
import { apiError, HttpError, requireAdmin } from "@/lib/admin-auth";
import { readJson } from "@/lib/studio-validation";
import { postSchema } from "@/lib/blog";
import { db } from "@/lib/db";
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(request);
    const id = (await context.params).id;
    if (!z.uuid().safeParse(id).success)
      throw new HttpError(404, "Post not found.");
    const parsed = z
      .object({
        post: postSchema,
        published: z.boolean(),
        revision: z.string(),
      })
      .safeParse(await readJson(request));
    if (!parsed.success)
      throw new HttpError(400, parsed.error.issues[0].message);
    const d = parsed.data;
    try {
      const result = await db().query(
        "UPDATE studio_posts SET slug=$1,content=$2,published=$3,published_at=CASE WHEN $3 THEN COALESCE(published_at,now()) ELSE published_at END,updated_at=clock_timestamp() WHERE id=$4 AND updated_at=$5::timestamptz RETURNING updated_at::text AS revision",
        [d.post.slug, JSON.stringify(d.post), d.published, id, d.revision],
      );
      if (!result.rowCount)
        throw new HttpError(
          409,
          "This post changed in another tab. Reload before saving.",
        );
      revalidateTag("blog", { expire: 0 });
      return Response.json({ revision: result.rows[0].revision });
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "23505"
      )
        throw new HttpError(409, "A post already uses that URL.");
      throw error;
    }
  } catch (error) {
    return apiError(error);
  }
}
