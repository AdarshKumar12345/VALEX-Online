"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface ListingGalleryProps {
  images: string[];
  title: string;
}

export default function ListingGallery({
  images,
  title,
}: ListingGalleryProps) {
  const validImages = images && images.length > 0 ? images : [];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const nextImage = useCallback(() => {
    if (validImages.length <= 1) return;
    setSelectedIndex((prev) => (prev + 1) % validImages.length);
  }, [validImages.length]);

  const prevImage = useCallback(() => {
    if (validImages.length <= 1) return;
    setSelectedIndex(
      (prev) => (prev - 1 + validImages.length) % validImages.length
    );
  }, [validImages.length]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape" && isLightboxOpen) setIsLightboxOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextImage, prevImage, isLightboxOpen]);

  if (validImages.length === 0) {
    return (
      <div className="flex aspect-4/3 sm:aspect-square w-full items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400 border border-neutral-200">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-neutral-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
          <span className="mt-2 block text-xs font-medium">No images available</span>
        </div>
      </div>
    );
  }

  const currentImage = validImages[selectedIndex];

  return (
    <div className="space-y-3">
      {/* Main image viewport */}
      <div className="group relative aspect-4/3 sm:aspect-square w-full overflow-hidden rounded-2xl bg-neutral-100 border border-neutral-200">
        <Image
          src={currentImage}
          alt={`${title} - Image ${selectedIndex + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 600px"
          className="object-cover cursor-zoom-in transition duration-300 group-hover:scale-102"
          onClick={() => setIsLightboxOpen(true)}
        />

        {/* Counter Badge */}
        {validImages.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-md bg-black/75 backdrop-blur-xs px-2.5 py-1 text-xs font-semibold text-white">
            {selectedIndex + 1} / {validImages.length}
          </span>
        )}

        {/* Prev / Next controls */}
        {validImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-black shadow-md backdrop-blur-xs transition hover:bg-black hover:text-white"
            >
              ←
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-black shadow-md backdrop-blur-xs transition hover:bg-black hover:text-white"
            >
              →
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-none">
          {validImages.map((img, index) => (
            <button
              key={`${img}-${index}`}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`View image ${index + 1}`}
              className={`relative h-18 w-18 shrink-0 overflow-hidden rounded-xl border transition ${
                selectedIndex === index
                  ? "border-black ring-2 ring-black ring-offset-1"
                  : "border-neutral-200 opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt=""
                fill
                sizes="72px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 sm:p-8 backdrop-blur-md"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close fullscreen"
            className="absolute top-5 right-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
          >
            ✕
          </button>

          <div
            className="relative h-full max-h-[85vh] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={currentImage}
              alt={title}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {validImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/30 text-xl transition"
                aria-label="Previous image"
              >
                ←
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/30 text-xl transition"
                aria-label="Next image"
              >
                →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
