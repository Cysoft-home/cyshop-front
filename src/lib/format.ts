const wholeNaira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const nairaAndKobo = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** "3500.00" becomes "₦3,500". Prices with kobo keep them: "₦3,500.50". */
export function formatNaira(amount: string | number): string {
  const value = typeof amount === "number" ? amount : Number(amount);
  if (!Number.isFinite(value)) return "";
  return Number.isInteger(value) ? wholeNaira.format(value) : nairaAndKobo.format(value);
}