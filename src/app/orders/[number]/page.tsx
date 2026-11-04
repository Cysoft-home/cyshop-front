import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrder } from "@/lib/api";
import { formatNaira } from "@/lib/format";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ number: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OrderPage({ params, searchParams }: Props) {
  const { number } = await params;
  const query = await searchParams;
  const token = Array.isArray(query.token) ? query.token[0] : query.token;
  if (!token) notFound();

  const order = await getOrder(number, token);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <p className="text-sm font-semibold text-muted">Order</p>
      <h1 className="text-3xl font-bold">{order.number}</h1>
      <p className="mt-2 inline-block rounded-full bg-paper px-3 py-1 text-sm font-semibold">
        {order.status_label}
      </p>

      {order.handover_code && (
        <section className="mt-6 rounded-lg bg-ink p-5 text-white">
          <p className="text-sm text-white/75">
            {order.fulfilment === "pickup" ? "Show this code at the shop" : "Give this code to the rider"}
          </p>
          <p className="mt-1 font-display text-4xl font-extrabold tracking-widest">
            {order.handover_code}
          </p>
        </section>
      )}

      <section className="mt-6 border-t border-line pt-6">
        <h2 className="font-display text-lg font-bold">Items</h2>
        <ul className="mt-3 divide-y divide-line">
          {order.items.map((item, index) => (
            <li key={index} className="flex justify-between gap-4 py-3 text-sm">
              <span>
                {item.product_name}
                {item.option ? ` (${item.option})` : ""} × {item.quantity}
              </span>
              <span className="font-semibold tabular-nums">{formatNaira(item.line_total)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt>Delivery</dt>
            <dd className="tabular-nums">
              {Number(order.delivery_fee) === 0 ? "Free" : formatNaira(order.delivery_fee)}
            </dd>
          </div>
          <div className="flex justify-between text-base font-bold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatNaira(order.total)}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 border-t border-line pt-6 text-sm">
        {order.fulfilment === "pickup" ? (
          <p>Collect at: {order.pickup_address}</p>
        ) : (
          <p>
            Deliver to: {order.address}
            {order.landmark ? `, near ${order.landmark}` : ""}
            {order.zone ? ` (${order.zone.name})` : ""}
          </p>
        )}
      </section>
    </div>
  );
}