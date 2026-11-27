"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Header } from "./header";
import { Footer } from "./footer";
import { NewsletterProvider } from "./newsletter-provider";
import { SiteIntro } from "./site-intro";
export function SiteFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return pathname.startsWith("/admin") ? (
    <>{children}</>
  ) : (
    <NewsletterProvider>
      {pathname === "/" && <SiteIntro />}
      <Header />
      {children}
      <Footer />
    </NewsletterProvider>
  );
}
