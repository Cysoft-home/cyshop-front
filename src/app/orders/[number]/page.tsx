import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AutoRefresh } from "@/components/AutoRefresh";
import { HandoverQr } from "@/components/HandoverQr";
import { OrderProgress } from "@/components/OrderProgress";
import { PayNowButton } from "@/components/PayNowButton";
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

const FINAL = new Set(["delivered", "collected", "cancelled", "failed_delivery"]);

const when = new Intl.DateTimeFormat("en-NG", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Lagos",
});

const PAYMENT_NOTES: Record<string, { text: string; className: string }> = {
  failed: {
    text: "That payment did not go through. You can try again below.",
    className: "border-bad text-bad",
  },
  pending: {
    text: "We have not received your payment yet. If you were charged, this page updates by itself within a minute or two.",
    className: "border-warn text-warn",
  },
  review: {
    text: "We received your payment and need to check it. The shop will contact you soon.",
    className: "border-warn text-warn",
  },
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function OrderPage({ params, searchParams }: Props) {
  const { number } = await params;
  const query = await searchParams;
  const token = first(query.token);
  if (!token) notFound();

  const order = await getOrder(number, token);
  if (!order) notFound();

  const unpaidOnline = order.payment_method === "online" && order.status === "pending_payment";
  const note = PAYMENT_NOTES[first(query.payment) ?? ""];
  const cashDue =
    order.payment_method === "cod" && !FINAL.has(order.status)
      ? order.fulfilment === "pickup"
        ? `Pay ${formatNaira(order.total)} in cash when you collect it.`
        : `Pay ${formatNaira(order.total)} in cash when it arrives.`
      : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {!FINAL.has(order.status) && <AutoRefresh />}

      <p className="text-sm font-semibold text-muted">Order</p>
      <h1 className="text-3xl font-bold">{order.number}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold">
        <span className="rounded-full bg-paper px-3 py-1">{order.status_label}</span>
        {order.paid && <span className="rounded-full bg-ok px-3 py-1 text-white">Paid</span>}
      </div>

      {note && unpaidOnline && (
        <p role="status" className={`mt-5 rounded-lg border p-4 text-sm font-semibold ${note.className}`}>
          {note.text}
        </p>
      )}
      {note && !unpaidOnline && first(query.payment) === "review" && (
        <p role="status" className={`mt-5 rounded-lg border p-4 text-sm font-semibold ${note.className}`}>
          {note.text}
        </p>
      )}

      {unpaidOnline && (
        <section className="mt-6 rounded-lg bg-paper p-5">
          <h2 className="font-display text-lg font-bold">Complete your payment</h2>
          <p className="mt-1 text-sm text-muted">
            Your order is saved. Pay now to confirm it. Orders that stay unpaid are cancelled
            automatically.
          </p>
          <div className="mt-4">
            <PayNowButton number={order.number} token={token} label={`Pay ${formatNaira(order.total)} now`} />
          </div>
        </section>
      )}

      {cashDue && <p className="mt-6 rounded-lg bg-paper p-4 text-sm font-semibold">{cashDue}</p>}

      {order.handover_code && order.handover_qr && (
        <section className="mt-6 flex flex-col gap-5 rounded-lg bg-ink p-5 text-white sm:flex-row sm:items-center">
          <HandoverQr value={order.handover_qr} />
          <div>
            <p className="text-sm text-white/75">
              {order.fulfilment === "pickup"
                ? "Show this code or QR at the shop"
                : "Give this code to the rider, or let them scan the QR"}
            </p>
            <p className="mt-1 font-display text-4xl font-extrabold tracking-widest">
              {order.handover_code}
            </p>
            <p className="mt-2 text-sm text-white/70">
              Only share it when you are collecting your order.
            </p>
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="mb-4 font-display text-lg font-bold">Progress</h2>
        <OrderProgress order={order} />
      </section>

      {order.timeline.length > 0 && (
        <section className="mt-8 border-t border-line pt-6">
          <h2 className="font-display text-lg font-bold">Updates</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {[...order.timeline].reverse().map((event, index) => (
              <li key={`${event.to_status}-${index}`} className="flex justify-between gap-4">
                <span className="font-semibold">{event.status_label}</span>
                <span className="text-muted">{when.format(new Date(event.created_at))}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8 border-t border-line pt-6">
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

      <section className="mt-8 border-t border-line pt-6 text-sm">
        <h2 className="font-display text-lg font-bold">
          {order.fulfilment === "pickup" ? "Collect at" : "Delivery address"}
        </h2>
        {order.fulfilment === "pickup" ? (
          <p className="mt-2">{order.pickup_address}</p>
        ) : (
          <p className="mt-2">
            {order.address}
            {order.landmark ? `, near ${order.landmark}` : ""}
            {order.zone ? ` (${order.zone.name})` : ""}
          </p>
        )}
      </section>

      <p className="mt-8 rounded-lg bg-paper p-4 text-sm text-muted">
        Keep this page&rsquo;s link (bookmark it or send it to yourself). It is the only way to look
        up this order later.
      </p>
    </div>
  );
}