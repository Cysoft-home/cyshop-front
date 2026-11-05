import type { OrderDetail } from "@/lib/types";

type Step = { key: string; label: string };

function stepsFor(order: OrderDetail): Step[] {
  const middle: Step[] =
    order.fulfilment === "pickup"
      ? [
          { key: "ready_for_pickup", label: "Ready for pickup" },
          { key: "collected", label: "Collected" },
        ]
      : [
          { key: "out_for_delivery", label: "Out for delivery" },
          { key: "delivered", label: "Delivered" },
        ];
  const first: Step[] =
    order.payment_method === "online"
      ? [{ key: "pending_payment", label: "Payment" }]
      : [];
  return [
    ...first,
    { key: "awaiting_confirmation", label: "Order received" },
    { key: "confirmed", label: "Confirmed" },
    { key: "packed", label: "Packed" },
    ...middle,
  ];
}

export function OrderProgress({ order }: { order: OrderDetail }) {
  if (order.status === "cancelled") {
    return (
      <p className="rounded-lg border border-bad p-4 font-semibold text-bad">
        This order was cancelled.
      </p>
    );
  }
  if (order.status === "failed_delivery") {
    return (
      <p className="rounded-lg border border-warn p-4 font-semibold text-warn">
        We could not deliver this order. The shop will contact you.
      </p>
    );
  }

  const steps = stepsFor(order);
  const current = Math.max(0, steps.findIndex((step) => step.key === order.status));
  const finished = order.status === "delivered" || order.status === "collected";

  return (
    <ol className="space-y-0" aria-label="Order progress">
      {steps.map((step, index) => {
        const done = index < current || (finished && index === current);
        const active = index === current && !finished;
        return (
          <li key={step.key} className="relative flex gap-3 pb-5 last:pb-0" aria-current={active ? "step" : undefined}>
            {index < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={`absolute left-[0.7rem] top-6 h-[calc(100%-1.5rem)] w-0.5 ${done ? "bg-ink" : "bg-line"}`}
              />
            )}
            <span
              aria-hidden="true"
              className={`z-10 mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-xs font-bold ${
                done
                  ? "border-ink bg-ink text-white"
                  : active
                    ? "border-tag bg-tag text-ink"
                    : "border-line bg-white text-transparent"
              }`}
            >
              {done ? "✓" : "•"}
            </span>
            <span className={active ? "font-bold" : done ? "font-semibold" : "text-muted"}>
              {step.label}
              {active && <span className="sr-only"> (current step)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}