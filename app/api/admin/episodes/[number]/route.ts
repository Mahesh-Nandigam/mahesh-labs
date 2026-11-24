import { revalidateTag } from "next/cache";
import { apiError, HttpError, requireAdmin } from "@/lib/admin-auth";
import { episodeSchema, readJson } from "@/lib/studio-validation";
import { db } from "@/lib/db";
import { z } from "zod";
export async function PUT(
  request: Request,
  context: { params: Promise<{ number: string }> },
) {
  try {
    await requireAdmin(request);
    const number = Number((await context.params).number);
    const parsed = z
      .object({
        episode: episodeSchema,
        published: z.boolean(),
        updatedAt: z.string(),
      })
      .safeParse(await readJson(request));
    if (!parsed.success)
      throw new HttpError(400, parsed.error.issues[0].message);
    if (number !== parsed.data.episode.number)
      throw new HttpError(400, "Episode numbers cannot be changed.");
    const result = await db().query(
      "UPDATE studio_episodes SET content=$1,published=$2,updated_at=clock_timestamp() WHERE number=$3 AND updated_at=$4::timestamptz RETURNING updated_at::text",
      [
        JSON.stringify(parsed.data.episode),
        parsed.data.published,
        number,
        parsed.data.updatedAt,
      ],
    );
    if (!result.rowCount)
      throw new HttpError(
        409,
        "This episode changed in another tab. Reload before saving.",
      );
    revalidateTag("episodes", { expire: 0 });
    return Response.json({ updatedAt: result.rows[0].updated_at });
  } catch (error) {
    return apiError(error);
  }
}
