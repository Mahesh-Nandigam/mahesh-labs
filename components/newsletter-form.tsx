"use client";
import { useId, useState } from "react";

export function NewsletterForm({
  compact = false,
  subscribed,
  onSubscribed,
}: {
  compact?: boolean;
  subscribed: boolean;
  onSubscribed: () => void;
}) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  if (subscribed)
    return (
      <p className="newsletter-confirmation" role="status">
        You’re on the list. Thanks for joining!
      </p>
    );
  return (
    <form
      className="newsletter-form"
      onSubmit={async (event) => {
        event.preventDefault();
        if (busy) return;
        setBusy(true);
        setMessage("");
        const form = event.currentTarget;
        const data = new FormData(form);
        try {
          const response = await fetch("/api/newsletter/subscribe/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: data.get("email"),
              consent: true,
              website: data.get("website"),
            }),
          });
          const result = await response.json();
          if (!response.ok)
            throw new Error(result.error || "Please try again.");
          form.reset();
          onSubscribed();
        } catch (error) {
          setMessage(
            error instanceof Error ? error.message : "Please try again.",
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      <label
        htmlFor={id}
        className={compact ? "sr-only" : "newsletter-email-label"}
      >
        Your email address
      </label>
      <div className="newsletter-input-row">
        <input
          id={id}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          maxLength={254}
          disabled={busy}
        />
        <button className="button button-blue" disabled={busy}>
          {busy ? "Joining…" : "Subscribe"}
        </button>
      </div>
      <div className="signup-honeypot" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {message && (
        <p className="form-message" role="alert">
          {message}
        </p>
      )}
    </form>
  );
}
