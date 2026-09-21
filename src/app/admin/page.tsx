import Link from "next/link";
import { Plus, Package, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { getAdminStats, getAllProductsAdmin } from "@/lib/supabase/admin-queries";
import { formatRupiah } from "@/lib/formatters/currency";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();
  const products = await getAllProductsAdmin();

  return (
    <div className="space-y-8">
      {/* Top Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard Katalog
          </h1>
          <p className="text-sm text-muted">
            Ringkasan status produk dan ketersediaan camilan Cem&apos;ong
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/produk/tambah"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors min-h-10"
          >
            <Plus size={16} aria-hidden="true" />
            <span>Tambah Produk</span>
          </Link>
        </div>
      </div>

      {/* 3 Simple Metric Blocks (No chart, no bento slop) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface rounded-xl border border-border p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
              Total Produk
            </span>
            <Package size={18} className="text-muted" aria-hidden="true" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-foreground">
            {stats.total}
          </p>
        </div>

        <div className="bg-surface rounded-xl border border-border p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-success uppercase tracking-wider">
              Produk Tersedia
            </span>
            <CheckCircle2 size={18} className="text-success" aria-hidden="true" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-success">
            {stats.available}
          </p>
        </div>

        <div className="bg-surface rounded-xl border border-border p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-warning uppercase tracking-wider">
              Sedang Habis
            </span>
            <XCircle size={18} className="text-warning" aria-hidden="true" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-warning">
            {stats.unavailable}
          </p>
        </div>
      </div>

      {/* Quick Recent Products List */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Daftar Produk Terkini
            </h2>
            <p className="text-xs text-muted">
              {products.length} produk terdaftar di database
            </p>
          </div>

          <Link
            href="/admin/produk"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <span>Semua Produk</span>
            <ArrowRight size={13} aria-hidden="true" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted">
            Belum ada produk di database.{" "}
            <Link
              href="/admin/produk/tambah"
              className="text-primary font-semibold underline"
            >
              Tambah produk pertama
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-background text-xs uppercase tracking-wider text-muted border-b border-border">
                <tr>
                  <th className="py-3 px-5">Nama Produk</th>
                  <th className="py-3 px-5">Kategori</th>
                  <th className="py-3 px-5">Harga</th>
                  <th className="py-3 px-5">Berat</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {products.slice(0, 5).map((product) => (
                  <tr key={product.id} className="hover:bg-background/50">
                    <td className="py-3.5 px-5 font-semibold text-foreground">
                      {product.name}
                    </td>
                    <td className="py-3.5 px-5 text-muted">
                      {product.category?.name || "-"}
                    </td>
                    <td className="py-3.5 px-5 font-medium text-foreground">
                      {formatRupiah(product.price)}
                    </td>
                    <td className="py-3.5 px-5 text-muted">
                      {product.weight_grams} g
                    </td>
                    <td className="py-3.5 px-5">
                      {product.is_available ? (
                        <span className="inline-flex items-center rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success">
                          Tersedia
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-warning/15 px-2.5 py-0.5 text-xs font-semibold text-warning">
                          Habis
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <Link
                        href={`/admin/produk/${product.id}/edit`}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
