import { formatNaira } from "@/lib/format";

export function PriceTag({
  amount,
  large = false,
}: {
  amount: string | number;
  large?: boolean;
}) {
  return (
    <span className={large ? "price-tag price-tag-lg" : "price-tag text-sm"}>
      {formatNaira(amount)}
    </span>
  );
}