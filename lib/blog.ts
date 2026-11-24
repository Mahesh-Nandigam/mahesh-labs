import { z } from "zod";
const imageUrl = z
  .string()
  .max(2048)
  .refine(
    (value) => !value || /^\/(?!\/)/.test(value) || /^https?:\/\//.test(value),
    "Use a site asset path or an http(s) URL.",
  );
export const postSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(160)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase words separated by hyphens for the URL.",
    ),
  excerpt: z.string().trim().max(500),
  body: z.string().min(1).max(100000),
  cover: imageUrl,
  author: z.string().trim().min(1).max(100),
  tags: z.array(z.string().trim().min(1).max(40)).max(8),
});
export type BlogPost = z.infer<typeof postSchema>;
export interface BlogSummary extends Omit<BlogPost, "body"> {
  id: string;
  publishedAt: string;
  readingMinutes: number;
}
export const readingMinutes = (body: string) =>
  Math.max(1, Math.ceil(body.trim().split(/\s+/).length / 220));
export const headingId = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
export function tableOfContents(body: string) {
  let fenced = false;
  const counts = new Map<string, number>();
  return body.split("\n").flatMap((line) => {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      return [];
    }
    if (fenced) return [];
    const match = line.match(/^(#{2,3})\s+(.+?)\s*#*$/);
    if (!match) return [];
    const title = match[2].replace(/[*_`]/g, ""),
      base = headingId(title),
      n = counts.get(base) || 0;
    counts.set(base, n + 1);
    return [{ title, id: n ? `${base}-${n}` : base, level: match[1].length }];
  });
}
