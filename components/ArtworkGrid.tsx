"use client";

import WatermarkedImage from "./WatermarkedImage";
import type { PublicArtwork } from "@/lib/types";

interface ArtworkGridProps {
  artworks: PublicArtwork[];
  onSelect: (slug: string) => void;
}

export default function ArtworkGrid({ artworks, onSelect }: ArtworkGridProps) {
  if (artworks.length === 0) {
    return (
      <div className="px-6 md:px-12 py-32 text-center">
        <p className="text-ash text-sm">
          Nessuna opera corrisponde ai filtri selezionati.
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-12 py-10 masonry-columns columns-2 md:columns-3 xl:columns-4">
      {artworks.map((artwork) => (
        <button
          key={artwork.id}
          onClick={() => onSelect(artwork.slug)}
          className="masonry-item group block w-full text-left"
        >
          <div className="relative overflow-hidden bg-charcoal">
            <div className="transition-transform duration-700 ease-cinematic group-hover:scale-[1.02]">
              <WatermarkedImage
                id={artwork.id}
                variant="thumb"
                alt={artwork.title}
                aspectRatio={artwork.width / artwork.height || undefined}
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>

            <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/70 via-transparent to-transparent">
              <span className="text-[11px] tracking-wider2 text-bone">
                {String(artwork.number).padStart(3, "0")} /{" "}
                {String(artwork.total).padStart(3, "0")}
              </span>
            </div>

            {artwork.featured && (
              <span className="absolute top-3 left-3 text-[10px] tracking-wider2 text-bone/80 border border-bone/30 px-2 py-0.5">
                FEATURED
              </span>
            )}
          </div>

          <div className="mt-3 flex items-baseline justify-between gap-2">
            <span className="text-sm text-bone truncate">{artwork.title}</span>
            <span className="text-xs text-ash shrink-0">{artwork.year}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
