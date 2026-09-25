"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag, Check } from "lucide-react";

interface Props {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    pcs: number;
    isAvailable: boolean;
  };
  imageUrl: string;
}

export default function AddToCartButton({ product, imageUrl }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product.isAvailable) {
    return (
      <button
        type="button"
        disabled
        className="w-full rounded-lg bg-border/60 px-6 py-3.5 text-base font-semibold text-muted cursor-not-allowed min-h-11"
        aria-disabled="true"
      >
        Sedang Habis
      </button>
    );
  }

  function handleAdd() {
    try {
      const raw = localStorage.getItem("cemong-cart");
      const cart = raw ? JSON.parse(raw) : [];
      const existing = cart.findIndex((item: { productId: string }) => item.productId === product.id);

      if (existing >= 0) {
        cart[existing].quantity += quantity;
      } else {
        cart.push({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          pcs: product.pcs,
          imageUrl,
          quantity,
        });
      }

      localStorage.setItem("cemong-cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cemong-cart-updated"));

      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }
  }

  return (
    <div className="space-y-4">
      {/* Quantity selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted">Jumlah</span>
        <div className="inline-flex items-center rounded-lg border border-border bg-surface p-1">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-background transition-colors"
            aria-label="Kurangi jumlah"
          >
            <Minus size={16} />
          </button>
          <span className="w-10 text-center font-sans text-base font-bold text-foreground">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-background transition-colors"
            aria-label="Tambah jumlah"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Add to cart */}
      <button
        type="button"
        onClick={handleAdd}
        className={`w-full inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-base font-bold transition-all min-h-11 active:scale-[0.99] ${
          added
            ? "bg-success text-white"
            : "bg-primary text-white hover:bg-primary/90 shadow-sm"
        }`}
      >
        {added ? (
          <>
            <Check size={18} aria-hidden="true" />
            <span>Berhasil Ditambahkan ke Keranjang</span>
          </>
        ) : (
          <>
            <ShoppingBag size={18} aria-hidden="true" />
            <span>Tambah ke Keranjang</span>
          </>
        )}
      </button>
    </div>
  );
}
