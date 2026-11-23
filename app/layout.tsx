import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { siteUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "MaheshLabs — Good questions. Real journeys.", template: "%s | MaheshLabs" },
  description: "Honest conversations about software, open source, AI, and finding your own way. A podcast by Mahesh Nandigam and Mahesh Moholkar.",
  openGraph: {
    title: "MaheshLabs — Good questions. Real journeys.",
    description: "Go beyond the highlights. Meet the people building a life in tech, one conversation at a time.",
    type: "website",
    url: siteUrl,
    siteName: "MaheshLabs",
    images: [{ url: "/assets/episode-03-open-source-to-job.jpg", width: 1280, height: 720 }],
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/favicon.ico", sizes: "64x64" }],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = { themeColor: "#F5F0E7" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en">
    <head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;450;500;550;600;650;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
    </head>
    <body><a className="skip-link" href="#main">Skip to content</a><Header />{children}<Footer /></body>
  </html>;
}
