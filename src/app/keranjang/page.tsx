"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { formatRupiah } from "@/lib/formatters/currency";
import type { CartItem } from "@/types/product";

const CART_KEY = "cemong-cart";

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Basic validation
    return parsed.filter(
      (item: CartItem) =>
        item.productId &&
        item.name &&
        typeof item.price === "number" &&
        typeof item.quantity === "number" &&
        item.quantity > 0
    );
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export default function KeranjangPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setMounted(true);
  }, []);

  const persist = useCallback((updated: CartItem[]) => {
    setItems(updated);
    saveCart(updated);
  }, []);

  function updateQuantity(productId: string, delta: number) {
    const updated = items
      .map((item) => {
        if (item.productId !== productId) return item;
        const newQty = item.quantity + delta;
        return newQty <= 0 ? null : { ...item, quantity: newQty };
      })
      .filter(Boolean) as CartItem[];
    persist(updated);
  }

  function removeItem(productId: string) {
    persist(items.filter((item) => item.productId !== productId));
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!mounted) {
    return (
      <>
        <Navbar />
        <main className="flex-1">
          <div className="mx-auto max-w-300 px-4 py-12 md:px-8">
            <h1 className="font-sans text-2xl font-bold text-foreground mb-8">Keranjang</h1>
            <div className="animate-pulse space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 bg-border/40 rounded-lg" />
              ))}
            </div>
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
          <h1 className="font-sans text-2xl font-bold text-foreground mb-8">Keranjang</h1>

          {items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag size={48} className="mx-auto text-border mb-4" aria-hidden="true" />
              <p className="text-base text-muted mb-6">
                Keranjang kamu masih kosong. Yuk, lihat camilan kita!
              </p>
              <Link
                href="/produk"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-white hover:bg-primary/90 transition-colors min-h-11"
              >
                Lihat Produk
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-4 bg-surface rounded-lg border border-border p-4"
                  >
                    {/* Image */}
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-background">
                      <Image
                        src={item.imageUrl || "/placeholder-photo.svg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex flex-1 flex-col justify-between min-w-0">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm text-muted">{formatRupiah(item.price)}</p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, -1)}
                            className="flex h-8 w-8 items-center justify-center rounded border border-border text-foreground hover:bg-background transition-colors"
                            aria-label="Kurangi jumlah"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, 1)}
                            className="flex h-8 w-8 items-center justify-center rounded border border-border text-foreground hover:bg-background transition-colors"
                            aria-label="Tambah jumlah"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Subtotal + delete */}
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-semibold text-foreground">
                            {formatRupiah(item.price * item.quantity)}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeItem(item.productId)}
                            className="flex h-8 w-8 items-center justify-center rounded text-muted hover:text-error transition-colors"
                            aria-label={`Hapus ${item.name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="lg:col-span-1">
                <div className="bg-surface rounded-lg border border-border p-6 sticky top-20">
                  <h2 className="font-sans text-lg font-semibold text-foreground mb-4">
                    Ringkasan
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
                  <div className="border-t border-border pt-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-base font-semibold text-foreground">Total</span>
                      <span className="text-base font-bold text-primary">{formatRupiah(total)}</span>
                    </div>
                  </div>
                  <Link
                    href="/checkout"
                    className="w-full inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-white hover:bg-primary/90 transition-colors min-h-11"
                  >
                    Checkout
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
