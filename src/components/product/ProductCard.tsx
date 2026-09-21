"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatRupiah } from "@/lib/formatters/currency";

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    weightGrams: number;
    imageUrl: string;
    isAvailable: boolean;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [added, setAdded] = useState(false);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!product.isAvailable) return;

    try {
      const raw = localStorage.getItem("cemong-cart");
      const cart = raw ? JSON.parse(raw) : [];
      const index = cart.findIndex((item: { productId: string }) => item.productId === product.id);

      if (index >= 0) {
        cart[index].quantity += 1;
      } else {
        cart.push({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          weightGrams: product.weightGrams,
          imageUrl: product.imageUrl,
          quantity: 1,
        });
      }

      localStorage.setItem("cemong-cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cemong-cart-updated"));

      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }
  }

  return (
    <article className="group flex flex-col bg-surface rounded-xl border border-border overflow-hidden transition-colors duration-200 hover:border-foreground/25">
      {/* Product Image: Dominant Visual with subtle scale 1.02 on hover */}
      <Link
        href={`/produk/${product.slug}`}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-[#F5EFE6]"
      >
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 33vw"
        />

        {!product.isAvailable && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
            <span className="rounded bg-warning px-3 py-1 text-xs font-semibold text-white">
              Sedang Habis
            </span>
          </div>
        )}
      </Link>

      {/* Product Content with Generous Spacing */}
      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
        <div>
          <Link href={`/produk/${product.slug}`} className="block">
            <h3 className="font-sans text-xl font-bold text-foreground hover:text-primary transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>
          <p className="mt-1.5 text-sm text-muted">{product.weightGrams} gram</p>
        </div>

        {/* Price & CTA row */}
        <div className="mt-6 pt-4 border-t border-border/80 flex items-center justify-between gap-4">
          <div>
            <span className="block text-[11px] font-medium text-muted uppercase tracking-wider">Harga</span>
            <span className="font-sans text-xl sm:text-2xl font-extrabold text-foreground">
              {formatRupiah(product.price)}
            </span>
          </div>

          {product.isAvailable ? (
            <button
              type="button"
              onClick={handleAdd}
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all min-h-11 active:scale-[0.98] ${
                added
                  ? "bg-success text-white"
                  : "bg-primary text-white hover:bg-primary/90"
              }`}
            >
              {added ? "Ditambahkan" : "+ Keranjang"}
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="rounded-lg bg-border px-4 py-2.5 text-sm font-semibold text-muted cursor-not-allowed min-h-11"
            >
              Habis
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
