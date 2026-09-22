"use client";

import React, { useState } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatPrice, formatDate } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

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
  isSeller: boolean;
  onStatusChange?: (id: string, newStatus: Offer["status"]) => void;
}

export default function OfferCard({
  offer,
  isSeller,
  onStatusChange,
}: OfferCardProps) {
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  async function handleAction(status: "accepted" | "rejected" | "cancelled") {
    try {
      setLoading(true);
      await apiFetch(`/offers/${encodeURIComponent(offer.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      success(`Offer ${status} successfully.`);
      if (onStatusChange) {
        onStatusChange(offer.id, status);
      }
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to update offer.");
    } finally {
      setLoading(false);
    }
  }

  const badgeVariant = {
    pending: "warning",
    accepted: "success",
    rejected: "dark",
    expired: "outline",
    cancelled: "outline",
  }[offer.status] as "warning" | "success" | "dark" | "outline";

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href={`/listings/${offer.listingId}`}
              className="font-bold text-sm text-black hover:underline"
            >
              {offer.listingTitle}
            </Link>
            <Badge variant={badgeVariant}>{offer.status}</Badge>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            {isSeller ? `From: ${offer.buyerName}` : `Listed at: ${formatPrice(offer.listingPrice)}`} • {formatDate(offer.createdAt)}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-base font-bold text-black">{formatPrice(offer.amount)}</p>
          <p className="text-[11px] text-neutral-400">Offered amount</p>
        </div>
      </div>

      {offer.message && (
        <p className="mt-3 text-xs text-neutral-600 bg-neutral-50 rounded-xl p-3 border border-neutral-100">
          "{offer.message}"
        </p>
      )}

      {/* Action Buttons */}
      {offer.status === "pending" && (
        <div className="mt-4 flex items-center justify-end gap-2 border-t border-neutral-100 pt-3">
          {isSeller ? (
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
          ) : (
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
