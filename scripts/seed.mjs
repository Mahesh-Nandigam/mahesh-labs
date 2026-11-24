import { readFile } from "node:fs/promises";
import { database } from "./database.mjs";
const pool = database();
try {
  const episodes = JSON.parse(
    await readFile(
      new URL("../content/episodes.json", import.meta.url),
      "utf8",
    ),
  );
  const results = await pool.sql.transaction(
    episodes.map((episode) =>
      pool.sql.query(
        "INSERT INTO studio_episodes (number,content,published) VALUES ($1,$2,true) ON CONFLICT (number) DO NOTHING",
        [episode.number, JSON.stringify(episode)],
      ),
    ),
  );
  const added = results.reduce((sum, result) => sum + result.rowCount, 0);
  console.log(`Seeded ${added} episodes; existing content preserved.`);
} finally {
  await pool.end();
}
