"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { formatPrice } from "@/lib/utils";

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: string;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
}

export default function OfferModal({
  isOpen,
  onClose,
  sellerId,
  listingId,
  listingTitle,
  listingPrice,
}: OfferModalProps) {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { success } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const offerNum = parseFloat(amount);
    if (!offerNum || offerNum <= 0) {
      setError("Please enter a valid offer amount.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await apiFetch("/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          listingTitle,
          listingPrice,
          sellerId,
          amount: offerNum,
          message: message.trim(),
        }),
      });

      success("Your offer has been submitted to the seller!");
      onClose();
      setAmount("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send offer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Make an Offer"
      description={`Original listing price: ${formatPrice(listingPrice)}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
            {error}
          </div>
        )}

        <Input
          label="Your Offer Amount (₹)"
          type="number"
          min="1"
          step="1"
          placeholder="e.g. 20000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <div>
          <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
            Message for Seller (optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="e.g. I can pick it up today cash in hand."
            className="w-full rounded-xl border border-neutral-300 p-3 text-sm outline-none transition focus:border-black resize-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Send Offer
          </Button>
        </div>
      </form>
    </Modal>
  );
}
