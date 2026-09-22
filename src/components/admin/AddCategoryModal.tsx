"use client";

import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { createCategory } from "@/lib/supabase/admin-queries";
import { generateSlug } from "@/lib/utils/slug";
import { mapAdminError } from "@/lib/utils/error-messages";
import type { ProductCategory } from "@/types/database";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (category: ProductCategory) => void;
}

export default function AddCategoryModal({
  isOpen,
  onClose,
  onSuccess,
}: AddCategoryModalProps) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  function handleNameChange(value: string) {
    setName(value);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Nama kategori wajib diisi.");
      return;
    }

    setSaving(true);

    const slug = generateSlug(trimmedName);
    const { data, error: createError } = await createCategory(trimmedName, slug);

    setSaving(false);

    if (createError) {
      const mapped = mapAdminError(createError, "category");
      setError(`${mapped.title}. ${mapped.message}`);
      return;
    }

    if (data) {
      onSuccess(data);
      setName("");
      setError(null);
      onClose();
    }
  }

  function handleClose() {
    if (!saving) {
      setName("");
      setError(null);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-surface rounded-xl border border-border shadow-lg w-full max-w-sm mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-foreground">Tambah Kategori</h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="text-muted hover:text-foreground transition-colors disabled:opacity-50"
            aria-label="Tutup"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-error/30 bg-error/10 p-3 text-xs text-error">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="category-name"
              className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide"
            >
              Nama Kategori <span className="text-error">*</span>
            </label>
            <input
              id="category-name"
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Contoh: Kerupuk"
              disabled={saving}
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors disabled:opacity-50"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-background transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-50 min-h-9"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
