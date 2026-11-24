"use client";
import { StudioLink as Link } from "@/components/admin/studio-link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { studioRequest } from "./client";
const navigation = [
  ["Overview", "/admin/", "overview"],
  ["Newsletters", "/admin/newsletters/", "mail"],
  ["Subscribers", "/admin/subscribers/", "people"],
  ["Episodes", "/admin/episodes/", "play"],
  ["Blog", "/admin/blog/", "edit"],
  ["Settings", "/admin/settings/", "settings"],
];
function NavIcon({ kind }: { kind: string }) {
  const paths: Record<string, ReactNode> = {
    overview: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 6 9 7 9-7" />
      </>
    ),
    people: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 21v-3a6 6 0 0 1 12 0v3m1-16a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v2" />
      </>
    ),
    play: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="m10 8 6 4-6 4Z" />
      </>
    ),
    edit: (
      <>
        <path d="m14 4 6 6M4 20l5-1L21 7a2 2 0 0 0-4-4L5 15Z" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      {paths[kind]}
    </svg>
  );
}
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname(),
    router = useRouter();
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <div className="studio-shell">
      <aside className="studio-sidebar">
        <Link className="studio-brand" href="/admin/">
          <span className="studio-monogram">M</span>
          <span>
            MaheshLabs<small>STUDIO</small>
          </span>
        </Link>
        <p className="studio-nav-label">YOUR WORKSPACE</p>
        <nav aria-label="Admin navigation">
          {navigation.map(([name, url, icon]) => (
            <Link
              key={url}
              href={url}
              aria-current={
                (
                  url === "/admin/"
                    ? pathname === "/admin" || pathname === "/admin/"
                    : pathname.startsWith(url.slice(0, -1))
                )
                  ? "page"
                  : undefined
              }
            >
              <NavIcon kind={icon} />
              {name}
            </Link>
          ))}
        </nav>
        <div className="studio-sidebar-bottom">
          <Link href="/" target="_blank">
            View website
          </Link>
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await studioRequest("/api/admin/logout/", "POST");
                router.replace("/admin/sign-in/");
                router.refresh();
              } catch (e) {
                setError((e as Error).message);
                setBusy(false);
              }
            }}
          >
            {busy ? "Signing out…" : "Sign out"}
          </button>
          <p role="status">{error}</p>
        </div>
      </aside>
      <div className="studio-workspace">
        <header className="studio-topbar">
          <span>MaheshLabs / Studio</span>
          <span className="studio-private">Private workspace</span>
        </header>
        <main id="main" className="studio-main">
          {children}
        </main>
      </div>
    </div>
  );
}
