import Link from "next/link";
import { getStore } from "@/lib/api";
import { STORE_NAME } from "@/lib/config";
import type { StoreInfo } from "@/lib/types";
import { Wordmark } from "./SiteHeader";

export async function SiteFooter() {
  let store: StoreInfo | null = null;
  try {
    store = await getStore();
  } catch {
    // The footer still shows without shop details if the API is unreachable.
  }

  return (
    <footer className="mt-16 bg-ink text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div className="text-white">
          <Wordmark light />
          <p className="mt-3 max-w-xs text-sm text-white/70">
            Phone accessories, sold from our shop in Abuja and delivered across the city.
          </p>
        </div>

        <div>
          <h2 className="font-display text-base font-bold">Visit the shop</h2>
          <p className="mt-2 text-sm text-white/70">
            {store?.pickup_enabled
              ? store.pickup_address
              : "Pickup is not available right now. We deliver across Abuja."}
          </p>
        </div>

        <div>
          <h2 className="font-display text-base font-bold">Shop</h2>
          <ul className="mt-2 space-y-1 text-sm text-white/70">
            <li>
              <Link href="/shop" className="hover:text-white">
                All products
              </Link>
            </li>
            <li>
              <Link href="/shop?trending=true" className="hover:text-white">
                Trending
              </Link>
            </li>
            <li>
              <Link href="/shop?new=true" className="hover:text-white">
                New arrivals
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <p className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/60">
        {new Date().getFullYear()} {STORE_NAME}. Delivery within Abuja only.
      </p>
    </footer>
  );
}