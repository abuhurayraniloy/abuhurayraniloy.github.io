import type { Metadata } from "next";
import { getSettings } from "@/lib/content";
import { SiteFrame } from "./site";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  const settings = getSettings();
  return <SiteFrame currentPath="/">
    <section className="home-intro">
      <h1>{settings.home.title}</h1>
      <p>{settings.home.intro}</p>
    </section>
  </SiteFrame>;
}
