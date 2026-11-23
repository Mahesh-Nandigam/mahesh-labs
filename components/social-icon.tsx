import type { SocialPlatform } from "@/lib/socials";

export function SocialIcon({ platform }: { platform: SocialPlatform }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
      {platform === "youtube" && <path fill="currentColor" fillRule="evenodd" d="M7 5a5 5 0 0 0-5 5v4a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5v-4a5 5 0 0 0-5-5H7Zm3 4v6l6-3-6-3Z" clipRule="evenodd" />}
      {platform === "x" && <path fill="currentColor" d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.5 22H2.3l8.2-9.4L.8 2h6.5l4.5 6.8L18.9 2Zm-1.1 18h1.7L6.4 3.9H4.6L17.8 20Z" />}
      {platform === "linkedin" && <>
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" />
        <path d="M7.5 11v6M11.5 17v-6m0 3a3 3 0 0 1 6 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>}
      {platform === "instagram" && <>
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" />
      </>}
    </svg>
  );
}
