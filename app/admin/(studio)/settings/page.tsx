import { adminDb } from "@/lib/studio-store";
export default async function SettingsPage() {
  const pool = await adminDb();
  await pool.query("SELECT 1");
  return (
    <>
      <div className="studio-heading">
        <div>
          <p className="studio-kicker">WORKSPACE SETTINGS</p>
          <h1>The essentials.</h1>
          <p>The services behind your MaheshLabs workspace.</p>
        </div>
      </div>
      <section className="studio-panel studio-settings">
        <div>
          <span>
            <strong>Subscriber & content storage</strong>
            <small>Neon Postgres</small>
          </span>
          <span className="studio-badge green">Connected</span>
        </div>
        <div>
          <span>
            <strong>Admin access</strong>
            <small>Password-only login · sessions expire after 12 hours</small>
          </span>
          <span className="studio-badge green">Protected</span>
        </div>
        <div>
          <span>
            <strong>Email delivery</strong>
            <small>
              Choose a third-party provider later. Subscriber data stays in
              Neon.
            </small>
          </span>
          <span className="studio-badge">Not connected</span>
        </div>
        <div>
          <span>
            <strong>Early-access publishing</strong>
            <small>
              Subscriber links and the one-day release window will be designed
              separately.
            </small>
          </span>
          <span className="studio-badge">Planned</span>
        </div>
        <div>
          <span>
            <strong>Teaser storage</strong>
            <small>
              Neon storage and removal after release will be added with the
              publishing workflow.
            </small>
          </span>
          <span className="studio-badge">Planned</span>
        </div>
      </section>
    </>
  );
}
