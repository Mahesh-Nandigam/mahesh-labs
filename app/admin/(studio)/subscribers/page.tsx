import { StudioLink as Link } from "@/components/admin/studio-link";
import { adminDb, dateLabel, pageNumber } from "@/lib/studio-store";
import { UnsubscribeButton } from "@/components/admin/unsubscribe-button";
export default async function SubscribersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const pool = await adminDb(),
    params = await searchParams,
    q = (params.q || "").slice(0, 254),
    status = ["subscribed", "unsubscribed"].includes(params.status || "")
      ? params.status!
      : "all";
  const values = [`%${q}%`, status];
  const count = await pool.query(
    "SELECT count(*) FROM newsletter_subscribers WHERE email ILIKE $1 AND ($2='all' OR status=$2)",
    values,
  );
  const total = Number(count.rows[0].count),
    page = pageNumber(params.page, total);
  const result = await pool.query(
    "SELECT id,email,status,source,consent_text,subscribed_at FROM newsletter_subscribers WHERE email ILIKE $1 AND ($2='all' OR status=$2) ORDER BY subscribed_at DESC LIMIT 50 OFFSET $3",
    [...values, (page - 1) * 50],
  );
  const url = (n: number) =>
    `/admin/subscribers/?${new URLSearchParams({ page: String(n), q, status })}`;
  return (
    <>
      <div className="studio-heading">
        <div>
          <p className="studio-kicker">YOUR GROWING COMMUNITY</p>
          <h1>Subscribers.</h1>
          <p>
            People who asked to hear from MaheshLabs. {total} matching{" "}
            {total === 1 ? "subscriber" : "subscribers"}.
          </p>
        </div>
        <a
          className="studio-button secondary"
          href={`/api/admin/subscribers/export/?status=${status === "unsubscribed" ? "unsubscribed" : "subscribed"}`}
        >
          Export {status === "unsubscribed" ? "unsubscribed" : "subscribed"} CSV
        </a>
      </div>
      <form className="studio-filter-bar" method="get">
        <label>
          <span className="sr-only">Search subscribers</span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search by email"
            maxLength={254}
          />
        </label>
        <label>
          <span className="sr-only">Subscription status</span>
          <select name="status" defaultValue={status}>
            <option value="all">All subscribers</option>
            <option value="subscribed">Subscribed</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>
        </label>
        <button className="studio-button secondary">Apply</button>
      </form>
      <section className="studio-panel">
        {result.rowCount ? (
          <div className="studio-table-scroll">
            <table className="studio-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Consent</th>
                  <th>
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong className="studio-email-cell">{row.email}</strong>
                      <small className="studio-table-subtitle">
                        {row.source}
                      </small>
                    </td>
                    <td>
                      <span
                        className={`studio-badge ${row.status === "subscribed" ? "green" : ""}`}
                      >
                        {row.status === "subscribed"
                          ? "Subscribed"
                          : "Unsubscribed"}
                      </span>
                    </td>
                    <td>{dateLabel(row.subscribed_at)}</td>
                    <td>
                      <details className="studio-consent-details">
                        <summary>View consent</summary>
                        <p>{row.consent_text}</p>
                      </details>
                    </td>
                    <td>
                      {row.status === "subscribed" && (
                        <UnsubscribeButton id={row.id} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="studio-empty">
            <h2>
              {q
                ? "No matching subscribers."
                : "A community starts with one person."}
            </h2>
            <p>
              {q
                ? "Try another email or clear the filters."
                : "The newsletter form on your homepage is ready for signups."}
            </p>
          </div>
        )}
      </section>
      <nav className="studio-pagination" aria-label="Subscriber pages">
        <span>
          Page {page} of {Math.max(1, Math.ceil(total / 50))}
        </span>
        <div>
          {page > 1 && (
            <Link className="studio-button secondary" href={url(page - 1)}>
              Previous
            </Link>
          )}
          {page * 50 < total && (
            <Link className="studio-button secondary" href={url(page + 1)}>
              Next
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
