"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-4xl font-extrabold">The shop could not load.</h1>
      <p className="mt-3 text-muted">
        This is usually a weak connection. Check your network and try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-md bg-brand px-5 py-3 font-semibold text-white hover:bg-brand-dark"
      >
        Try again
      </button>
    </div>
  );
}