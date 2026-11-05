"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getOrderToken, verifyPayment } from "@/lib/orders";

// Paystack sends the customer here after paying (or giving up). We ask the shop to check
// the payment, then show the order page with the result.
export function PaymentReturn({ reference }: { reference: string }) {
  const router = useRouter();
  const [problem, setProblem] = useState<"no-token" | "check-failed" | null>(null);
  const [attempt, setAttempt] = useState(0);

  // Payment references look like "CH-ABCD1234-1": the order number plus an attempt number.
  const number = reference.replace(/-\d+$/, "");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = getOrderToken(number);
      if (!reference || !token) {
        if (!cancelled) setProblem("no-token");
        return;
      }
      try {
        const result = await verifyPayment(reference, token);
        if (cancelled) return;
        let flag = "";
        if (result.payment_status === "failed") flag = "&payment=failed";
        else if (result.payment_status === "flagged") flag = "&payment=review";
        else if (!result.paid) flag = "&payment=pending";
        router.replace(`/orders/${result.order_number}?token=${token}${flag}`);
      } catch {
        if (!cancelled) setProblem("check-failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reference, number, router, attempt]);

  if (problem === "no-token") {
    return (
      <div className="mt-6 space-y-3">
        <p className="font-semibold">We could not find this order in this browser.</p>
        <p className="text-muted">
          If you paid, your order is safe and the shop will confirm it. Use the order link you
          opened before paying to see it, or contact the shop with your order number
          {number ? ` (${number})` : ""}.
        </p>
        <Link href="/shop" className="btn">
          Back to the shop
        </Link>
      </div>
    );
  }

  if (problem === "check-failed") {
    return (
      <div className="mt-6 space-y-3">
        <p role="alert" className="font-semibold text-bad">
          We could not check your payment right now.
        </p>
        <p className="text-muted">
          If you were charged, the order will confirm by itself. You can also try the check again.
        </p>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setProblem(null);
            setAttempt((value) => value + 1);
          }}
        >
          Check again
        </button>
      </div>
    );
  }

  return (
    <p role="status" className="mt-6 text-lg">
      Checking your payment. Please do not close this page...
    </p>
  );
}