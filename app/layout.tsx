import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SiteFrame } from "@/components/site-frame";
import { siteUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MaheshLabs — Good questions. Real journeys.",
    template: "%s | MaheshLabs",
  },
  description:
    "Honest conversations about software, open source, AI, and finding your own way. A podcast by Mahesh Nandigam and Mahesh Moholkar.",
  openGraph: {
    title: "MaheshLabs — Good questions. Real journeys.",
    description:
      "Go beyond the highlights. Meet the people building a life in tech, one conversation at a time.",
    type: "website",
    url: siteUrl,
    siteName: "MaheshLabs",
    images: [
      {
        url: "/assets/episode-04-j-prakash-open-source-to-job.png",
        width: 1280,
        height: 720,
      },
    ],
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: [
      {
        url: "/icon.svg?v=ml-filled-20261127",
        type: "image/svg+xml",
        sizes: "any",
      },
      {
        url: "/favicon.ico?v=ml-filled-20261127",
        type: "image/x-icon",
        sizes: "16x16 32x32 48x48 64x64",
      },
    ],
    shortcut: "/favicon.ico?v=ml-filled-20261127",
    apple: "/apple-touch-icon.png?v=ml-filled-20261127",
  },
};

export const viewport: Viewport = { themeColor: "#F5F0E7" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;450;500;550;600;650;700&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteFrame>{children}</SiteFrame>
      </body>
    </html>
  );
}
