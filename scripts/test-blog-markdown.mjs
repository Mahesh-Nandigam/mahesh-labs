import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import ts from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const root = new URL("../", import.meta.url);
const directory = await mkdtemp(new URL(".blog-test-", root));
try {
  for (const [source, target] of [["lib/markdown.ts", "markdown.mjs"], ["components/blog-markdown.tsx", "component.mjs"]]) {
    const input = (await readFile(new URL(source, root), "utf8"))
      .replace('"@/lib/markdown"', '"./markdown.mjs"');
    const output = ts.transpileModule(input, { compilerOptions: {
      module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
    }}).outputText;
    await writeFile(`${directory}/${target}`, output);
  }
  const { tableOfContents } = await import(pathToFileURL(`${directory}/markdown.mjs`));
  const { BlogMarkdown } = await import(pathToFileURL(`${directory}/component.mjs`));
  const body = [
    "# Not in the contents", "", "## [Neon](https://neon.tech)", "", "### **Neon**", "",
    "## Escaped \\*stars\\* &amp; `code`", "", "> ## [Nested][docs]", "",
    "Setext heading", "--------------", "", "## ![Logo](/logo.png) image", "",
    "```md", "## Not a heading", "```", "", "[docs]: https://example.com", "",
    "[Jump](#neon) and [Episodes](/episodes/).",
  ].join("\n");
  const contents = tableOfContents(body);
  assert.deepEqual(contents.map(h => h.title), ["Neon", "Neon", "Escaped *stars* & code", "Nested", "Setext heading", "Logo image"]);
  assert.deepEqual(contents.map(h => h.id), ["neon", "neon-1", "escaped-stars-code", "nested", "setext-heading", "logo-image"]);
  const html = renderToStaticMarkup(createElement(BlogMarkdown, { body }));
  assert.deepEqual([...html.matchAll(/<h[23] id="([^"]+)"/g)].map(m => m[1]), contents.map(h => h.id));
  assert.match(html, /<a href="#neon">Jump<\/a>/);
  assert.match(html, /<a href="\/episodes\/">Episodes<\/a>/);
  assert.match(html, /href="https:\/\/neon.tech" target="_blank" rel="noopener noreferrer"/);
  console.log("Passed Markdown heading/contents and internal/external link regressions.");
} finally {
  await rm(directory, { recursive: true, force: true });
}
