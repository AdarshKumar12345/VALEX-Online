import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ListingGrid from "@/components/listings/ListingGrid";
import { Listing } from "@/components/listings/ListingCard";
import { formatDate } from "@/lib/utils";

interface SellerProfilePageProps {
  params: Promise<{ id: string }>;
}

interface SellerData {
  id: string;
  name: string;
  avatar?: string;
  location?: string;
  createdAt: string;
  isVerified?: boolean;
}

async function getSellerData(id: string): Promise<SellerData | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return null;

    const res = await fetch(
      `${apiUrl}/users/${encodeURIComponent(id)}`,
      {
        next: { revalidate: 30 },
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const u = data.user;

    if (!u) return null;

    return {
      id: u._id || u.authId || id,
      name: u.name || "MarketX Seller",
      avatar: u.avatar || "",
      location:
        typeof u.location === "object"
          ? `${u.location.city || ""}, ${u.location.state || ""}`.replace(
            /^, |, $/g,
            ""
          )
          : u.location || undefined,
      createdAt: u.createdAt,
      isVerified: u.isVerified ?? false,
    };
  } catch {
    return null;
  }
}

async function getSellerListings(sellerId: string): Promise<Listing[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return [];

    const res = await fetch(`${apiUrl}/listings?sellerId=${encodeURIComponent(sellerId)}`, {
      next: { revalidate: 30 },
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
  } catch (error) {
    console.log(error);

    return [];
  }
}

export default async function SellerProfilePage({ params }: SellerProfilePageProps) {
  const { id } = await params;
  const seller = await getSellerData(id);

  if (!seller) {
    notFound();
  }

  const listings = await getSellerListings(id);

  return (
    <main className="min-h-screen bg-white">
      {/* Seller Header Hero */}
      <section className="border-b border-neutral-200 bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-black text-2xl font-bold text-white overflow-hidden shadow-md">
                {seller.avatar ? (
                  <img src={seller.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  seller.name.charAt(0).toUpperCase()
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-black">
                    {seller.name}
                  </h1>
                  {seller.isVerified && (
                    <span className="rounded-full bg-black px-2 py-0.5 text-[10px] font-bold text-white">
                      Verified
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs text-neutral-500">
                  Member since {formatDate(seller.createdAt)} {seller.location ? `• ${seller.location}` : ""}
                </p>

                <p className="mt-2 text-xs font-semibold text-neutral-800">
                  {listings.length} Active Listing{listings.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <Link
              href={`/chat?recipient=${encodeURIComponent(seller.id)}`}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-black px-6 text-sm font-semibold text-white hover:bg-neutral-800 transition"
            >
              💬 Message Seller
            </Link>
          </div>
        </div>
      </section>

      {/* Seller Listings */}
      <section className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-black mb-6">
          Listings by {seller.name}
        </h2>

        <ListingGrid
          listings={listings}
          emptyMessage={`${seller.name} has no active listings at the moment.`}
        />
      </section>
    </main>
  );
}
