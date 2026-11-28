import { unified } from "unified";
import remarkParse from "remark-parse";

const parser = unified().use(remarkParse);
export const headingId = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");

type MarkdownNode = {
  type: string;
  value?: string;
  alt?: string | null;
  depth?: number;
  position?: { start: { line: number } };
  children?: MarkdownNode[];
};

function textOf(node: MarkdownNode): string {
  if (node.type === "image" || node.type === "imageReference") return node.alt || "";
  if (node.type === "break") return " ";
  return node.value ?? node.children?.map(textOf).join("") ?? "";
}

export function tableOfContents(body: string) {
  const counts = new Map<string, number>();
  const headings: { title: string; id: string; level: number; line: number }[] = [];
  function visit(node: MarkdownNode) {
    if (node.type === "heading" && (node.depth === 2 || node.depth === 3)) {
      const title = textOf(node), base = headingId(title), count = counts.get(base) || 0;
      counts.set(base, count + 1);
      headings.push({ title, id: count ? `${base}-${count}` : base,
        level: node.depth, line: node.position!.start.line });
    }
    node.children?.forEach(visit);
  }
  visit(parser.parse(body));
  return headings;
}
