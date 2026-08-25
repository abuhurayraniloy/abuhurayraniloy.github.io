import { EntryList } from "../components/EntryList";
import { getAllPosts } from "@/lib/content";
import { pageMetadata, SiteFrame } from "../site";

export const metadata = pageMetadata("Blogs", "Writing and notes by Abu Hurayra Niloy.", "/blog");

export default function BlogsPage() {
  return <SiteFrame currentPath="/blog">
    <header className="page-heading"><h1>Blogs</h1><p>Writing, ideas, and things I am learning.</p></header>
    <EntryList entries={getAllPosts()} empty="No blog posts yet." />
  </SiteFrame>;
}
