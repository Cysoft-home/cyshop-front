import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-4xl font-extrabold">We could not find that page.</h1>
      <p className="mt-3 text-muted">
        The product may have sold out or moved. Look through what we have in the shop.
      </p>
      <Link
        href="/shop"
        className="mt-6 inline-block rounded-md bg-brand px-5 py-3 font-semibold text-white hover:bg-brand-dark"
      >
        See all products
      </Link>
    </div>
  );
}