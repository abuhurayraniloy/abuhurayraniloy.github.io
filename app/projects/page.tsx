import { EntryList } from "../components/EntryList";
import { getAllProjects } from "@/lib/content";
import { pageMetadata, SiteFrame } from "../site";

export const metadata = pageMetadata("Projects", "Projects by Abu Hurayra Niloy.", "/projects");

export default function ProjectsPage() {
  return <SiteFrame currentPath="/projects">
    <header className="page-heading"><h1>Projects</h1><p>A simple record of things I have built.</p></header>
    <EntryList entries={getAllProjects()} empty="No projects yet." />
  </SiteFrame>;
}
