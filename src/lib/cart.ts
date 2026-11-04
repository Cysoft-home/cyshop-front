import { useSyncExternalStore } from "react";

// The cart lives in the visitor's browser (localStorage). It only holds which option
// and how many. Prices always come from the shop's API, so they can never be out of date.

export type CartItem = { variant_id: number; quantity: number };

const KEY = "cyshop-cart-v1";
const EMPTY: CartItem[] = [];

let items: CartItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function read(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const data: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(data)) return EMPTY;
    const valid = data.filter(
      (item): item is CartItem =>
        typeof item === "object" &&
        item !== null &&
        Number.isInteger(item.variant_id) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0,
    );
    return valid.length ? valid : EMPTY;
  } catch {
    return EMPTY;
  }
}

function snapshot(): CartItem[] {
  if (!loaded) {
    items = read();
    loaded = true;
  }
  return items;
}

function commit(next: CartItem[]) {
  items = next.length ? next : EMPTY;
  loaded = true;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // Private browsing can refuse storage. The cart still works until the page closes.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keep several open tabs in step.
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) {
      loaded = false;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCart(): CartItem[] {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY);
}

/** False while the page is still loading in the browser, so we do not flash "cart is empty". */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function addToCart(variantId: number, quantity: number, maxPerLine: number) {
  const current = snapshot();
  const existing = current.find((item) => item.variant_id === variantId);
  const total = Math.min(maxPerLine, (existing?.quantity ?? 0) + quantity);
  commit(
    existing
      ? current.map((item) => (item.variant_id === variantId ? { ...item, quantity: total } : item))
      : [...current, { variant_id: variantId, quantity: total }],
  );
}

export function setQuantity(variantId: number, quantity: number) {
  if (quantity < 1) return removeFromCart(variantId);
  commit(
    snapshot().map((item) => (item.variant_id === variantId ? { ...item, quantity } : item)),
  );
}

export function removeFromCart(variantId: number) {
  commit(snapshot().filter((item) => item.variant_id !== variantId));
}

export function clearCart() {
  commit([]);
}

export function cartCount(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}