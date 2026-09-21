"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function CartButton() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function readCart() {
      try {
        const raw = localStorage.getItem("cemong-cart");
        if (!raw) {
          setCount(0);
          return;
        }
        const items = JSON.parse(raw);
        if (Array.isArray(items)) {
          const total = items.reduce((acc: number, item: { quantity?: number }) => acc + (item.quantity || 0), 0);
          setCount(total);
        }
      } catch {
        setCount(0);
      }
    }

    readCart();
    window.addEventListener("storage", readCart);
    window.addEventListener("cemong-cart-updated", readCart);

    return () => {
      window.removeEventListener("storage", readCart);
      window.removeEventListener("cemong-cart-updated", readCart);
    };
  }, []);

  return (
    <Link
      href="/keranjang"
      className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors min-h-11 py-1"
      aria-label={`Keranjang belanja, ${count} produk`}
    >
      <ShoppingBag size={19} aria-hidden="true" />
      <span>Keranjang</span>
      {count > 0 && (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-white leading-none">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
