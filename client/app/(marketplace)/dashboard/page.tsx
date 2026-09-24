"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiFetch } from "@/lib/api";
import { formatPrice, formatDate } from "@/lib/utils";
import OfferList from "@/components/offers/OfferList";
import { Offer } from "@/components/offers/OfferCard";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    myListings: 0,
    savedListings: 0,
    unreadMessages: 0,
    pendingOffers: 0,
  });
  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);

        const [myListingsRes, savedRes, chatsRes, offersRes] =
          await Promise.all([
            apiFetch<any>("/listings/me").catch(() => ({ listings: [] })),
            apiFetch<any>("/listings/saved").catch(() => ({ listings: [] })),
            apiFetch<any>("/chats").catch(() => ({ chats: [] })),
            apiFetch<any>("/offers").catch(() => ({ offers: [] })),
          ]);

        const myList = myListingsRes?.listings || myListingsRes || [];
        const savedList = savedRes?.listings || savedRes || [];
        const chatsList = chatsRes?.chats || chatsRes || [];
        const offersList: Offer[] =
          offersRes?.offers ||
          offersRes?.data ||
          (Array.isArray(offersRes) ? offersRes : []);

        setRecentListings(myList.slice(0, 4));
        setOffers(offersList);

        setStats({
          myListings: myList.length,
          savedListings: savedList.length,
          unreadMessages: chatsList.reduce(
            (acc: number, c: any) => acc + (c.unreadCount || 0),
            0
          ),
          pendingOffers: offersList.filter((o) => o.status === "pending").length,
        });
      } catch {
        // Fallback silently
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <main className="min-h-screen bg-neutral-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 bg-white p-6 sm:p-8 rounded-2xl shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Overview
            </span>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-black">
              Welcome back, {user?.name || "User"}
            </h1>
            <p className="mt-1 text-xs text-neutral-500">
              Manage your marketplace activity, listings, and customer inquiries.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/sell"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-black px-5 text-sm font-semibold text-white hover:bg-neutral-800 transition"
            >
              + Create Listing
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Link
            href="/listings/my"
            className="rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-black hover:shadow-md"
          >
            <span className="text-xs font-semibold text-neutral-500">
              My Active Listings
            </span>
            <p className="mt-3 text-3xl font-extrabold text-black">
              {stats.myListings}
            </p>
            <span className="mt-2 block text-xs font-semibold text-neutral-400">
              View all listings →
            </span>
          </Link>

          <Link
            href="/listings/saved"
            className="rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-black hover:shadow-md"
          >
            <span className="text-xs font-semibold text-neutral-500">
              Saved Items
            </span>
            <p className="mt-3 text-3xl font-extrabold text-black">
              {stats.savedListings}
            </p>
            <span className="mt-2 block text-xs font-semibold text-neutral-400">
              View saved →
            </span>
          </Link>

          <Link
            href="/chat"
            className="rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-black hover:shadow-md"
          >
            <span className="text-xs font-semibold text-neutral-500">
              Unread Messages
            </span>
            <p className="mt-3 text-3xl font-extrabold text-black">
              {stats.unreadMessages}
            </p>
            <span className="mt-2 block text-xs font-semibold text-neutral-400">
              Open inbox →
            </span>
          </Link>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <span className="text-xs font-semibold text-neutral-500">
              Pending Offers
            </span>
            <p className="mt-3 text-3xl font-extrabold text-black">
              {stats.pendingOffers}
            </p>
            <span className="mt-2 block text-xs font-semibold text-neutral-400">
              Review below
            </span>
          </div>
        </div>

        {/* Dashboard Sections */}
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {/* Recent Listings */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
              <h2 className="text-base font-bold text-black">My Recent Listings</h2>
              <Link
                href="/listings/my"
                className="text-xs font-semibold text-neutral-500 hover:text-black underline"
              >
                View all
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                <div className="h-16 animate-pulse bg-neutral-100 rounded-xl" />
                <div className="h-16 animate-pulse bg-neutral-100 rounded-xl" />
              </div>
            ) : recentListings.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                You haven't listed any items yet.
                <div className="mt-3">
                  <Link
                    href="/sell"
                    className="inline-flex rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white"
                  >
                    Sell an item
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {recentListings.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-3.5"
                  >
                    <div className="min-w-0 pr-4">
                      <Link
                        href={`/listings/${item.id}`}
                        className="font-bold text-xs sm:text-sm text-black hover:underline truncate block"
                      >
                        {item.title}
                      </Link>
                      <span className="text-[11px] text-neutral-400">
                        {formatPrice(item.price)} • {formatDate(item.createdAt)}
                      </span>
                    </div>

                    <Link
                      href={`/sell/edit/${item.id}`}
                      className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold hover:border-black transition shrink-0"
                    >
                      Edit
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Offers */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
              <h2 className="text-base font-bold text-black">Offers & Inquiries</h2>
            </div>

            {loading ? (
              <div className="space-y-3">
                <div className="h-20 animate-pulse bg-neutral-100 rounded-xl" />
              </div>
            ) : (
              <OfferList
                initialOffers={offers}
                emptyMessage="No offers sent or received yet."
              />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
