import "server-only";
import { neon } from "@neondatabase/serverless";
import { EnvHttpProxyAgent } from "undici";
const transport =
  process.env.HTTPS_PROXY || process.env.HTTP_PROXY
    ? { dispatcher: new EnvHttpProxyAgent() }
    : {};
const globalDb = globalThis as unknown as {
  studioSql?: ReturnType<typeof neon<false, true>>;
};
export function db() {
  if (!process.env.DATABASE_URL)
    throw new Error("DATABASE_URL is not configured.");
  if (!globalDb.studioSql)
    globalDb.studioSql = neon(process.env.DATABASE_URL, {
      fullResults: true,
      fetchOptions: { cache: "no-store", ...transport },
    });
  const sql = globalDb.studioSql;
  return {
    query: (text: string, values: unknown[] = []) =>
      sql.query(text, values, {
        fetchOptions: {
          signal: AbortSignal.timeout(
            process.env.HTTPS_PROXY || process.env.HTTP_PROXY ? 60000 : 30000,
          ),
          cache: "no-store",
          ...transport,
        },
      }),
  };
}

export const contentCacheScope =
  process.env.NEON_BRANCH_ID ||
  (() => {
    try {
      return new URL(process.env.DATABASE_URL || "").hostname;
    } catch {
      return "unconfigured";
    }
  })();
