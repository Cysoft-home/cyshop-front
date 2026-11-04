"use client";

import Link from "next/link";
import { useState } from "react";
import { addToCart } from "@/lib/cart";
import type { ProductVariant } from "@/lib/types";
import { PriceTag } from "./PriceTag";

function stockNote(variant: ProductVariant): { text: string; className: string } {
  if (!variant.in_stock) return { text: "Out of stock", className: "text-bad" };
  if (variant.low_stock && variant.stock_left !== null) {
    return { text: `Only ${variant.stock_left} left`, className: "text-warn" };
  }
  return { text: "In stock", className: "text-ok" };
}

export function VariantPicker({
  variants,
  maxQty,
}: {
  variants: ProductVariant[];
  maxQty: number;
}) {
  const firstAvailable = variants.find((variant) => variant.in_stock) ?? variants[0];
  const [selectedId, setSelectedId] = useState(firstAvailable?.id);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState<number | null>(null);

  const selected = variants.find((variant) => variant.id === selectedId) ?? firstAvailable;
  if (!selected) return null;
  const note = stockNote(selected);
  const limit = Math.max(1, Math.min(maxQty, selected.stock_left ?? maxQty));
  const shown = Math.min(quantity, limit);

  function choose(id: number) {
    setSelectedId(id);
    setAdded(null);
  }

  function add() {
    if (!selected) return;
    addToCart(selected.id, shown, maxQty);
    setAdded(selected.id);
  }

  return (
    <div>
      <PriceTag amount={selected.price} large />

      {variants.length > 1 && (
        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Choose an option</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {variants.map((variant) => {
              const active = variant.id === selected.id;
              return (
                <label
                  key={variant.id}
                  className={`cursor-pointer rounded-lg border px-4 py-2.5 text-sm font-semibold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-brand ${
                    active ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"
                  } ${variant.in_stock ? "" : "text-muted line-through"}`}
                >
                  <input
                    type="radio"
                    name="variant"
                    value={variant.id}
                    checked={active}
                    onChange={() => choose(variant.id)}
                    className="sr-only"
                  />
                  {variant.option}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <p className={`mt-4 text-sm font-semibold ${note.className}`}>{note.text}</p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-lg border border-line" role="group" aria-label="Quantity">
          <button
            type="button"
            aria-label="One fewer"
            disabled={shown <= 1}
            onClick={() => setQuantity(shown - 1)}
            className="h-12 w-11 text-xl disabled:opacity-40"
          >
            &minus;
          </button>
          <span className="w-8 text-center font-semibold tabular-nums" aria-live="polite">
            {shown}
          </span>
          <button
            type="button"
            aria-label="One more"
            disabled={shown >= limit}
            onClick={() => setQuantity(shown + 1)}
            className="h-12 w-11 text-xl disabled:opacity-40"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={add}
          disabled={!selected.in_stock}
          className="btn h-12 min-w-44 flex-1 sm:flex-none"
        >
          {selected.in_stock ? "Add to cart" : "Out of stock"}
        </button>
      </div>

      <p className="mt-3 min-h-6 text-sm" role="status">
        {added === selected.id && (
          <>
            <span className="font-semibold text-ok">Added to your cart.</span>{" "}
            <Link href="/cart" className="font-semibold underline">
              View cart
            </Link>
          </>
        )}
      </p>
    </div>
  );
}