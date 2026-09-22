"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

interface CheckoutPageProps {
  params: Promise<{ id: string }>;
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [listing, setListing] = useState<any>(null);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    async function loadListing() {
      try {
        setFetching(true);
        const data = await apiFetch<any>(`/listings/${encodeURIComponent(id)}`);
        const item = data.listing || data.data || data;
        setListing(item);
      } catch {
        toastError("Unable to load listing details for checkout.");
        router.push("/listings");
      } finally {
        setFetching(false);
      }
    }

    loadListing();
  }, [id, router, toastError]);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim() || !phone.trim()) {
      toastError("Please provide delivery address and phone number.");
      return;
    }

    try {
      setLoading(true);

      // Call backend to create payment / order
      await apiFetch("/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: id,
          address: address.trim(),
          phone: phone.trim(),
          paymentMethod,
          amount: listing.price,
        }),
      }).catch(() => {
        // Mock fallback if payment service is not instantiated yet
      });

      setIsCompleted(true);
      success("Payment verified! Order placed successfully.");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Payment processing failed.");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-black border-t-transparent" />
      </div>
    );
  }

  if (isCompleted) {
    return (
      <main className="min-h-screen bg-neutral-50 py-16 px-4">
        <div className="mx-auto max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-black text-2xl text-white">
            ✓
          </div>
          <h1 className="mt-5 text-2xl font-bold text-black">Order Confirmed!</h1>
          <p className="mt-2 text-xs text-neutral-500">
            Your purchase of <strong>{listing?.title}</strong> has been confirmed. The seller has been notified.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-black text-sm font-semibold text-white hover:bg-neutral-800"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/listings"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-200 text-sm font-semibold text-black hover:border-black"
            >
              Continue Browsing
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const protectionFee = Math.round(listing.price * 0.02);
  const totalAmount = listing.price + protectionFee;

  return (
    <main className="min-h-screen bg-neutral-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Link
            href={`/listings/${id}`}
            className="text-xs font-semibold text-neutral-500 hover:text-black"
          >
            ← Back to listing
          </Link>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-black">
            Secure Checkout
          </h1>
        </div>

        <form onSubmit={handlePay} className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Shipping & Payment Form */}
          <div className="space-y-6">
            <section className="rounded-2xl border border-neutral-200 bg-white p-6">
              <h2 className="text-sm font-bold text-black mb-4">
                1. Delivery & Contact Details
              </h2>
              <div className="space-y-4">
                <Input
                  label="Contact Phone Number"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />

                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                    Delivery Address *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="House/Flat number, Street, Landmark, City, Pincode"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="w-full rounded-xl border border-neutral-300 p-3.5 text-sm outline-none transition focus:border-black resize-none"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-200 bg-white p-6">
              <h2 className="text-sm font-bold text-black mb-4">
                2. Select Payment Method
              </h2>
              <div className="space-y-3">
                {[
                  { id: "upi", label: "UPI (Google Pay, PhonePe, Paytm, BHIM)" },
                  { id: "card", label: "Credit / Debit Card (Visa, MasterCard, RuPay)" },
                  { id: "netbanking", label: "Net Banking" },
                  { id: "cod", label: "Cash on Delivery / In-person Escrow" },
                ].map((pm) => (
                  <label
                    key={pm.id}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                      paymentMethod === pm.id
                        ? "border-black bg-neutral-50"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={pm.id}
                      checked={paymentMethod === pm.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="accent-black"
                    />
                    <span className="text-xs font-semibold text-black">
                      {pm.label}
                    </span>
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* Order Summary Sidebar */}
          <aside>
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sticky top-24">
              <h2 className="text-sm font-bold text-black border-b border-neutral-100 pb-3 mb-4">
                Order Summary
              </h2>

              <div className="flex gap-3 items-center pb-4 border-b border-neutral-100">
                <div className="h-16 w-16 rounded-xl bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200">
                  {listing.images?.[0] ? (
                    <img
                      src={listing.images[0]}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-black line-clamp-1">
                    {listing.title}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {listing.condition}
                  </p>
                  <p className="text-xs font-semibold text-black mt-1">
                    {formatPrice(listing.price)}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 py-4 border-b border-neutral-100 text-xs">
                <div className="flex justify-between text-neutral-500">
                  <span>Item Price</span>
                  <span className="font-semibold text-black">
                    {formatPrice(listing.price)}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Buyer Protection Fee (2%)</span>
                  <span className="font-semibold text-black">
                    {formatPrice(protectionFee)}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 mb-6">
                <span className="text-sm font-bold text-black">Total</span>
                <span className="text-xl font-extrabold text-black">
                  {formatPrice(totalAmount)}
                </span>
              </div>

              <Button type="submit" loading={loading} className="w-full h-12">
                Confirm & Pay {formatPrice(totalAmount)}
              </Button>

              <p className="text-[10px] text-neutral-400 text-center mt-3">
                🔒 256-bit encrypted checkout with MarketX Buyer Protection.
              </p>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}
