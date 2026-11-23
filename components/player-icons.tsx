type IconName = "play" | "pause" | "rewind" | "forward" | "volume" | "muted" | "settings" | "fullscreen" | "minimize" | "loading" | "chevron" | "check";

export function PlayerIcon({ name }: { name: IconName }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={name === "loading" ? "player-spinner" : undefined}>
    {name === "play" && <path d="m9 5 11 7-11 7V5Z" fill="currentColor" stroke="none" />}
    {name === "pause" && <path d="M8 5v14M16 5v14" strokeWidth="3" />}
    {(name === "rewind" || name === "forward") && <>
      <g transform={name === "forward" ? "translate(24 0) scale(-1 1)" : undefined}><path d="M4 9a8.3 8.3 0 1 1-.3 6M4 4v5h5" /></g>
      <text x="12" y="15.5" textAnchor="middle" fill="currentColor" stroke="none" fontSize="8" fontFamily="Arial, sans-serif" fontWeight="600">10</text>
    </>}
    {(name === "volume" || name === "muted") && <path d="m11 5-6 4H2v6h3l6 4V5Z" />}
    {name === "volume" && <path d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14" />}
    {name === "muted" && <path d="m16 9 6 6m0-6-6 6" />}
    {name === "settings" && <><path d="m9 3-.6 2.1-2 .9-2-.5L2 9l1.5 1.6v2.8L2 15l2.4 3.5 2-.5 2 .9L9 21h6l.6-2.1 2-.9 2 .5L22 15l-1.5-1.6v-2.8L22 9l-2.4-3.5-2 .5-2-.9L15 3H9Z" /><circle cx="12" cy="12" r="3" /></>}
    {name === "fullscreen" && <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />}
    {name === "minimize" && <path d="M3 8h5V3m13 5h-5V3M8 21v-5H3m13 5v-5h5" />}
    {name === "loading" && <path d="M21 12a9 9 0 1 1-9-9" />}
    {name === "chevron" && <path d="m7 10 5 5 5-5" />}
    {name === "check" && <path d="m5 12 4 4L19 6" />}
  </svg>;
}
