"use client";
import { useRef, useState } from "react";
import type { Chapter } from "@/lib/episodes";
import { parseChapters } from "@/lib/chapters";

export function ChapterUpload({
  chapters,
  onChange,
  onReadingChange,
  disabled,
}: {
  chapters: Chapter[];
  onChange: (chapters: Chapter[]) => void;
  onReadingChange: (reading: boolean) => void;
  disabled: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [reading, setReading] = useState(false);
  const [filename, setFilename] = useState("");
  const [error, setError] = useState("");
  return (
    <section className="studio-panel studio-form">
      <div className="studio-section-heading">
        <h2>Chapters</h2>
        {chapters.length > 0 && (
          <button
            type="button"
            className="studio-text-button"
            disabled={disabled || reading}
            onClick={() => {
              onChange([]);
              setFilename("");
              setError("");
              if (input.current) input.current.value = "";
            }}
          >
            Clear chapters
          </button>
        )}
      </div>
      <label>
        Upload chapter file
        <input
          ref={input}
          type="file"
          accept=".txt,text/plain"
          aria-describedby="chapter-file-help"
          disabled={disabled || reading}
          onChange={async (event) => {
            const field = event.currentTarget;
            const file = field.files?.[0];
            if (!file) return;
            setError("");
            setReading(true);
            onReadingChange(true);
            try {
              if (!/\.txt$/i.test(file.name))
                throw new Error("Choose a .txt chapter file.");
              if (file.size > 100 * 1024)
                throw new Error("Choose a chapter file smaller than 100 KB.");
              const imported = parseChapters(await file.text());
              onChange(imported);
              setFilename(file.name);
            } catch (error) {
              setError(
                (error as Error).message +
                  " Your chapters have not been changed.",
              );
              field.value = "";
            } finally {
              setReading(false);
              onReadingChange(false);
            }
          }}
        />
      </label>
      <p className="studio-help" id="chapter-file-help">
        Upload the same chapters.txt used for YouTube. One timestamp and title
        per line, using 00:00 or 00:00:00. A new file replaces the chapter list
        when you save the episode.
      </p>
      <p className="studio-upload-status" role="status">
        {reading
          ? "Reading chapters…"
          : filename
            ? `${filename} · ${chapters.length} chapters ready to save`
            : `${chapters.length} chapters`}
      </p>
      {error && (
        <p className="studio-input-error" role="alert">
          {error}
        </p>
      )}
      {chapters.length > 0 ? (
        <ol className="studio-chapter-preview" aria-label="Chapter preview">
          {chapters.map((chapter, index) => (
            <li key={`${chapter.time}-${index}`}>
              <code>{chapter.time}</code>
              <span>{chapter.title}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="studio-help">
          No chapters yet. Upload a file when they’re ready.
        </p>
      )}
    </section>
  );
}
