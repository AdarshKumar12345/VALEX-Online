"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("MarketX Application Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 text-black text-2xl font-bold">
        !
      </div>

      <h1 className="mt-5 text-2xl font-bold text-black">Something went wrong</h1>
      <p className="mt-2 max-w-md text-xs text-neutral-500 leading-relaxed">
        An unexpected error occurred. Please try again or return to the marketplace home.
      </p>

      <div className="mt-6 flex gap-3">
        <Button onClick={() => reset()} variant="primary">
          Try Again
        </Button>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 px-5 text-sm font-semibold text-black hover:border-black transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
