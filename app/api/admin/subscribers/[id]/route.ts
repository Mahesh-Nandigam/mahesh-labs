import { apiError, HttpError, requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { z } from "zod";
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(request);
    const id = (await context.params).id;
    if (!z.uuid().safeParse(id).success)
      throw new HttpError(404, "Subscriber not found.");
    const result = await db().query(
      "UPDATE newsletter_subscribers SET status='unsubscribed',unsubscribed_at=COALESCE(unsubscribed_at,now()),updated_at=now() WHERE id=$1 RETURNING id",
      [id],
    );
    if (!result.rowCount) throw new HttpError(404, "Subscriber not found.");
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
