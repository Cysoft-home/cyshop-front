"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { removeFromCart, setQuantity, useCart, useHydrated } from "@/lib/cart";
import { formatNaira } from "@/lib/format";
import { priceCart } from "@/lib/shop-api";
import type { CartIssue, CartLine, CartQuote } from "@/lib/types";

export function CartView({ maxQty }: { maxQty: number }) {
  const cart = useCart();
  const hydrated = useHydrated();
  const [quote, setQuote] = useState<CartQuote | null>(null);
  const [failed, setFailed] = useState(false);
  const signature = JSON.stringify(cart);

  useEffect(() => {
    if (cart.length === 0) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const result = await priceCart(cart, "delivery", null, controller.signal);
        setQuote(result);
        setFailed(false);
      } catch {
        if (!controller.signal.aborted) setFailed(true);
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // `signature` stands for the cart contents.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  if (!hydrated) return <p className="mt-8 text-muted">Loading your cart...</p>;

  if (cart.length === 0) {
    return (
      <div className="mt-8 rounded-lg bg-paper p-8">
        <p className="font-display text-xl font-bold">Your cart is empty.</p>
        <p className="mt-1 text-muted">Find something that fits your phone.</p>
        <Link href="/shop" className="btn mt-4">
          Browse the shop
        </Link>
      </div>
    );
  }

  const hasIssues = (quote?.issues.length ?? 0) > 0;

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div>
        {failed && (
          <p role="alert" className="mb-4 rounded-lg bg-paper p-4 text-sm text-bad">
            We could not load the latest prices. Check your connection and refresh.
          </p>
        )}
        <ul className="divide-y divide-line border-y border-line">
          {cart.map((item) => {
            const line = quote?.lines.find((entry) => entry.variant_id === item.variant_id);
            const issue = quote?.issues.find((entry) => entry.variant_id === item.variant_id);
            return (
              <CartRow
                key={item.variant_id}
                variantId={item.variant_id}
                quantity={item.quantity}
                line={line}
                issue={issue}
                loaded={quote !== null}
                maxQty={maxQty}
              />
            );
          })}
        </ul>
      </div>

      <aside className="h-fit rounded-lg bg-paper p-5 lg:sticky lg:top-24">
        <h2 className="font-display text-lg font-bold">Summary</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt>Items</dt>
            <dd className="font-semibold tabular-nums">{quote ? formatNaira(quote.subtotal) : "..."}</dd>
          </div>
          <div className="flex justify-between text-muted">
            <dt>Delivery</dt>
            <dd>Added at checkout</dd>
          </div>
        </dl>
        {hasIssues && (
          <p className="mt-4 text-sm text-bad">Fix the items marked above to continue.</p>
        )}
        {hasIssues || !quote ? (
          <span className="btn mt-5 w-full opacity-50" aria-disabled="true">
            Go to checkout
          </span>
        ) : (
          <Link href="/checkout" className="btn mt-5 w-full">
            Go to checkout
          </Link>
        )}
        <Link href="/shop" className="mt-3 block text-center text-sm font-semibold underline">
          Keep shopping
        </Link>
      </aside>
    </div>
  );
}

function CartRow({
  variantId,
  quantity,
  line,
  issue,
  loaded,
  maxQty,
}: {
  variantId: number;
  quantity: number;
  line: CartLine | undefined;
  issue: CartIssue | undefined;
  loaded: boolean;
  maxQty: number;
}) {
  // An item the shop no longer sells: nothing to show but a way to remove it.
  if (!line && issue) {
    return (
      <li className="flex items-center justify-between gap-4 py-5">
        <p className="text-sm text-bad">{issue.message}</p>
        <button
          type="button"
          onClick={() => removeFromCart(variantId)}
          className="text-sm font-semibold underline"
        >
          Remove
        </button>
      </li>
    );
  }
  if (!line) {
    return <li className="py-5 text-sm text-muted">{loaded ? "Updating..." : "Loading..."}</li>;
  }

  const limit = Math.min(maxQty, issue?.available ?? maxQty);
  return (
    <li className="flex gap-4 py-5">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-line bg-paper">
        {line.image && (
          <Image src={line.image} alt="" fill sizes="96px" className="object-cover" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <Link href={`/products/${line.product_slug}`} className="font-semibold hover:underline">
          {line.product_name}
        </Link>
        {line.option && <p className="text-sm text-muted">{line.option}</p>}
        <p className="mt-1 text-sm tabular-nums">{formatNaira(line.unit_price)} each</p>

        {issue && (
          <p role="alert" className="mt-1 text-sm font-semibold text-bad">
            {issue.message}
            {issue.available !== undefined && issue.available > 0 && (
              <>
                {" "}
                <button
                  type="button"
                  onClick={() => setQuantity(variantId, issue.available as number)}
                  className="underline"
                >
                  Set to {issue.available}
                </button>
              </>
            )}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center rounded-lg border border-line" role="group" aria-label={`Quantity of ${line.product_name}`}>
            <button
              type="button"
              aria-label="One fewer"
              disabled={quantity <= 1}
              onClick={() => setQuantity(variantId, quantity - 1)}
              className="h-10 w-10 text-lg disabled:opacity-40"
            >
              &minus;
            </button>
            <span className="w-8 text-center text-sm font-semibold tabular-nums">{quantity}</span>
            <button
              type="button"
              aria-label="One more"
              disabled={quantity >= limit}
              onClick={() => setQuantity(variantId, quantity + 1)}
              className="h-10 w-10 text-lg disabled:opacity-40"
            >
              +
            </button>
          </div>
          <p className="font-semibold tabular-nums">{formatNaira(line.line_total)}</p>
        </div>
        <button
          type="button"
          onClick={() => removeFromCart(variantId)}
          className="mt-2 text-sm text-muted underline hover:text-ink"
        >
          Remove
        </button>
      </div>
    </li>
  );
}