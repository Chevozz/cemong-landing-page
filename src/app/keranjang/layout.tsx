import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Keranjang",
  robots: { index: false, follow: false },
};

export default function KeranjangLayout({ children }: { children: React.ReactNode }) {
  return children;
}
