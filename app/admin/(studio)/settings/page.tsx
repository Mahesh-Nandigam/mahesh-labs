import { adminDb } from "@/lib/studio-store";
import { deliverySetup } from "@/lib/newsletter-delivery";
export default async function SettingsPage() {
  const pool = await adminDb();
  await pool.query("SELECT 1");
  const email = await deliverySetup();
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
              {email.ready ? "Resend API · subscriber data stays in Neon. Send a test from a saved newsletter to verify delivery." : `Setup needed: ${email.missing.join(", ")}. Configure these server variables, then send a test email.`}
            </small>
          </span>
          <span className={`studio-badge ${email.ready ? "green" : ""}`}>{email.ready ? "Configured" : "Setup needed"}</span>
        </div>
        <div>
          <span>
            <strong>Early-access publishing</strong>
            <small>
              Personal email links unlock the full player 24 hours before public release. Use an unlisted YouTube video; anyone with its YouTube link can share it.
            </small>
          </span>
          <span className="studio-badge green">Ready</span>
        </div>
        <div>
          <span><strong>Email scheduling</strong><small>{email.schedulerConfigured ? "Queue worker configured. Verify the external scheduler is calling /api/cron/newsletters/ regularly." : "Manual batches are available in each newsletter. For automatic delivery, connect a scheduler to /api/cron/newsletters/, set CRON_SECRET, then enable NEWSLETTER_SCHEDULER_ENABLED."}</small></span>
          <span className="studio-badge">{email.schedulerConfigured ? "Configured" : "Manual"}</span>
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
