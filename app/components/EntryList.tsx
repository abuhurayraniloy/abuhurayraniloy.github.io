import { getEntryHref, type ContentEntry } from "@/lib/content";

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export function EntryList({ entries, empty = "Nothing published yet." }: { entries: ContentEntry[]; empty?: string }) {
  if (!entries.length) return <p className="empty-state">{empty}</p>;
  return <ul className="entry-list">
    {entries.map((entry) => <li key={`${entry.collection}-${entry.slug}`}>
      <a className="entry-list__link" href={getEntryHref(entry)}>
        <span>{entry.title}</span>
        {entry.date ? <time dateTime={entry.date}>{formatDate(entry.date)}</time> : null}
      </a>
      {entry.description ? <p>{entry.description}</p> : null}
    </li>)}
  </ul>;
}
