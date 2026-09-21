"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Upload,
  Trash2,
  Star,
  ArrowLeftSquare,
  ArrowRightSquare,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  getProductByIdAdmin,
  getCategoriesAdmin,
  updateProduct,
  uploadProductImage,
  setPrimaryImage,
  deleteProductImage,
  reorderProductImages,
} from "@/lib/supabase/admin-queries";
import type { ProductWithRelations, ProductCategory, ProductImage } from "@/types/database";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: Props) {
  const { id } = use(params);

  const [product, setProduct] = useState<ProductWithRelations | null>(null);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [weightGrams, setWeightGrams] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  // Images
  const [images, setImages] = useState<ProductImage[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      try {
        const [p, cats] = await Promise.all([
          getProductByIdAdmin(id),
          getCategoriesAdmin(),
        ]);

        if (!cancelled) {
          if (!p) {
            setLoading(false);
            return;
          }

          setProduct(p);
          setCategories(cats);

          setName(p.name);
          setSlug(p.slug);
          setCategoryId(p.category_id);
          setPrice(p.price);
          setWeightGrams(p.weight_grams);
          setDescription(p.description || "");
          setIsAvailable(p.is_available);
          setImages(p.images || []);

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
  }, [id]);

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    setStatusMessage(null);

    if (!name.trim() || !slug.trim() || !categoryId) {
      setStatusMessage({
        type: "error",
        text: "Nama, slug, dan kategori wajib diisi.",
      });
      return;
    }

    if (typeof price !== "number" || price < 0) {
      setStatusMessage({
        type: "error",
        text: "Harga harus berupa angka positif.",
      });
      return;
    }

    if (typeof weightGrams !== "number" || weightGrams <= 0) {
      setStatusMessage({
        type: "error",
        text: "Berat harus lebih dari 0 gram.",
      });
      return;
    }

    setSaving(true);

    const { error } = await updateProduct(id, {
      name: name.trim(),
      slug: slug.trim(),
      category_id: categoryId,
      price: Math.round(price),
      weight_grams: Math.round(weightGrams),
      description: description.trim() || null,
      is_available: isAvailable,
    });

    setSaving(false);

    if (error) {
      setStatusMessage({
        type: "error",
        text: `Gagal memperbarui produk: ${error}`,
      });
      return;
    }

    setStatusMessage({
      type: "success",
      text: "Perubahan produk berhasil disimpan!",
    });
  }

  async function handleUploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const isFirst = images.length === 0;
    const { data, error } = await uploadProductImage(id, file, isFirst);
    setUploading(false);

    if (error || !data) {
      alert(`Gagal mengunggah foto: ${error}`);
      return;
    }

    setImages((prev) => [...prev, data]);
    // Reset file input
    e.target.value = "";
  }

  async function handleSetPrimary(imageId: string) {
    const { error } = await setPrimaryImage(id, imageId);
    if (error) {
      alert(`Gagal menetapkan foto utama: ${error}`);
      return;
    }

    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        is_primary: img.id === imageId,
      }))
    );
  }

  async function handleDeleteImage(image: ProductImage) {
    const ok = window.confirm("Hapus foto ini dari galeri produk?");
    if (!ok) return;

    const { error } = await deleteProductImage(image.id, image.image_url);
    if (error) {
      alert(`Gagal menghapus foto: ${error}`);
      return;
    }

    const remaining = images.filter((img) => img.id !== image.id);
    // If the deleted image was primary and there are remaining images, set the first one as primary
    if (image.is_primary && remaining.length > 0) {
      await setPrimaryImage(id, remaining[0].id);
      remaining[0].is_primary = true;
    }
    setImages(remaining);
  }

  async function handleMoveOrder(index: number, direction: "left" | "right") {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const reordered = [...images];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    setImages(reordered);
    await reorderProductImages(reordered.map((img) => img.id));
  }

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-muted">
        Memuat data produk...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-muted mb-4">Produk tidak ditemukan.</p>
        <Link
          href="/admin/produk"
          className="text-primary font-semibold underline text-sm"
        >
          Kembali ke daftar produk
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/admin/produk"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-primary transition-colors mb-3"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Kembali ke daftar produk</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Edit Produk: {product.name}
            </h1>
            <p className="text-sm text-muted">
              Ubah rincian, harga, ketersediaan, dan galeri foto
            </p>
          </div>

          <Link
            href={`/produk/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-primary hover:underline self-start sm:self-auto"
          >
            Buka halaman publik &rarr;
          </Link>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`flex items-start gap-2.5 rounded-lg p-3.5 text-xs ${
            statusMessage.type === "success"
              ? "border border-success/30 bg-success/10 text-success"
              : "border border-error/30 bg-error/10 text-error"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* 1. Main Product Details Form */}
      <form
        onSubmit={handleSaveProduct}
        className="bg-surface rounded-xl border border-border p-6 sm:p-8 space-y-6 shadow-xs"
      >
        <h2 className="text-base font-bold text-foreground border-b border-border pb-3">
          Informasi Produk
        </h2>

        {/* Name & Slug */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="name"
              className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide"
            >
              Nama Produk <span className="text-error">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="slug"
              className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide"
            >
              Slug URL <span className="text-error">*</span>
            </label>
            <input
              id="slug"
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            />
          </div>
        </div>

        {/* Category & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="category"
              className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide"
            >
              Kategori <span className="text-error">*</span>
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide"
            >
              Ketersediaan Stok
            </label>
            <select
              id="status"
              value={isAvailable ? "true" : "false"}
              onChange={(e) => setIsAvailable(e.target.value === "true")}
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            >
              <option value="true">Tersedia (Dapat dibeli)</option>
              <option value="false">Sedang Habis (Nonaktifkan pembelian)</option>
            </select>
          </div>
        </div>

        {/* Price & Weight */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="price"
              className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide"
            >
              Harga (Rp) <span className="text-error">*</span>
            </label>
            <input
              id="price"
              type="number"
              min="0"
              step="500"
              required
              value={price}
              onChange={(e) =>
                setPrice(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="weight"
              className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide"
            >
              Berat Bersih (gram) <span className="text-error">*</span>
            </label>
            <input
              id="weight"
              type="number"
              min="1"
              required
              value={weightGrams}
              onChange={(e) =>
                setWeightGrams(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide"
          >
            Deskripsi Produk
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-50 min-h-11"
          >
            {saving ? "Menyimpan..." : "Simpan Rincian"}
          </button>
        </div>
      </form>

      {/* 2. Photo Gallery Management */}
      <div className="bg-surface rounded-xl border border-border p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Galeri Foto Produk
            </h2>
            <p className="text-xs text-muted">
              Foto dengan tanda bintang adalah foto utama yang ditampilkan di etalase
            </p>
          </div>

          <label className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-surface transition-colors cursor-pointer self-start sm:self-auto">
            <Upload size={14} aria-hidden="true" />
            <span>{uploading ? "Mengunggah..." : "Unggah Foto Baru"}</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={uploading}
              onChange={handleUploadImage}
              className="hidden"
            />
          </label>
        </div>

        {images.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted">
            Belum ada foto untuk produk ini. Silakan unggah foto di atas.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((img, idx) => (
              <div
                key={img.id}
                className={`relative flex flex-col overflow-hidden rounded-xl border ${
                  img.is_primary
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border"
                } bg-background`}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] w-full bg-surface">
                  <Image
                    src={img.image_url}
                    alt="Foto produk"
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                  {img.is_primary && (
                    <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-md bg-primary px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
                      <Star size={11} fill="currentColor" />
                      <span>Foto Utama</span>
                    </span>
                  )}
                </div>

                {/* Control toolbar */}
                <div className="flex items-center justify-between p-2.5 bg-surface border-t border-border text-xs">
                  {/* Reorder buttons */}
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveOrder(idx, "left")}
                      title="Pindah ke kiri"
                      className="p-1 rounded text-muted hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowLeftSquare size={16} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === images.length - 1}
                      onClick={() => handleMoveOrder(idx, "right")}
                      title="Pindah ke kanan"
                      className="p-1 rounded text-muted hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowRightSquare size={16} />
                    </button>
                  </div>

                  {/* Set Primary or Delete */}
                  <div className="inline-flex items-center gap-2">
                    {!img.is_primary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(img.id)}
                        className="text-[11px] font-semibold text-primary hover:underline"
                      >
                        Jadikan Utama
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img)}
                      className="p-1 rounded text-muted hover:text-error transition-colors"
                      title="Hapus foto"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
