import { API_URL } from "./config";
import type { CartItem } from "./cart";
import type { CartQuote, OrderCreated } from "./types";

// Calls the browser makes to the shop's API: pricing the cart and placing the order.

export async function priceCart(
  items: CartItem[],
  fulfilment: "delivery" | "pickup",
  zone: string | null,
  signal?: AbortSignal,
): Promise<CartQuote> {
  const response = await fetch(`${API_URL}/api/cart/price/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ items, fulfilment, zone }),
    signal,
  });
  if (!response.ok) throw new Error(`Pricing failed (${response.status})`);
  return (await response.json()) as CartQuote;
}

export type CheckoutPayload = {
  request_id: string;
  items: CartItem[];
  fulfilment: "delivery" | "pickup";
  zone: string | null;
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  landmark: string;
  payment_method: "online" | "cod";
  note: string;
};

/** Field name -> message, plus a general message for things that are not about one field. */
export class CheckoutFailure extends Error {
  fields: Record<string, string>;

  constructor(message: string, fields: Record<string, string> = {}) {
    super(message);
    this.fields = fields;
  }
}

export async function placeOrder(payload: CheckoutPayload): Promise<OrderCreated> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/checkout/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new CheckoutFailure("We could not reach the shop. Check your connection and try again.");
  }

  if (response.ok) return (await response.json()) as OrderCreated;

  if (response.status === 429) {
    throw new CheckoutFailure("Too many attempts. Please wait a minute and try again.");
  }

  const body: unknown = await response.json().catch(() => null);
  if (response.status === 400 && body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    const fields: Record<string, string> = {};
    let message = "Please check the highlighted details and try again.";

    if (Array.isArray(record.items)) {
      const first = record.items[0] as { message?: string; product_name?: string } | undefined;
      message = first?.message
        ? `${first.product_name ?? "An item"}: ${first.message} Please review your cart.`
        : "Some items in your cart changed. Please review your cart.";
    }
    for (const [key, value] of Object.entries(record)) {
      if (key === "items") continue;
      const text = Array.isArray(value) ? String(value[0]) : typeof value === "string" ? value : "";
      if (text) fields[key] = text;
    }
    if (typeof record.detail === "string") message = record.detail;
    throw new CheckoutFailure(message, fields);
  }

  throw new CheckoutFailure("Something went wrong on our side. Please try again in a moment.");
}