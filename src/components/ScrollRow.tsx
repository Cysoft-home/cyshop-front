"use client";

import { useRef } from "react";

// A row that swipes on phones and has arrow buttons on bigger screens.
// Children must be <li> elements.
export function ScrollRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const row = useRef<HTMLUListElement>(null);

  function scroll(direction: 1 | -1) {
    const element = row.current;
    if (!element) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollBy({
      left: direction * element.clientWidth * 0.85,
      behavior: reduce ? "auto" : "smooth",
    });
  }

  const arrow =
    "absolute top-1/3 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-white text-lg shadow-sm hover:bg-paper lg:grid";

  return (
    <div className="relative">
      <ul ref={row} aria-label={label} className="scroll-row">
        {children}
      </ul>
      <button
        type="button"
        aria-label={`${label}: scroll left`}
        onClick={() => scroll(-1)}
        className={`${arrow} -left-5`}
      >
        <span aria-hidden="true">&lsaquo;</span>
      </button>
      <button
        type="button"
        aria-label={`${label}: scroll right`}
        onClick={() => scroll(1)}
        className={`${arrow} -right-5`}
      >
        <span aria-hidden="true">&rsaquo;</span>
      </button>
    </div>
  );
}