import type { CartItem } from "@/types/product";

const CART_KEY = "cemong-cart";

// ============================================
// Cart Storage Operations (localStorage)
// ============================================

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
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

function writeCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("cemong-cart-updated"));
}

// ============================================
// External Store for useSyncExternalStore
// ============================================

let listeners: Array<() => void> = [];
let cartSnapshot: CartItem[] = [];

function getSnapshot(): CartItem[] {
  return cartSnapshot;
}

function getServerSnapshot(): CartItem[] {
  return [];
}

function subscribe(listener: () => void): () => void {
  listeners.push(listener);

  // Read initial cart on first subscription (client-side only)
  if (typeof window !== "undefined" && listeners.length === 1) {
    cartSnapshot = readCart();
  }

  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function notifyListeners() {
  cartSnapshot = readCart();
  listeners.forEach((listener) => listener());
}

// ============================================
// Cart Operations
// ============================================

export function addToCart(item: CartItem): void {
  const current = readCart();
  const existing = current.find((i) => i.productId === item.productId);

  let updated: CartItem[];
  if (existing) {
    updated = current.map((i) =>
      i.productId === item.productId
        ? { ...i, quantity: i.quantity + item.quantity }
        : i
    );
  } else {
    updated = [...current, item];
  }

  writeCart(updated);
  notifyListeners();
}

export function removeFromCart(productId: string): void {
  const updated = readCart().filter((i) => i.productId !== productId);
  writeCart(updated);
  notifyListeners();
}

export function updateQuantity(productId: string, quantity: number): void {
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  const updated = readCart().map((i) =>
    i.productId === productId ? { ...i, quantity } : i
  );
  writeCart(updated);
  notifyListeners();
}

export function clearCart(): void {
  writeCart([]);
  notifyListeners();
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// ============================================
// Export store hooks utilities
// ============================================

export const cartStore = {
  subscribe,
  getSnapshot,
  getServerSnapshot,
};
