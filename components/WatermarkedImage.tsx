"use client";

import { useState } from "react";

interface WatermarkedImageProps {
  id: string;
  variant: "thumb" | "preview";
  alt: string;
  className?: string;
  aspectRatio?: number;
  sizes?: string;
  priority?: boolean;
}

export default function WatermarkedImage({
  id,
  variant,
  alt,
  className = "",
  aspectRatio,
  sizes,
  priority,
}: WatermarkedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const src = `/api/img/${id}/${variant}`;

  return (
    <div
      className="protected-image-wrapper w-full h-full"
      style={aspectRatio ? { aspectRatio: String(aspectRatio) } : undefined}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        sizes={sizes}
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        onLoad={() => setLoaded(true)}
        className={`protected-image w-full h-full object-cover transition-opacity duration-700 ease-cinematic ${
          loaded ? "opacity-100" : "opacity-0"
        } ${className}`}
      />
      {!loaded && <div className="absolute inset-0 bg-charcoal animate-pulse" />}
      {/* scudo trasparente: assorbe long-press / drag senza bloccare lo scroll */}
      <div
        className="protected-image-shield"
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}
