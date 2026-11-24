import nextEnv from "@next/env";
import { neon } from "@neondatabase/serverless";
import { EnvHttpProxyAgent } from "undici";
const agent =
  process.env.HTTPS_PROXY || process.env.HTTP_PROXY
    ? new EnvHttpProxyAgent()
    : undefined;
const transport = agent ? { dispatcher: agent } : {};
nextEnv.loadEnvConfig(process.cwd());
export function database({ direct = false } = {}) {
  const connectionString = direct
    ? process.env.DATABASE_URL_UNPOOLED
    : process.env.DATABASE_URL;
  if (!connectionString)
    throw new Error(
      `${direct ? "DATABASE_URL_UNPOOLED" : "DATABASE_URL"} is required.`,
    );
  const sql = neon(connectionString, {
    fullResults: true,
    fetchOptions: transport,
  });
  return {
    sql,
    query: (text, values = []) =>
      sql.query(text, values, {
        fetchOptions: { signal: AbortSignal.timeout(60000), ...transport },
      }),
    end: async () => {
      await agent?.close();
    },
  };
}
