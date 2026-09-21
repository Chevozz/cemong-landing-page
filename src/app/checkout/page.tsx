"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { formatRupiah } from "@/lib/formatters/currency";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { useCart } from "@/hooks/use-cart";

interface FormErrors {
  name?: string;
  address?: string;
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!name.trim()) newErrors.name = "Nama wajib diisi";
    if (!address.trim()) newErrors.address = "Alamat wajib diisi";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (items.length === 0) return;

    const message = buildWhatsAppMessage({
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

    const url = buildWhatsAppUrl(message);

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
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-whatsapp px-6 py-3 text-base font-medium text-white hover:bg-whatsapp/90 transition-colors min-h-11"
              >
                <MessageCircle size={18} aria-hidden="true" />
                Kirim Pesanan ke WhatsApp
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
