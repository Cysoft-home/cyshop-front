"use client";

import Link from "next/link";
import { cartCount, useCart, useHydrated } from "@/lib/cart";

export function CartLink() {
  const cart = useCart();
  const hydrated = useHydrated();
  const count = hydrated ? cartCount(cart) : 0;

  return (
    <Link
      href="/cart"
      aria-label={count > 0 ? `Cart, ${count} ${count === 1 ? "item" : "items"}` : "Cart, empty"}
      className="relative flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold hover:bg-paper"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 7h12l-1 13H7L6 7Z" />
        <path d="M9 7a3 3 0 0 1 6 0" />
      </svg>
      <span className="hidden sm:inline">Cart</span>
      {count > 0 && (
        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-tag px-1 text-xs font-bold text-ink">
          {count}
        </span>
      )}
    </Link>
  );
}