import { revalidateTag } from "next/cache";
import { apiError, HttpError, requireAdmin } from "@/lib/admin-auth";
import { episodeSchema, readJson } from "@/lib/studio-validation";
import { db } from "@/lib/db";
export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const parsed = episodeSchema.safeParse(await readJson(request));
    if (!parsed.success)
      throw new HttpError(400, parsed.error.issues[0].message);
    const result = await db().query(
      "INSERT INTO studio_episodes (number,content,published) VALUES ($1,$2,false) ON CONFLICT DO NOTHING RETURNING number",
      [parsed.data.number, JSON.stringify(parsed.data)],
    );
    if (!result.rowCount)
      throw new HttpError(409, "That episode number already exists.");
    revalidateTag("episodes", { expire: 0 });
    return Response.json({ number: parsed.data.number }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
