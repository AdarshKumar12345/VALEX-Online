import ListingCard, {
    type Listing,
} from "@/components/listings/ListingCard";

interface ListingGridProps {
    listings: Listing[];
    loading?: boolean;
    error?: string | null;
    emptyMessage?: string;
}

export default function ListingGrid({
    listings,
    loading = false,
    error = null,
    emptyMessage = "No listings found.",
}: ListingGridProps) {
    /* Loading */
    if (loading) {
        return <ListingGridSkeleton />;
    }

    /* Error */
    if (error) {
        return (
            <div
                role="alert"
                className="rounded-2xl border border-neutral-200 bg-neutral-50 px-6 py-12 text-center"
            >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                    <ErrorIcon />
                </div>

                <h3 className="mt-4 text-sm font-semibold">
                    Something went wrong
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
                    {error}
                </p>
            </div>
        );
    }

    /* Empty */
    if (listings.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200 bg-white">
                    <SearchIcon />
                </div>

                <h3 className="mt-4 text-sm font-semibold">
                    Nothing here yet
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-500">
                    {emptyMessage}
                </p>
            </div>
        );
    }

    /* Listings */
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
                <ListingCard
                    key={listing.id}
                    listing={listing}
                />
            ))}
        </div>
    );
}

/* --------------------------------
   Skeleton
--------------------------------- */

function ListingGridSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
                <ListingSkeleton key={index} />
            ))}
        </div>
    );
}

function ListingSkeleton() {
    return (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            {/* Image */}
            <div className="aspect-[4/3] animate-pulse bg-neutral-100" />

            {/* Content */}
            <div className="space-y-3 p-4">
                <div className="h-2.5 w-1/4 animate-pulse rounded bg-neutral-100" />

                <div className="h-4 w-4/5 animate-pulse rounded bg-neutral-100" />

                <div className="h-5 w-1/3 animate-pulse rounded bg-neutral-100" />

                <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-100" />
            </div>
        </div>
    );
}

/* --------------------------------
   Icons
--------------------------------- */

function ErrorIcon() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
        </svg>
    );
}

function SearchIcon() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
        >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
        </svg>
    );
}