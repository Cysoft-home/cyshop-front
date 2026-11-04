import type { Metadata } from "next";
import { CheckoutForm } from "@/components/CheckoutForm";
import { getStore, getZones } from "@/lib/api";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const [store, zones] = await Promise.all([getStore(), getZones()]);
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <CheckoutForm store={store} zones={zones} />
    </div>
  );
}