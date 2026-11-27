"use client";
import Image from "next/image";
import { useState } from "react";
import { StudioLink as Link } from "@/components/admin/studio-link";
import { useRouter } from "next/navigation";
import type { NewsletterDraft } from "@/lib/studio-validation";
import { studioRequest } from "./client";
export function NewsletterEditor({ initial }: { initial: NewsletterDraft }) {
  const router = useRouter();
  const [draft, setDraft] = useState(initial),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const update = (key: keyof NewsletterDraft, value: string) =>
    setDraft((d) => ({ ...d, [key]: value }));
  function exportDraft() {
    const body = `Subject: ${draft.subject}\nPreheader: ${draft.preheader}\n\n${draft.body}${draft.earlyAccessUrl ? "\n\nEarly access: " + draft.earlyAccessUrl : ""}`;
    const url = URL.createObjectURL(
      new Blob([body], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "maheshlabs-newsletter-draft.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <>
      <div className="studio-heading">
        <div>
          <Link className="studio-breadcrumb" href="/admin/newsletters/">
            Newsletters
          </Link>
          <h1>
            {initial.id ? "Shape your next letter." : "Start a new letter."}
          </h1>
          <p>
            Write, preview, and save. Sending will be connected to your chosen
            provider later.
          </p>
        </div>
        <button
          className="studio-button secondary"
          type="button"
          onClick={exportDraft}
        >
          Export draft
        </button>
      </div>
      <div className="studio-newsletter-editor">
        <form
          className="studio-panel studio-form"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setMessage("");
            try {
              if (!draft.id) {
                const result = await studioRequest(
                  "/api/admin/newsletters/",
                  "POST",
                  draft,
                );
                router.replace(`/admin/newsletters/${result.id}/`);
                router.refresh();
              } else {
                const result = await studioRequest(
                  `/api/admin/newsletters/${draft.id}/`,
                  "PUT",
                  { draft, updatedAt: draft.updatedAt },
                );
                setDraft((d) => ({ ...d, updatedAt: result.updatedAt }));
                setMessage("Draft saved.");
                router.refresh();
              }
            } catch (e) {
              setMessage((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            Internal title
            <input
              value={draft.title}
              onChange={(e) => update("title", e.target.value)}
              required
              maxLength={200}
              placeholder="Episode 6 · Early access"
            />
          </label>
          <label>
            Email subject
            <input
              value={draft.subject}
              onChange={(e) => update("subject", e.target.value)}
              maxLength={200}
              placeholder="A new conversation, a day early"
            />
          </label>
          <label>
            Inbox preview text
            <input
              value={draft.preheader}
              onChange={(e) => update("preheader", e.target.value)}
              maxLength={250}
            />
          </label>
          <label>
            Your letter
            <textarea
              rows={14}
              value={draft.body}
              onChange={(e) => update("body", e.target.value)}
              maxLength={40000}
              placeholder="Hey curious minds,…"
            />
          </label>
          <label>
            Early-access link (optional)
            <input
              type="url"
              value={draft.earlyAccessUrl}
              onChange={(e) => update("earlyAccessUrl", e.target.value)}
              maxLength={2048}
              placeholder="https://…"
            />
          </label>
          <label>
            Status
            <select
              value={draft.status}
              onChange={(e) => update("status", e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <div className="studio-form-actions">
            <button className="studio-button" disabled={busy}>
              {busy ? "Saving…" : "Save draft"}
            </button>
            <span className="studio-provider-note">Sending not connected</span>
          </div>
          <p className="studio-form-message" role="status">
            {message}
          </p>
        </form>
        <aside className="studio-email-preview">
          <p className="studio-kicker">EMAIL PREVIEW</p>
          <div className="studio-email-inbox">
            <strong>{draft.subject || "Your email subject"}</strong>
            <small>{draft.preheader || "Preview text appears here"}</small>
          </div>
          <article className="studio-email-paper">
            <div className="studio-email-wordmark">
              <Image src="/assets/logo.svg" width={230} height={52} alt="Mahesh Labs" />
              <span>FOR CURIOUS MINDS</span>
            </div>
            <h2>{draft.subject || "Something worth opening."}</h2>
            {draft.body ? (
              draft.body
                .split(/\n\s*\n/)
                .map((paragraph, i) => <p key={i}>{paragraph}</p>)
            ) : (
              <p className="studio-muted">
                Your letter will take shape here as you write.
              </p>
            )}
            {/^https?:\/\//.test(draft.earlyAccessUrl) && (
              <a
                className="studio-button"
                href={draft.earlyAccessUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Watch early
              </a>
            )}
            <footer>
              You’re receiving this because you signed up for MaheshLabs
              updates.
              <br />
              Your email provider’s unsubscribe link will go here.
            </footer>
          </article>
          <p className="studio-help">
            A writing preview. Final email styling and subscriber access links
            will depend on the sending setup.
          </p>
        </aside>
      </div>
    </>
  );
}
