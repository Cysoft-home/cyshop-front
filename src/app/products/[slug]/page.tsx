import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/ProductGallery";
import { VariantPicker } from "@/components/VariantPicker";
import { getProduct, getStore } from "@/lib/api";
import { SITE_URL, STORE_NAME } from "@/lib/config";
import { shareImageUrl } from "@/lib/images";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

function summary(text: string): string {
  const plain = text.replace(/\s+/g, " ").trim();
  return plain.length > 155 ? `${plain.slice(0, 152).trimEnd()}...` : plain;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product not found" };

  const photo = product.images[0]?.url ?? product.image;
  const description =
    summary(product.description) ||
    `${product.name} from ${STORE_NAME}. Pick up in Abuja or get it delivered.`;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url: `/products/${product.slug}`,
      images: photo ? [{ url: shareImageUrl(photo), width: 1200, height: 630 }] : undefined,
    },
    twitter: { card: photo ? "summary_large_image" : "summary" },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, store] = await Promise.all([getProduct(slug), getStore()]);
  if (!product) notFound();

  const prices = product.variants.map((variant) => Number(variant.price));
  const photo = product.images[0]?.url ?? product.image;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: summary(product.description) || product.name,
    image: photo ? [photo] : undefined,
    brand: product.accessory_brand ? { "@type": "Brand", name: product.accessory_brand } : undefined,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "NGN",
      lowPrice: prices.length ? Math.min(...prices) : undefined,
      highPrice: prices.length ? Math.max(...prices) : undefined,
      offerCount: product.variants.length,
      availability: product.in_stock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/products/${product.slug}`,
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      <nav aria-label="Breadcrumb" className="mb-5 text-sm text-muted">
        <Link href="/shop" className="hover:underline">
          Shop
        </Link>{" "}
        /{" "}
        <Link href={`/shop?category=${product.category.slug}`} className="hover:underline">
          {product.category.name}
        </Link>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{product.name}</h1>
          {product.accessory_brand && (
            <p className="mt-1 text-muted">by {product.accessory_brand}</p>
          )}

          <div className="mt-6">
            <VariantPicker variants={product.variants} />
          </div>

          <section className="mt-8 border-t border-line pt-6">
            <h2 className="font-display text-lg font-bold">Fits</h2>
            {product.is_universal ? (
              <p className="mt-1 text-muted">Every phone.</p>
            ) : product.compatible_phones.length > 0 ? (
              <ul className="mt-2 flex flex-wrap gap-2">
                {product.compatible_phones.map((phone) => (
                  <li key={phone.id}>
                    <Link
                      href={`/shop?phone=${phone.slug}`}
                      className="block rounded-full border border-line px-3 py-1 text-sm hover:border-ink"
                    >
                      {phone.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-muted">Ask us if it fits your phone.</p>
            )}
          </section>

          {product.description && (
            <section className="mt-6 border-t border-line pt-6">
              <h2 className="font-display text-lg font-bold">About this item</h2>
              <div className="mt-2 max-w-prose space-y-3 leading-relaxed text-ink/85">
                {product.description
                  .split(/\n{2,}/)
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
              </div>
            </section>
          )}

          <section className="mt-6 border-t border-line pt-6 text-sm text-muted">
            <p>
              {store.pickup_enabled
                ? `Collect it at ${store.pickup_address}, or get it delivered in Abuja.`
                : "Delivered in Abuja. Choose your area at checkout to see the fee."}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}