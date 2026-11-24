import { StudioLink as Link } from "@/components/admin/studio-link";
import { adminDb, dateLabel } from "@/lib/studio-store";
export default async function NewslettersPage() {
  const pool = await adminDb();
  const result = await pool.query(
    "SELECT id,title,subject,status,updated_at FROM newsletter_drafts ORDER BY updated_at DESC",
  );
  return (
    <>
      <div className="studio-heading">
        <div>
          <p className="studio-kicker">LETTERS TO YOUR COMMUNITY</p>
          <h1>Newsletters.</h1>
          <p>A place for early access, useful ideas, and your next update.</p>
        </div>
        <Link className="studio-button" href="/admin/newsletters/new/">
          New draft
        </Link>
      </div>
      <div className="studio-info">
        Drafts are saved here. Email sending will be available after you connect
        a provider.
      </div>
      {result.rowCount ? (
        <section className="studio-panel">
          <div className="studio-table-scroll">
            <table className="studio-table">
              <thead>
                <tr>
                  <th>Newsletter</th>
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
                        {row.subject || "No subject yet"}
                      </small>
                    </td>
                    <td>
                      <span className="studio-badge">
                        {row.status === "draft" ? "Draft" : "Archived"}
                      </span>
                    </td>
                    <td>{dateLabel(row.updated_at)}</td>
                    <td>
                      <Link
                        className="studio-table-action"
                        href={`/admin/newsletters/${row.id}/`}
                      >
                        Open
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
          <h2>Your first letter starts here.</h2>
          <p>Write something your subscribers will be glad to open.</p>
          <Link className="studio-button" href="/admin/newsletters/new/">
            Write a newsletter
          </Link>
        </div>
      )}
    </>
  );
}
