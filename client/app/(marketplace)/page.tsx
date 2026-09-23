import Link from "next/link";
import ListingGrid from "@/components/listings/ListingGrid";
import { CATEGORIES } from "@/lib/constants";
import { Listing } from "@/components/listings/ListingCard";

export const dynamic = "force-dynamic";

async function getRecentListings(): Promise<Listing[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const res = await fetch(`${apiUrl}/listings?limit=8&sort=latest`, {
      cache: "no-store",
    });

    if (!res.ok) return [];
    const data = await res.json();
    const list = data.listings || data.data || (Array.isArray(data) ? data : []);

    return list.map((item: any) => ({
      id: item.id || item._id,
      title: item.title,
      price: item.price,
      location: item.location
        ? typeof item.location === "object"
          ? `${item.location.city || ""}, ${item.location.state || ""}`.replace(/^, |, $/g, "")
          : item.location
        : "Location not specified",
      imageUrl: item.images?.[0] || item.imageUrl || "",
      category: item.category,
      condition: item.condition,
      createdAt: item.createdAt,
      isSaved: item.isSaved ?? false,
    }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const listings = await getRecentListings();

  return (
    <>
      {/* Hero */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-600">
              <span className="h-1.5 w-1.5 rounded-full bg-black" />
              Your local marketplace
            </div>

            <h1 className="text-5xl font-bold tracking-[-0.04em] text-black sm:text-6xl lg:text-7xl">
              Buy less.
              <br />
              <span className="text-neutral-400">Find more.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-7 text-neutral-600 sm:text-lg">
              Discover great products from people around you. Buy and sell
              pre-owned items with a marketplace built for real people.
            </p>

            {/* Search */}
            <form
              action="/listings"
              method="GET"
              className="mt-9 flex max-w-2xl flex-col gap-2 rounded-2xl border border-neutral-300 bg-white p-2 shadow-[0_8px_30px_rgba(0,0,0,0.06)] sm:flex-row"
            >
              <div className="flex flex-1 items-center px-3">
                <SearchIcon />
                <input
                  type="search"
                  name="q"
                  placeholder="What are you looking for?"
                  aria-label="Search listings"
                  className="ml-3 w-full bg-transparent py-3 text-sm outline-none placeholder:text-neutral-400 sm:text-base"
                />
              </div>

              <button
                type="submit"
                className="rounded-xl bg-black px-7 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.98]"
              >
                Search
              </button>
            </form>

            {/* Quick links */}
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-neutral-500">
              <span>Popular:</span>
              {["iPhone", "Laptop", "Bike", "Furniture", "Camera"].map((item) => (
                <Link
                  key={item}
                  href={`/listings?q=${encodeURIComponent(item)}`}
                  className="font-medium text-neutral-700 underline decoration-neutral-300 underline-offset-4 transition hover:text-black"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Explore"
            title="Browse categories"
            description="Find what you need faster."
          />

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={`/listings?category=${encodeURIComponent(category.name)}`}
                className="group rounded-2xl border border-neutral-200 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-black hover:shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                  <CategoryIcon />
                </div>

                <h3 className="mt-5 text-sm font-semibold text-black">
                  {category.name}
                </h3>

                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  {category.description}
                </p>

                <div className="mt-4 text-xs font-medium text-neutral-400 transition group-hover:text-black">
                  Explore →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <SectionHeader
              eyebrow="Marketplace"
              title="Recently listed"
              description="Fresh listings from sellers near you."
            />

            <Link
              href="/listings"
              className="hidden shrink-0 text-sm font-semibold underline decoration-neutral-300 underline-offset-4 hover:decoration-black sm:block"
            >
              View all
            </Link>
          </div>

          <div className="mt-10">
            <ListingGrid
              listings={listings}
              emptyMessage="No active listings yet. Be the first to sell something!"
            />
          </div>

          <Link
            href="/listings"
            className="mt-8 block text-center text-sm font-semibold underline decoration-neutral-300 underline-offset-4 sm:hidden"
          >
            View all listings
          </Link>
        </div>
      </section>

      {/* Sell CTA */}
      <section className="bg-black text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 py-16 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div>
            <p className="text-sm font-medium text-neutral-400">
              HAVE SOMETHING TO SELL?
            </p>

            <h2 className="mt-2 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
              Turn unused things into something useful.
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-400">
              Create a listing in minutes and connect with buyers looking for
              exactly what you have.
            </p>
          </div>

          <Link
            href="/sell"
            className="shrink-0 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200 active:scale-[0.98]"
          >
            Start selling →
          </Link>
        </div>
      </section>

      {/* Trust section */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 border-y border-neutral-200 py-10 sm:grid-cols-3 sm:gap-0">
            <TrustItem
              title="Built for people"
              description="Simple buying and selling without unnecessary complexity."
            />

            <TrustItem
              title="Discover locally"
              description="Find products from sellers around your location."
            />

            <TrustItem
              title="Your marketplace"
              description="Manage listings, conversations and purchases in one place."
            />
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
        {title}
      </h2>

      <p className="mt-2 text-sm text-neutral-500">{description}</p>
    </div>
  );
}

function TrustItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="px-0 sm:px-8 first:sm:pl-0 last:sm:pr-0">
      <h3 className="text-sm font-semibold text-black">{title}</h3>
      <p className="mt-2 max-w-xs text-sm leading-6 text-neutral-500">
        {description}
      </p>
    </div>
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
      className="shrink-0 text-neutral-500"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function CategoryIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  );
}