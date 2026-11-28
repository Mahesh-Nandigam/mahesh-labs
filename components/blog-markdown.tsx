import Markdown from "react-markdown";
import { tableOfContents } from "@/lib/markdown";
export function BlogMarkdown({ body }: { body: string }) {
  const ids = new Map(tableOfContents(body).map(heading => [heading.line, heading.id]));
  return (
    <div className="blog-prose">
      <Markdown
        components={{
          h2: ({ node, children }) => <h2 id={ids.get(node?.position?.start.line ?? 0)}>{children}</h2>,
          h3: ({ node, children }) => <h3 id={ids.get(node?.position?.start.line ?? 0)}>{children}</h3>,
          a: ({ href, children }) => /^(https?:)?\/\//.test(href || "") ? (
            <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
          ) : <a href={href}>{children}</a>,
        }}
      >
        {body}
      </Markdown>
    </div>
  );
}
