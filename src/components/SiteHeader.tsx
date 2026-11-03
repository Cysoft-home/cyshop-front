import Link from "next/link";

export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <svg viewBox="0 0 64 64" width="28" height="28" aria-hidden="true">
        <rect width="64" height="64" rx="14" fill={light ? "#ffffff" : "#0e1330"} />
        <path d="M14 32 24 20h28v24H24z" fill="#ffd23f" />
        <circle cx="25" cy="32" r="3.2" fill={light ? "#ffffff" : "#0e1330"} />
      </svg>
      <span className="font-display text-lg font-extrabold tracking-tight">CYSOFTHOME</span>
    </span>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <Link href="/" aria-label="CYSOFTHOME home" className="mr-auto">
          <Wordmark />
        </Link>

        <nav aria-label="Main" className="order-2 flex items-center gap-1 sm:order-3">
          <Link
            href="/shop"
            className="rounded-md px-3 py-2 text-sm font-semibold hover:bg-paper"
          >
            Shop all
          </Link>
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