"use client";

import Link from "next/link";
import CartButton from "./CartButton";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-border">
      <nav className="mx-auto flex max-w-300 items-center justify-between px-4 py-3.5 md:px-8">
        {/* Brand name */}
        <Link href="/" className="font-sans text-2xl font-bold tracking-tight text-primary">
          Cem&apos;ong
        </Link>

        {/* Navigation links & cart */}
        <div className="flex items-center gap-6 sm:gap-8">
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Beranda
            </Link>
            <Link href="/produk" className="hover:text-primary transition-colors">
              Produk
            </Link>
            <a href="/#tentang" className="hover:text-primary transition-colors">
              Tentang
            </a>
            <a href="/#cara-pesan" className="hover:text-primary transition-colors">
              Cara Pesan
            </a>
          </div>

          <CartButton />
        </div>
      </nav>
    </header>
  );
}
