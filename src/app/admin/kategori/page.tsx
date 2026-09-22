"use client";

import { useState, useEffect } from "react";
import { Edit2, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  getCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/supabase/admin-queries";
import { generateSlug } from "@/lib/utils/slug";
import { mapAdminError } from "@/lib/utils/error-messages";
import type { ProductCategory } from "@/types/database";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      try {
        const data = await getCategoriesAdmin();
        if (!cancelled) {
          setCategories(data);
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

  function handleNameChange(value: string) {
    setName(value);
    if (!editingId) {
      setSlug(generateSlug(value));
    }
  }

  function resetForm() {
    setName("");
    setSlug("");
    setEditingId(null);
    setStatusMessage(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatusMessage(null);

    if (!name.trim()) {
      setStatusMessage({ type: "error", text: "Nama kategori wajib diisi." });
      return;
    }

    if (!slug.trim()) {
      setStatusMessage({ type: "error", text: "Slug kategori wajib diisi." });
      return;
    }

    setSaving(true);

    if (editingId) {
      const { error } = await updateCategory(editingId, {
        name: name.trim(),
        slug: slug.trim(),
      });

      setSaving(false);

      if (error) {
        const mapped = mapAdminError(error, "category");
        setStatusMessage({ type: "error", text: `${mapped.title}. ${mapped.message}` });
        return;
      }

      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === editingId ? { ...cat, name: name.trim(), slug: slug.trim() } : cat
        )
      );

      setStatusMessage({ type: "success", text: "Kategori berhasil diperbarui!" });
      resetForm();
    } else {
      const { data, error } = await createCategory(name.trim(), slug.trim());

      setSaving(false);

      if (error) {
        const mapped = mapAdminError(error, "category");
        setStatusMessage({ type: "error", text: `${mapped.title}. ${mapped.message}` });
        return;
      }

      if (data) {
        setCategories((prev) => [...prev, data]);
      }

      setStatusMessage({ type: "success", text: "Kategori berhasil ditambahkan!" });
      resetForm();
    }
  }

  function handleEdit(category: ProductCategory) {
    setEditingId(category.id);
    setName(category.name);
    setSlug(category.slug);
    setStatusMessage(null);
  }

  async function handleDelete(id: string, name: string) {
    const ok = window.confirm(`Yakin ingin menghapus kategori "${name}"?`);
    if (!ok) return;

    const { error } = await deleteCategory(id);

    if (error) {
      const mapped = mapAdminError(error, "category");
      setStatusMessage({ type: "error", text: `${mapped.title}. ${mapped.message}` });
      return;
    }

    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    setStatusMessage({ type: "success", text: "Kategori berhasil dihapus." });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Kelola Kategori
        </h1>
        <p className="text-sm text-muted">
          Daftar kategori produk yang digunakan untuk mengorganisir katalog
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category List */}
        <div className="lg:col-span-2">
          <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-xs">
            {loading ? (
              <div className="py-16 text-center text-sm text-muted">
                Memuat data kategori...
              </div>
            ) : categories.length === 0 ? (
              <div className="py-16 text-center text-sm text-muted">
                Belum ada kategori. Tambah kategori pertama di form kanan.
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-background text-xs uppercase tracking-wider text-muted border-b border-border">
                  <tr>
                    <th className="py-3 px-5">Nama Kategori</th>
                    <th className="py-3 px-5">Slug</th>
                    <th className="py-3 px-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-background/40 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-foreground">
                        {category.name}
                      </td>
                      <td className="py-3.5 px-5 text-muted font-mono text-xs">
                        /{category.slug}
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(category)}
                            className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-2.5 text-xs font-medium text-foreground hover:bg-background transition-colors"
                          >
                            <Edit2 size={13} aria-hidden="true" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(category.id, category.name)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted hover:border-error/40 hover:bg-error/10 hover:text-error transition-colors"
                            aria-label={`Hapus ${category.name}`}
                          >
                            <Trash2 size={14} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Add/Edit Form */}
        <div className="lg:col-span-1">
          <div className="bg-surface rounded-xl border border-border p-6 shadow-xs">
            <h2 className="text-base font-bold text-foreground mb-4">
              {editingId ? "Edit Kategori" : "Tambah Kategori Baru"}
            </h2>

            {statusMessage && (
              <div
                className={`mb-4 flex items-start gap-2.5 rounded-lg p-3 text-xs ${
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide"
                >
                  Nama Kategori <span className="text-error">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Contoh: Keripik"
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
                  placeholder="keripik"
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground font-mono placeholder:text-muted/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                />
                <p className="text-xs text-muted mt-1">
                  Slug dibuat otomatis dari nama. Dapat diedit manual.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-background transition-colors"
                  >
                    Batal
                  </button>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-50 min-h-11"
                >
                  {saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Kategori"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
