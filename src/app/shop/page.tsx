import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pagination } from "@/components/Pagination";
import { ProductCard } from "@/components/ProductCard";
import { getCategories, getPhone, getProducts } from "@/lib/api";

type SearchParams = Record<string, string | string[] | undefined>;

const FILTER_KEYS = ["category", "phone", "search", "trending", "new", "ordering"] as const;

const SORTS = [
  { value: "", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "name", label: "Name" },
];

function first(value: string | string[] | undefined): string | undefined {
  const item = Array.isArray(value) ? value[0] : value;
  return item?.trim() || undefined;
}

function readFilters(params: SearchParams) {
  const filters: Record<string, string | undefined> = {};
  for (const key of FILTER_KEYS) filters[key] = first(params[key]);
  return filters;
}

function hrefFor(filters: Record<string, string | undefined>, changes: Record<string, string | undefined>) {
  const merged = { ...filters, ...changes };
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value) query.set(key, value);
  }
  const text = query.toString();
  return text ? `/shop?${text}` : "/shop";
}

async function headingFor(filters: Record<string, string | undefined>) {
  if (filters.search) return `Results for \u201c${filters.search}\u201d`;
  if (filters.phone) {
    const phone = await getPhone(filters.phone);
    return phone ? `Fits the ${phone.full_name}` : "All products";
  }
  if (filters.category) {
    const categories = await getCategories();
    return categories.find((item) => item.slug === filters.category)?.name ?? "All products";
  }
  if (filters.trending) return "Trending now";
  if (filters.new) return "Just in";
  return "All products";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const filters = readFilters(await searchParams);
  const title = await headingFor(filters);
  // Search and filter pages should not compete with the real category pages in Google.
  const filtered = Object.values(filters).some(Boolean);
  return {
    title,
    alternates: { canonical: "/shop" },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const filters = readFilters(params);
  const pageNumber = Math.max(1, Number.parseInt(first(params.page) ?? "1", 10) || 1);

  const [products, categories, heading] = await Promise.all([
    getProducts({ ...filters, page: pageNumber > 1 ? String(pageNumber) : undefined }),
    getCategories(),
    headingFor(filters),
  ]);
  if (products === null) notFound();

  const totalPages = Math.max(1, Math.ceil(products.count / 24));
  const hasFilters = Object.values(filters).some(Boolean);
  const chip = (active: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-sm font-semibold ${
      active ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"
    }`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold">{heading}</h1>
      <p className="mt-1 text-muted" aria-live="polite">
        {products.count === 1 ? "1 product" : `${products.count} products`}
        {hasFilters && (
          <>
            {" "}
            <Link href="/shop" className="font-semibold text-brand hover:underline">
              Clear filters
            </Link>
          </>
        )}
      </p>

      <div className="mt-6 space-y-4">
        <nav aria-label="Categories" className="flex flex-wrap gap-2">
          <Link
            href={hrefFor(filters, { category: undefined })}
            aria-current={!filters.category ? "true" : undefined}
            className={chip(!filters.category)}
          >
            All
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={hrefFor(filters, { category: category.slug })}
              aria-current={filters.category === category.slug ? "true" : undefined}
              className={chip(filters.category === category.slug)}
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <nav aria-label="Sort" className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted">Sort by</span>
          {SORTS.map((sort) => {
            const active = (filters.ordering ?? "") === sort.value;
            return (
              <Link
                key={sort.value || "newest"}
                href={hrefFor(filters, { ordering: sort.value || undefined })}
                aria-current={active ? "true" : undefined}
                className={`rounded-md px-2.5 py-1 font-semibold ${
                  active ? "bg-paper underline underline-offset-4" : "hover:bg-paper"
                }`}
              >
                {sort.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {products.results.length > 0 ? (
        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {products.results.map((product, index) => (
            <li key={product.id}>
              <ProductCard product={product} priority={index < 4} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-10 rounded-lg bg-paper p-8">
          <p className="font-display text-xl font-bold">Nothing matches that yet.</p>
          <p className="mt-1 text-muted">
            Try a different word, another category, or look at everything we have.
          </p>
          <Link
            href="/shop"
            className="mt-4 inline-block rounded-md bg-brand px-4 py-2.5 font-semibold text-white hover:bg-brand-dark"
          >
            See all products
          </Link>
        </div>
      )}

      <Pagination
        page={pageNumber}
        totalPages={totalPages}
        hrefFor={(target) => hrefFor(filters, { page: target > 1 ? String(target) : undefined })}
      />
    </div>
  );
}