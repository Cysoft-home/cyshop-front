"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

// Draws the QR code in the browser. The shop's scanner reads "ORDER:CODE" from it.
export function HandoverQr({ value }: { value: string }) {
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, {
      margin: 1,
      width: 240,
      errorCorrectionLevel: "M",
      color: { dark: "#0a1628", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) setImage(url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [value]);

  return (
    <div className="grid h-40 w-40 shrink-0 place-items-center rounded-lg bg-white p-2">
      {image ? (
        // A data: image needs no optimising, so a plain img is right here.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="QR code for this order" width={144} height={144} />
      ) : (
        <span className="text-xs text-muted">Loading code...</span>
      )}
    </div>
  );
}