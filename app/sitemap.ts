import type { MetadataRoute } from "next";
import { getAllEntries, getEntryHref, getSettings } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const settings = getSettings();
  const core = ["/", "/blog", "/projects", "/journals", "/contact"].map((href) => ({ url: new URL(href, settings.url).toString(), changeFrequency: href === "/" ? "weekly" as const : "monthly" as const, priority: href === "/" ? 1 : 0.8 }));
  const content = getAllEntries().map((entry) => ({ url: new URL(getEntryHref(entry), settings.url).toString(), lastModified: entry.date ? new Date(entry.date) : undefined, changeFrequency: "monthly" as const, priority: 0.6 }));
  return [...new Map([...core, ...content].map((item) => [item.url, item])).values()];
}
