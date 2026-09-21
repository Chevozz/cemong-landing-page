"use client";

import { useSyncExternalStore } from "react";
import {
  cartStore,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  getCartTotal,
} from "@/lib/cart/store";

export function useCart() {
  const items = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot
  );

  return {
    items,
    total: getCartTotal(items),
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };
}
