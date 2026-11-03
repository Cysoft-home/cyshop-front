import Link from "next/link";
import type { ProductSummary } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { ScrollRow } from "./ScrollRow";

export function ProductCarousel({
  title,
  products,
  viewAllHref,
}: {
  title: string;
  products: ProductSummary[];
  viewAllHref: string;
}) {
  if (products.length === 0) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 pt-10">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Link href={viewAllHref} className="text-sm font-semibold text-brand hover:underline">
          View all
        </Link>
      </div>
      <ScrollRow label={title}>
        {products.map((product, index) => (
          <li key={product.id} className="w-[44vw] max-w-52 shrink-0 snap-start sm:w-48 lg:w-52">
            <ProductCard product={product} priority={index < 2} />
          </li>
        ))}
      </ScrollRow>
    </section>
  );
}