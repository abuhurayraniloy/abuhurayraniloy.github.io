/* eslint-disable @next/next/no-html-link-for-pages -- Static export needs full-document navigation. */
import type { Metadata } from "next";
import { isValidElement, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { getSettings, type ContentEntry } from "@/lib/content";

function absoluteUrl(href: string) { return new URL(href, getSettings().url).toString() }

export function pageMetadata(title: string, description: string, href: string): Metadata {
  const settings = getSettings();
  return {
    title,
    description,
    alternates: { canonical: href },
    openGraph: { type: "website", locale: settings.locale, url: absoluteUrl(href), siteName: settings.siteTitle, title, description, images: ["/og.png"] },
  };
}

export function entryMetadata(entry: ContentEntry, href: string): Metadata {
  return { ...pageMetadata(entry.title, entry.description, href), openGraph: { ...pageMetadata(entry.title, entry.description, href).openGraph, type: "article", publishedTime: entry.date, tags: entry.tags } };
}

function markdownText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number" || typeof node === "bigint") return String(node);
  if (Array.isArray(node)) return node.map(markdownText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return markdownText(node.props.children);
  return "";
}

function headingId(children: ReactNode) {
  return markdownText(children).normalize("NFKD").toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-") || "section";
}

export function Markdown({ children }: { children: string }) {
  const ids = new Map<string, number>();
  const heading = (Tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") => function MarkdownHeading({ children: headingChildren }: { children?: ReactNode }) {
    const base = headingId(headingChildren);
    const count = ids.get(base) ?? 0;
    ids.set(base, count + 1);
    return <Tag id={count ? `${base}-${count}` : base}>{headingChildren}</Tag>;
  };
  const components = { h1: heading("h1"), h2: heading("h2"), h3: heading("h3"), h4: heading("h4"), h5: heading("h5"), h6: heading("h6") } satisfies Components;
  return <ReactMarkdown components={components} remarkPlugins={[remarkGfm]} skipHtml>{children}</ReactMarkdown>;
}

export function articleContent(entry: ContentEntry) { return entry.content.replace(/^\s*#\s+[^\r\n]+(?:\r?\n|$)/, "").trimStart() }

const nav = [
  ["Blogs", "/blog"],
  ["Projects", "/projects"],
  ["Journals", "/journals"],
  ["Contact me", "/contact"],
] as const;

function activePath(href: string, currentPath?: string) {
  if (!currentPath) return false;
  const path = currentPath.replace(/\/$/, "") || "/";
  const target = href.replace(/\/$/, "") || "/";
  return target === path || (target !== "/" && path.startsWith(`${target}/`));
}

export function SiteFrame({ children, currentPath }: { children: ReactNode; currentPath?: string }) {
  const settings = getSettings();
  return (
    <div className="site">
      <header className="site-header">
        <div className="site-header__inner">
          <a className="site-title" href="/" target="_top">{settings.siteTitle}</a>
          <nav aria-label="Primary navigation" className="site-nav">
            {nav.map(([label, href]) => <a aria-current={activePath(href, currentPath) ? "page" : undefined} href={href} key={href}>{label}</a>)}
          </nav>
        </div>
      </header>
      <main className="site-main">{children}</main>
    </div>
  );
}
