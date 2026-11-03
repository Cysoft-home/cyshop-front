import Link from "next/link";

export function Pagination({
  page,
  totalPages,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}) {
  if (totalPages <= 1) return null;
  const link = "rounded-md border border-line px-4 py-2 text-sm font-semibold hover:border-ink";
  return (
    <nav aria-label="Pages" className="mt-10 flex items-center justify-between gap-4">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" className={link}>
          Previous
        </Link>
      ) : (
        <span />
      )}
      <p className="text-sm text-muted">
        Page {page} of {totalPages}
      </p>
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} rel="next" className={link}>
          Next
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}