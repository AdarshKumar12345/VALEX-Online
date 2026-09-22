import React from "react";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-3 border-black border-t-transparent" />
      <p className="mt-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
        Loading MarketX...
      </p>
    </div>
  );
}
