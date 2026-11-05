"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { clearCart, useCart, useHydrated } from "@/lib/cart";
import { formatNaira } from "@/lib/format";
import { saveOrderToken, startPayment } from "@/lib/orders";
import { CheckoutFailure, placeOrder, priceCart } from "@/lib/shop-api";
import type { CartQuote, DeliveryZone, StoreInfo } from "@/lib/types";

const input =
  "mt-1 w-full rounded-lg border border-line bg-white px-3.5 py-3 text-base placeholder:text-muted";

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-sm text-muted">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm font-semibold text-bad">
          {error}
        </p>
      )}
    </div>
  );
}

export function CheckoutForm({ store, zones }: { store: StoreInfo; zones: DeliveryZone[] }) {
  const router = useRouter();
  const cart = useCart();
  const hydrated = useHydrated();

  const [fulfilment, setFulfilment] = useState<"delivery" | "pickup">("delivery");
  const [zoneSlug, setZoneSlug] = useState("");
  const [payment, setPayment] = useState<"online" | "cod">("online");
  const [quote, setQuote] = useState<CartQuote | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // The same id is sent again if the customer taps Pay twice or retries after a bad
  // connection, so the shop makes one order, not two. A changed cart gets a new id.
  const requestId = useRef<{ cart: string; id: string } | null>(null);
  const signature = JSON.stringify(cart);
  const zone = zones.find((item) => item.slug === zoneSlug) ?? null;

  useEffect(() => {
    if (cart.length === 0) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const result = await priceCart(
          cart,
          fulfilment,
          fulfilment === "delivery" && zoneSlug ? zoneSlug : null,
          controller.signal,
        );
        setQuote(result);
      } catch {
        // The shop checks everything again when the order is placed.
      }
    }, 150);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, fulfilment, zoneSlug]);

  if (placed) {
    return <p className="mt-8 text-lg font-semibold">Order placed. Taking you to it...</p>;
  }
  if (!hydrated) return <p className="mt-8 text-muted">Loading...</p>;
  if (cart.length === 0) {
    return (
      <div className="mt-8 rounded-lg bg-paper p-8">
        <p className="font-display text-xl font-bold">Your cart is empty.</p>
        <Link href="/shop" className="btn mt-4">
          Browse the shop
        </Link>
      </div>
    );
  }

  // Cash is offered only when the shop says it is allowed for this cart and area.
  const codOk = quote?.cod_available === true && (fulfilment === "pickup" || zone !== null);
  const method = payment === "cod" && !codOk ? "online" : payment;
  let codReason = "";
  if (!codOk) {
    if (fulfilment === "delivery" && zone === null) codReason = "Choose your area to see if cash is available.";
    else if (fulfilment === "delivery" && zone && !zone.allows_cod) codReason = `Cash on delivery is not available in ${zone.name}.`;
    else if (quote) codReason = `Cash is available for orders up to ${formatNaira(quote.cod_max_total)}.`;
  }

  const deliveryFee = fulfilment === "pickup" ? 0 : zone ? Number(zone.fee) : null;
  const subtotal = quote ? Number(quote.subtotal) : null;
  const total = subtotal !== null && deliveryFee !== null ? subtotal + deliveryFee : null;
  const blocked = (quote?.issues.length ?? 0) > 0;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || blocked) return;
    const data = new FormData(event.currentTarget);
    const text = (name: string) => String(data.get(name) ?? "").trim();

    if (!requestId.current || requestId.current.cart !== signature) {
      requestId.current = { cart: signature, id: crypto.randomUUID() };
    }

    setSubmitting(true);
    setMessage("");
    setErrors({});
    try {
      const order = await placeOrder({
        request_id: requestId.current.id,
        items: cart,
        fulfilment,
        zone: fulfilment === "delivery" ? zoneSlug || null : null,
        customer_name: text("customer_name"),
        phone: text("phone"),
        email: text("email"),
        address: text("address"),
        landmark: text("landmark"),
        payment_method: method,
        note: text("note"),
      });
           saveOrderToken(order.number, order.tracking_token);
      setPlaced(true);
      clearCart();
      if (method === "online") {
        try {
          // On to Paystack to pay. If it cannot open, the order page has a Pay now button.
          window.location.assign(await startPayment(order.number, order.tracking_token));
          return;
        } catch {
          // fall through to the order page
        }
      }
      router.push(`/orders/${order.number}?token=${order.tracking_token}`);
    } catch (error) {
      if (error instanceof CheckoutFailure) {
        setMessage(error.message);
        setErrors(error.fields);
      } else {
        setMessage("Something went wrong. Please try again.");
      }
      setSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const choice = (active: boolean) =>
    `flex cursor-pointer items-start gap-3 rounded-lg border p-4 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-brand ${
      active ? "border-ink bg-paper" : "border-line"
    }`;

  return (
    <form onSubmit={submit} className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-8">
        {message && (
          <p role="alert" className="rounded-lg border border-bad bg-white p-4 font-semibold text-bad">
            {message}{" "}
            {message.includes("review your cart") && (
              <Link href="/cart" className="underline">
                Go to cart
              </Link>
            )}
          </p>
        )}

        <fieldset>
          <legend className="font-display text-xl font-bold">1. How do you want it?</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className={choice(fulfilment === "delivery")}>
              <input type="radio" name="fulfilment" checked={fulfilment === "delivery"} onChange={() => setFulfilment("delivery")} className="mt-1" />
              <span>
                <span className="block font-semibold">Delivery in Abuja</span>
                <span className="text-sm text-muted">A rider brings it to you.</span>
              </span>
            </label>
            {store.pickup_enabled && (
              <label className={choice(fulfilment === "pickup")}>
                <input type="radio" name="fulfilment" checked={fulfilment === "pickup"} onChange={() => setFulfilment("pickup")} className="mt-1" />
                <span>
                  <span className="block font-semibold">Pick up at the shop</span>
                  <span className="text-sm text-muted">Free. {store.pickup_address}</span>
                </span>
              </label>
            )}
          </div>
        </fieldset>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold">2. Your details</h2>
          <Field id="customer_name" label="Full name" error={errors.customer_name}>
            <input id="customer_name" name="customer_name" required autoComplete="name" maxLength={120} className={input} />
          </Field>
          <Field id="phone" label="Phone number" error={errors.phone} hint="We call or message this number about your order.">
            <input id="phone" name="phone" type="tel" inputMode="tel" required autoComplete="tel" placeholder="0803 123 4567" className={input} />
          </Field>
          <Field
            id="email"
            label={method === "online" ? "Email" : "Email (optional)"}
            error={errors.email}
            hint="Your receipt is sent here."
          >
            <input id="email" name="email" type="email" required={method === "online"} autoComplete="email" className={input} />
          </Field>

          {fulfilment === "delivery" && (
            <>
              <Field id="zone" label="Delivery area" error={errors.zone}>
                <select
                  id="zone"
                  name="zone"
                  required
                  value={zoneSlug}
                  onChange={(event) => setZoneSlug(event.target.value)}
                  className={input}
                >
                  <option value="">Choose your area</option>
                  {zones.map((item) => (
                    <option key={item.id} value={item.slug}>
                      {item.name} ({formatNaira(item.fee)})
                    </option>
                  ))}
                </select>
                {zone?.eta_note && <p className="mt-1 text-sm text-muted">{zone.eta_note}</p>}
              </Field>
              <Field id="address" label="Street address" error={errors.address}>
                <textarea id="address" name="address" required rows={2} maxLength={500} autoComplete="street-address" className={input} />
              </Field>
              <Field id="landmark" label="Landmark (optional)" error={errors.landmark} hint="Something the rider can look for, like a filling station or church.">
                <input id="landmark" name="landmark" maxLength={120} className={input} />
              </Field>
            </>
          )}

          <Field id="note" label="Note for the shop (optional)" error={errors.note}>
            <textarea id="note" name="note" rows={2} maxLength={500} className={input} />
          </Field>
        </section>

        <fieldset>
          <legend className="font-display text-xl font-bold">3. How do you want to pay?</legend>
          {errors.payment_method && (
            <p role="alert" className="mt-2 text-sm font-semibold text-bad">{errors.payment_method}</p>
          )}
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className={choice(method === "online")}>
              <input type="radio" name="payment" checked={method === "online"} onChange={() => setPayment("online")} className="mt-1" />
              <span>
                <span className="block font-semibold">Pay online</span>
                <span className="text-sm text-muted">Card, bank transfer or USSD, through Paystack.</span>
              </span>
            </label>
            <label className={`${choice(method === "cod")} ${codOk ? "" : "cursor-not-allowed opacity-60"}`}>
              <input type="radio" name="payment" checked={method === "cod"} disabled={!codOk} onChange={() => setPayment("cod")} className="mt-1" />
              <span>
                <span className="block font-semibold">
                  {fulfilment === "pickup" ? "Pay at the shop" : "Pay on delivery"}
                </span>
                <span className="text-sm text-muted">{codOk ? "Pay in cash when you receive it." : codReason}</span>
              </span>
            </label>
          </div>
        </fieldset>
      </div>

      <aside className="h-fit rounded-lg bg-paper p-5 lg:sticky lg:top-24">
        <h2 className="font-display text-lg font-bold">Your order</h2>
        <ul className="mt-3 space-y-3">
          {quote?.lines.map((line) => (
            <li key={line.variant_id} className="flex gap-3 text-sm">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-line bg-white">
                {line.image && <Image src={line.image} alt="" fill sizes="48px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-snug">{line.product_name}</p>
                <p className="text-muted">
                  {line.option ? `${line.option} · ` : ""}Qty {line.quantity}
                </p>
              </div>
              <p className="font-semibold tabular-nums">{formatNaira(line.line_total)}</p>
            </li>
          ))}
        </ul>
        {blocked && (
          <p role="alert" className="mt-3 text-sm font-semibold text-bad">
            Some items need attention.{" "}
            <Link href="/cart" className="underline">
              Review your cart
            </Link>
          </p>
        )}
        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt>Items</dt>
            <dd className="tabular-nums">{subtotal !== null ? formatNaira(subtotal) : "..."}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Delivery</dt>
            <dd className="tabular-nums">
              {deliveryFee === null ? "Choose an area" : deliveryFee === 0 ? "Free" : formatNaira(deliveryFee)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-line pt-2 text-base font-bold">
            <dt>Total</dt>
            <dd className="tabular-nums">{total !== null ? formatNaira(total) : "..."}</dd>
          </div>
        </dl>
        <button type="submit" disabled={submitting || blocked || !quote} className="btn mt-5 w-full">
          {submitting ? "Placing your order..." : method === "online" ? "Place order and pay" : "Place order"}
        </button>
        <p className="mt-3 text-center text-xs text-muted">
          <Link href="/cart" className="underline">
            Back to cart
          </Link>
        </p>
      </aside>
    </form>
  );
}