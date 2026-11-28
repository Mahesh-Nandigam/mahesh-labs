"use client";
import { useId, useState } from "react";
import Link from "next/link";

export function EarlyAccessForm({ episode }: { episode: number }) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  return <section className="episode-access">
    <h2>Watch a day early.</h2>
    <p>Already subscribed? Get a watch link in your inbox. <Link href="/#newsletter">Join the newsletter</Link> if you’re new.</p>
    <form className="newsletter-form" onSubmit={async (event) => {
      event.preventDefault(); if (busy) return;
      setBusy(true); setMessage("");
      const data = new FormData(event.currentTarget);
      try {
        const response = await fetch("/api/newsletter/access/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.get("email"), episode }) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Please try again.");
        setMessage(result.message);
      } catch (error) { setMessage((error as Error).message); }
      finally { setBusy(false); }
    }}>
      <label className="sr-only" htmlFor={id}>Your newsletter email address</label>
      <div className="newsletter-input-row"><input id={id} type="email" name="email" placeholder="Your newsletter email" autoComplete="email" required maxLength={254} disabled={busy} /><button className="button button-blue" disabled={busy}>{busy ? "Requesting…" : "Email me access"}</button></div>
      {message && <p className="form-message" role="status">{message}</p>}
    </form>
  </section>;
}
