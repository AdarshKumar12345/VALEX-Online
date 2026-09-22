import Link from "next/link";

export default function ListingNotFound() {
    return (
        <main className="flex min-h-[70vh] items-center justify-center bg-white px-4">
            <div className="max-w-md text-center">
                <p className="text-7xl font-bold tracking-tight">
                    404
                </p>

                <h1 className="mt-4 text-2xl font-bold">
                    Listing not found
                </h1>

                <p className="mt-3 text-sm leading-6 text-neutral-500">
                    This listing may have been removed, sold, or is no
                    longer available.
                </p>

                <Link
                    href="/listings"
                    className="mt-7 inline-flex rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                    Browse listings
                </Link>
            </div>
        </main>
    );
}