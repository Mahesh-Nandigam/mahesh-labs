import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { database } from "./database.mjs";

if (!process.env.NEON_BRANCH?.startsWith("dev-"))
  throw new Error("Integration tests require an isolated dev-* Neon branch.");
if (!process.env.STUDIO_TEST_PASSWORD)
  throw new Error("Set STUDIO_TEST_PASSWORD to the local admin password.");
const pool = database(),
  base = process.env.STUDIO_TEST_URL || "http://127.0.0.1:4173";
const marker = "studio-e2e-" + randomUUID(),
  email = marker + "@example.com";
const testIp = "test-" + randomUUID();
let cookie = "",
  draftId = "",
  postId = "",
  postSlug = marker,
  createdNumber = 0,
  fixtureNumbers = [];
let passed = 0;
function pass(label) {
  passed++;
  console.log("PASS " + label);
}
async function request(
  path,
  method = "GET",
  body,
  authenticated = true,
  extra = {},
) {
  return fetch(base + path, {
    method,
    redirect: "manual",
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(method !== "GET" ? { Origin: base } : {}),
      "x-forwarded-for": testIp,
      ...(authenticated && cookie ? { Cookie: cookie } : {}),
      ...extra,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(150000),
  });
}
const value = await pool.query(
  "SELECT COALESCE(max(number),0)+100 AS number FROM studio_episodes",
);
const start = Number(value.rows[0].number);
try {
  await pool.query("SELECT 1");
  pass("Neon Postgres connection");
  for (const path of ["/api/admin/subscribers/export/", "/admin/"]) {
    const response = await request(path, "GET", undefined, false);
    assert.equal(response.status, path.startsWith("/api") ? 401 : 307);
  }
  for (const path of [
    "/api/admin/episodes/",
    "/api/admin/newsletters/",
    "/api/admin/blog/",
  ])
    assert.equal((await request(path, "POST", {}, false)).status, 401);
  pass("Admin pages and data endpoints reject anonymous access");
  assert.equal(
    (
      await request(
        "/api/admin/login/",
        "POST",
        { password: "incorrect" },
        false,
      )
    ).status,
    401,
  );
  const login = await request(
    "/api/admin/login/",
    "POST",
    { password: process.env.STUDIO_TEST_PASSWORD },
    false,
  );
  assert.equal(login.status, 200, await login.text());
  cookie = login.headers.get("set-cookie").split(";")[0];
  assert.match(login.headers.get("set-cookie"), /HttpOnly/i);
  assert.match(login.headers.get("set-cookie"), /SameSite=strict/i);
  assert.equal(
    (await request("/api/admin/subscribers/export/", "GET")).status,
    200,
  );
  pass("Password login issues a working HttpOnly session");
  assert.equal(
    (
      await request("/api/admin/newsletters/", "POST", {}, true, {
        Origin: "https://example.org",
      })
    ).status,
    403,
  );
  pass("Admin mutations reject cross-site requests");
  assert.equal(
    (
      await request(
        "/api/newsletter/subscribe/",
        "POST",
        { email, consent: false },
        false,
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await request(
        "/api/newsletter/subscribe/",
        "POST",
        { email: "invalid", consent: true },
        false,
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await request(
        "/api/newsletter/subscribe/",
        "POST",
        { email, consent: true },
        false,
      )
    ).status,
    200,
  );
  assert.equal(
    (
      await request(
        "/api/newsletter/subscribe/",
        "POST",
        { email: email.toUpperCase(), consent: true },
        false,
      )
    ).status,
    200,
  );
  const subscribers = await pool.query(
    "SELECT id,status,consent_text FROM newsletter_subscribers WHERE email=$1",
    [email],
  );
  assert.equal(subscribers.rowCount, 1);
  assert.equal(subscribers.rows[0].status, "subscribed");
  assert.ok(subscribers.rows[0].consent_text);
  assert.ok(
    (await (await request("/api/admin/subscribers/export/")).text()).includes(
      email,
    ),
  );
  assert.equal(
    (
      await request(
        `/api/admin/subscribers/${subscribers.rows[0].id}/`,
        "DELETE",
      )
    ).status,
    200,
  );
  await request(
    "/api/newsletter/subscribe/",
    "POST",
    { email, consent: true },
    false,
  );
  assert.equal(
    (
      await pool.query(
        "SELECT status FROM newsletter_subscribers WHERE email=$1",
        [email],
      )
    ).rows[0].status,
    "unsubscribed",
  );
  assert.ok(
    !(await (await request("/api/admin/subscribers/export/")).text()).includes(
      email,
    ),
  );
  pass(
    "Signup consent, normalization, duplicate prevention, CSV export, and unsubscribe suppression",
  );
  const originals = JSON.parse(
    await readFile(
      new URL("../content/episodes.json", import.meta.url),
      "utf8",
    ),
  );
  const episode = {
    ...originals[0],
    number: start,
    title: marker,
    externalPlayback: false,
  };
  createdNumber = start;
  const created = await request("/api/admin/episodes/", "POST", episode);
  assert.equal(created.status, 201, await created.text());
  assert.equal((await request(`/episodes/${start}/`)).status, 404);
  let revision = (
    await pool.query(
      "SELECT updated_at::text AS revision FROM studio_episodes WHERE number=$1",
      [start],
    )
  ).rows[0].revision;
  const published = await request(`/api/admin/episodes/${start}/`, "PUT", {
    episode,
    published: true,
    updatedAt: revision,
  });
  assert.equal(published.status, 200, await published.text());
  const publicEpisode = await request(`/episodes/${start}/`);
  assert.equal(publicEpisode.status, 200);
  assert.ok((await publicEpisode.text()).includes(marker));
  assert.equal(
    (
      await request(`/api/admin/episodes/${start}/`, "PUT", {
        episode,
        published: false,
        updatedAt: revision,
      })
    ).status,
    409,
  );
  pass(
    "Episode draft privacy, publishing, and concurrent-edit conflict protection",
  );
  const statements = [];
  for (let i = 1; i <= 14; i++) {
    const number = start + i;
    fixtureNumbers.push(number);
    const content = {
      ...episode,
      number,
      title: marker + "-" + i,
      videoId: null,
    };
    statements.push(
      pool.sql.query(
        "INSERT INTO studio_episodes (number,content,published) VALUES ($1,$2,true)",
        [number, JSON.stringify(content)],
      ),
    );
  }
  await pool.sql.transaction(statements);
  revision = (
    await pool.query(
      "SELECT updated_at::text AS revision FROM studio_episodes WHERE number=$1",
      [start],
    )
  ).rows[0].revision;
  await request(`/api/admin/episodes/${start}/`, "PUT", {
    episode,
    published: true,
    updatedAt: revision,
  });
  const homeResponse = await request("/");
  assert.equal(
    homeResponse.status,
    200,
    "Homepage must render without a server error",
  );
  const home = await homeResponse.text();
  assert.equal((home.match(/class="episode-card"/g) || []).length, 6);
  assert.ok(home.includes("More conversations"));
  const archive1 = await (await request("/episodes/")).text(),
    archive2 = await (await request("/episodes/?page=2")).text();
  assert.equal((archive1.match(/class="episode-card"/g) || []).length, 12);
  assert.ok((archive2.match(/class="episode-card"/g) || []).length > 0);
  assert.ok(archive2.includes("Previous"));
  pass("Homepage six-card cap and separate 12-item paginated archive");
  const defaultHomepage = JSON.parse(
    await readFile(
      new URL("../content/homepage.json", import.meta.url),
      "utf8",
    ),
  );
  assert.ok(home.includes(defaultHomepage.heroDescription));
  assert.equal((await request("/admin/content/")).status, 404);
  assert.equal((await request("/api/admin/content/", "PUT", {})).status, 404);
  assert.ok(!(await (await request("/admin/")).text()).includes("Site copy"));
  pass("Homepage copy is hardcoded and the Site copy editor is removed");
  const draft = {
    title: marker,
    subject: "Test subject",
    preheader: "Preview",
    body: "A private draft.",
    earlyAccessUrl: "https://example.com/early",
    status: "draft",
  };
  const newsletter = await request("/api/admin/newsletters/", "POST", draft);
  assert.equal(newsletter.status, 201);
  draftId = (await newsletter.json()).id;
  assert.ok(
    (
      await pool.query("SELECT subject FROM newsletter_drafts WHERE id=$1", [
        draftId,
      ])
    ).rows[0].subject === "Test subject",
  );
  const newsletterPage = await request(`/admin/newsletters/${draftId}/`);
  assert.equal(newsletterPage.status, 200);
  pass("Provider-independent newsletter drafts persist and open in Studio");
  const post = {
    title: marker,
    slug: postSlug,
    excerpt: "Integration test excerpt",
    body: "## First section\n\nA useful paragraph.\n\n## First section\n\nAnother paragraph.\n\n<script>alert(1)</script>",
    cover: "",
    author: "Studio test",
    tags: ["Testing"],
  };
  const postResponse = await request("/api/admin/blog/", "POST", post);
  assert.equal(postResponse.status, 201);
  postId = (await postResponse.json()).id;
  assert.equal((await request(`/blog/${postSlug}/`)).status, 404);
  const postRevision = (
    await pool.query(
      "SELECT updated_at::text AS revision FROM studio_posts WHERE id=$1",
      [postId],
    )
  ).rows[0].revision;
  const publishPost = await request(`/api/admin/blog/${postId}/`, "PUT", {
    post,
    published: true,
    revision: postRevision,
  });
  assert.equal(publishPost.status, 200, await publishPost.text());
  const article = await request(`/blog/${postSlug}/`);
  assert.equal(article.status, 200);
  const articleHtml = await article.text();
  assert.ok(articleHtml.includes('id="first-section"'));
  assert.ok(articleHtml.includes('id="first-section-1"'));
  assert.ok(!articleHtml.includes("<script>alert(1)</script>"));
  assert.ok((await (await request("/blog/")).text()).includes(marker));
  pass("Blog draft privacy, publishing, safe Markdown, and table of contents");
  const ip = "rate-" + randomUUID();
  for (let i = 0; i < 5; i++)
    assert.equal(
      (
        await request(
          "/api/admin/login/",
          "POST",
          { password: "incorrect" },
          false,
          { "x-forwarded-for": ip },
        )
      ).status,
      401,
    );
  assert.equal(
    (
      await request(
        "/api/admin/login/",
        "POST",
        { password: "incorrect" },
        false,
        { "x-forwarded-for": ip },
      )
    ).status,
    429,
  );
  pass("Password attempts are rate limited");
  assert.equal((await request("/api/admin/logout/", "POST")).status, 200);
  assert.equal((await request("/api/admin/subscribers/export/")).status, 401);
  pass("Logout revokes the server-side session");
  console.log(`Integration tests passed: ${passed}`);
} finally {
  try {
    const cleanup = [
      pool.sql.query("DELETE FROM newsletter_subscribers WHERE email=$1", [
        email,
      ]),
      pool.sql.query(
        "DELETE FROM studio_episodes WHERE number=ANY($1::int[])",
        [[...fixtureNumbers, ...(createdNumber ? [createdNumber] : [])]],
      ),
    ];
    if (draftId)
      cleanup.push(
        pool.sql.query("DELETE FROM newsletter_drafts WHERE id=$1", [draftId]),
      );
    if (postId)
      cleanup.push(
        pool.sql.query("DELETE FROM studio_posts WHERE id=$1", [postId]),
      );
    await pool.sql.transaction(cleanup);
    console.log("Temporary test records removed.");
  } finally {
    await pool.end();
  }
}
