"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { subscribeUrl } from "@/lib/episodes";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  return <header className="site-header">
    <div className="nav-shell wrap">
      <Link className="brand" href="/" aria-label="MaheshLabs home" onClick={() => setMenuOpen(false)}>
        <Image src="/assets/logo.svg" width={185} height={35} alt="MaheshLabs" priority />
      </Link>
      <nav id="navigation" className={menuOpen ? "is-open" : ""} aria-label="Main navigation">
        <Link href="/#episodes" onClick={() => setMenuOpen(false)}>The conversations</Link>
        <Link href="/#about" onClick={() => setMenuOpen(false)}>Our story</Link>
        <Link href="/#team" onClick={() => setMenuOpen(false)}>The creators</Link>
      </nav>
      <div className="header-socials">
        <span className="header-social-label">Subscribe to</span>
        <a className="button header-x" href="https://x.com/mahesh_labs" target="_blank" rel="noopener noreferrer" aria-label="Follow MaheshLabs on X" title="MaheshLabs on X">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.5 22H2.3l8.2-9.4L.8 2h6.5l4.5 6.8L18.9 2Zm-1.1 18h1.7L6.4 3.9H4.6L17.8 20Z" /></svg>
        </a>
        <a className="button button-blue header-subscribe" href={subscribeUrl} target="_blank" rel="noopener noreferrer" aria-label="Subscribe to Mahesh Nandigam on YouTube" title="Mahesh Nandigam on YouTube">
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="5" fill="currentColor" /><path d="m10 9 6 3-6 3Z" fill="var(--blue)" /></svg>
        </a>
      </div>
      <button className="menu-toggle" type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-controls="navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><span /><span /></button>
    </div>
  </header>;
}
