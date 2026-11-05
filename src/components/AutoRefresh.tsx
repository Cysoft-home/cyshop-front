"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Re-reads the order every little while, so a customer who leaves the page open
// sees "Confirmed", "Out for delivery" and so on without pressing refresh.
export function AutoRefresh({ seconds = 20 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, seconds * 1000);
    return () => clearInterval(timer);
  }, [router, seconds]);
  return null;
}