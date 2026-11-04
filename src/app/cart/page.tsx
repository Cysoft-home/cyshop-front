import type { Metadata } from "next";
import { CartView } from "@/components/CartView";
import { getStore } from "@/lib/api";

export const metadata: Metadata = {
  title: "Your cart",
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  const store = await getStore();
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold">Your cart</h1>
      <CartView maxQty={store.max_qty_per_line} />
    </div>
  );
}