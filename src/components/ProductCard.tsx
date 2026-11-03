import Image from "next/image";
import Link from "next/link";
import type { ProductSummary } from "@/lib/types";
import { PriceTag } from "./PriceTag";

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductSummary;
  priority?: boolean;
}) {
  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative aspect-square overflow-hidden rounded-lg border border-line bg-paper">
        {product.image ? (
          <Image
            src={product.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 46vw"
            className="object-cover"
            priority={priority}
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-muted">No photo</div>
        )}
        {product.is_new && (
          <span className="absolute left-2 top-2 rounded bg-ink px-2 py-1 text-xs font-semibold text-white">
            New
          </span>
        )}
        {!product.in_stock && (
          <span className="absolute inset-x-0 bottom-0 bg-white/90 px-2 py-1.5 text-center text-xs font-semibold text-bad">
            Out of stock
          </span>
        )}
      </div>

      <div className="mt-2.5 flex flex-1 flex-col gap-1">
        <h3 className="line-clamp-2 text-[0.95rem] font-semibold leading-snug group-hover:underline">
          <Link
            href={`/products/${product.slug}`}
            className="after:absolute after:inset-0 focus-visible:after:outline-3 focus-visible:after:outline-brand"
          >
            {product.name}
          </Link>
        </h3>
        {product.accessory_brand && (
          <p className="text-sm text-muted">{product.accessory_brand}</p>
        )}
        <div className="mt-auto pt-1.5">
          <PriceTag amount={product.price_from} />
        </div>
      </div>
    </article>
  );
}