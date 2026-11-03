import Link from "next/link";
import Image from "next/image";
import { PhoneBrowser } from "@/components/PhoneBrowser";
import { PhoneFinder } from "@/components/PhoneFinder";
import { ProductCarousel } from "@/components/ProductCarousel";
import { getBrands, getHome, getStore } from "@/lib/api";

export const revalidate = 60;

export default async function HomePage() {
  const [home, brands, store] = await Promise.all([getHome(), getBrands(), getStore()]);
  const hasProducts = home.trending.length > 0 || home.new_arrivals.length > 0;

  return (
    <>
      <section className="bg-ink text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-2 md:items-center md:py-16">
          <div>
            <h1 className="max-w-md text-4xl font-extrabold leading-[1.05] sm:text-5xl">
              Accessories that fit your phone.
            </h1>
            <p className="mt-4 max-w-md text-lg text-white/75">
              Cases, chargers, screen guards and more.{" "}
              {store.pickup_enabled
                ? "Pick up at our Abuja shop or get it delivered."
                : "Delivered across Abuja."}
            </p>
          </div>
          <div className="md:justify-self-end md:w-full md:max-w-md">
            <PhoneFinder />
          </div>
        </div>
      </section>

      {hasProducts ? (
        <>
          <ProductCarousel
            title="Trending now"
            products={home.trending}
            viewAllHref="/shop?trending=true"
          />
          <ProductCarousel
            title="Just in"
            products={home.new_arrivals}
            viewAllHref="/shop?new=true"
          />
        </>
      ) : (
        <section className="mx-auto max-w-6xl px-4 pt-10">
          <p className="rounded-lg bg-paper p-6 text-muted">
            New products are being added. Check back soon.
          </p>
        </section>
      )}

      <section className="mt-12 bg-paper py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold">Shop by your phone</h2>
          <p className="mb-5 mt-1 text-muted">Choose your brand, then your model.</p>
          <PhoneBrowser brands={brands} />
        </div>
      </section>

      {home.categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-12">
          <h2 className="text-2xl font-bold">Shop by type</h2>
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {home.categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/shop?category=${category.slug}`}
                  className="group flex h-full items-center gap-3 rounded-lg border border-line p-3 hover:border-ink"
                >
                  {category.image && (
                    <Image
                      src={category.image}
                      alt=""
                      width={48}
                      height={48}
                      className="h-12 w-12 shrink-0 rounded-md object-cover"
                    />
                  )}
                  <span className="font-display text-lg font-bold leading-tight group-hover:underline">
                    {category.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mx-auto mt-14 max-w-6xl px-4">
        <dl className="grid gap-6 border-t border-line pt-8 sm:grid-cols-3">
          {store.pickup_enabled && (
            <div>
              <dt className="font-display text-lg font-bold">Pick up at the shop</dt>
              <dd className="mt-1 text-sm text-muted">{store.pickup_address}</dd>
            </div>
          )}
          <div>
            <dt className="font-display text-lg font-bold">Delivered in Abuja</dt>
            <dd className="mt-1 text-sm text-muted">
              Choose your area at checkout to see the delivery fee before you pay.
            </dd>
          </div>
          <div>
            <dt className="font-display text-lg font-bold">Pay your way</dt>
            <dd className="mt-1 text-sm text-muted">
              Pay online, or pay cash when your order arrives
              {store.pickup_enabled ? " or when you collect it" : ""}.
            </dd>
          </div>
        </dl>
      </section>
    </>
  );
}