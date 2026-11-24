import { StudioLink as Link } from "@/components/admin/studio-link";
import { adminDb, dateLabel } from "@/lib/studio-store";
export default async function EpisodesAdmin() {
  const pool = await adminDb();
  const result = await pool.query(
    "SELECT number,content,published,updated_at FROM studio_episodes ORDER BY number DESC",
  );
  return (
    <>
      <div className="studio-heading">
        <div>
          <p className="studio-kicker">CONTENT LIBRARY</p>
          <h1>The conversations.</h1>
          <p>
            Edit episodes, prepare teasers, and choose what appears on the
            website.
          </p>
        </div>
        <Link className="studio-button" href="/admin/episodes/new/">
          Add episode
        </Link>
      </div>
      <section className="studio-panel">
        <div className="studio-table-scroll">
          <table className="studio-table">
            <thead>
              <tr>
                <th>Episode</th>
                <th>Visibility</th>
                <th>Updated</th>
                <th>
                  <span className="sr-only">Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row) => (
                <tr key={row.number}>
                  <td>
                    <div className="studio-content-cell">
                      <img
                        src={row.content.image}
                        width="96"
                        height="54"
                        alt=""
                      />
                      <span>
                        <small>
                          EP. {String(row.number).padStart(2, "0")} ·{" "}
                          {row.content.guest}
                        </small>
                        <strong>{row.content.title}</strong>
                      </span>
                    </div>
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
                      href={`/admin/episodes/${row.number}/`}
                    >
                      Edit<span className="sr-only"> episode {row.number}</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
