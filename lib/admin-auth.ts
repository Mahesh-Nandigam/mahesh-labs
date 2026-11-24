import "server-only";
import { cookies } from "next/headers";
import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { db } from "./db";

const derive = promisify(scrypt);
export const adminCookie = "maheshlabs_studio";
const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host") || new URL(request.url).host;
  let valid = false;
  try {
    const parsed = new URL(origin || "");
    valid =
      ["http:", "https:"].includes(parsed.protocol) && parsed.host === host;
  } catch {}
  if (!valid)
    throw new HttpError(
      403,
      "Please submit this form from the MaheshLabs website.",
    );
}
export async function rateLimit(
  request: Request,
  scope: string,
  limit: number,
  seconds: number,
) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const key = hashToken(`${scope}:${ip}`);
  const globalKey = hashToken("admin-login-global");
  const keys = scope === "admin-login" ? [key, globalKey] : [key];
  const result = await db().query(
    `INSERT INTO studio_rate_limits (key,attempts,expires_at) SELECT unnest($1::text[]),1,now()+$2*interval '1 second'
    ON CONFLICT (key) DO UPDATE SET attempts=CASE WHEN studio_rate_limits.expires_at<now() THEN 1 ELSE studio_rate_limits.attempts+1 END,
    expires_at=CASE WHEN studio_rate_limits.expires_at<now() THEN now()+$2*interval '1 second' ELSE studio_rate_limits.expires_at END RETURNING key,attempts`,
    [keys, seconds],
  );
  if (
    result.rows.some(
      (row) => row.attempts > (row.key === globalKey ? 60 : limit),
    )
  )
    throw new HttpError(429, "Too many attempts. Please try again later.");
}
export async function verifyAdminPassword(password: string) {
  const encoded = process.env.ADMIN_PASSWORD_HASH;
  if (!encoded)
    throw new HttpError(503, "Admin login has not been configured.");
  const [algorithm, salt, hex] = encoded.split(":");
  if (algorithm !== "scrypt" || !salt || !/^[a-f0-9]{128}$/.test(hex || ""))
    throw new HttpError(503, "Admin login configuration is invalid.");
  const candidate = (await derive(password, salt, 64)) as Buffer;
  return timingSafeEqual(candidate, Buffer.from(hex, "hex"));
}
export async function createAdminSession() {
  const token = randomBytes(32).toString("base64url");
  await db().query(
    "WITH expired_sessions AS (DELETE FROM studio_sessions WHERE expires_at<now()), expired_limits AS (DELETE FROM studio_rate_limits WHERE expires_at<now()-interval '1 day') INSERT INTO studio_sessions (token_hash,expires_at) VALUES ($1,now()+interval '12 hours')",
    [hashToken(token)],
  );
  (await cookies()).set(adminCookie, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 43200,
  });
}
export async function hasAdminSession() {
  const token = (await cookies()).get(adminCookie)?.value;
  if (!token || !/^[\w-]{43}$/.test(token) || !process.env.DATABASE_URL)
    return false;
  const result = await db().query(
    "SELECT 1 FROM studio_sessions WHERE token_hash=$1 AND expires_at>now()",
    [hashToken(token)],
  );
  return Boolean(result.rowCount);
}
export async function requireAdmin(request?: Request) {
  if (request && request.method !== "GET") assertSameOrigin(request);
  if (!(await hasAdminSession()))
    throw new HttpError(401, "Please sign in to continue.");
}
export async function endAdminSession() {
  const token = (await cookies()).get(adminCookie)?.value;
  if (token)
    await db().query("DELETE FROM studio_sessions WHERE token_hash=$1", [
      hashToken(token),
    ]);
  (await cookies()).delete(adminCookie);
}
export function apiError(error: unknown) {
  if (error instanceof RangeError)
    return Response.json({ error: "This form is too large." }, { status: 413 });
  if (error instanceof SyntaxError)
    return Response.json(
      { error: "Please submit valid form data." },
      { status: 400 },
    );
  if (error instanceof HttpError)
    return Response.json({ error: error.message }, { status: error.status });
  console.error(
    "Studio request failed:",
    error instanceof Error ? error.name : "unknown",
  );
  return Response.json(
    { error: "We couldn’t complete that request. Please try again." },
    { status: 500 },
  );
}
