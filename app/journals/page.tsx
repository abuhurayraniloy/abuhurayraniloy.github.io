import { EntryList } from "../components/EntryList";
import { getAllJournals } from "@/lib/content";
import { pageMetadata, SiteFrame } from "../site";

export const metadata = pageMetadata("Journals", "Short journal entries by Abu Hurayra Niloy.", "/journals");

export default function JournalsPage() {
  return <SiteFrame currentPath="/journals">
    <header className="page-heading"><h1>Journals</h1><p>Short notes from day to day.</p></header>
    <EntryList entries={getAllJournals()} empty="No journal entries yet." />
  </SiteFrame>;
}
