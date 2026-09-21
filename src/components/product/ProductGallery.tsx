"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/types/database";

interface Props {
  images: ProductImage[];
  productName: string;
}

export default function ProductGallery({ images, productName }: Props) {
  const [activeImage, setActiveImage] = useState(
    images[0]?.image_url || "/placeholder-photo.svg"
  );

  return (
    <div className="space-y-3">
      {/* Main Large Image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-[#F5EFE6]">
        <Image
          src={activeImage}
          alt={productName}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Thumbnails (only if multiple images) */}
      {images.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
          {images.map((img) => {
            const isSelected = activeImage === img.image_url;
            return (
              <button
                key={img.id}
                type="button"
                onClick={() => setActiveImage(img.image_url)}
                className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-foreground/30 opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.image_url}
                  alt={productName}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
