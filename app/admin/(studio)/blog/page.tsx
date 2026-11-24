import { StudioLink as Link } from "@/components/admin/studio-link";
import { adminDb, dateLabel } from "@/lib/studio-store";
export default async function BlogAdmin() {
  const pool = await adminDb(),
    result = await pool.query(
      `SELECT id,slug,content->>'title' AS title,content->>'author' AS author,published,updated_at FROM studio_posts ORDER BY updated_at DESC`,
    );
  return (
    <>
      <div className="studio-heading">
        <div>
          <p className="studio-kicker">YOUR PUBLICATION</p>
          <h1>The notebook.</h1>
          <p>
            Turn your notes, experiences, and ideas into something worth
            sharing.
          </p>
        </div>
        <Link className="studio-button" href="/admin/blog/new/">
          Write an article
        </Link>
      </div>
      {result.rowCount ? (
        <section className="studio-panel">
          <div className="studio-table-scroll">
            <table className="studio-table">
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Status</th>
                  <th>Last edited</th>
                  <th>
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.title}</strong>
                      <small className="studio-table-subtitle">
                        {row.author} · /blog/{row.slug}/
                      </small>
                    </td>
                    <td>
                      <span
                        className={`studio-badge ${row.published ? "green" : ""}`}
                      >
                        {row.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td>{dateLabel(row.updated_at)}</td>
                    <td>
                      <Link
                        className="studio-table-action"
                        href={`/admin/blog/${row.id}/`}
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <div className="studio-empty">
          <span className="studio-empty-symbol">✳</span>
          <h2>Let your first idea find its words.</h2>
          <p>
            Start a draft. Add a cover, write in Markdown, and publish when
            you’re ready.
          </p>
          <Link className="studio-button" href="/admin/blog/new/">
            Write an article
          </Link>
        </div>
      )}
    </>
  );
}
