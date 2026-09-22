"use client";

import React, { useState } from "react";
import OfferCard, { Offer } from "./OfferCard";

interface OfferListProps {
  initialOffers: Offer[];
  isSeller: boolean;
  emptyMessage?: string;
}

export default function OfferList({
  initialOffers,
  isSeller,
  emptyMessage = "No offers found.",
}: OfferListProps) {
  const [offers, setOffers] = useState<Offer[]>(initialOffers);

  function handleStatusChange(id: string, newStatus: Offer["status"]) {
    setOffers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
  }

  if (offers.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center bg-neutral-50">
        <p className="text-xs text-neutral-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {offers.map((offer) => (
        <OfferCard
          key={offer.id}
          offer={offer}
          isSeller={isSeller}
          onStatusChange={handleStatusChange}
        />
      ))}
    </div>
  );
}
