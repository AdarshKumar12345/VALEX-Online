"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATEGORIES, CONDITIONS } from "@/lib/constants";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface EditListingPageProps {
  params: Promise<{ id: string }>;
}

export default function EditListingPage({ params }: EditListingPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<"active" | "sold" | "inactive">("active");

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    async function loadListing() {
      try {
        setFetching(true);
        const data = await apiFetch<any>(`/listings/${encodeURIComponent(id)}`);
        const listing = data.listing || data.data || data;

        setTitle(listing.title || "");
        setDescription(listing.description || "");
        setPrice(String(listing.price || ""));
        setCategory(listing.category || "");
        setCondition(listing.condition || "");
        setStatus(listing.status || "active");
        setLocation(
          listing.location
            ? typeof listing.location === "object"
              ? `${listing.location.city || ""}, ${listing.location.state || ""}`.replace(/^, |, $/g, "")
              : listing.location
            : ""
        );
        setExistingImages(listing.images || (listing.imageUrl ? [listing.imageUrl] : []));
      } catch (err) {
        toastError("Unable to load listing details.");
        router.push("/listings/my");
      } finally {
        setFetching(false);
      }
    }

    loadListing();
  }, [id, router, toastError]);

  function handleAddFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const validFiles = files.filter(
      (f) => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024
    );

    const availableSlots = 8 - (existingImages.length + newImageFiles.length);
    const selected = validFiles.slice(0, availableSlots);

    const previews = selected.map((f) => URL.createObjectURL(f));

    setNewImageFiles((prev) => [...prev, ...selected]);
    setNewImagePreviews((prev) => [...prev, ...previews]);
    e.target.value = "";
  }

  function removeExistingImage(index: number) {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  }

  function removeNewImage(index: number) {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!title.trim() || !description.trim() || !price || !category || !condition) {
      setFormError("Please fill out all required fields.");
      return;
    }

    if (existingImages.length + newImageFiles.length === 0) {
      setFormError("Listing must have at least one photo.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("price", price);
      formData.append("category", category);
      formData.append("condition", condition);
      formData.append("location", location.trim());
      formData.append("status", status);
      formData.append("existingImages", JSON.stringify(existingImages));

      newImageFiles.forEach((file) => {
        formData.append("images", file);
      });

      await apiFetch(`/listings/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: formData,
      });

      success("Listing updated successfully!");
      router.push(`/listings/${id}`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to update listing.");
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

  return (
    <main className="min-h-screen bg-neutral-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              href={`/listings/${id}`}
              className="text-xs font-semibold text-neutral-500 hover:text-black"
            >
              ← Cancel and return
            </Link>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-black">
              Edit Listing
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-neutral-500">Status:</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold"
            >
              <option value="active">Active</option>
              <option value="sold">Sold</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {formError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-600">
              {formError}
            </div>
          )}

          {/* Photos */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="text-sm font-bold text-black mb-1">Listing Photos</h2>
            <p className="text-xs text-neutral-500 mb-4">
              Add or remove photos (max 8 photos total, 5MB each).
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {/* Existing Images */}
              {existingImages.map((imgUrl, index) => (
                <div
                  key={imgUrl}
                  className="relative aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100"
                >
                  <img src={imgUrl} alt="" className="h-full w-full object-cover" />
                  {index === 0 && (
                    <span className="absolute left-2 top-2 rounded-md bg-black px-1.5 py-0.5 text-[9px] font-bold text-white">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black text-white text-xs hover:bg-red-600"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* New Image Previews */}
              {newImagePreviews.map((preview, index) => (
                <div
                  key={preview}
                  className="relative aspect-square overflow-hidden rounded-xl border border-dashed border-black bg-neutral-100"
                >
                  <img src={preview} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black text-white text-xs hover:bg-red-600"
                    aria-label="Remove new image"
                  >
                    ×
                  </button>
                </div>
              ))}

              {existingImages.length + newImageFiles.length < 8 && (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 transition hover:border-black hover:bg-white">
                  <span className="text-lg">+</span>
                  <span className="text-xs font-semibold text-neutral-600">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAddFiles}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </section>

          {/* Details */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-4">
            <Input
              label="Listing Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                required
                className="w-full rounded-xl border border-neutral-300 p-3.5 text-sm outline-none transition focus:border-black resize-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Price (₹)"
                type="number"
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full h-11 rounded-xl border border-neutral-300 bg-white px-3.5 text-sm outline-none transition focus:border-black"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                  Condition *
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  required
                  className="w-full h-11 rounded-xl border border-neutral-300 bg-white px-3.5 text-sm outline-none transition focus:border-black"
                >
                  <option value="">Select condition</option>
                  {CONDITIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Location"
                placeholder="e.g. Mumbai, Maharashtra"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-2">
            <Link
              href={`/listings/${id}`}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 px-5 text-sm font-semibold text-black hover:border-black transition"
            >
              Cancel
            </Link>
            <Button type="submit" loading={loading} className="px-7">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
