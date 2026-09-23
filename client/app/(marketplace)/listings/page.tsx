import Link from "next/link";
import ListingGrid from "@/components/listings/ListingGrid";
import SortSelect from "@/components/listings/SortSelect";
import { type Listing } from "@/components/listings/ListingCard";
import { CATEGORIES, CONDITIONS, SORT_OPTIONS } from "@/lib/constants";

export const dynamic = "force-dynamic";

interface ListingsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    condition?: string;
    location?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  }>;
}

interface ListingsResponse {
  listings: Listing[];
  total: number;
  page: number;
  pages: number;
}

async function getListingsData(
  params: Record<string, string | undefined>
): Promise<ListingsResponse> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const queryParams = new URLSearchParams();
    if (params.q) queryParams.set("q", params.q);
    if (params.category) queryParams.set("category", params.category);
    if (params.condition) queryParams.set("condition", params.condition);
    if (params.location) queryParams.set("location", params.location);
    if (params.minPrice) queryParams.set("minPrice", params.minPrice);
    if (params.maxPrice) queryParams.set("maxPrice", params.maxPrice);
    if (params.sort) queryParams.set("sort", params.sort);
    if (params.page) queryParams.set("page", params.page);
    queryParams.set("limit", "12");

    const res = await fetch(`${apiUrl}/listings?${queryParams.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.log("listing is not avilabel and res is not ok");

      return { listings: [], total: 0, page: 1, pages: 1 };
    }

    const data = await res.json();
    const rawListings =
      data.listings || data.data || (Array.isArray(data) ? data : []);

    const listings: Listing[] = rawListings.map((item: any) => ({
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

    return {
      listings,
      total: data.total ?? listings.length,
      page: Number(params.page || "1"),
      pages: data.pages ?? (Math.ceil(listings.length / 12) || 1),
    };
  } catch (error) {
    console.log(error, "error in fetching listings");
    return { listings: [], total: 0, page: 1, pages: 1 };
  }
}

export default async function ListingsPage({
  searchParams,
}: ListingsPageProps) {
  const params = await searchParams;

  const query = params.q ?? "";
  const category = params.category ?? "";
  const condition = params.condition ?? "";
  const location = params.location ?? "";
  const minPrice = params.minPrice ?? "";
  const maxPrice = params.maxPrice ?? "";
  const sort = params.sort ?? "latest";
  const currentPage = Number(params.page ?? "1");

  const { listings, total, pages } = await getListingsData(params);

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                Marketplace
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl text-black">
                {query
                  ? `Results for "${query}"`
                  : category
                    ? `${category} Listings`
                    : "Browse listings"}
              </h1>

              <p className="mt-2 text-sm text-neutral-500">
                Discover verified products from local sellers.
              </p>
            </div>

            <Link
              href="/sell"
              className="inline-flex w-fit items-center rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              + Sell something
            </Link>
          </div>
        </div>
      </section>

      {/* Main Grid & Filters */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Filters Sidebar (Desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <FilterPanel
                query={query}
                category={category}
                condition={condition}
                location={location}
                minPrice={minPrice}
                maxPrice={maxPrice}
              />
            </div>
          </aside>

          {/* Results Column */}
          <div className="min-w-0">
            {/* Top Toolbar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-neutral-500">
                {total > 0
                  ? `Showing ${listings.length} of ${total} listings`
                  : "No listings found"}
              </p>

              <SortSelect value={sort} currentParams={params} />
            </div>

            {/* Listings Grid */}
            <ListingGrid
              listings={listings}
              emptyMessage={
                query
                  ? `No listings matched "${query}". Try adjusting your filters or search keywords.`
                  : "There are currently no listings matching your criteria."
              }
            />

            {/* Pagination */}
            {pages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={pages}
                currentParams={params}
              />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function FilterPanel({
  query,
  category,
  condition,
  location,
  minPrice,
  maxPrice,
}: {
  query: string;
  category: string;
  condition: string;
  location: string;
  minPrice: string;
  maxPrice: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
        <h2 className="text-sm font-bold text-black">Filters</h2>
        <Link
          href="/listings"
          className="text-xs text-neutral-500 underline underline-offset-4 hover:text-black"
        >
          Reset all
        </Link>
      </div>

      <form action="/listings" method="GET" className="mt-5 space-y-6">
        {/* Search */}
        <div>
          <label
            htmlFor="filter-search"
            className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400"
          >
            Keywords
          </label>
          <input
            id="filter-search"
            name="q"
            defaultValue={query}
            placeholder="e.g. iPhone 15"
            className="mt-1.5 w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs outline-none transition focus:border-black"
          />
        </div>

        {/* Categories */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Category
          </label>
          <div className="mt-2 space-y-1">
            <Link
              href={buildUrl({
                q: query,
                category: "",
                condition,
                location,
                minPrice,
                maxPrice,
              })}
              className={`block rounded-lg px-2.5 py-1.5 text-xs transition ${!category
                ? "bg-black font-semibold text-white"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-black"
                }`}
            >
              All Categories
            </Link>
            {CATEGORIES.map((cat) => {
              const active =
                category.toLowerCase() === cat.name.toLowerCase();
              return (
                <Link
                  key={cat.slug}
                  href={buildUrl({
                    q: query,
                    category: active ? "" : cat.name,
                    condition,
                    location,
                    minPrice,
                    maxPrice,
                  })}
                  className={`block rounded-lg px-2.5 py-1.5 text-xs transition ${active
                    ? "bg-black font-semibold text-white"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-black"
                    }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Condition */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Condition
          </label>
          <div className="mt-2 space-y-1">
            <Link
              href={buildUrl({
                q: query,
                category,
                condition: "",
                location,
                minPrice,
                maxPrice,
              })}
              className={`block rounded-lg px-2.5 py-1.5 text-xs transition ${!condition
                ? "bg-black font-semibold text-white"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-black"
                }`}
            >
              Any Condition
            </Link>
            {CONDITIONS.map((cond) => {
              const active =
                condition.toLowerCase() === cond.toLowerCase();
              return (
                <Link
                  key={cond}
                  href={buildUrl({
                    q: query,
                    category,
                    condition: active ? "" : cond,
                    location,
                    minPrice,
                    maxPrice,
                  })}
                  className={`block rounded-lg px-2.5 py-1.5 text-xs transition ${active
                    ? "bg-black font-semibold text-white"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-black"
                    }`}
                >
                  {cond}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Location */}
        <div>
          <label
            htmlFor="filter-location"
            className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400"
          >
            Location / City
          </label>
          <input
            id="filter-location"
            name="location"
            defaultValue={location}
            placeholder="e.g. Dhanbad"
            className="mt-1.5 w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs outline-none transition focus:border-black"
          />
        </div>

        {/* Price Range */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Price Range (₹)
          </label>
          <div className="mt-1.5 flex items-center gap-2">
            <input
              type="number"
              name="minPrice"
              defaultValue={minPrice}
              placeholder="Min"
              min="0"
              className="w-full rounded-xl border border-neutral-300 px-2.5 py-1.5 text-xs outline-none focus:border-black"
            />
            <span className="text-neutral-400">-</span>
            <input
              type="number"
              name="maxPrice"
              defaultValue={maxPrice}
              placeholder="Max"
              min="0"
              className="w-full rounded-xl border border-neutral-300 px-2.5 py-1.5 text-xs outline-none focus:border-black"
            />
          </div>
        </div>

        {category && <input type="hidden" name="category" value={category} />}
        {condition && <input type="hidden" name="condition" value={condition} />}

        <button
          type="submit"
          className="w-full rounded-xl bg-black py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition"
        >
          Apply Filters
        </button>
      </form>
    </div>
  );
}



function Pagination({
  currentPage,
  totalPages,
  currentParams,
}: {
  currentPage: number;
  totalPages: number;
  currentParams: Record<string, string | undefined>;
}) {
  const prevPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(totalPages, currentPage + 1);

  return (
    <div className="mt-12 flex items-center justify-center gap-2">
      <Link
        href={buildUrl({ ...currentParams, page: String(prevPage) })}
        className={`rounded-xl border border-neutral-200 px-4 py-2 text-xs font-semibold transition ${currentPage === 1
          ? "pointer-events-none opacity-40"
          : "hover:border-black"
          }`}
      >
        ← Previous
      </Link>

      <span className="rounded-xl bg-black px-4 py-2 text-xs font-semibold text-white">
        {currentPage} / {totalPages}
      </span>

      <Link
        href={buildUrl({ ...currentParams, page: String(nextPage) })}
        className={`rounded-xl border border-neutral-200 px-4 py-2 text-xs font-semibold transition ${currentPage === totalPages
          ? "pointer-events-none opacity-40"
          : "hover:border-black"
          }`}
      >
        Next →
      </Link>
    </div>
  );
}

function buildUrl(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) sp.set(k, v);
  });
  const qs = sp.toString();
  return qs ? `/listings?${qs}` : "/listings";
}