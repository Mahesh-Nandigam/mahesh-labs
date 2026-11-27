"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { subscribeUrl } from "@/lib/episodes";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const navigation = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!menuOpen) return;
    navigation.current?.querySelector("a")?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <header className="site-header">
      <div className="nav-shell wrap">
        <Link
          className="brand"
          href="/"
          aria-label="MaheshLabs home"
          onClick={() => setMenuOpen(false)}
        >
          <Image
            src="/assets/logo.svg"
            width={230}
            height={52}
            alt="MaheshLabs"
            priority
          />
        </Link>
        <nav
          ref={navigation}
          id="navigation"
          className={menuOpen ? "is-open" : ""}
          aria-label="Main navigation"
        >
          <Link href="/#episodes" onClick={() => setMenuOpen(false)}>
            The conversations
          </Link>
          <Link href="/#about" onClick={() => setMenuOpen(false)}>
            Our story
          </Link>
          <Link href="/#newsletter" onClick={() => setMenuOpen(false)}>
            Newsletter
          </Link>
          <Link href="/#team" onClick={() => setMenuOpen(false)}>
            The creators
          </Link>
          <Link
            href="/blog/"
            aria-current={pathname === "/blog" || pathname === "/blog/" ? "page" : pathname.startsWith("/blog/") ? "location" : undefined}
            onClick={() => setMenuOpen(false)}
          >
            Blog
          </Link>
          <Link
            href="/socials/"
            aria-current={
              pathname === "/socials" || pathname === "/socials/"
                ? "page"
                : undefined
            }
            onClick={() => setMenuOpen(false)}
          >
            Socials
          </Link>
        </nav>
        <a
          className="button button-blue header-subscribe"
          href={subscribeUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Subscribe to our main YouTube channel"
        >
          Subscribe
        </a>
        <button
          ref={menuButton}
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-controls="navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
