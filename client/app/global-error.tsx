"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center p-6 text-center font-sans bg-white text-black">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-white text-2xl font-bold">
          !
        </div>
        <h1 className="mt-5 text-2xl font-bold">Application Error</h1>
        <p className="mt-2 text-xs text-neutral-500 max-w-sm">
          A critical system error occurred. We apologize for the inconvenience.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          Reload Page
        </button>
      </body>
    </html>
  );
}
