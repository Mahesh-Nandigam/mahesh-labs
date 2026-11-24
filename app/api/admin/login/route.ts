import { z } from "zod";
import {
  apiError,
  assertSameOrigin,
  createAdminSession,
  HttpError,
  rateLimit,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import { readJson } from "@/lib/studio-validation";
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await rateLimit(request, "admin-login", 5, 900);
    const parsed = z
      .object({ password: z.string().min(1).max(256) })
      .safeParse(await readJson(request));
    if (!parsed.success || !(await verifyAdminPassword(parsed.data.password)))
      throw new HttpError(401, "That password isn’t correct.");
    await createAdminSession();
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
