import Link from "next/link";
import type { BlogSummary } from "@/lib/blog";
export function BlogCards({ posts }: { posts: BlogSummary[] }) {
  return (
    <div className="blog-card-grid">
      {posts.map((post) => (
        <article className="blog-card" key={post.id}>
          {post.cover && (
            <Link
              className="blog-card-cover"
              href={`/blog/${post.slug}/`}
              tabIndex={-1}
              aria-hidden="true"
            >
              <img src={post.cover} alt="" width="1000" height="560" />
            </Link>
          )}
          <div className="blog-card-body">
            <div className="blog-tags">
              {post.tags.slice(0, 3).map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <h2>
              <Link href={`/blog/${post.slug}/`}>{post.title}</Link>
            </h2>
            <p>{post.excerpt}</p>
            <div className="blog-card-meta">
              <span>{post.author}</span>
              <span>{post.readingMinutes} min read</span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
