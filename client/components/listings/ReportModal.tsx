"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { REPORT_REASONS } from "@/lib/constants";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
}

export default function ReportModal({
  isOpen,
  onClose,
  listingId,
}: ReportModalProps) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { success } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason) {
      setError("Please select a reason for reporting.");
      return;
    }
    if (details.trim().length < 10) {
      setError("Please provide at least 10 characters of explanation.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await apiFetch(`/listings/${encodeURIComponent(listingId)}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, details: details.trim() }),
      });

      success("Report submitted. Our moderation team will review this listing.");
      onClose();
      setReason("");
      setDetails("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit report.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report Listing"
      description="Help us keep MarketX safe by reporting suspicious or policy-violating listings."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
            Reason *
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            className="w-full h-11 rounded-xl border border-neutral-300 bg-white px-3.5 text-sm outline-none transition focus:border-black"
          >
            <option value="">Select a reason</option>
            {REPORT_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
            Details *
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={4}
            placeholder="Please describe why this listing should be reviewed..."
            className="w-full rounded-xl border border-neutral-300 p-3 text-sm outline-none transition focus:border-black resize-none"
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" loading={loading}>
            Submit Report
          </Button>
        </div>
      </form>
    </Modal>
  );
}
