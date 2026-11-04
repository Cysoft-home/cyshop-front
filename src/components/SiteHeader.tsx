import Link from "next/link";
import { CartLink } from "./CartLink";
import { Logo } from "./Logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
        <Link href="/" aria-label="CyShop home" className="mr-auto">
          <Logo compactOnPhone />
        </Link>

        <nav aria-label="Main" className="order-2 flex items-center gap-1 sm:order-3">
          <Link
            href="/shop"
            className="rounded-md px-3 py-2 text-sm font-semibold hover:bg-paper"
          >
            Shop all
          </Link>
          <CartLink />
        </nav>

        <form
          action="/shop"
          method="get"
          role="search"
          className="order-3 w-full sm:order-2 sm:w-auto sm:flex-1 sm:max-w-md"
        >
          <label htmlFor="header-search" className="sr-only">
            Search products
          </label>
          <input
            id="header-search"
            name="search"
            type="search"
            placeholder="Search cases, chargers, cables"
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm placeholder:text-muted focus:bg-white"
          />
        </form>
      </div>
    </header>
  );
}