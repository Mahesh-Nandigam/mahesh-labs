"use client";
import { useState } from "react";
import { StudioLink as Link } from "@/components/admin/studio-link";
import { useRouter } from "next/navigation";
import type { Episode } from "@/lib/episodes";
import { studioRequest } from "./client";
import { ChapterUpload } from "./chapter-upload";
export function EpisodeEditor({
  initial,
  published,
  revision,
  isNew = false,
}: {
  initial: Episode;
  published: boolean;
  revision: string;
  isNew?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [version, setVersion] = useState(revision),
    [image, setImage] = useState(initial.image),
    [chapters, setChapters] = useState(initial.chapters),
    [readingChapters, setReadingChapters] = useState(false),
    [links, setLinks] = useState(
      initial.links.map((link, index) => ({ ...link, id: `link-${index}` })),
    );
  const fields = [
    ["guest", "Guest name", initial.guest || ""],
    ["title", "Episode title", initial.title],
    ["role", "Guest role / subtitle", initial.role],
    ["topics", "Topics (comma separated)", initial.topics.join(", ")],
    ["duration", "Duration", initial.duration],
    ["videoId", "YouTube video ID", initial.videoId || ""],
    ["teaser", "Teaser asset URL", initial.teaser || ""],
    [
      "teaserDuration",
      "Teaser duration in seconds",
      String(initial.teaserDuration || ""),
    ],
  ];
  return (
    <>
      <div className="studio-heading">
        <div>
          <Link className="studio-breadcrumb" href="/admin/episodes/">
            Episodes
          </Link>
          <h1>
            {isNew ? "A new conversation." : `Edit episode ${initial.number}.`}
          </h1>
          <p>
            {isNew
              ? "Save a draft first, then publish when it’s ready."
              : "Changes appear on the website when this episode is published."}
          </p>
        </div>
        {!isNew && published && (
          <Link
            className="studio-button secondary"
            target="_blank"
            href={`/episodes/${initial.number}/`}
          >
            View episode
          </Link>
        )}
      </div>
      <form
        className="studio-editor"
        onSubmit={async (event) => {
          event.preventDefault();
          if (busy || readingChapters) return;
          setBusy(true);
          setMessage("");
          const f = new FormData(event.currentTarget);
          const get = (key: string) => String(f.get(key) || "").trim();
          try {
            const episode: Episode = {
              number: isNew ? Number(get("number")) : initial.number,
              guest: get("guest"),
              title: get("title"),
              description: get("description"),
              topics: get("topics")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
              role: get("role"),
              image: get("image"),
              videoId: get("videoId") || null,
              duration: get("duration"),
              status: get("videoId") ? "Watch now" : "Coming soon",
              chapters,
              links: links.map(({ name, url }) => ({
                name: name.trim(),
                url: url.trim(),
              })),
              ...(get("teaser") ? { teaser: get("teaser") } : {}),
              ...(get("teaserDuration")
                ? { teaserDuration: Number(get("teaserDuration")) }
                : {}),
            };
            if (isNew) {
              const result = await studioRequest(
                "/api/admin/episodes/",
                "POST",
                episode,
              );
              router.replace(`/admin/episodes/${result.number}/`);
              router.refresh();
            } else {
              const result = await studioRequest(
                `/api/admin/episodes/${initial.number}/`,
                "PUT",
                {
                  episode,
                  published: f.get("published") === "on",
                  updatedAt: version,
                },
              );
              setVersion(result.updatedAt);
              setMessage("Episode saved.");
              router.refresh();
            }
          } catch (e) {
            setMessage((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="studio-editor-main">
          <section className="studio-panel studio-form">
            <h2>Episode details</h2>
            {isNew && (
              <label>
                Episode number
                <input
                  name="number"
                  type="number"
                  min="1"
                  max="100000"
                  defaultValue={initial.number}
                  required
                />
              </label>
            )}
            {fields.slice(0, 4).map(([key, label, value]) => (
              <label key={key}>
                {label}
                <input
                  name={key}
                  defaultValue={value}
                  required={key === "guest" || key === "title"}
                  maxLength={key === "title" ? 250 : 500}
                />
              </label>
            ))}
            <label>
              Description
              <textarea
                name="description"
                defaultValue={initial.description}
                rows={5}
                required
                maxLength={10000}
              />
            </label>
          </section>
          <section className="studio-panel studio-form">
            <h2>Playback & teaser</h2>
            <div className="studio-fields-grid">
              {fields.slice(4).map(([key, label, value]) => (
                <label key={key}>
                  {label}
                  <input
                    name={key}
                    defaultValue={value}
                    type={key === "teaserDuration" ? "number" : "text"}
                    min={key === "teaserDuration" ? 1 : undefined}
                    maxLength={2048}
                  />
                </label>
              ))}
            </div>
            <p className="studio-help">
              Keep the video ID empty for a coming-soon episode. Teaser storage
              and early-access timing will be added separately.
            </p>
          </section>
          <ChapterUpload
            key={version}
            chapters={chapters}
            onChange={setChapters}
            onReadingChange={setReadingChapters}
            disabled={busy}
          />
          <section className="studio-panel studio-form">
            <div className="studio-section-heading">
              <h2>Guest links</h2>
              <button
                type="button"
                className="studio-button secondary"
                disabled={busy || links.length >= 15}
                onClick={() =>
                  setLinks([
                    ...links,
                    { id: crypto.randomUUID(), name: "", url: "" },
                  ])
                }
              >
                Add link
              </button>
            </div>
            <p className="studio-help">
              Add the guest’s website or social profiles.
            </p>
            {links.map((link, index) => (
              <div className="studio-guest-link" key={link.id}>
                <label>
                  Label
                  <input
                    aria-label={`Link ${index + 1} label`}
                    value={link.name}
                    placeholder="LinkedIn"
                    required
                    maxLength={60}
                    disabled={busy}
                    onChange={(event) =>
                      setLinks(
                        links.map((item) =>
                          item.id === link.id
                            ? { ...item, name: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                </label>
                <label>
                  URL
                  <input
                    aria-label={`Link ${index + 1} URL`}
                    type="url"
                    value={link.url}
                    placeholder="https://linkedin.com/in/guest"
                    required
                    maxLength={2048}
                    disabled={busy}
                    onChange={(event) =>
                      setLinks(
                        links.map((item) =>
                          item.id === link.id
                            ? { ...item, url: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                </label>
                <button
                  type="button"
                  className="studio-remove-link"
                  aria-label={`Remove link ${index + 1}`}
                  disabled={busy}
                  onClick={() =>
                    setLinks(links.filter((item) => item.id !== link.id))
                  }
                >
                  Remove
                </button>
              </div>
            ))}
          </section>
        </div>
        <aside className="studio-editor-aside">
          <section className="studio-panel studio-form">
            <h2>Thumbnail</h2>
            <img
              className="studio-thumbnail-preview"
              src={image}
              alt="Episode thumbnail preview"
            />
            <label>
              Thumbnail path or URL
              <input
                name="image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                required
                maxLength={2048}
              />
            </label>
            <p className="studio-help">
              Use an existing site asset or a hosted image URL.
            </p>
          </section>
          <section className="studio-panel studio-form">
            <h2>Website visibility</h2>
            {isNew ? (
              <p>New episodes are saved as drafts.</p>
            ) : (
              <label className="studio-checkbox">
                <input
                  type="checkbox"
                  name="published"
                  defaultChecked={published}
                />
                <span>Published on the website</span>
              </label>
            )}
            <p className="studio-help">
              Unpublished episodes are hidden from public pages and search.
            </p>
            <button
              className="studio-button"
              disabled={busy || readingChapters}
            >
              {busy ? "Saving…" : isNew ? "Create draft" : "Save changes"}
            </button>
            <p className="studio-form-message" role="status">
              {message}
            </p>
          </section>
        </aside>
      </form>
    </>
  );
}
