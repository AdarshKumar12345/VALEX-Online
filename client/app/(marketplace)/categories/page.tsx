import React from "react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";

export const metadata = {
  title: "Browse Categories | MarketX",
  description: "Explore all marketplace categories to buy and sell second-hand goods.",
};

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="border-b border-neutral-200 bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
            Marketplace
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-black tracking-tight">
            Explore Categories
          </h1>
          <p className="mt-2 text-sm text-neutral-500 max-w-2xl">
            Find electronics, phones, vehicles, furniture, fashion, and much more from local sellers across India.
          </p>
        </div>
      </section>

      {/* Grid of Categories */}
      <section className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/listings?category=${encodeURIComponent(cat.name)}`}
              className="group flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-black hover:shadow-lg"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white text-lg font-bold">
                  {cat.name.charAt(0)}
                </div>

                <h2 className="mt-5 text-lg font-bold text-black group-hover:underline">
                  {cat.name}
                </h2>

                <p className="mt-1 text-xs text-neutral-500 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4 text-xs font-semibold text-neutral-700 group-hover:text-black">
                <span>Browse {cat.name} listings</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
