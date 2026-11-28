"use client";
import { useState } from "react";
import type { CampaignSummary } from "@/lib/newsletter-delivery";
import { studioRequest } from "./client";

export type DeliveryState = { setup: { ready: boolean; missing: string[]; schedulerConfigured: boolean }; campaigns: CampaignSummary[] };
export function NewsletterDelivery({ id, updatedAt, dirty, initial }: { id: string; updatedAt: string; dirty: boolean; initial: DeliveryState }) {
  const [state, setState] = useState(initial);
  const [email, setEmail] = useState("");
  const [sendAt, setSendAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const url = `/api/admin/newsletters/${id}/delivery/`;
  async function refresh() {
    const response = await fetch(url, { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not refresh deliveries.");
    setState(result);
  }
  async function run(body: Record<string, unknown>) {
    if (busy) return;
    setBusy(true); setMessage("");
    try {
      const result = await studioRequest(url, "POST", body);
      setMessage(result.message || (body.action === "queue" ? result.existing ? "This saved version already has a delivery. Its status is shown below." : "Delivery queued. The saved letter and current subscriber list are now fixed for this delivery." : "Delivery updated."));
      await refresh();
    } catch (error) { setMessage((error as Error).message); }
    finally { setBusy(false); }
  }
  return <section className="studio-panel studio-form studio-delivery">
    <h2>Email delivery</h2>
    {!state.setup.ready && <p className="studio-help">Email setup is incomplete. Open Settings to see what is needed.</p>}
    {dirty && <p className="studio-help">Save your changes before testing or queuing this letter.</p>}
    <div className="studio-fields-grid">
      <label>Test recipient<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" maxLength={254} /></label>
      <div className="studio-delivery-action"><button type="button" className="studio-button secondary" disabled={busy || dirty || !email || !state.setup.ready} onClick={() => run({ action: "test", email, updatedAt })}>Send test email</button></div>
    </div>
    <p className="studio-help">Tests go only to the address above. They do not add a subscriber or unlock early access.</p>
    <label>Send time (India time, optional)<input type="datetime-local" value={sendAt} onChange={(e) => setSendAt(e.target.value)} disabled={!state.setup.schedulerConfigured} /></label>
    <p className="studio-help">For an early-access episode, an empty send time uses the start of its 24-hour window, or now if that window has already opened. {state.setup.schedulerConfigured ? "Scheduled deliveries use the connected queue worker." : "Automatic scheduling needs a connected worker. You can queue and process a delivery manually when the window is open."}</p>
    <div className="studio-form-actions">
      <button type="button" className="studio-button" disabled={busy || dirty || !state.setup.ready} onClick={() => {
        if (!confirm("Queue this saved newsletter for all currently subscribed addresses? Each person will receive their own email. The queued content and recipient list will be fixed.")) return;
        run({ action: "queue", updatedAt, ...(sendAt ? { sendAt: new Date(sendAt + "+05:30").toISOString() } : {}) });
      }}>Queue newsletter</button>
      <button type="button" className="studio-button secondary" disabled={busy} onClick={async () => { try { await refresh(); } catch (e) { setMessage((e as Error).message); } }}>Refresh status</button>
    </div>
    {state.campaigns.map((campaign) => <article className="studio-delivery-record" key={campaign.id}>
      <strong>{campaign.status === "queued" ? "Queued" : campaign.status === "paused" ? "Paused for review" : campaign.status === "cancelled" ? "Cancelled" : "Finished processing"} · {new Date(campaign.sendAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })} IST</strong>
      <p>{campaign.total} recipients · {campaign.accepted} accepted · {campaign.pending} pending · {campaign.failed} failed · {campaign.unknown} need review · {campaign.skipped} skipped</p>
      {campaign.unknown > 0 && <p className="studio-help">Some provider responses were interrupted. Check the provider dashboard before resending; these addresses are excluded from automatic retries.</p>}
      {campaign.errors?.map((error) => <p className="studio-help" key={error}>{error}</p>)}
      <div className="studio-form-actions">
        {campaign.status === "queued" && campaign.pending > 0 && <button type="button" className="studio-button secondary" disabled={busy || !state.setup.ready || Date.parse(campaign.sendAt) > Date.now()} onClick={() => run({ action: "process", campaignId: campaign.id })}>{busy ? "Processing…" : "Process next batch"}</button>}
        {campaign.status === "paused" && campaign.pending > 0 && <button type="button" className="studio-button secondary" disabled={busy || !state.setup.ready} onClick={() => { if (confirm("Resume the remaining recipients after checking the provider? Uncertain deliveries will not be resent.")) run({ action: "resume", campaignId: campaign.id }); }}>Continue remaining</button>}
        {["queued", "paused"].includes(campaign.status) && <button type="button" className="studio-button secondary" disabled={busy} onClick={() => { if (confirm("Cancel the remaining delivery? Emails already accepted by the provider cannot be recalled.")) run({ action: "cancel", campaignId: campaign.id }); }}>Cancel remaining</button>}
        {campaign.failed > 0 && campaign.status !== "cancelled" && <button type="button" className="studio-button secondary" disabled={busy || !state.setup.ready} onClick={() => { if (confirm("Retry failed deliveries? Accepted emails and uncertain deliveries will be skipped.")) run({ action: "retry", campaignId: campaign.id }); }}>Retry failed</button>}
      </div>
    </article>)}
    <p className="studio-help">Accepted means the email provider accepted the message. Inbox placement, bounces, and spam complaints must be checked in the provider dashboard.</p>
    {message && <p className="studio-form-message" role="status">{message}</p>}
  </section>;
}
