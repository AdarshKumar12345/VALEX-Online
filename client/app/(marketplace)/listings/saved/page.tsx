"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface SavedListing {
    id: string;
    title: string;
    price: number;
    location: string;
    condition: string;
    imageUrl?: string;
    sellerName?: string;
    savedAt: string;
}

export default function SavedListingsPage() {
    const [listings, setListings] = useState<
        SavedListing[]
    >([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [removingId, setRemovingId] =
        useState<string | null>(null);

    /* --------------------------------
       Fetch saved listings
    --------------------------------- */

    useEffect(() => {
        async function fetchSavedListings() {
            try {
                const apiUrl =
                    process.env.NEXT_PUBLIC_API_URL;

                if (!apiUrl) {
                    throw new Error(
                        "NEXT_PUBLIC_API_URL is not configured."
                    );
                }

                const response = await fetch(
                    `${apiUrl}/listings/saved`,
                    {
                        method: "GET",
                        credentials: "include",
                        cache: "no-store",
                    }
                );

                if (response.status === 401) {
                    window.location.href = "/login";
                    return;
                }

                const data = await response
                    .json()
                    .catch(() => ({}));

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "Unable to load saved listings."
                    );
                }

                setListings(
                    data.listings ?? data ?? []
                );
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Something went wrong."
                );
            } finally {
                setLoading(false);
            }
        }

        fetchSavedListings();
    }, []);

    /* --------------------------------
       Remove saved listing
    --------------------------------- */

    async function removeSavedListing(
        listingId: string
    ) {
        try {
            setRemovingId(listingId);

            const apiUrl =
                process.env.NEXT_PUBLIC_API_URL;

            if (!apiUrl) {
                throw new Error(
                    "NEXT_PUBLIC_API_URL is not configured."
                );
            }

            const response = await fetch(
                `${apiUrl}/listings/${encodeURIComponent(
                    listingId
                )}/save`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            if (!response.ok) {
                const data = await response
                    .json()
                    .catch(() => ({}));

                throw new Error(
                    data.message ||
                    "Unable to remove saved listing."
                );
            }

            setListings((current) =>
                current.filter(
                    (listing) =>
                        listing.id !== listingId
                )
            );
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to remove listing."
            );
        } finally {
            setRemovingId(null);
        }
    }

    return (
        <main className="min-h-screen bg-neutral-50">
            {/* Header */}
            <div className="border-b border-neutral-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <Link
                        href="/"
                        className="text-xs font-medium text-neutral-500 hover:text-black"
                    >
                        ← Marketplace
                    </Link>

                    <div className="mt-4 flex items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Saved listings
                            </h1>

                            <p className="mt-2 text-sm text-neutral-500">
                                Keep track of items you don't want
                                to lose.
                            </p>
                        </div>

                        {!loading && (
                            <span className="hidden text-xs text-neutral-400 sm:block">
                                {listings.length} saved
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Error */}
                {error && (
                    <div className="mb-6 flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm">
                        <span className="text-neutral-600">
                            {error}
                        </span>

                        <button
                            type="button"
                            onClick={() => setError("")}
                            className="text-xs font-semibold underline"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <LoadingGrid />
                ) : listings.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {listings.map((listing) => (
                            <SavedListingCard
                                key={listing.id}
                                listing={listing}
                                removing={
                                    removingId === listing.id
                                }
                                onRemove={() =>
                                    removeSavedListing(
                                        listing.id
                                    )
                                }
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

/* --------------------------------
   Card
--------------------------------- */

function SavedListingCard({
    listing,
    removing,
    onRemove,
}: {
    listing: SavedListing;
    removing: boolean;
    onRemove: () => void;
}) {
    return (
        <article className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-[0_12px_35px_rgba(0,0,0,0.06)]">
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                <Link href={`/listings/${listing.id}`}>
                    {listing.imageUrl ? (
                        <img
                            src={listing.imageUrl}
                            alt={listing.title}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-neutral-400">
                            <ImageIcon />
                        </div>
                    )}
                </Link>

                {/* Remove */}
                <button
                    type="button"
                    disabled={removing}
                    onClick={onRemove}
                    aria-label="Remove from saved listings"
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-black shadow-sm backdrop-blur transition hover:bg-black hover:text-white disabled:opacity-50"
                >
                    <HeartIcon filled />
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                <Link
                    href={`/listings/${listing.id}`}
                    className="line-clamp-2 text-sm font-semibold leading-5 hover:underline"
                >
                    {listing.title}
                </Link>

                <p className="mt-2 text-lg font-bold">
                    ₹
                    {listing.price.toLocaleString(
                        "en-IN"
                    )}
                </p>

                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-neutral-500">
                    <span className="truncate">
                        {listing.condition}
                    </span>

                    <span className="truncate">
                        {listing.location}
                    </span>
                </div>

                {listing.sellerName && (
                    <p className="mt-3 border-t border-neutral-100 pt-3 text-xs text-neutral-400">
                        Seller:{" "}
                        <span className="text-neutral-600">
                            {listing.sellerName}
                        </span>
                    </p>
                )}

                <Link
                    href={`/listings/${listing.id}`}
                    className="mt-4 flex h-10 items-center justify-center rounded-lg border border-neutral-200 text-xs font-semibold transition hover:border-black hover:bg-black hover:text-white"
                >
                    View listing
                </Link>
            </div>
        </article>
    );
}

/* --------------------------------
   Empty State
--------------------------------- */

function EmptyState() {
    return (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-20 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
                <HeartIcon />
            </div>

            <h2 className="mt-5 text-lg font-bold">
                No saved listings
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-500">
                When you find something interesting,
                save it here so you can easily find it
                later.
            </p>

            <Link
                href="/listings"
                className="mt-6 inline-flex rounded-lg bg-black px-5 py-3 text-xs font-semibold text-white transition hover:bg-neutral-800"
            >
                Browse listings
            </Link>
        </div>
    );
}

/* --------------------------------
   Loading
--------------------------------- */

function LoadingGrid() {
    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map(
                (_, index) => (
                    <div
                        key={index}
                        className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
                    >
                        <div className="aspect-[4/3] animate-pulse bg-neutral-200" />

                        <div className="space-y-3 p-4">
                            <div className="h-4 w-4/5 animate-pulse rounded bg-neutral-200" />

                            <div className="h-5 w-2/5 animate-pulse rounded bg-neutral-200" />

                            <div className="h-3 w-3/5 animate-pulse rounded bg-neutral-200" />

                            <div className="h-10 w-full animate-pulse rounded bg-neutral-200" />
                        </div>
                    </div>
                )
            )}
        </div>
    );
}

/* --------------------------------
   Icons
--------------------------------- */

function HeartIcon({
    filled = false,
}: {
    filled?: boolean;
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

function ImageIcon() {
    return (
        <svg
            width="28"
            height="28"
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
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
        </svg>
    );
}