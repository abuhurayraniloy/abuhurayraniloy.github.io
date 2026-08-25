import { pageMetadata, SiteFrame } from "../site";
import { getSettings } from "@/lib/content";
import { SocialLinks } from "../components/SocialLinks";

export function generateMetadata() {
  const settings = getSettings();
  return pageMetadata(settings.contact.title, settings.contact.intro, "/contact");
}

export default function ContactPage() {
  const { contact } = getSettings();
  return <SiteFrame currentPath="/contact">
    <section className="page-heading contact-page">
      <h1>{contact.title}</h1>
      <p>{contact.intro}</p>
      <a className="email-link" href={`mailto:${contact.email}`}>{contact.email}</a>
      <SocialLinks github={contact.github} linkedin={contact.linkedin} />
    </section>
  </SiteFrame>;
}
