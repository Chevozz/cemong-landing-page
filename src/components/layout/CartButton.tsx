"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { cartStore } from "@/lib/cart/store";

export default function CartButton() {
  const items = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot
  );

  const count = items.reduce((acc, item) => acc + item.quantity, 0);

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
