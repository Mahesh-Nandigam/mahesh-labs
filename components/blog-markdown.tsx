import Markdown from "react-markdown";
import type { ReactNode } from "react";
import { headingId } from "@/lib/blog";
function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node && typeof node === "object" && "props" in node)
    return textOf((node.props as { children?: ReactNode }).children);
  return "";
}
export function BlogMarkdown({ body }: { body: string }) {
  const counts = new Map<string, number>();
  const idFor = (children: ReactNode) => {
    const base = headingId(textOf(children)),
      n = counts.get(base) || 0;
    counts.set(base, n + 1);
    return n ? `${base}-${n}` : base;
  };
  return (
    <div className="blog-prose">
      <Markdown
        components={{
          h2: ({ children }) => <h2 id={idFor(children)}>{children}</h2>,
          h3: ({ children }) => <h3 id={idFor(children)}>{children}</h3>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {body}
      </Markdown>
    </div>
  );
}
