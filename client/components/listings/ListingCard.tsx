"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export interface Listing {
    id: string;
    title: string;
    price: number;
    location: string;
    imageUrl?: string;
    category?: string;
    condition?: string;
    createdAt?: string;
    isSaved?: boolean;
}

interface ListingCardProps {
    listing: Listing;
}

export default function ListingCard({
    listing,
}: ListingCardProps) {
    const [saved, setSaved] = useState(
        listing.isSaved ?? false
    );

    const [saving, setSaving] = useState(false);

    async function handleSave(
        event: React.MouseEvent<HTMLButtonElement>
    ) {
        event.preventDefault();
        event.stopPropagation();

        if (saving) return;

        try {
            setSaving(true);

            const apiUrl =
                process.env.NEXT_PUBLIC_API_URL;

            if (!apiUrl) {
                throw new Error(
                    "NEXT_PUBLIC_API_URL is not configured."
                );
            }

            const response = await fetch(
                `${apiUrl}/listings/${encodeURIComponent(
                    listing.id
                )}/save`,
                {
                    method: saved ? "DELETE" : "POST",
                    credentials: "include",
                }
            );

            if (response.status === 401) {
                window.location.href = `/login?redirect=${encodeURIComponent(
                    window.location.pathname
                )}`;

                return;
            }

            if (!response.ok) {
                throw new Error(
                    "Unable to update saved listing."
                );
            }

            setSaved((current) => !current);
        } catch (error) {
            console.error(
                "Save listing error:",
                error
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <article className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white transition duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-[0_12px_35px_rgba(0,0,0,0.06)]">
            {/* --------------------------------
          Image
      --------------------------------- */}

            <Link
                href={`/listings/${listing.id}`}
                className="block"
            >
                <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                    {listing.imageUrl ? (
                        <Image
                            src={listing.imageUrl}
                            alt={listing.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover transition duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-neutral-400">
                            <ImagePlaceholder />
                        </div>
                    )}

                    {/* Save */}
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        aria-label={
                            saved
                                ? "Remove from saved listings"
                                : "Save listing"
                        }
                        aria-pressed={saved}
                        className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition ${saved
                                ? "border-black bg-black text-white"
                                : "border-white/70 bg-white/90 text-black hover:bg-black hover:text-white"
                            } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                        {saving ? (
                            <Spinner />
                        ) : (
                            <HeartIcon filled={saved} />
                        )}
                    </button>

                    {/* Condition */}
                    {listing.condition && (
                        <span className="absolute bottom-3 left-3 rounded-md bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-black shadow-sm backdrop-blur">
                            {listing.condition}
                        </span>
                    )}
                </div>
            </Link>

            {/* --------------------------------
          Content
      --------------------------------- */}

            <div className="p-4">
                <Link
                    href={`/listings/${listing.id}`}
                    className="block"
                >
                    <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-black transition group-hover:underline group-hover:underline-offset-2">
                        {listing.title}
                    </h3>

                    <p className="mt-3 text-lg font-bold tracking-tight">
                        ₹
                        {listing.price.toLocaleString(
                            "en-IN"
                        )}
                    </p>
                </Link>

                {/* Metadata */}
                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-neutral-500">
                    <span className="flex min-w-0 items-center gap-1.5 truncate">
                        <LocationIcon />
                        <span className="truncate">
                            {listing.location}
                        </span>
                    </span>

                    {listing.createdAt && (
                        <span className="shrink-0 text-neutral-400">
                            {formatDate(listing.createdAt)}
                        </span>
                    )}
                </div>

                {/* Category */}
                {listing.category && (
                    <div className="mt-3 border-t border-neutral-100 pt-3">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">
                            {listing.category}
                        </span>
                    </div>
                )}
            </div>
        </article>
    );
}

/* --------------------------------
   Helpers
--------------------------------- */

function formatDate(date: string) {
    const timestamp = new Date(date).getTime();

    if (Number.isNaN(timestamp)) {
        return "";
    }

    const diff =
        Date.now() - timestamp;

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) {
        return "now";
    }

    if (diff < hour) {
        return `${Math.floor(
            diff / minute
        )}m`;
    }

    if (diff < day) {
        return `${Math.floor(
            diff / hour
        )}h`;
    }

    if (diff < 7 * day) {
        return `${Math.floor(
            diff / day
        )}d`;
    }

    return new Intl.DateTimeFormat(
        "en-IN",
        {
            day: "numeric",
            month: "short",
        }
    ).format(new Date(date));
}

/* --------------------------------
   Icons
--------------------------------- */

function HeartIcon({
    filled,
}: {
    filled: boolean;
}) {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={filled ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
        >
            <path d="M20.8 8.8c0 5.2-8.8 10.4-8.8 10.4S3.2 14 3.2 8.8A4.8 4.8 0 0 1 12 6a4.8 4.8 0 0 1 8.8 2.8Z" />
        </svg>
    );
}

function LocationIcon() {
    return (
        <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="shrink-0"
            aria-hidden="true"
        >
            <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
            <circle cx="12" cy="10" r="2.5" />
        </svg>
    );
}

function ImagePlaceholder() {
    return (
        <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
        >
            <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
            />
            <circle
                cx="8.5"
                cy="8.5"
                r="1.5"
            />
            <path d="m21 15-5-5L5 21" />
        </svg>
    );
}

function Spinner() {
    return (
        <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
        />
    );
}