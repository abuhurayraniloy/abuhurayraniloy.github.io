import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollectionEntries, getEntryByCollection, getEntryHref, getSettings, type CollectionName } from "@/lib/content";
import { articleContent, entryMetadata, Markdown, SiteFrame } from "../../site";

const routeCollections = { blog: "posts", projects: "projects", journals: "journals" } as const;
type RouteCollection = keyof typeof routeCollections;

interface DetailPageProps { params: Promise<{ collection: string; slug: string }> }

function resolveCollection(value: string): CollectionName | undefined {
  return value in routeCollections ? routeCollections[value as RouteCollection] : undefined;
}
function labelFor(value: RouteCollection) { return value === "blog" ? "Blog" : value === "projects" ? "Project" : "Journal" }
function formatDate(value: string, locale: string) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(date);
}

export const dynamicParams = false;

export function generateStaticParams() {
  return (Object.entries(routeCollections) as Array<[RouteCollection, CollectionName]>).flatMap(([collection, source]) => getCollectionEntries(source).map((entry) => ({ collection, slug: entry.slug })));
}

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const { collection, slug } = await params;
  const source = resolveCollection(collection);
  const entry = source ? getEntryByCollection(source, slug) : undefined;
  return entry ? entryMetadata(entry, getEntryHref(entry)) : {};
}

export default async function ContentDetailPage({ params }: DetailPageProps) {
  const { collection, slug } = await params;
  const source = resolveCollection(collection);
  const entry = source ? getEntryByCollection(source, slug) : undefined;
  if (!source || !entry || !(collection in routeCollections)) notFound();
  const settings = getSettings();
  const route = collection as RouteCollection;
  return <SiteFrame currentPath={`/${collection}/`}>
    <article className="article">
      <p className="eyebrow">{labelFor(route)}</p>
      <h1>{entry.title}</h1>
      {entry.description ? <p className="article-description">{entry.description}</p> : null}
      {entry.date ? <time className="article-date" dateTime={entry.date}>{formatDate(entry.date, settings.locale)}</time> : null}
      {entry.tags.length ? <p className="article-tags">{entry.tags.map((tag) => `#${tag}`).join("  ")}</p> : null}
      <div className="prose"><Markdown>{articleContent(entry)}</Markdown></div>
    </article>
  </SiteFrame>;
}

