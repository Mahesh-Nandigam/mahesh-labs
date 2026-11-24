import { StudioLink as Link } from "@/components/admin/studio-link";
import { adminDb, dateLabel } from "@/lib/studio-store";
export default async function Dashboard() {
  const pool = await adminDb();
  const [counts, recent] = await Promise.all([
    pool.query(
      `SELECT (SELECT count(*) FROM newsletter_subscribers WHERE status='subscribed') AS subscribers,(SELECT count(*) FROM newsletter_drafts WHERE status='draft') AS drafts,(SELECT count(*) FROM studio_episodes WHERE published=true) AS episodes,(SELECT count(*) FROM studio_episodes WHERE published=false) AS unpublished`,
    ),
    pool.query(
      "SELECT number,content,published,updated_at FROM studio_episodes ORDER BY updated_at DESC LIMIT 4",
    ),
  ]);
  const c = counts.rows[0];
  return (
    <>
      <div className="studio-heading">
        <div>
          <p className="studio-kicker">YOUR WORKSPACE</p>
          <h1>Make room for the next conversation.</h1>
          <p>A quick look at what’s growing and what’s in the works.</p>
        </div>
        <Link className="studio-button" href="/admin/newsletters/new/">
          Write a newsletter
        </Link>
      </div>
      <div className="studio-stats">
        {[
          ["Subscribers", c.subscribers, "People on your mailing list"],
          ["Newsletter drafts", c.drafts, "Ideas taking shape"],
          ["Published episodes", c.episodes, "Conversations on the website"],
          ["Unpublished episodes", c.unpublished, "Ready when you are"],
        ].map(([label, value, note]) => (
          <article className="studio-stat" key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{note}</span>
          </article>
        ))}
      </div>
      <div className="studio-overview-grid">
        <section className="studio-panel">
          <div className="studio-panel-heading">
            <h2>Recently edited episodes</h2>
            <Link href="/admin/episodes/">View all</Link>
          </div>
          {recent.rows.map((row) => (
            <Link
              className="studio-recent"
              key={row.number}
              href={`/admin/episodes/${row.number}/`}
            >
              <span className="studio-episode-number">
                {String(row.number).padStart(2, "0")}
              </span>
              <span>
                <strong>{row.content.title}</strong>
                <small>
                  {row.content.guest} · {dateLabel(row.updated_at)}
                </small>
              </span>
              <span className={`studio-badge ${row.published ? "green" : ""}`}>
                {row.published ? "Published" : "Draft"}
              </span>
            </Link>
          ))}
        </section>
        <section className="studio-panel studio-next">
          <p className="studio-kicker">NEXT UP</p>
          <h2>Build your newsletter before your first send.</h2>
          <p>
            Collect subscribers, shape your drafts, and keep early-access links
            ready. We’ll connect an email provider when you choose one.
          </p>
          <Link className="studio-button secondary" href="/admin/subscribers/">
            Meet your subscribers
          </Link>
          <div className="studio-provider-note">
            Email sending is not connected.
          </div>
        </section>
      </div>
    </>
  );
}
