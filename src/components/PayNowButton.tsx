"use client";

import { useState } from "react";
import { PaymentFailure, startPayment } from "@/lib/orders";

export function PayNowButton({
  number,
  token,
  label,
}: {
  number: string;
  token: string;
  label: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pay() {
    setBusy(true);
    setError("");
    try {
      window.location.assign(await startPayment(number, token));
    } catch (failure) {
      setError(failure instanceof PaymentFailure ? failure.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={pay} disabled={busy} className="btn w-full sm:w-auto">
        {busy ? "Opening payment..." : label}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm font-semibold text-bad">
          {error}
        </p>
      )}
    </div>
  );
}