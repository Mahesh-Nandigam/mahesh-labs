import { revalidateTag } from "next/cache";
import { apiError, HttpError, requireAdmin } from "@/lib/admin-auth";
import { readJson } from "@/lib/studio-validation";
import { postSchema } from "@/lib/blog";
import { db } from "@/lib/db";
export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const parsed = postSchema.safeParse(await readJson(request));
    if (!parsed.success)
      throw new HttpError(400, parsed.error.issues[0].message);
    const result = await db().query(
      "INSERT INTO studio_posts (slug,content) VALUES ($1,$2) ON CONFLICT (slug) DO NOTHING RETURNING id",
      [parsed.data.slug, JSON.stringify(parsed.data)],
    );
    if (!result.rowCount)
      throw new HttpError(
        409,
        "A post already uses that URL. Choose another slug.",
      );
    revalidateTag("blog", { expire: 0 });
    return Response.json({ id: result.rows[0].id }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
