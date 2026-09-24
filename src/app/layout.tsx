import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/components/layout/StoreProvider";
import { getStoreInfo } from "@/lib/supabase/store-queries";
import { siteUrl } from "@/config/site";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Cem'ong — Keripik Talas & Rengginang",
    template: "%s — Cem'ong",
  },
  description: "Keripik ubi talas dan rengginang goreng rumahan. Renyah, gurih, cocok untuk teman ngopi atau ngemil santai. Pesan langsung via WhatsApp.",
  keywords: ["keripik talas", "rengginang", "camilan", "snack", "UMKM", "gorengan rumahan"],
  authors: [{ name: "Cem'ong" }],
  creator: "Cem'ong",
  publisher: "Cem'ong",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Cem'ong — Keripik Talas & Rengginang",
    description: "Keripik ubi talas dan rengginang goreng rumahan. Renyah, gurih, pesan via WhatsApp.",
    url: siteUrl,
    siteName: "Cem'ong",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/images/hero-camilan.svg", width: 1200, height: 900, alt: "Keripik talas dan rengginang Cem'ong" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cem'ong — Keripik Talas & Rengginang",
    description: "Keripik ubi talas dan rengginang goreng rumahan.",
    images: ["/images/hero-camilan.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#6A4C93",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const store = await getStoreInfo();

  return (
    <html lang="id" className={`${plusJakarta.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <StoreProvider store={store}>{children}</StoreProvider>
      </body>
    </html>
  );
}
