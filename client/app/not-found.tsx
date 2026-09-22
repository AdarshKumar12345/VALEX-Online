import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center p-6 text-center">
      <p className="text-7xl font-extrabold tracking-tight text-black">404</p>
      <h1 className="mt-4 text-2xl font-bold text-black">Page not found</h1>
      <p className="mt-2 max-w-sm text-xs text-neutral-500 leading-relaxed">
        The page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
      </p>

      <div className="mt-7 flex gap-3">
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-black px-6 text-sm font-semibold text-white hover:bg-neutral-800 transition"
        >
          Back to Marketplace
        </Link>
        <Link
          href="/listings"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 px-5 text-sm font-semibold text-black hover:border-black transition"
        >
          Browse Listings
        </Link>
      </div>
    </div>
  );
}
