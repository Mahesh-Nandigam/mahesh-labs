"use client";
import { useState } from "react";
import { StudioLink as Link } from "@/components/admin/studio-link";
import { useRouter } from "next/navigation";
import { studioRequest } from "./client";
export function AdminLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <main id="main" className="studio-login">
      <div className="studio-login-card">
        <Link className="studio-login-brand" href="/">
          MaheshLabs <span>STUDIO</span>
        </Link>
        <p className="studio-kicker">A LITTLE BEHIND THE SCENES</p>
        <h1>Welcome back.</h1>
        <p>
          Your conversations, community, and next great idea. All in one place.
        </p>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError("");
            const data = new FormData(event.currentTarget);
            try {
              await studioRequest("/api/admin/login/", "POST", {
                password: data.get("password"),
              });
              router.replace("/admin/");
              router.refresh();
            } catch (e) {
              setError((e as Error).message);
              setBusy(false);
            }
          }}
        >
          <label htmlFor="admin-password">Studio password</label>
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={256}
            disabled={!configured || busy}
          />
          <button className="studio-button" disabled={!configured || busy}>
            {busy ? "Signing in…" : "Open Studio"}
          </button>
          <p className="studio-form-message" role="alert">
            {!configured
              ? "Studio login needs to be configured on the server."
              : error}
          </p>
        </form>
        <Link className="studio-back" href="/">
          Back to MaheshLabs
        </Link>
      </div>
    </main>
  );
}
