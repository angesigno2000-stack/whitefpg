"use client";

import { useEffect, useState, useCallback } from "react";
import WatermarkedImage from "./WatermarkedImage";
import type { PublicArtwork } from "@/lib/types";

interface ArtworkViewerProps {
  artworks: PublicArtwork[];
  activeSlug: string;
  onClose: () => void;
  onNavigate: (slug: string) => void;
}

export default function ArtworkViewer({
  artworks,
  activeSlug,
  onClose,
  onNavigate,
}: ArtworkViewerProps) {
  const [zoomed, setZoomed] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const index = artworks.findIndex((a) => a.slug === activeSlug);
  const artwork = artworks[index];

  useEffect(() => {
    setActiveImage(0);
  }, [activeSlug]);

  const goPrev = useCallback(() => {
    if (index > 0) {
      setZoomed(false);
      onNavigate(artworks[index - 1].slug);
    }
  }, [index, artworks, onNavigate]);

  const goNext = useCallback(() => {
    if (index < artworks.length - 1) {
      setZoomed(false);
      onNavigate(artworks[index + 1].slug);
    }
  }, [index, artworks, onNavigate]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, goPrev, goNext]);

  if (!artwork) return null;

  const mainImageSrc =
    artwork.gallery && artwork.gallery.length > 0
      ? artwork.gallery[activeImage] || artwork.gallery[0]
      : `/api/img/${artwork.id}/preview`;

  return (
    <div
      className="fixed inset-0 z-50 bg-black fpg-fade-in flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={`Visualizzatore opera: ${artwork.title}`}
    >
      <div className="flex items-center justify-between px-6 md:px-10 py-5 text-xs tracking-wider2 text-ash">
        <span>
          {String(artwork.number).padStart(3, "0")} /{" "}
          {String(artwork.total).padStart(3, "0")}
        </span>
        <button
          onClick={onClose}
          aria-label="Chiudi visualizzatore"
          className="text-bone hover:text-ash transition-colors text-sm"
        >
          ESC &nbsp; &times;
        </button>
      </div>

     
<div className="relative flex-1 min-h-0 flex flex-row items-stretch justify-center px-4 md:px-16 overflow-hidden gap-4 max-w-6xl mx-auto w-full">
<div className="relative flex-1 min-h-0 h-full flex items-center justify-center overflow-hidden">
          <button
            onClick={goPrev}
            disabled={index === 0}
            aria-label="Opera precedente"
            className="absolute left-2 md:left-6 z-10 text-bone/60 hover:text-bone disabled:opacity-0 transition-opacity text-3xl px-3 py-6"
          >
            &#8249;
          </button>

          <div
     className={`h-full max-h-full max-w-full transition-transform duration-500 ease-cinematic cursor-zoom-in ${
              zoomed ? "scale-150 cursor-zoom-out" : "scale-100"
            }`}
            onClick={() => setZoomed((z) => !z)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mainImageSrc}
              alt={artwork.title}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
              className="protected-image max-h-full max-w-full w-auto object-contain select-none"
            />
          </div>

          <button
            onClick={goNext}
            disabled={index === artworks.length - 1}
            aria-label="Opera successiva"
            className="absolute right-2 md:right-6 z-10 text-bone/60 hover:text-bone disabled:opacity-0 transition-opacity text-3xl px-3 py-6"
          >
            &#8250;
          </button>
        </div>

        {artwork.gallery && artwork.gallery.length > 1 && (
         <div className="flex flex-col gap-2 overflow-y-auto py-2 pr-1 w-16 md:w-20 shrink-0">
            {artwork.gallery.map((src, i) => (
              <button
                key={src + i}
                onClick={() => setActiveImage(i)}
                aria-label={`Mostra immagine ${i + 1}`}
                className={`w-14 h-14 md:w-16 md:h-16 shrink-0 border overflow-hidden transition-colors ${
                  i === activeImage
                    ? "border-bone"
                    : "border-hairline hover:border-ash"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Miniatura ${i + 1}`}
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {artwork.description && (
        <div className="px-6 md:px-10 pb-4 max-w-3xl mx-auto text-center">
          <p className="text-sm text-bone leading-relaxed">
            {artwork.description}
          </p>
        </div>
      )}

      <div className="px-6 md:px-10 py-6 flex items-baseline justify-between border-t border-hairline/60">
        <div>
          <h2 className="text-lg text-bone">{artwork.title}</h2>
          <p className="text-xs text-ash mt-1">
            {artwork.category} &middot; {artwork.year}
          </p>
        </div>
        {artwork.tags.length > 0 && (
          <div className="hidden md:flex gap-3 text-xs text-ash">
            {artwork.tags.slice(0, 5).map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
