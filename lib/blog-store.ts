import "server-only";
import { unstable_cache } from "next/cache";
import { db, contentCacheScope } from "./db";
import { readingMinutes, type BlogPost, type BlogSummary } from "./blog";
export const getBlogPosts = unstable_cache(
  async (): Promise<BlogSummary[]> => {
    if (!process.env.DATABASE_URL) return [];
    const result = await db().query(
      `SELECT id,slug,content->>'title' AS title,content->>'excerpt' AS excerpt,content->>'cover' AS cover,content->>'author' AS author,content->'tags' AS tags,ceil(greatest(1,array_length(regexp_split_to_array(trim(content->>'body'),'[[:space:]]+'),1))/220.0) AS minutes,published_at FROM studio_posts WHERE published=true ORDER BY published_at DESC,id DESC`,
    );
    return result.rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      cover: row.cover,
      author: row.author,
      tags: row.tags,
      readingMinutes: Number(row.minutes),
      publishedAt: new Date(row.published_at).toISOString(),
    }));
  },
  ["blog-posts", contentCacheScope],
  { tags: ["blog"], revalidate: 300 },
);
export const getBlogPost = unstable_cache(
  async (
    slug: string,
  ): Promise<
    | (BlogPost & { id: string; publishedAt: string; readingMinutes: number })
    | null
  > => {
    if (!process.env.DATABASE_URL) return null;
    const result = await db().query(
      "SELECT id,content,published_at FROM studio_posts WHERE slug=$1 AND published=true",
      [slug],
    );
    if (!result.rowCount) return null;
    const row = result.rows[0];
    return {
      ...row.content,
      id: row.id,
      publishedAt: new Date(row.published_at).toISOString(),
      readingMinutes: readingMinutes(row.content.body),
    };
  },
  ["blog-post", contentCacheScope],
  { tags: ["blog"], revalidate: 300 },
);
