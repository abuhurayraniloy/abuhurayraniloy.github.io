import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const outputRoot = new URL("../dist/client/", import.meta.url);

function output(path) { return new URL(path, outputRoot) }
async function findOutput(route) {
  const candidates = route ? [output(`${route}.html`), output(`${route}/index.html`)] : [output("index.html")];
  for (const candidate of candidates) {
    try { await access(candidate); return candidate; } catch { continue; }
  }
  throw new Error(`Missing exported route: ${route || "/"}`);
}
async function html(route) { return readFile(await findOutput(route), "utf8") }

test("exports the minimal home page", async () => {
  const source = await html("");
  assert.match(source, /<title>Abu Hurayra Niloy<\/title>/i);
  assert.match(source, /Hi, I(?:&#x27;|&#x2019;|&apos;|'|\u2019)m Abu Hurayra Niloy/i);
  for (const label of ["Blogs", "Projects", "Journals", "Contact me"]) assert.match(source, new RegExp(`>${label}<`));
  assert.doesNotMatch(source, /SearchPalette|ThemeToggle|sidebar-nav|card-grid|Manage content|Pages CMS/);
});

test("exports the four public sections and detail pages", async () => {
  const routes = ["blog", "projects", "journals", "contact", "blog/welcome", "projects/portfolio", "journals/a-small-start"];
  await Promise.all(routes.map(findOutput));
});

test("creates directory indexes for GitHub Pages", async () => {
  const routes = ["blog", "projects", "journals", "contact", "blog/welcome", "projects/portfolio", "journals/a-small-start"];
  await Promise.all(routes.map((route) => access(output(`${route}/index.html`))));
});

test("does not export removed routes or editor controls", async () => {
  await assert.rejects(findOutput("admin"));
  await assert.rejects(findOutput("about"));
  await assert.rejects(findOutput("uses"));
  const source = await html("contact");
  assert.match(source, /abuhurayraniloy@gmail\.com/);
  assert.match(source, /github\.com\/abuhurayraniloy/);
  assert.match(source, /linkedin\.com\/in\/niloy13/);
  assert.doesNotMatch(source, /Compose email|Search|ThemeToggle/);
});

test("ships discovery assets", async () => {
  await Promise.all([access(output(".nojekyll")), access(output("favicon.svg")), access(output("og.png")), access(output("robots.txt")), access(output("sitemap.xml"))]);
  const sitemapSource = await readFile(output("sitemap.xml"), "utf8");
  assert.match(sitemapSource, /abuhurayraniloy\.github\.io\/journals\/a-small-start/);
});

test("uses full-document navbar navigation for static hosting", async () => {
  const renderer = await readFile(new URL("../app/site.tsx", import.meta.url), "utf8");
  assert.match(renderer, /nav\.map\(\(\[label, href\]\) => <a /);
  assert.match(renderer, /<a className="site-title" href="\/" target="_top">/);
});

test("keeps Markdown raw HTML disabled", async () => {
  const renderer = await readFile(new URL("../app/site.tsx", import.meta.url), "utf8");
  assert.match(renderer, /<ReactMarkdown[^>]*skipHtml/);
  assert.doesNotMatch(renderer, /rehypeRaw|rehype-raw/);
});
