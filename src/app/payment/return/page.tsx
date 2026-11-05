import type { Metadata } from "next";
import { PaymentReturn } from "@/components/PaymentReturn";

export const metadata: Metadata = {
  title: "Checking your payment",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function PaymentReturnPage({ searchParams }: Props) {
  const query = await searchParams;
  const value = query.reference ?? query.trxref;
  const reference = (Array.isArray(value) ? value[0] : value) ?? "";

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-3xl font-bold">Payment</h1>
      <PaymentReturn reference={reference} />
    </div>
  );
}