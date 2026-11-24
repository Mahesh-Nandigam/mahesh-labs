import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogPost } from "@/lib/blog-store";
import { tableOfContents } from "@/lib/blog";
import { BlogMarkdown } from "@/components/blog-markdown";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const post = await getBlogPost((await params).slug);
  return post
    ? {
        title: post.title,
        description: post.excerpt,
        openGraph: {
          type: "article",
          title: post.title,
          description: post.excerpt,
          publishedTime: new Date(post.publishedAt).toISOString(),
          authors: [post.author],
          ...(post.cover ? { images: [post.cover] } : {}),
        },
        alternates: { canonical: `/blog/${post.slug}/` },
      }
    : { title: "Post not found" };
}
export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const post = await getBlogPost((await params).slug);
  if (!post) notFound();
  const contents = tableOfContents(post.body);
  return (
    <main id="main" className="blog-article wrap">
      <Link className="text-link" href="/blog/">
        The MaheshLabs blog
      </Link>
      <header className="blog-article-heading">
        <div className="blog-tags">
          {post.tags.map((tag) => (
            <Link href={`/blog/?${new URLSearchParams({ tag })}`} key={tag}>
              {tag}
            </Link>
          ))}
        </div>
        <h1>{post.title}</h1>
        {post.excerpt && <p>{post.excerpt}</p>}
        <div className="blog-author">
          <span className="blog-author-avatar" aria-hidden="true">
            {post.author.charAt(0)}
          </span>
          <span>
            <strong>{post.author}</strong>
            <span>
              <time dateTime={new Date(post.publishedAt).toISOString()}>
                {new Intl.DateTimeFormat("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(new Date(post.publishedAt))}
              </time>{" "}
              · {post.readingMinutes} min read
            </span>
          </span>
        </div>
      </header>
      {post.cover && (
        <img
          className="blog-article-cover"
          src={post.cover}
          alt=""
          width="1280"
          height="720"
        />
      )}
      <div className={`blog-article-layout${contents.length ? "" : " no-toc"}`}>
        <article>
          <BlogMarkdown body={post.body} />
          <div className="blog-endnote">
            Good questions. Real journeys.
            <br />
            <Link href="/#newsletter">Join the MaheshLabs newsletter</Link>
          </div>
        </article>
        {contents.length > 0 && (
          <aside className="blog-toc">
            <p>IN THIS ARTICLE</p>
            <nav aria-label="Table of contents">
              {contents.map((item) => (
                <a
                  key={item.id}
                  className={item.level === 3 ? "nested" : ""}
                  href={`#${item.id}`}
                >
                  {item.title}
                </a>
              ))}
            </nav>
          </aside>
        )}
      </div>
    </main>
  );
}
