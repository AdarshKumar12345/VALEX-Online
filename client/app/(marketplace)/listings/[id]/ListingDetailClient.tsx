"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ListingGallery from "@/components/listings/ListingGallery";
import ShareButton from "@/components/listings/ShareButton";
import ReportModal from "@/components/listings/ReportModal";
import OfferModal from "@/components/offers/OfferModal";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatPrice, formatDate } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

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

export default function ListingDetailClient({
  listing,
}: {
  listing: ListingDetails;
}) {
  const [isSaved, setIsSaved] = useState(listing.isSaved ?? false);
  const [saving, setSaving] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const { success, error } = useToast();

  async function toggleSave() {
    if (saving) return;
    try {
      setSaving(true);
      await apiFetch(`/listings/${encodeURIComponent(listing.id)}/save`, {
        method: isSaved ? "DELETE" : "POST",
      });
      setIsSaved((prev) => !prev);
      success(isSaved ? "Removed from saved listings" : "Listing saved!");
    } catch (err) {
      if ((err as any)?.status === 401) {
        window.location.href = `/login?redirect=${encodeURIComponent(
          window.location.pathname
        )}`;
      } else {
        error("Failed to update saved listing.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <Link href="/" className="hover:text-black">
              Home
            </Link>
            <span>/</span>
            <Link href="/listings" className="hover:text-black">
              Listings
            </Link>
            <span>/</span>
            <Link
              href={`/listings?category=${encodeURIComponent(listing.category)}`}
              className="hover:text-black"
            >
              {listing.category}
            </Link>
            <span>/</span>
            <span className="truncate text-black font-medium max-w-[200px]">
              {listing.title}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_440px]">
          {/* Gallery Viewport */}
          <div>
            <ListingGallery images={listing.images} title={listing.title} />

            {/* Description (Desktop position) */}
            <section className="mt-10 border-t border-neutral-200 pt-8">
              <h2 className="text-base font-bold text-black">Description</h2>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-neutral-600">
                {listing.description}
              </p>
            </section>
          </div>

          {/* Details Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <Badge variant="default">{listing.category}</Badge>
                <span className="text-xs text-neutral-400">
                  {formatDate(listing.createdAt)}
                </span>
              </div>

              <h1 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-black leading-tight">
                {listing.title}
              </h1>

              <p className="mt-4 text-3xl font-extrabold text-black">
                {formatPrice(listing.price)}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 bg-neutral-50">
                  Condition: <strong className="text-black">{listing.condition}</strong>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 bg-neutral-50">
                  📍 {listing.location}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="mt-7 space-y-3">
                <Link
                  href={`/chat?listing=${encodeURIComponent(listing.id)}`}
                  className="flex h-12 w-full items-center justify-center rounded-xl bg-black px-5 text-sm font-bold text-white transition hover:bg-neutral-800 shadow-sm"
                >
                  💬 Message Seller
                </Link>

                <div className="grid grid-cols-2 gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOfferOpen(true)}
                  >
                    🤝 Make Offer
                  </Button>

                  <Button
                    type="button"
                    variant={isSaved ? "secondary" : "outline"}
                    disabled={saving}
                    onClick={toggleSave}
                  >
                    {isSaved ? "❤️ Saved" : "🤍 Save"}
                  </Button>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <ShareButton title={listing.title} className="w-full justify-center" />
                </div>
              </div>
            </div>

            {/* Seller Details Card */}
            <section className="rounded-2xl border border-neutral-200 bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Seller Information
                </h3>
                <Link
                  href={`/users/${listing.seller.id}`}
                  className="text-xs font-semibold text-black underline underline-offset-4"
                >
                  View Profile
                </Link>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                  {listing.seller.avatar ? (
                    <img
                      src={listing.seller.avatar}
                      alt={listing.seller.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    listing.seller.name.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-bold text-sm text-black">
                    {listing.seller.name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Member since {formatDate(listing.seller.joinedAt)}
                  </p>
                </div>
              </div>
            </section>

            {/* Safety Tips Card */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
              <div className="flex gap-3">
                <span className="text-lg">🛡️</span>
                <div>
                  <h4 className="text-xs font-bold text-black">Stay Safe on MarketX</h4>
                  <ul className="mt-2 space-y-1 text-xs text-neutral-500 list-disc list-inside">
                    <li>Meet seller at a safe public location</li>
                    <li>Inspect the item thoroughly before paying</li>
                    <li>Never transfer money in advance</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Report Listing */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsReportOpen(true)}
                className="text-xs text-neutral-400 hover:text-black transition underline underline-offset-4"
              >
                🚩 Report this listing
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        listingId={listing.id}
      />

      <OfferModal
        isOpen={isOfferOpen}
        onClose={() => setIsOfferOpen(false)}
        listingId={listing.id}
        listingTitle={listing.title}
        listingPrice={listing.price}
      />
    </main>
  );
}
