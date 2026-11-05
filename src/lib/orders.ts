import { API_URL } from "./config";

// Browser-side helpers for paying and for remembering which orders belong to this visitor.

const KEY = "cyshop-orders-v1";

function readTokens(): Record<string, string> {
  try {
    const data: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? "{}");
    return data && typeof data === "object" ? (data as Record<string, string>) : {};
  } catch {
    return {};
  }
}

/** Remember an order's secret link code, so the payment-return page can find it. */
export function saveOrderToken(number: string, token: string) {
  try {
    const tokens = readTokens();
    tokens[number] = token;
    // Keep only the 10 most recent orders.
    const recent = Object.fromEntries(Object.entries(tokens).slice(-10));
    window.localStorage.setItem(KEY, JSON.stringify(recent));
  } catch {
    // Storage can be blocked. The order page link still works.
  }
}

export function getOrderToken(number: string): string | null {
  return readTokens()[number] ?? null;
}

export class PaymentFailure extends Error {}

/** Asks the shop to open a Paystack payment page for this order. Returns the page's address. */
export async function startPayment(number: string, token: string): Promise<string> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/payments/paystack/initialize/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ order_number: number, token }),
    });
  } catch {
    throw new PaymentFailure("We could not reach the shop. Check your connection and try again.");
  }
  if (response.ok) {
    const data = (await response.json()) as { authorization_url: string };
    return data.authorization_url;
  }
  if (response.status === 429) {
    throw new PaymentFailure("Too many attempts. Please wait a minute and try again.");
  }
  const body = (await response.json().catch(() => null)) as { detail?: string } | null;
  throw new PaymentFailure(body?.detail ?? "Payment could not be started. Please try again.");
}

export type PaymentResult = {
  payment_status: string;
  order_number: string;
  order_status: string;
  paid: boolean;
};

export async function verifyPayment(reference: string, token: string): Promise<PaymentResult> {
  const query = new URLSearchParams({ reference, token });
  const response = await fetch(`${API_URL}/api/payments/paystack/verify/?${query}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new PaymentFailure("Could not check the payment right now.");
  return (await response.json()) as PaymentResult;
}