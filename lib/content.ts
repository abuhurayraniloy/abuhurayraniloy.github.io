import matter from "gray-matter";
import bundledSettings from "../content/settings.json";

export type CollectionName = "posts" | "projects" | "journals";

export interface SiteSettings {
  name: string;
  siteTitle: string;
  description: string;
  url: string;
  locale: string;
  home: { title: string; intro: string };
  contact: { title: string; intro: string; email: string; github: string; linkedin: string };
}

export interface Heading { id: string; text: string; label: string; level: number }

export interface ContentEntry {
  slug: string;
  collection: CollectionName;
  title: string;
  description: string;
  date?: string;
  tags: string[];
  draft: boolean;
  content: string;
  headings: Heading[];
}

export interface ContentOptions { includeDrafts?: boolean }

const collections: CollectionName[] = ["posts", "projects", "journals"];
const contentSources = import.meta.glob<string>(
  ["../content/**/*.md", "../content/**/*.mdx"],
  { eager: true, import: "default", query: "?raw" },
);

function fail(file: string, message: string): never { throw new Error(`[content] ${file}: ${message}`) }
function object(value: unknown, file: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(file, "expected an object");
  return value as Record<string, unknown>;
}
function string(value: unknown, file: string, field: string, fallback?: string): string {
  if (value === undefined && fallback !== undefined) return fallback;
  if (typeof value !== "string" || !value.trim()) fail(file, `field "${field}" must be a non-empty string`);
  return value.trim();
}
function boolean(value: unknown, file: string, field: string, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  if (typeof value !== "boolean") fail(file, `field "${field}" must be true or false`);
  return value;
}
function strings(value: unknown, file: string, field: string): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) fail(file, `field "${field}" must be a list of strings`);
  return value.map((item) => item.trim()).filter(Boolean);
}
function date(value: unknown, file: string): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(parsed.valueOf())) fail(file, 'field "date" must be a valid date');
  return parsed.toISOString().slice(0, 10);
}
function slugFromFilename(filename: string): string { return filename.replace(/\.mdx?$/i, "") }
function hrefFor(entry: Pick<ContentEntry, "collection" | "slug">): string {
  const prefix = entry.collection === "posts" ? "blog" : entry.collection;
  return `/${prefix}/${entry.slug}`;
}
function inlineText(value: string): string {
  return value.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/<[^>]+>/g, "").replace(/[`*_~]/g, "").trim();
}
function headingId(value: string): string {
  return inlineText(value).normalize("NFKD").toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-") || "section";
}

export function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];
  const ids = new Map<string, number>();
  let fenced = false;
  for (const line of markdown.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) { fenced = !fenced; continue; }
    if (fenced) continue;
    const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    const text = inlineText(match[2]);
    const base = headingId(text);
    const count = ids.get(base) ?? 0;
    ids.set(base, count + 1);
    headings.push({ id: count ? `${base}-${count}` : base, text, label: text, level: match[1].length });
  }
  return headings;
}

function parseEntry(collection: CollectionName, filename: string, source: string): ContentEntry {
  const file = `content/${collection}/${filename}`;
  const parsed = matter(source);
  const data = object(parsed.data, file);
  return {
    slug: slugFromFilename(filename),
    collection,
    title: string(data.title, file, "title"),
    description: string(data.description, file, "description", ""),
    date: date(data.date, file),
    tags: strings(data.tags, file, "tags"),
    draft: boolean(data.draft, file, "draft", false),
    content: parsed.content.trim(),
    headings: extractHeadings(parsed.content),
  };
}

function readCollection(collection: CollectionName, options: ContentOptions = {}): ContentEntry[] {
  const marker = `/content/${collection}/`;
  const entries = Object.entries(contentSources)
    .map(([sourcePath, source]) => [sourcePath.replace(/\\/g, "/"), source] as const)
    .filter(([sourcePath]) => sourcePath.includes(marker))
    .flatMap(([sourcePath, source]) => {
      const filename = sourcePath.slice(sourcePath.indexOf(marker) + marker.length);
      return filename && !filename.includes("/") ? [parseEntry(collection, filename, source)] : [];
    });
  const slugs = new Set<string>();
  for (const entry of entries) {
    if (slugs.has(entry.slug.toLowerCase())) fail(`content/${collection}`, `duplicate slug "${entry.slug}"`);
    slugs.add(entry.slug.toLowerCase());
  }
  return entries.filter((entry) => options.includeDrafts || !entry.draft).sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "") || a.title.localeCompare(b.title));
}

export function getSettings(): SiteSettings {
  const file = "content/settings.json";
  const data = object(bundledSettings, file);
  const home = object(data.home, `${file} (home)`);
  const contact = object(data.contact, `${file} (contact)`);
  return {
    name: string(data.name, file, "name"),
    siteTitle: string(data.siteTitle, file, "siteTitle"),
    description: string(data.description, file, "description"),
    url: string(data.url, file, "url"),
    locale: string(data.locale, file, "locale", "en"),
    home: { title: string(home.title, file, "home.title"), intro: string(home.intro, file, "home.intro") },
    contact: {
      title: string(contact.title, file, "contact.title"),
      intro: string(contact.intro, file, "contact.intro"),
      email: string(contact.email, file, "contact.email"),
      github: string(contact.github, file, "contact.github"),
      linkedin: string(contact.linkedin, file, "contact.linkedin"),
    },
  };
}

export function getCollectionEntries(collection: CollectionName, options?: ContentOptions) { return readCollection(collection, options) }
export function getEntryByCollection(collection: CollectionName, slug: string, options?: ContentOptions) { return readCollection(collection, options).find((entry) => entry.slug === slug) }
export function getAllPosts(options?: ContentOptions) { return readCollection("posts", options) }
export function getAllProjects(options?: ContentOptions) { return readCollection("projects", options) }
export function getAllJournals(options?: ContentOptions) { return readCollection("journals", options) }
export function getAllEntries(options?: ContentOptions) { return collections.flatMap((collection) => readCollection(collection, options)) }
export function getEntryHref(entry: Pick<ContentEntry, "collection" | "slug">) { return hrefFor(entry) }
