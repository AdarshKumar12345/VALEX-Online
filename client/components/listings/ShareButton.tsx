"use client";

import React, { useState } from "react";
import { useToast } from "@/components/ui/Toast";

interface ShareButtonProps {
  title: string;
  className?: string;
}

export default function ShareButton({
  title,
  className = "",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const { success } = useToast();

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Check out this listing on MarketX: ${title}`,
          url,
        });
        return;
      } catch {
        // User cancelled or share failed, fallback to clipboard
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      success("Listing link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Share listing"
      className={`inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-4 py-2.5 text-xs font-semibold transition hover:border-black hover:bg-neutral-50 ${className}`}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
      <span>{copied ? "Link copied!" : "Share"}</span>
    </button>
  );
}
