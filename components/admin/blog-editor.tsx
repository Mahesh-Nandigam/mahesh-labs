"use client";
import { useRef, useState } from "react";
import { StudioLink as Link } from "@/components/admin/studio-link";
import { useRouter } from "next/navigation";
import { BlogMarkdown } from "@/components/blog-markdown";
import { readingMinutes, type BlogPost } from "@/lib/blog";
import { studioRequest } from "./client";
export function BlogEditor({
  initial,
  id = "",
  revision = "",
  published = false,
}: {
  initial: BlogPost;
  id?: string;
  revision?: string;
  published?: boolean;
}) {
  const router = useRouter(),
    editor = useRef<HTMLTextAreaElement>(null);
  const [post, setPost] = useState(initial),
    [version, setVersion] = useState(revision),
    [visible, setVisible] = useState(published),
    [preview, setPreview] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [customSlug, setCustomSlug] = useState(Boolean(id));
  const update = (key: keyof BlogPost, value: string) =>
    setPost((p) => ({
      ...p,
      [key]:
        key === "tags"
          ? value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : value,
    }));
  function insert(before: string, after = "") {
    const element = editor.current;
    if (!element) return;
    const start = element.selectionStart,
      end = element.selectionEnd,
      selected = post.body.slice(start, end) || "text";
    setPost((p) => ({
      ...p,
      body:
        p.body.slice(0, start) + before + selected + after + p.body.slice(end),
    }));
    requestAnimationFrame(() => {
      element.focus();
      element.setSelectionRange(
        start + before.length,
        start + before.length + selected.length,
      );
    });
  }
  return (
    <form
      id="post-editor"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setMessage("");
        try {
          if (!id) {
            const result = await studioRequest(
              "/api/admin/blog/",
              "POST",
              post,
            );
            router.replace(`/admin/blog/${result.id}/`);
            router.refresh();
          } else {
            const result = await studioRequest(
              `/api/admin/blog/${id}/`,
              "PUT",
              { post, published: visible, revision: version },
            );
            setVersion(result.revision);
            setMessage("Post saved.");
            router.refresh();
          }
        } catch (e) {
          setMessage((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="studio-heading">
        <div>
          <Link className="studio-breadcrumb" href="/admin/blog/">
            Blog
          </Link>
          <h1>
            {id
              ? "Every idea deserves a good draft."
              : "Write what’s on your mind."}
          </h1>
          <p>
            {readingMinutes(post.body)} min read ·{" "}
            {visible ? "Published" : "Draft"}
          </p>
        </div>
        <div className="studio-form-actions">
          {id && published && (
            <Link
              className="studio-button secondary"
              href={`/blog/${initial.slug}/`}
              target="_blank"
            >
              View post
            </Link>
          )}
          <button className="studio-button" disabled={busy}>
            {busy ? "Saving…" : id ? "Save changes" : "Save draft"}
          </button>
        </div>
      </div>
      <div className="studio-blog-editor">
        <div className="studio-panel studio-writing-panel">
          {post.cover && (
            <img
              className="studio-post-cover"
              src={post.cover}
              alt="Cover preview"
            />
          )}
          <label className="sr-only" htmlFor="post-title">
            Article title
          </label>
          <textarea
            className="studio-post-title"
            id="post-title"
            placeholder="Article title…"
            rows={2}
            required
            maxLength={200}
            value={post.title}
            onChange={(e) => {
              const title = e.target.value;
              setPost((p) => ({
                ...p,
                title,
                ...(!customSlug
                  ? {
                      slug: title
                        .toLowerCase()
                        .replace(/[^a-z0-9\s-]/g, "")
                        .trim()
                        .replace(/\s+/g, "-")
                        .replace(/-+/g, "-"),
                    }
                  : {}),
              }));
            }}
          />
          <div className="studio-writing-toolbar">
            <div className="studio-writing-tabs">
              <button
                type="button"
                aria-pressed={!preview}
                onClick={() => setPreview(false)}
              >
                Write
              </button>
              <button
                type="button"
                aria-pressed={preview}
                onClick={() => setPreview(true)}
              >
                Preview
              </button>
            </div>
            {!preview && (
              <div
                className="studio-format-buttons"
                role="group"
                aria-label="Formatting"
              >
                <button
                  type="button"
                  aria-label="Bold"
                  onClick={() => insert("**", "**")}
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  aria-label="Italic"
                  onClick={() => insert("*", "*")}
                >
                  <em>I</em>
                </button>
                <button
                  type="button"
                  aria-label="Heading"
                  onClick={() => insert("\n## ")}
                >
                  H2
                </button>
                <button
                  type="button"
                  aria-label="Link"
                  onClick={() => insert("[", "](https://example.com)")}
                >
                  Link
                </button>
                <button
                  type="button"
                  aria-label="Code block"
                  onClick={() => insert("\n```\n", "\n```\n")}
                >
                  Code
                </button>
                <button
                  type="button"
                  aria-label="Quote"
                  onClick={() => insert("\n> ")}
                >
                  Quote
                </button>
              </div>
            )}
          </div>
          {preview ? (
            <div className="studio-markdown-preview">
              <BlogMarkdown
                body={post.body || "Your words will appear here."}
              />
            </div>
          ) : (
            <>
              <label className="sr-only" htmlFor="post-body">
                Article content in Markdown
              </label>
              <textarea
                id="post-body"
                ref={editor}
                className="studio-post-body"
                placeholder="Tell your story… Markdown is welcome."
                rows={24}
                maxLength={100000}
                required
                value={post.body}
                onChange={(e) => update("body", e.target.value)}
              />
            </>
          )}
        </div>
        <aside className="studio-panel studio-form">
          <h2>Post settings</h2>
          <label>
            URL slug
            <input
              value={post.slug}
              onChange={(e) => {
                setCustomSlug(true);
                update("slug", e.target.value);
              }}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              required
              maxLength={160}
            />
          </label>
          <p className="studio-help">/blog/{post.slug || "your-article"}/</p>
          <label>
            Cover image path or URL
            <input
              value={post.cover}
              onChange={(e) => update("cover", e.target.value)}
              maxLength={2048}
              placeholder="/assets/image.jpg or https://…"
            />
          </label>
          <label>
            Author
            <input
              value={post.author}
              onChange={(e) => update("author", e.target.value)}
              required
              maxLength={100}
            />
          </label>
          <label>
            Tags (comma separated)
            <input
              defaultValue={post.tags.join(", ")}
              onChange={(e) => update("tags", e.target.value)}
              maxLength={320}
              placeholder="Open source, Careers"
            />
          </label>
          <label>
            Excerpt
            <textarea
              rows={5}
              value={post.excerpt}
              onChange={(e) => update("excerpt", e.target.value)}
              maxLength={500}
              placeholder="A short introduction for article cards and search results."
            />
          </label>
          {id ? (
            <label className="studio-checkbox">
              <input
                type="checkbox"
                checked={visible}
                onChange={(e) => setVisible(e.target.checked)}
              />
              <span>Published on the website</span>
            </label>
          ) : (
            <p className="studio-help">
              New posts start as drafts. Publish after saving and reviewing.
            </p>
          )}
          <p className="studio-form-message" role="status">
            {message}
          </p>
        </aside>
      </div>
    </form>
  );
}
