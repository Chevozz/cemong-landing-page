"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Search, Edit2, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { getAllProductsAdmin, deleteProduct, updateProduct } from "@/lib/supabase/admin-queries";
import { formatRupiah } from "@/lib/formatters/currency";
import type { ProductWithRelations } from "@/types/database";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      try {
        const data = await getAllProductsAdmin();
        if (!cancelled) {
          setProducts(data);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleDelete(id: string, name: string) {
    const ok = window.confirm(`Yakin ingin menghapus produk "${name}"? Gambar dan data akan dihapus permanen.`);
    if (!ok) return;

    setDeletingId(id);
    const { error } = await deleteProduct(id);
    setDeletingId(null);

    if (error) {
      alert(`Gagal menghapus produk: ${error}`);
      return;
    }

    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleToggleAvailability(product: ProductWithRelations) {
    const nextStatus = !product.is_available;
    const { error } = await updateProduct(product.id, {
      is_available: nextStatus,
    });

    if (error) {
      alert(`Gagal mengubah status: ${error}`);
      return;
    }

    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, is_available: nextStatus } : p
      )
    );
  }

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Kelola Produk
          </h1>
          <p className="text-sm text-muted">
            Daftar seluruh camilan, harga, berat, foto, dan ketersediaan stok
          </p>
        </div>

        <Link
          href="/admin/produk/tambah"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors min-h-10 self-start sm:self-auto"
        >
          <Plus size={16} aria-hidden="true" />
          <span>Tambah Produk</span>
        </Link>
      </div>

      {/* Filter / Search bar */}
      <div className="flex items-center gap-3 bg-surface p-3 rounded-xl border border-border">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama produk atau kategori..."
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2 pl-9 text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
          />
          <Search
            size={16}
            className="absolute left-3 top-2.5 text-muted pointer-events-none"
          />
        </div>
        <span className="text-xs text-muted pr-2 hidden sm:inline">
          {filtered.length} dari {products.length} produk
        </span>
      </div>

      {/* Table Container */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-sm text-muted">
            Memuat data produk...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted">
            {search ? "Tidak ada produk yang cocok dengan pencarian." : "Belum ada produk."}{" "}
            <Link
              href="/admin/produk/tambah"
              className="text-primary font-semibold underline"
            >
              Tambah produk baru
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-background text-xs uppercase tracking-wider text-muted border-b border-border">
                <tr>
                  <th className="py-3 px-4 sm:px-6">Produk</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Harga</th>
                  <th className="py-3 px-4">Berat</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {filtered.map((product) => {
                  const primaryImg =
                    product.images?.find((img) => img.is_primary) ??
                    product.images?.[0];
                  const imgSrc =
                    primaryImg?.image_url || "/placeholder-photo.svg";

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-background/40 transition-colors"
                    >
                      {/* Product Image & Name */}
                      <td className="py-3 px-4 sm:px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-background border border-border/80">
                            <Image
                              src={imgSrc}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                          <div>
                            <span className="font-bold text-foreground block">
                              {product.name}
                            </span>
                            <span className="text-xs text-muted font-mono">
                              /{product.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-muted font-medium">
                        {product.category?.name || "-"}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-bold text-foreground">
                        {formatRupiah(product.price)}
                      </td>

                      {/* Weight */}
                      <td className="py-3 px-4 text-muted">
                        {product.weight_grams} g
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleAvailability(product)}
                          className="group inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer border border-transparent hover:border-border"
                          title="Klik untuk mengubah ketersediaan"
                        >
                          {product.is_available ? (
                            <>
                              <CheckCircle2
                                size={14}
                                className="text-success"
                                aria-hidden="true"
                              />
                              <span className="text-success group-hover:underline">
                                Tersedia
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle
                                size={14}
                                className="text-warning"
                                aria-hidden="true"
                              />
                              <span className="text-warning group-hover:underline">
                                Habis
                              </span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/admin/produk/${product.id}/edit`}
                            className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-2.5 text-xs font-medium text-foreground hover:bg-background transition-colors"
                          >
                            <Edit2 size={13} aria-hidden="true" />
                            <span>Edit</span>
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(product.id, product.name)
                            }
                            disabled={deletingId === product.id}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted hover:border-error/40 hover:bg-error/10 hover:text-error transition-colors disabled:opacity-50"
                            aria-label={`Hapus ${product.name}`}
                          >
                            <Trash2 size={14} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
