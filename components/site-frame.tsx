"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Header } from "./header";
import { Footer } from "./footer";
import { NewsletterProvider } from "./newsletter-provider";
export function SiteFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return pathname.startsWith("/admin") ? (
    <>{children}</>
  ) : (
    <NewsletterProvider>
      <Header />
      {children}
      <Footer />
    </NewsletterProvider>
  );
}
