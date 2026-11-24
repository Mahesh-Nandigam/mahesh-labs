import type { Metadata } from "next";
import Link from "next/link";
import { getBlogPosts } from "@/lib/blog-store";
import { BlogCards } from "@/components/blog-cards";
export const metadata: Metadata = {
  title: "The MaheshLabs blog",
  description: "Notes, ideas, and lessons from the people behind MaheshLabs.",
};
export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tag?: string }>;
}) {
  const params = await searchParams,
    all = await getBlogPosts(),
    tag = (params.tag || "").slice(0, 40),
    posts = tag ? all.filter((post) => post.tags.includes(tag)) : all,
    tags = [...new Set(all.flatMap((post) => post.tags))],
    requested = Number(params.page),
    pages = Math.max(1, Math.ceil(posts.length / 9)),
    page = Math.min(
      pages,
      Number.isSafeInteger(requested) && requested > 0 ? requested : 1,
    ),
    url = (n: number) =>
      `/blog/?${new URLSearchParams({ page: String(n), tag })}`;
  return (
    <main id="main" className="blog-index wrap">
      <div className="blog-index-heading">
        <p className="eyebrow">BEYOND THE CONVERSATION</p>
        <h1>
          Ideas worth
          <br />
          <em>sitting with.</em>
        </h1>
        <p>Notes, lessons, and things we’re figuring out along the way.</p>
      </div>
      {tags.length > 0 && (
        <nav
          className="blog-tag-filter"
          aria-label="Filter blog posts by topic"
        >
          <Link href="/blog/" aria-current={!tag ? "page" : undefined}>
            All posts
          </Link>
          {tags.map((item) => (
            <Link
              key={item}
              href={`/blog/?${new URLSearchParams({ tag: item })}`}
              aria-current={tag === item ? "page" : undefined}
            >
              {item}
            </Link>
          ))}
        </nav>
      )}
      {posts.length ? (
        <BlogCards posts={posts.slice((page - 1) * 9, page * 9)} />
      ) : (
        <section className="blog-empty">
          <span aria-hidden="true">✳</span>
          <h2>The first page is still being written.</h2>
          <p>
            We’ll share our notes here soon. Until then, pull up a conversation.
          </p>
          <Link className="button button-blue" href="/episodes/">
            Explore the podcasts
          </Link>
        </section>
      )}
      {pages > 1 && (
        <nav className="archive-pagination" aria-label="Blog pages">
          <span>
            Page {page} of {pages}
          </span>
          <div>
            {page > 1 && (
              <Link className="button button-outline" href={url(page - 1)}>
                Previous
              </Link>
            )}
            {page < pages && (
              <Link className="button button-outline" href={url(page + 1)}>
                Next
              </Link>
            )}
          </div>
        </nav>
      )}
    </main>
  );
}
