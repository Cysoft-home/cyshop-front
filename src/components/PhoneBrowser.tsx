"use client";

import Link from "next/link";
import { useState } from "react";
import type { Brand } from "@/lib/types";

const FIRST_BATCH = 18;

// Pick a brand, then your phone. Each phone links to the accessories that fit it.
export function PhoneBrowser({ brands }: { brands: Brand[] }) {
  const withPhones = brands.filter((brand) => brand.phones.length > 0);
  const [slug, setSlug] = useState(withPhones[0]?.slug);
  const [showAll, setShowAll] = useState(false);

  const brand = withPhones.find((item) => item.slug === slug) ?? withPhones[0];
  if (!brand) return null;

  const phones = showAll ? brand.phones : brand.phones.slice(0, FIRST_BATCH);

  return (
    <div>
      <div role="group" aria-label="Phone brand" className="flex flex-wrap gap-2">
        {withPhones.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={item.slug === brand.slug}
            onClick={() => {
              setSlug(item.slug);
              setShowAll(false);
            }}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              item.slug === brand.slug
                ? "border-ink bg-ink text-white"
                : "border-line bg-white hover:border-ink"
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>

      <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {phones.map((phone) => (
          <li key={phone.id}>
            <Link
              href={`/shop?phone=${phone.slug}`}
              className="block rounded-lg border border-line bg-white px-3 py-3 text-sm font-medium hover:border-brand hover:text-brand"
            >
              {phone.name}
            </Link>
          </li>
        ))}
      </ul>

      {brand.phones.length > FIRST_BATCH && !showAll && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-4 text-sm font-semibold text-brand hover:underline"
        >
          Show all {brand.phones.length} {brand.name} phones
        </button>
      )}
    </div>
  );
}