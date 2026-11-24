import type { Chapter } from "./episodes";

export function chapterSeconds(time: string): number | null {
  if (!/^(?:\d+:)?\d{1,2}:\d{2}$/.test(time)) return null;
  const parts = time.split(":").map(Number);
  if (parts.at(-1)! > 59 || (parts.length === 3 && parts[1] > 59)) return null;
  const seconds = parts.reduce((total, n) => total * 60 + n, 0);
  return Number.isSafeInteger(seconds) ? seconds : null;
}

export function parseChapters(text: string): Chapter[] {
  const chapters: Chapter[] = [];
  for (const [index, raw] of text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .entries()) {
    const line = raw.trim();
    if (!line) continue;
    const match = line.match(/^((?:\d+:)?\d{1,2}:\d{2})\s+(?:[-–—]\s+)?(.+)$/);
    const seconds = match ? chapterSeconds(match[1]) : null;
    if (!match || seconds === null)
      throw new Error(
        `Line ${index + 1}: use MM:SS or HH:MM:SS followed by a title.`,
      );
    const title = match[2].trim();
    if (title.length > 300)
      throw new Error(
        `Line ${index + 1}: the chapter title must be 300 characters or fewer.`,
      );
    if (chapters.length && seconds <= chapters[chapters.length - 1].seconds)
      throw new Error(`Line ${index + 1}: chapter timestamps must increase.`);
    chapters.push({ time: match[1], seconds, title });
    if (chapters.length > 300)
      throw new Error("A chapter file can contain up to 300 chapters.");
  }
  if (!chapters.length) throw new Error("This file has no chapters.");
  return chapters;
}
