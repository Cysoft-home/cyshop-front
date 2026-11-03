"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage } from "@/lib/types";

export function ProductGallery({
  images,
  name,
}: {
  images: ProductImage[];
  name: string;
}) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="grid aspect-square place-items-center rounded-lg border border-line bg-paper text-muted">
        No photo yet
      </div>
    );
  }

  const current = images[index] ?? images[0];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-lg border border-line bg-paper">
        <Image
          src={current.url}
          alt={current.alt_text || name}
          fill
          priority
          sizes="(min-width: 1024px) 560px, 100vw"
          className="object-cover"
        />
      </div>
      {images.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto" aria-label="More photos">
          {images.map((image, position) => (
            <li key={`${image.url}-${position}`} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(position)}
                aria-label={`Show photo ${position + 1} of ${images.length}`}
                aria-current={position === index}
                className={`relative block h-16 w-16 overflow-hidden rounded-md border-2 bg-paper ${
                  position === index ? "border-ink" : "border-transparent hover:border-line"
                }`}
              >
                <Image src={image.url} alt="" fill sizes="64px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}