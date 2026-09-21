"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Upload, X, AlertCircle } from "lucide-react";
import {
  getCategoriesAdmin,
  createProduct,
  uploadProductImage,
} from "@/lib/supabase/admin-queries";
import type { ProductCategory } from "@/types/database";

export default function AddProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState<number | "">(25000);
  const [weightGrams, setWeightGrams] = useState<number | "">(100);
  const [description, setDescription] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  // Image Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const cats = await getCategoriesAdmin();
      setCategories(cats);
      if (cats.length > 0) {
        setCategoryId(cats[0].id);
      }
    }
    init();
  }, []);

  // Auto-generate slug when name changes
  function handleNameChange(val: string) {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    setSlug(generatedSlug);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 5 MB.");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function handleRemoveFile() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    // Validations
    if (!name.trim()) {
      setErrorMessage("Nama produk wajib diisi.");
      return;
    }
    if (!slug.trim()) {
      setErrorMessage("Slug produk wajib diisi.");
      return;
    }
    if (!categoryId) {
      setErrorMessage("Kategori produk wajib dipilih.");
      return;
    }
    if (typeof price !== "number" || price < 0) {
      setErrorMessage("Harga harus berupa angka positif.");
      return;
    }
    if (typeof weightGrams !== "number" || weightGrams <= 0) {
      setErrorMessage("Berat harus lebih dari 0 gram.");
      return;
    }

    setLoading(true);

    try {
      // 1. Insert product record
      const { data: newProduct, error: createError } = await createProduct({
        category_id: categoryId,
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        price: Math.round(price),
        weight_grams: Math.round(weightGrams),
        is_available: isAvailable,
      });

      if (createError || !newProduct) {
        setErrorMessage(`Gagal menyimpan produk: ${createError}`);
        setLoading(false);
        return;
      }

      // 2. Upload primary image if selected
      if (selectedFile) {
        const { error: uploadErr } = await uploadProductImage(
          newProduct.id,
          selectedFile,
          true
        );
        if (uploadErr) {
          alert(`Produk tersimpan, tetapi gagal mengunggah gambar: ${uploadErr}`);
        }
      }

      // 3. Redirect back to product list
      router.push("/admin/produk");
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan."
      );
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Back button & Title */}
      <div>
        <Link
          href="/admin/produk"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-primary transition-colors mb-3"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Kembali ke daftar produk</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Tambah Produk Baru
        </h1>
        <p className="text-sm text-muted">
          Isi rincian camilan baru untuk ditampilkan di katalog toko
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-start gap-2.5 rounded-lg border border-error/30 bg-error/10 p-3.5 text-xs text-error">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-surface rounded-xl border border-border p-6 sm:p-8 space-y-6 shadow-xs"
      >
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
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Contoh: Keripik Talas Barbeque"
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
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
              placeholder="keripik-talas-barbeque"
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground font-mono placeholder:text-muted/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            />
          </div>
        </div>

        {/* Category & Availability */}
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
              placeholder="25000"
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
              placeholder="100"
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
            Deskripsi Produk <span className="text-muted">(opsional)</span>
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan rasa, tekstur, atau catatan camilan secara singkat..."
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
          />
        </div>

        {/* Image Upload Area */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">
            Foto Produk Utama
          </label>

          {previewUrl ? (
            <div className="relative inline-block overflow-hidden rounded-xl border border-border bg-background">
              <div className="relative h-44 w-56">
                <Image
                  src={previewUrl}
                  alt="Preview gambar produk"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition-colors"
                title="Hapus foto"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-background/50 p-6 text-center cursor-pointer hover:border-primary hover:bg-background transition-colors">
              <Upload size={24} className="text-muted mb-2" />
              <span className="text-sm font-semibold text-foreground">
                Pilih foto produk
              </span>
              <span className="text-xs text-muted mt-1">
                Format PNG, JPG, atau WebP (maks. 5 MB)
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Link
            href="/admin/produk"
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-background transition-colors"
          >
            Batal
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-50 min-h-11"
          >
            {loading ? "Menyimpan..." : "Simpan Produk"}
          </button>
        </div>
      </form>
    </div>
  );
}
