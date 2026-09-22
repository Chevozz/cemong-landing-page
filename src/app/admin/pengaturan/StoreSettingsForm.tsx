"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { saveStoreSettings } from "./actions";
import { isValidWhatsAppNumber } from "@/lib/whatsapp/normalize";
import { mapAdminError } from "@/lib/utils/error-messages";

interface Props {
  initial: {
    storeName: string;
    whatsappNumber: string;
    instagram: string;
    address: string;
  };
}

interface FormErrors {
  storeName?: string;
  whatsappNumber?: string;
  address?: string;
}

export default function StoreSettingsForm({ initial }: Props) {
  const [storeName, setStoreName] = useState(initial.storeName);
  const [whatsappNumber, setWhatsappNumber] = useState(initial.whatsappNumber);
  const [instagram, setInstagram] = useState(initial.instagram);
  const [address, setAddress] = useState(initial.address);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  function validate(): boolean {
    const next: FormErrors = {};
    if (!storeName.trim()) next.storeName = "Nama toko wajib diisi.";
    if (!whatsappNumber.trim()) {
      next.whatsappNumber = "Nomor WhatsApp wajib diisi.";
    } else if (!isValidWhatsAppNumber(whatsappNumber)) {
      next.whatsappNumber =
        "Nomor WhatsApp tidak valid. Contoh format: 081353908632 atau 6281353908632.";
    }
    if (!address.trim()) next.address = "Alamat toko wajib diisi.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatusMessage(null);
    if (!validate()) return;

    setSaving(true);

    // Normalize instagram: trim, ensure leading @ if non-empty
    const rawInstagram = instagram.trim();
    const normalizedInstagram = rawInstagram
      ? rawInstagram.startsWith("@")
        ? rawInstagram
        : `@${rawInstagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "")}`
      : "";

    try {
      const { error } = await saveStoreSettings({
        store_name: storeName,
        whatsapp_number: whatsappNumber,
        instagram: normalizedInstagram || null,
        address,
      });

      setSaving(false);

      if (error) {
        const mapped = mapAdminError(error, "store-settings");
        setStatusMessage({ type: "error", text: `${mapped.title}. ${mapped.message}` });
        return;
      }

      setStatusMessage({ type: "success", text: "Pengaturan berhasil disimpan." });
    } catch (err) {
      setSaving(false);
      const mapped = mapAdminError(err, "store-settings");
      setStatusMessage({ type: "error", text: `${mapped.title}. ${mapped.message}` });
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface rounded-xl border border-border p-6 sm:p-8 space-y-6 shadow-xs"
    >
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

      <div>
        <label
          htmlFor="store-name"
          className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide"
        >
          Nama Toko <span className="text-error">*</span>
        </label>
        <input
          id="store-name"
          type="text"
          required
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          disabled={saving}
          placeholder="Cem'ong"
          className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors disabled:opacity-50"
        />
        {errors.storeName && (
          <p className="mt-1.5 text-xs text-error" role="alert">{errors.storeName}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="whatsapp-number"
          className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide"
        >
          Nomor WhatsApp <span className="text-error">*</span>
        </label>
        <input
          id="whatsapp-number"
          type="tel"
          required
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          disabled={saving}
          placeholder="081353908632"
          className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors disabled:opacity-50"
        />
        {errors.whatsappNumber && (
          <p className="mt-1.5 text-xs text-error" role="alert">{errors.whatsappNumber}</p>
        )}
        <p className="mt-1 text-xs text-muted">
          Nomor akan otomatis dinormalisasi untuk link WhatsApp (contoh: 081353908632 menjadi 6281353908632).
        </p>
      </div>

      <div>
        <label
          htmlFor="instagram"
          className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide"
        >
          Instagram <span className="text-muted">(opsional)</span>
        </label>
        <input
          id="instagram"
          type="text"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          disabled={saving}
          placeholder="@cheltavii"
          className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors disabled:opacity-50"
        />
      </div>

      <div>
        <label
          htmlFor="address"
          className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide"
        >
          Alamat Toko <span className="text-error">*</span>
        </label>
        <textarea
          id="address"
          required
          rows={3}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={saving}
          placeholder="Alamat lengkap toko"
          className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-y disabled:opacity-50"
        />
        {errors.address && (
          <p className="mt-1.5 text-xs text-error" role="alert">{errors.address}</p>
        )}
      </div>

      <div className="flex items-center justify-end pt-3 border-t border-border">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-50 min-h-11"
        >
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  );
}
