// Where the shop's API lives, and where this storefront lives.
// Both are set in .env.local (on your computer) and in Netlify's environment variables.

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"
).replace(/\/$/, "");

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export const STORE_NAME = "CYSOFTHOME Technologies";