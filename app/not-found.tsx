import Link from "next/link";
import { SiteFrame } from "./site";

export default function NotFound() {
  return <SiteFrame>
    <section className="page-heading"><h1>Page not found</h1><p>The page may have moved.</p><Link href="/">Return home</Link></section>
  </SiteFrame>;
}
