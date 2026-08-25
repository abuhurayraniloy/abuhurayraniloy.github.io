import type { Metadata, Viewport } from "next";
import { getSettings } from "@/lib/content";
import "./globals.css";

const settings = getSettings();
const socialImage = new URL("/og.png", settings.url).toString();

export const metadata: Metadata = {
  metadataBase: new URL(settings.url),
  applicationName: settings.siteTitle,
  title: { default: settings.siteTitle, template: `%s | ${settings.siteTitle}` },
  description: settings.description,
  authors: [{ name: settings.name }],
  creator: settings.name,
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: { type: "website", locale: settings.locale, url: settings.url, siteName: settings.siteTitle, title: settings.siteTitle, description: settings.description, images: [{ url: socialImage, width: 1731, height: 909, alt: `${settings.name} portfolio` }] },
};

export const viewport: Viewport = { colorScheme: "light", themeColor: "#fff5e6" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang={settings.locale}><body>{children}</body></html>;
}
