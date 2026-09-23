import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ListingDetailClient from "./ListingDetailClient";

interface ListingDetails {
    id: string;
    title: string;
    description: string;
    price: number;
    location: string;
    category: string;
    condition: string;
    createdAt: string;
    images: string[];
    isSaved?: boolean;
    seller: {
        id: string;
        name: string;
        avatar?: string;
        joinedAt: string;
    };
}

async function getListing(id: string): Promise<ListingDetails | null> {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

        const res = await fetch(`${apiUrl}/listings/${encodeURIComponent(id)}`, {
            next: { revalidate: 15 },
        });

        if (!res.ok) return null;
        const data = await res.json();
        const raw = data.listing || data.data || data;

        if (!raw || (!raw.id && !raw._id)) return null;

        return {
            id: raw.id || raw._id,
            title: raw.title || "Listing",
            description: raw.description || "",
            price: raw.price || 0,
            location: raw.location
                ? typeof raw.location === "object"
                    ? `${raw.location.city || ""}, ${raw.location.state || ""}`.replace(/^, |, $/g, "")
                    : raw.location
                : "Location not specified",
            category: raw.category || "General",
            condition: raw.condition || "Good",
            createdAt: raw.createdAt || new Date().toISOString(),
            images: raw.images || (raw.imageUrl ? [raw.imageUrl] : []),
            isSaved: raw.isSaved ?? false,
            seller: {
                id: raw.seller?.id || raw.sellerId || "seller",
                name: raw.seller?.name || "Verified Seller",
                avatar: raw.seller?.avatar || "",
                joinedAt: raw.seller?.createdAt || raw.createdAt || new Date().toISOString(),
            },
        };
    } catch {
        return null;
    }
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    const listing = await getListing(id);

    if (!listing) {
        return {
            title: "Listing Not Found | MarketX",
        };
    }

    return {
        title: `${listing.title} | MarketX`,
        description: listing.description.slice(0, 160),
        openGraph: {
            title: `${listing.title} - ₹${listing.price.toLocaleString("en-IN")}`,
            description: listing.description.slice(0, 160),
            images: listing.images[0] ? [{ url: listing.images[0] }] : [],
        },
    };
}

export default async function ListingPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const listing = await getListing(id);

    if (!listing) {
        notFound();
    }

    return <ListingDetailClient listing={listing} />;
}