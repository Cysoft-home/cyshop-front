"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { API_URL } from "@/lib/config";
import type { Phone } from "@/lib/types";

// "Which phone do you have?" Type a few letters, pick your phone, see what fits it.
export function PhoneFinder() {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [found, setFound] = useState<{ query: string; phones: Phone[] } | null>(null);

  const text = query.trim();

  useEffect(() => {
    if (text.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/phones/?search=${encodeURIComponent(text)}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("search failed");
        const phones = (await response.json()) as Phone[];
        setFound({ query: text, phones: phones.slice(0, 8) });
      } catch {
        if (!controller.signal.aborted) setFound({ query: text, phones: [] });
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [text]);

  const showResults = text.length >= 2 && found !== null && found.query === text;

  return (
    <div>
      <form action="/shop" method="get">
        <label htmlFor={inputId} className="block text-sm font-semibold text-white">
          Which phone do you have?
        </label>
        <input
          id={inputId}
          name="search"
          type="search"
          autoComplete="off"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try iPhone 13 or Galaxy S24"
          className="mt-2 w-full rounded-lg border-0 bg-white px-4 py-3.5 text-base text-ink placeholder:text-muted"
        />
      </form>

      <div aria-live="polite" className="mt-2">
        {showResults && found.phones.length > 0 && (
          <ul className="overflow-hidden rounded-lg bg-white text-ink">
            {found.phones.map((phone) => (
              <li key={phone.id} className="border-b border-line last:border-b-0">
                <Link
                  href={`/shop?phone=${phone.slug}`}
                  className="block px-4 py-3 font-medium hover:bg-paper"
                >
                  {phone.full_name}
                </Link>
              </li>
            ))}
          </ul>
        )}
        {showResults && found.phones.length === 0 && (
          <p className="rounded-lg bg-white/10 px-4 py-3 text-sm text-white">
            No phone matches &ldquo;{text}&rdquo;. Press Enter to search products with those
            words instead.
          </p>
        )}
      </div>
    </div>
  );
}