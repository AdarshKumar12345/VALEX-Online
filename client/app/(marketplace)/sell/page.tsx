"use client";

import Link from "next/link";
import {
    ChangeEvent,
    FormEvent,
    useMemo,
    useState,
} from "react";

interface ImagePreview {
    file: File;
    preview: string;
}

const categories = [
    "Mobiles",
    "Laptops",
    "Electronics",
    "Vehicles",
    "Furniture",
    "Fashion",
    "Books",
    "Sports",
    "Home & Garden",
    "Other",
];

const conditions = [
    "New",
    "Like New",
    "Good",
    "Fair",
];

export default function SellPage() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [condition, setCondition] = useState("");
    const [location, setLocation] = useState("");

    const [images, setImages] = useState<ImagePreview[]>(
        []
    );

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const remainingCharacters = 2000 - description.length;

    const canSubmit = useMemo(() => {
        return (
            title.trim().length >= 5 &&
            description.trim().length >= 20 &&
            Number(price) > 0 &&
            category &&
            condition &&
            location.trim().length >= 2 &&
            images.length > 0
        );
    }, [
        title,
        description,
        price,
        category,
        condition,
        location,
        images,
    ]);

    /* --------------------------------
       Image Upload
    --------------------------------- */

    function handleImageUpload(
        event: ChangeEvent<HTMLInputElement>
    ) {
        const files = Array.from(event.target.files ?? []);

        if (!files.length) return;

        const validFiles = files.filter(
            (file) =>
                file.type.startsWith("image/") &&
                file.size <= 5 * 1024 * 1024
        );

        const availableSlots = 8 - images.length;

        const selectedFiles = validFiles.slice(
            0,
            availableSlots
        );

        const previews = selectedFiles.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));

        setImages((current) => [
            ...current,
            ...previews,
        ]);

        event.target.value = "";
    }

    function removeImage(index: number) {
        const image = images[index];

        URL.revokeObjectURL(image.preview);

        setImages((current) =>
            current.filter((_, i) => i !== index)
        );
    }

    function moveImage(
        index: number,
        direction: "left" | "right"
    ) {
        const newIndex =
            direction === "left"
                ? index - 1
                : index + 1;

        if (
            newIndex < 0 ||
            newIndex >= images.length
        ) {
            return;
        }

        setImages((current) => {
            const copy = [...current];

            [copy[index], copy[newIndex]] = [
                copy[newIndex],
                copy[index],
            ];

            return copy;
        });
    }

    /* --------------------------------
       Submit
    --------------------------------- */

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");

        if (!canSubmit) {
            setError(
                "Please complete all required fields and add at least one image."
            );
            return;
        }

        try {
            setLoading(true);

            const apiUrl =
                process.env.NEXT_PUBLIC_API_URL;

            if (!apiUrl) {
                throw new Error(
                    "NEXT_PUBLIC_API_URL is not configured."
                );
            }

            /*
             * Step 1:
             * Create listing.
             *
             * Image upload can later be handled through
             * your Listing/Storage service.
             */

            const formData = new FormData();

            formData.append("title", title.trim());
            formData.append(
                "description",
                description.trim()
            );
            formData.append("price", price);
            formData.append("category", category);
            formData.append("condition", condition);
            formData.append("location", location.trim());

            images.forEach((image) => {
                formData.append("images", image.file);
            });

            const response = await fetch(
                `${apiUrl}/listings`,
                {
                    method: "POST",
                    credentials: "include",
                    body: formData,
                }
            );

            const data = await response
                .json()
                .catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to create listing."
                );
            }

            /*
             * Listing service should return:
             * {
             *   listing: {
             *     id: "..."
             *   }
             * }
             */

            const listingId =
                data.listing?.id || data.id;

            if (listingId) {
                window.location.href = `/listings/${listingId}`;
            } else {
                window.location.href = "/listings";
            }
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Something went wrong."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-neutral-50">
            {/* Header */}
            <div className="border-b border-neutral-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
                    <div>
                        <Link
                            href="/"
                            className="text-sm font-semibold"
                        >
                            ← MarketX
                        </Link>

                        <h1 className="mt-3 text-2xl font-bold tracking-tight">
                            Create a listing
                        </h1>

                        <p className="mt-1 text-sm text-neutral-500">
                            Sell your item to buyers on MarketX.
                        </p>
                    </div>

                    <div className="hidden text-right sm:block">
                        <p className="text-xs text-neutral-400">
                            Step
                        </p>

                        <p className="text-sm font-semibold">
                            Create listing
                        </p>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <form
                    onSubmit={handleSubmit}
                    className="grid gap-8 lg:grid-cols-[1fr_360px]"
                >
                    {/* --------------------------------
              Main Form
          --------------------------------- */}

                    <div className="space-y-6">
                        {/* Images */}
                        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                            <SectionHeader
                                number="01"
                                title="Photos"
                                description="Add up to 8 clear photos."
                            />

                            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {images.map((image, index) => (
                                    <div
                                        key={image.preview}
                                        className="group relative aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100"
                                    >
                                        <img
                                            src={image.preview}
                                            alt={`Listing image ${index + 1}`}
                                            className="h-full w-full object-cover"
                                        />

                                        {index === 0 && (
                                            <span className="absolute left-2 top-2 rounded-md bg-black px-2 py-1 text-[10px] font-semibold text-white">
                                                Cover
                                            </span>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeImage(index)
                                            }
                                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-black shadow transition hover:bg-black hover:text-white"
                                            aria-label="Remove image"
                                        >
                                            ×
                                        </button>

                                        <div className="absolute bottom-2 left-2 right-2 hidden gap-1 group-hover:flex">
                                            <button
                                                type="button"
                                                disabled={index === 0}
                                                onClick={() =>
                                                    moveImage(
                                                        index,
                                                        "left"
                                                    )
                                                }
                                                className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-xs shadow disabled:opacity-30"
                                            >
                                                ←
                                            </button>

                                            <button
                                                type="button"
                                                disabled={
                                                    index ===
                                                    images.length - 1
                                                }
                                                onClick={() =>
                                                    moveImage(
                                                        index,
                                                        "right"
                                                    )
                                                }
                                                className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-xs shadow disabled:opacity-30"
                                            >
                                                →
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {images.length < 8 && (
                                    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 transition hover:border-black hover:bg-white">
                                        <UploadIcon />

                                        <span className="mt-2 text-xs font-semibold">
                                            Add photos
                                        </span>

                                        <span className="mt-1 text-[10px] text-neutral-400">
                                            Max 5MB each
                                        </span>

                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            multiple
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>

                            <p className="mt-4 text-xs text-neutral-400">
                                The first photo will be used as your
                                listing cover.
                            </p>
                        </section>

                        {/* Basic Information */}
                        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                            <SectionHeader
                                number="02"
                                title="Basic information"
                                description="Tell buyers what you're selling."
                            />

                            <div className="mt-6 space-y-5">
                                <Field
                                    label="Title"
                                    required
                                    hint="Keep it short and descriptive."
                                >
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) =>
                                            setTitle(e.target.value)
                                        }
                                        maxLength={100}
                                        placeholder="e.g. iPhone 15 Pro 256GB"
                                        className={inputClass}
                                    />

                                    <CharacterCount
                                        current={title.length}
                                        max={100}
                                    />
                                </Field>

                                <Field
                                    label="Description"
                                    required
                                    hint="Include important details, defects and what's included."
                                >
                                    <textarea
                                        value={description}
                                        onChange={(e) =>
                                            setDescription(
                                                e.target.value
                                            )
                                        }
                                        maxLength={2000}
                                        rows={6}
                                        placeholder="Describe your item..."
                                        className="w-full resize-none rounded-lg border border-neutral-300 px-3.5 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
                                    />

                                    <CharacterCount
                                        current={description.length}
                                        max={2000}
                                    />

                                    {remainingCharacters < 100 && (
                                        <p className="mt-1 text-xs text-neutral-400">
                                            {remainingCharacters} characters
                                            remaining
                                        </p>
                                    )}
                                </Field>
                            </div>
                        </section>

                        {/* Price / Category */}
                        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                            <SectionHeader
                                number="03"
                                title="Pricing & category"
                                description="Help buyers find your listing."
                            />

                            <div className="mt-6 grid gap-5 sm:grid-cols-2">
                                <Field label="Price" required>
                                    <div className="flex h-11 overflow-hidden rounded-lg border border-neutral-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black">
                                        <span className="flex items-center border-r border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-500">
                                            ₹
                                        </span>

                                        <input
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={price}
                                            onChange={(e) =>
                                                setPrice(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="25000"
                                            className="w-full px-3 text-sm outline-none"
                                        />
                                    </div>
                                </Field>

                                <Field
                                    label="Category"
                                    required
                                >
                                    <select
                                        value={category}
                                        onChange={(e) =>
                                            setCategory(
                                                e.target.value
                                            )
                                        }
                                        className={selectClass}
                                    >
                                        <option value="">
                                            Select category
                                        </option>

                                        {categories.map(
                                            (item) => (
                                                <option
                                                    key={item}
                                                    value={item}
                                                >
                                                    {item}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </Field>

                                <Field
                                    label="Condition"
                                    required
                                >
                                    <select
                                        value={condition}
                                        onChange={(e) =>
                                            setCondition(
                                                e.target.value
                                            )
                                        }
                                        className={selectClass}
                                    >
                                        <option value="">
                                            Select condition
                                        </option>

                                        {conditions.map(
                                            (item) => (
                                                <option
                                                    key={item}
                                                    value={item}
                                                >
                                                    {item}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </Field>

                                <Field
                                    label="Location"
                                    required
                                >
                                    <div className="relative">
                                        <LocationIcon />

                                        <input
                                            type="text"
                                            value={location}
                                            onChange={(e) =>
                                                setLocation(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="City, State"
                                            className={`${inputClass} pl-10`}
                                        />
                                    </div>
                                </Field>
                            </div>
                        </section>

                        {/* Error */}
                        {error && (
                            <div
                                role="alert"
                                className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700"
                            >
                                <div className="flex gap-3">
                                    <ErrorIcon />
                                    <span>{error}</span>
                                </div>
                            </div>
                        )}

                        {/* Mobile Submit */}
                        <button
                            type="submit"
                            disabled={loading || !canSubmit}
                            className="flex h-12 w-full items-center justify-center rounded-xl bg-black px-5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40 lg:hidden"
                        >
                            {loading
                                ? "Publishing..."
                                : "Publish listing"}
                        </button>
                    </div>

                    {/* --------------------------------
              Preview / Submit
          --------------------------------- */}

                    <aside className="lg:sticky lg:top-24 lg:h-fit">
                        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
                            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                                Preview
                            </p>

                            <div className="mt-5 overflow-hidden rounded-xl border border-neutral-200">
                                <div className="aspect-[4/3] bg-neutral-100">
                                    {images[0] ? (
                                        <img
                                            src={images[0].preview}
                                            alt="Listing preview"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full flex-col items-center justify-center text-neutral-400">
                                            <ImageIcon />

                                            <span className="mt-2 text-xs">
                                                Add a photo
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4">
                                    <p className="text-lg font-bold">
                                        {price
                                            ? `₹${Number(price).toLocaleString(
                                                "en-IN"
                                            )}`
                                            : "₹ —"}
                                    </p>

                                    <h3 className="mt-1 truncate text-sm font-semibold">
                                        {title ||
                                            "Your listing title"}
                                    </h3>

                                    <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
                                        <span>
                                            {condition ||
                                                "Condition"}
                                        </span>

                                        <span>
                                            {location ||
                                                "Location"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 border-t border-neutral-200 pt-5">
                                <div className="space-y-3 text-xs">
                                    <SummaryRow
                                        label="Photos"
                                        value={`${images.length}/8`}
                                    />

                                    <SummaryRow
                                        label="Category"
                                        value={
                                            category || "Not selected"
                                        }
                                    />

                                    <SummaryRow
                                        label="Condition"
                                        value={
                                            condition || "Not selected"
                                        }
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !canSubmit}
                                className="mt-6 hidden h-12 w-full items-center justify-center rounded-xl bg-black px-5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40 lg:flex"
                            >
                                {loading
                                    ? "Publishing..."
                                    : "Publish listing"}
                            </button>

                            <p className="mt-4 text-center text-[11px] leading-5 text-neutral-400">
                                By publishing, you agree to MarketX's
                                terms and marketplace guidelines.
                            </p>
                        </div>
                    </aside>
                </form>
            </div>
        </main>
    );
}

/* --------------------------------
   Components
--------------------------------- */

function SectionHeader({
    number,
    title,
    description,
}: {
    number: string;
    title: string;
    description: string;
}) {
    return (
        <div className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black text-xs font-bold text-white">
                {number}
            </span>

            <div>
                <h2 className="text-base font-bold">
                    {title}
                </h2>

                <p className="mt-1 text-xs text-neutral-500">
                    {description}
                </p>
            </div>
        </div>
    );
}

function Field({
    label,
    required,
    hint,
    children,
}: {
    label: string;
    required?: boolean;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium">
                    {label}
                    {required && (
                        <span className="ml-1 text-neutral-400">
                            *
                        </span>
                    )}
                </label>

                {hint && (
                    <span className="hidden text-xs text-neutral-400 sm:block">
                        {hint}
                    </span>
                )}
            </div>

            {children}
        </div>
    );
}

function CharacterCount({
    current,
    max,
}: {
    current: number;
    max: number;
}) {
    return (
        <p className="mt-1 text-right text-[10px] text-neutral-400">
            {current}/{max}
        </p>
    );
}

function SummaryRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex justify-between gap-4">
            <span className="text-neutral-400">
                {label}
            </span>

            <span className="max-w-40 truncate text-right font-medium">
                {value}
            </span>
        </div>
    );
}

/* --------------------------------
   Styles
--------------------------------- */

const inputClass =
    "h-11 w-full rounded-lg border border-neutral-300 px-3.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-black focus:ring-1 focus:ring-black";

const selectClass =
    "h-11 w-full rounded-lg border border-neutral-300 bg-white px-3.5 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black";

/* --------------------------------
   Icons
--------------------------------- */

function UploadIcon() {
    return (
        <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
        >
            <path d="M12 16V4" />
            <path d="m7 9 5-5 5 5" />
            <path d="M5 20h14" />
        </svg>
    );
}

function ImageIcon() {
    return (
        <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
        >
            <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
            />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
        </svg>
    );
}

function LocationIcon() {
    return (
        <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="absolute left-3 top-3 text-neutral-400"
        >
            <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
            <circle cx="12" cy="10" r="2.5" />
        </svg>
    );
}

function ErrorIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="shrink-0"
        >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
        </svg>
    );
}