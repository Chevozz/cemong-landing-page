"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { formatRupiah } from "@/lib/formatters/currency";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { useCart } from "@/hooks/use-cart";
import { useStore } from "@/components/layout/StoreProvider";
import { supabase } from "@/lib/supabase/client";

interface FormErrors {
  name?: string;
  address?: string;
}

interface CheckoutNotice {
  title: string;
  message: string;
  tone: "warning" | "error";
}

function NoticeBox({ notice }: { notice: CheckoutNotice }) {
  return (
    <div
      role="alert"
      className={`rounded-lg border p-4 text-sm ${
        notice.tone === "error"
          ? "border-error/30 bg-error/10 text-error"
          : "border-warning/30 bg-warning/10 text-warning"
      }`}
    >
      <p className="font-semibold">{notice.title}</p>
      <p className="mt-1 whitespace-pre-line leading-relaxed">{notice.message}</p>
    </div>
  );
}

export default function CheckoutPage() {
  const { items, total, clearCart, removeFromCart } = useCart();
  const store = useStore();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [checking, setChecking] = useState(false);
  const [notice, setNotice] = useState<CheckoutNotice | null>(null);

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!name.trim()) newErrors.name = "Nama wajib diisi";
    if (!address.trim()) newErrors.address = "Alamat wajib diisi";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (checking) return;
    setNotice(null);
    if (!validate()) return;
    if (items.length === 0) return;

    setChecking(true);

    // FR-06: recheck availability from the database (source of truth).
    // Public RLS only returns rows with is_available=true, so any cart
    // productId missing from the result is either unavailable or deleted.
    let orderableIds: string[] = [];
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, is_available")
        .in(
          "id",
          items.map((item) => item.productId)
        );

      if (error) throw new Error(error.message);

      orderableIds = (data ?? [])
        .filter((row) => row.is_available)
        .map((row) => row.id);
    } catch {
      setChecking(false);
      setNotice({
        title: "Gagal memeriksa ketersediaan",
        message: "Kami belum bisa memeriksa ketersediaan produk. Silakan coba lagi.",
        tone: "error",
      });
      return;
    }

    setChecking(false);

    const removedNames = items
      .filter((item) => !orderableIds.includes(item.productId))
      .map((item) => item.name);

    if (removedNames.length > 0) {
      // Remove unorderable items; keep the rest in the cart
      items
        .filter((item) => !orderableIds.includes(item.productId))
        .forEach((item) => removeFromCart(item.productId));

      setNotice({
        title: "Beberapa produk sudah habis",
        message: `Produk berikut sudah tidak tersedia:\n${removedNames
          .map((name) => `- ${name}`)
          .join(
            "\n"
          )}\n\nKeranjang kamu sudah diperbarui. Silakan periksa kembali sebelum melanjutkan.`,
        tone: "warning",
      });
      return;
    }

    const message = buildWhatsAppMessage({
      storeName: store.name,
      items: items.map((item) => ({
        name: item.name,
        price: item.price * item.quantity,
        quantity: item.quantity,
      })),
      total,
      name: name.trim(),
      address: address.trim(),
      note: note.trim() || undefined,
    });

    const url = buildWhatsAppUrl(store.whatsappNumber, message);

    // Clear cart after sending
    clearCart();

    window.open(url, "_blank");
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="flex-1">
          <div className="mx-auto max-w-300 px-4 py-12 md:px-8 text-center">
            <h1 className="font-sans text-2xl font-bold text-foreground mb-4">Checkout</h1>
            <p className="text-muted mb-6">Keranjang kamu kosong, tidak ada yang bisa di-checkout.</p>
            <Link
              href="/produk"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-white hover:bg-primary/90 transition-colors min-h-11"
            >
              Lihat Produk
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-300 px-4 py-12 md:px-8">
          <Link
            href="/keranjang"
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Kembali ke keranjang
          </Link>

          <h1 className="font-sans text-2xl font-bold text-foreground mb-8">Checkout</h1>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
              {notice && (
                <div className="mb-1">
                  <NoticeBox notice={notice} />
                </div>
              )}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                  Nama pemesan <span className="text-error">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-base text-foreground placeholder:text-muted/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  placeholder="Nama lengkap"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-error" role="alert">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-foreground mb-1.5">
                  Alamat pengiriman <span className="text-error">*</span>
                </label>
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-base text-foreground placeholder:text-muted/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-y"
                  placeholder="Alamat lengkap untuk pengiriman"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-error" role="alert">{errors.address}</p>
                )}
              </div>

              <div>
                <label htmlFor="note" className="block text-sm font-medium text-foreground mb-1.5">
                  Catatan <span className="text-muted">(opsional)</span>
                </label>
                <textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-base text-foreground placeholder:text-muted/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-y"
                  placeholder="Catatan tambahan, misal: jangan terlalu pedas"
                />
              </div>

              <button
                type="submit"
                disabled={checking}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-whatsapp px-6 py-3 text-base font-medium text-white hover:bg-whatsapp/90 transition-colors min-h-11 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <MessageCircle size={18} aria-hidden="true" />
                {checking ? "Memeriksa ketersediaan..." : "Kirim Pesanan ke WhatsApp"}
              </button>
            </form>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-surface rounded-lg border border-border p-6 sticky top-20">
                <h2 className="font-sans text-lg font-semibold text-foreground mb-4">
                  Pesanan Kamu
                </h2>
                <div className="space-y-2 mb-6">
                  {items.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span className="text-muted truncate mr-2">
                        {item.name} x{item.quantity}
                      </span>
                      <span className="text-foreground font-medium flex-shrink-0">
                        {formatRupiah(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-foreground">Total</span>
                    <span className="text-base font-bold text-primary">{formatRupiah(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
