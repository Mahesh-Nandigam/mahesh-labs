import { z } from "zod";
import {
  apiError,
  assertSameOrigin,
  HttpError,
  rateLimit,
} from "@/lib/admin-auth";
import { consentText, emailSchema, readJson } from "@/lib/studio-validation";
import { db } from "@/lib/db";
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const parsed = z
      .object({
        email: emailSchema,
        consent: z.literal(true),
        website: z.string().max(200).optional(),
      })
      .safeParse(await readJson(request));
    if (!parsed.success)
      throw new HttpError(400, "Enter a valid email address.");
    if (parsed.data.website) return Response.json({ ok: true });
    await rateLimit(request, "newsletter-signup", 10, 600);
    const result = await db().query(
      `INSERT INTO newsletter_subscribers (email,consent_text) VALUES ($1,$2) ON CONFLICT (email) DO UPDATE SET email=EXCLUDED.email RETURNING status`,
      [parsed.data.email, consentText],
    );
    if (result.rows[0].status !== "subscribed")
      throw new HttpError(409, "This address is unsubscribed. Please contact Mahesh Labs if you would like to rejoin.");
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
