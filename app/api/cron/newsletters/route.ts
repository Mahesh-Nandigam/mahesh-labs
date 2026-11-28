import { timingSafeEqual } from "node:crypto";
import { processNewsletterQueue } from "@/lib/newsletter-delivery";
import { apiError } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const actual = Buffer.from(request.headers.get("authorization") || "");
  const expected = Buffer.from(`Bearer ${secret}`);
  if (process.env.NEWSLETTER_SCHEDULER_ENABLED !== "true" || !secret || secret.length < 32 || actual.length !== expected.length || !timingSafeEqual(actual, expected))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return Response.json(await processNewsletterQueue(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}
