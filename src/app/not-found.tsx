import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-xl font-bold text-foreground mb-2">
          Halaman tidak ditemukan
        </h2>
        <p className="text-muted mb-6">
          Maaf, halaman yang kamu cari tidak tersedia.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-base font-medium text-white hover:bg-primary/90 transition-colors min-h-11"
          >
            <Home size={18} aria-hidden="true" />
            Beranda
          </Link>
          <Link
            href="/produk"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-surface px-6 py-3 text-base font-medium text-foreground hover:bg-background transition-colors min-h-11"
          >
            <Search size={18} aria-hidden="true" />
            Lihat Produk
          </Link>
        </div>
      </div>
    </div>
  );
}
