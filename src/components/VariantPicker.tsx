"use client";

import { useState } from "react";
import type { ProductVariant } from "@/lib/types";
import { PriceTag } from "./PriceTag";

function stockNote(variant: ProductVariant): { text: string; className: string } {
  if (!variant.in_stock) return { text: "Out of stock", className: "text-bad" };
  if (variant.low_stock && variant.stock_left !== null) {
    return { text: `Only ${variant.stock_left} left`, className: "text-warn" };
  }
  return { text: "In stock", className: "text-ok" };
}

export function VariantPicker({ variants }: { variants: ProductVariant[] }) {
  const firstAvailable = variants.find((variant) => variant.in_stock) ?? variants[0];
  const [selectedId, setSelectedId] = useState(firstAvailable?.id);

  const selected = variants.find((variant) => variant.id === selectedId) ?? firstAvailable;
  if (!selected) return null;
  const note = stockNote(selected);

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
                    onChange={() => setSelectedId(variant.id)}
                    className="sr-only"
                  />
                  {variant.option}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <p className={`mt-4 text-sm font-semibold ${note.className}`} aria-live="polite">
        {note.text}
      </p>
    </div>
  );
}