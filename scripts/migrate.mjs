import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { database } from "./database.mjs";
const { sql, query, end } = database({ direct: true });
try {
  await query(
    "CREATE TABLE IF NOT EXISTS studio_migrations (name text PRIMARY KEY,checksum text NOT NULL,applied_at timestamptz NOT NULL DEFAULT now())",
  );
  for (const name of (
    await readdir(new URL("../db/migrations/", import.meta.url))
  )
    .filter((n) => n.endsWith(".sql"))
    .sort()) {
    const content = await readFile(
      new URL("../db/migrations/" + name, import.meta.url),
      "utf8",
    );
    const checksum = createHash("sha256").update(content).digest("hex");
    const previous = await query(
      "SELECT checksum FROM studio_migrations WHERE name=$1",
      [name],
    );
    if (previous.rowCount) {
      if (previous.rows[0].checksum !== checksum)
        throw new Error(`Applied migration changed: ${name}`);
      console.log(`Already applied: ${name}`);
      continue;
    }
    const statements = content
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);
    await sql.transaction([
      sql.query(
        "SELECT pg_advisory_xact_lock(hashtext('mahesh-labs-migrations'))",
      ),
      ...statements.map((statement) => sql.query(statement)),
      sql.query(
        "INSERT INTO studio_migrations (name,checksum) VALUES ($1,$2) ON CONFLICT DO NOTHING",
        [name, checksum],
      ),
    ]);
    console.log(`Applied: ${name}`);
  }
} finally {
  await end();
}
