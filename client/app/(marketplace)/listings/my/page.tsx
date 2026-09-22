"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface MyListing {
  id: string;
  title: string;
  price: number;
  location: string;
  condition: string;
  status: "active" | "sold" | "draft" | "expired";
  imageUrl?: string;
  views: number;
  favorites: number;
  createdAt: string;
}

type Filter = "all" | MyListing["status"];

export default function MyListingsPage() {
  const [listings, setListings] = useState<
    MyListing[]
  >([]);

  const [filter, setFilter] =
    useState<Filter>("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  /* --------------------------------
     Fetch listings
  --------------------------------- */

  useEffect(() => {
    async function fetchListings() {
      try {
        setLoading(true);

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
          throw new Error(
            "NEXT_PUBLIC_API_URL is not configured."
          );
        }

        const response = await fetch(
          `${apiUrl}/listings/me`,
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
              "Unable to load your listings."
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

    fetchListings();
  }, []);

  /* --------------------------------
     Filter
  --------------------------------- */

  const filteredListings = useMemo(() => {
    if (filter === "all") {
      return listings;
    }

    return listings.filter(
      (listing) => listing.status === filter
    );
  }, [listings, filter]);

  /* --------------------------------
     Delete listing
  --------------------------------- */

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this listing?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error(
          "NEXT_PUBLIC_API_URL is not configured."
        );
      }

      const response = await fetch(
        `${apiUrl}/listings/${encodeURIComponent(
          id
        )}`,
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
            "Unable to delete listing."
        );
      }

      setListings((current) =>
        current.filter(
          (listing) => listing.id !== id
        )
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete listing."
      );
    } finally {
      setDeletingId(null);
    }
  }

  /* --------------------------------
     Statistics
  --------------------------------- */

  const stats = {
    total: listings.length,
    active: listings.filter(
      (item) => item.status === "active"
    ).length,
    sold: listings.filter(
      (item) => item.status === "sold"
    ).length,
    views: listings.reduce(
      (sum, item) => sum + item.views,
      0
    ),
  };

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <Link
                href="/"
                className="text-xs font-medium text-neutral-500 hover:text-black"
              >
                ← Marketplace
              </Link>

              <h1 className="mt-3 text-3xl font-bold tracking-tight">
                My listings
              </h1>

              <p className="mt-2 text-sm text-neutral-500">
                Manage and track everything you're
                selling.
              </p>
            </div>

            <Link
              href="/sell"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-black px-5 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              + Sell something
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Total listings"
            value={stats.total}
          />

          <StatCard
            label="Active"
            value={stats.active}
          />

          <StatCard
            label="Sold"
            value={stats.sold}
          />

          <StatCard
            label="Total views"
            value={stats.views}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700">
            <div className="flex items-center justify-between gap-4">
              <span>{error}</span>

              <button
                type="button"
                onClick={() => setError("")}
                className="text-xs font-semibold underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mt-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex gap-1 overflow-x-auto rounded-lg border border-neutral-200 bg-white p-1">
            <FilterButton
              active={filter === "all"}
              onClick={() => setFilter("all")}
            >
              All
              <FilterCount
                count={listings.length}
              />
            </FilterButton>

            <FilterButton
              active={filter === "active"}
              onClick={() => setFilter("active")}
            >
              Active
              <FilterCount
                count={stats.active}
              />
            </FilterButton>

            <FilterButton
              active={filter === "sold"}
              onClick={() => setFilter("sold")}
            >
              Sold
              <FilterCount
                count={stats.sold}
              />
            </FilterButton>

            <FilterButton
              active={filter === "draft"}
              onClick={() => setFilter("draft")}
            >
              Drafts
              <FilterCount
                count={
                  listings.filter(
                    (item) =>
                      item.status === "draft"
                  ).length
                }
              />
            </FilterButton>
          </div>

          <p className="text-xs text-neutral-400">
            {filteredListings.length} listing
            {filteredListings.length !== 1
              ? "s"
              : ""}
          </p>
        </div>

        {/* Listings */}
        <div className="mt-5">
          {loading ? (
            <LoadingState />
          ) : filteredListings.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              {/* Desktop header */}
              <div className="hidden grid-cols-[minmax(280px,1fr)_120px_100px_120px_150px] gap-4 border-b border-neutral-200 bg-neutral-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-400 md:grid">
                <span>Listing</span>
                <span>Price</span>
                <span>Status</span>
                <span>Performance</span>
                <span className="text-right">
                  Actions
                </span>
              </div>

              <div className="divide-y divide-neutral-200">
                {filteredListings.map(
                  (listing) => (
                    <ListingRow
                      key={listing.id}
                      listing={listing}
                      deleting={
                        deletingId ===
                        listing.id
                      }
                      onDelete={() =>
                        handleDelete(
                          listing.id
                        )
                      }
                    />
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

/* --------------------------------
   Listing Row
--------------------------------- */

function ListingRow({
  listing,
  deleting,
  onDelete,
}: {
  listing: MyListing;
  deleting: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="group px-4 py-4 transition hover:bg-neutral-50 sm:px-5">
      <div className="grid gap-4 md:grid-cols-[minmax(280px,1fr)_120px_100px_120px_150px] md:items-center">
        {/* Listing */}
        <div className="flex min-w-0 gap-4">
          <Link
            href={`/listings/${listing.id}`}
            className="h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100"
          >
            {listing.imageUrl ? (
              <img
                src={listing.imageUrl}
                alt={listing.title}
                className="h-full w-full object-cover transition group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-neutral-400">
                <ImageIcon />
              </div>
            )}
          </Link>

          <div className="min-w-0">
            <Link
              href={`/listings/${listing.id}`}
              className="line-clamp-2 text-sm font-semibold hover:underline"
            >
              {listing.title}
            </Link>

            <p className="mt-1 text-xs text-neutral-500">
              {listing.condition}
            </p>

            <p className="mt-1 text-xs text-neutral-400">
              {listing.location}
            </p>

            <p className="mt-1 text-[10px] text-neutral-400">
              Listed{" "}
              {formatDate(listing.createdAt)}
            </p>
          </div>
        </div>

        {/* Price */}
        <div>
          <p className="text-sm font-bold">
            ₹
            {listing.price.toLocaleString(
              "en-IN"
            )}
          </p>
        </div>

        {/* Status */}
        <div>
          <StatusBadge
            status={listing.status}
          />
        </div>

        {/* Performance */}
        <div className="flex gap-4 text-xs text-neutral-500">
          <span
            className="inline-flex items-center gap-1"
            title="Views"
          >
            <EyeIcon />
            {listing.views}
          </span>

          <span
            className="inline-flex items-center gap-1"
            title="Favorites"
          >
            <HeartIcon />
            {listing.favorites}
          </span>
        </div>

        {/* Actions */}
        <div className="flex justify-start gap-2 md:justify-end">
          <Link
            href={`/listings/${listing.id}`}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold transition hover:border-black"
          >
            View
          </Link>

          <Link
            href={`/sell/edit/${listing.id}`}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold transition hover:border-black"
          >
            Edit
          </Link>

          <button
            type="button"
            disabled={deleting}
            onClick={onDelete}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-500 transition hover:border-black hover:text-black disabled:opacity-40"
          >
            {deleting ? "..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------
   Statistics
--------------------------------- */

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <p className="text-xs text-neutral-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold tracking-tight">
        {value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

/* --------------------------------
   Filters
--------------------------------- */

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition ${
        active
          ? "bg-black text-white"
          : "text-neutral-500 hover:bg-neutral-100 hover:text-black"
      }`}
    >
      {children}
    </button>
  );
}

function FilterCount({
  count,
}: {
  count: number;
}) {
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[10px] ${
        count > 0
          ? "bg-neutral-100 text-neutral-700"
          : "bg-neutral-100 text-neutral-400"
      }`}
    >
      {count}
    </span>
  );
}

/* --------------------------------
   Status
--------------------------------- */

function StatusBadge({
  status,
}: {
  status: MyListing["status"];
}) {
  const labels = {
    active: "Active",
    sold: "Sold",
    draft: "Draft",
    expired: "Expired",
  };

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "active"
            ? "bg-black"
            : "bg-neutral-300"
        }`}
      />

      {labels[status]}
    </span>
  );
}

/* --------------------------------
   Empty
--------------------------------- */

function EmptyState({
  filter,
}: {
  filter: Filter;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
        <ListingIcon />
      </div>

      <h2 className="mt-5 text-sm font-bold">
        {filter === "all"
          ? "No listings yet"
          : `No ${filter} listings`}
      </h2>

      <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-neutral-500">
        {filter === "all"
          ? "Create your first listing and start selling on MarketX."
          : "There are currently no listings in this category."}
      </p>

      {filter === "all" && (
        <Link
          href="/sell"
          className="mt-6 inline-flex rounded-lg bg-black px-5 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800"
        >
          Create your first listing
        </Link>
      )}
    </div>
  );
}

/* --------------------------------
   Loading
--------------------------------- */

function LoadingState() {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      {Array.from({ length: 5 }).map(
        (_, index) => (
          <div
            key={index}
            className="flex animate-pulse gap-4 border-b border-neutral-200 p-5 last:border-0"
          >
            <div className="h-20 w-24 rounded-lg bg-neutral-200" />

            <div className="flex-1 space-y-3">
              <div className="h-4 w-1/3 rounded bg-neutral-200" />
              <div className="h-3 w-1/4 rounded bg-neutral-200" />
              <div className="h-3 w-1/5 rounded bg-neutral-200" />
            </div>
          </div>
        )
      )}
    </div>
  );
}

/* --------------------------------
   Helpers
--------------------------------- */

function formatDate(date: string) {
  try {
    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    ).format(new Date(date));
  } catch {
    return "Recently";
  }
}

/* --------------------------------
   Icons
--------------------------------- */

function ImageIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
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

function ListingIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="2"
      />
      <path d="M8 9h8" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path d="M20.8 8.8c0 5.2-8.8 10.4-8.8 10.4S3.2 14 3.2 8.8A4.8 4.8 0 0 1 12 6a4.8 4.8 0 0 1 8.8 2.8Z" />
    </svg>
  );
}