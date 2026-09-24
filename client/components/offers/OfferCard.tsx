"use client";

import React, { useState } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatPrice, formatDate } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

import { useAuth } from "@/components/auth/AuthProvider";

export interface Offer {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  amount: number;
  message?: string;
  status: "pending" | "accepted" | "rejected" | "expired" | "cancelled";
  createdAt: string;
}

interface OfferCardProps {
  offer: Offer;
  isSeller?: boolean;
  onStatusChange?: (id: string, newStatus: Offer["status"]) => void;
}

export default function OfferCard({
  offer,
  isSeller,
  onStatusChange,
}: OfferCardProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const offerId = offer.id || (offer as any)._id;

  // Determine whether the logged-in user is the seller or the buyer of this specific offer
  const isUserSeller = user ? user.id === offer.sellerId : (isSeller ?? false);
  const isUserBuyer = user ? user.id === offer.buyerId : !(isSeller ?? false);

  async function handleAction(status: "accepted" | "rejected" | "cancelled") {
    try {
      setLoading(true);
      await apiFetch(`/offers/${encodeURIComponent(offerId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      success(`Offer ${status} successfully.`);
      if (onStatusChange) {
        onStatusChange(offerId, status);
      }
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to update offer.");
    } finally {
      setLoading(false);
    }
  }

  const statusKey = (offer.status || "pending").toLowerCase();
  const badgeVariant = ({
    pending: "warning",
    accepted: "success",
    rejected: "dark",
    expired: "outline",
    cancelled: "outline",
  }[statusKey] || "outline") as "warning" | "success" | "dark" | "outline";

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/listings/${offer.listingId}`}
              className="font-bold text-sm text-black hover:underline"
            >
              {offer.listingTitle || "Listing"}
            </Link>
            <Badge variant={badgeVariant}>{offer.status || "pending"}</Badge>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
              {isUserSeller ? "Received Offer" : "Sent Offer"}
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            {isUserSeller
              ? `From: ${offer.buyerName || "Buyer"}`
              : `Listed at: ${formatPrice(offer.listingPrice || 0)}`} • {formatDate(offer.createdAt)}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-base font-bold text-black">{formatPrice(offer.amount || 0)}</p>
          <p className="text-[11px] text-neutral-400">Offered amount</p>
        </div>
      </div>

      {offer.message && (
        <p className="mt-3 text-xs text-neutral-600 bg-neutral-50 rounded-xl p-3 border border-neutral-100">
          "{offer.message}"
        </p>
      )}

      {/* Action Buttons - Only allow the seller to Accept/Decline, and the buyer to Cancel */}
      {statusKey === "pending" && (
        <div className="mt-4 flex items-center justify-end gap-2 border-t border-neutral-100 pt-3">
          {isUserSeller && (
            <>
              <Button
                size="sm"
                variant="outline"
                disabled={loading}
                onClick={() => handleAction("rejected")}
              >
                Decline
              </Button>
              <Button
                size="sm"
                variant="primary"
                loading={loading}
                onClick={() => handleAction("accepted")}
              >
                Accept Offer
              </Button>
            </>
          )}

          {isUserBuyer && !isUserSeller && (
            <Button
              size="sm"
              variant="outline"
              loading={loading}
              onClick={() => handleAction("cancelled")}
            >
              Cancel Offer
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
