import Link from "next/link";
import WatermarkedImage from "./WatermarkedImage";
import type { Artwork } from "@/lib/types";

export default function FeaturedStrip({ artworks }: { artworks: Artwork[] }) {
  if (artworks.length === 0) {
    return (
      <section className="px-6 md:px-12 py-24 border-b border-hairline">
        <p className="text-ash text-sm max-w-md">
          L&apos;archivio è in costruzione. Le prime opere pubblicate
          appariranno qui e nello showroom.
        </p>
      </section>
    );
  }

  return (
    <section className="px-6 md:px-12 py-20 md:py-28 border-b border-hairline">
      <div className="flex items-baseline justify-between mb-10">
        <h2 className="text-sm tracking-wider2 text-ash">SELEZIONE</h2>
        <Link
          href="/showroom"
          className="text-xs tracking-wider2 text-ash hover:text-bone transition-colors"
        >
          Vedi tutto lo showroom
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {artworks.slice(0, 4).map((artwork) => (
          <Link
            key={artwork.id}
            href={`/showroom?piece=${artwork.slug}`}
            className="group block"
          >
            <div className="overflow-hidden bg-charcoal">
              <div className="transition-transform duration-700 ease-cinematic group-hover:scale-[1.03]">
                <WatermarkedImage
                  id={artwork.id}
                  variant="thumb"
                  alt={artwork.title}
                  aspectRatio={artwork.width / artwork.height || 1}
                />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-sm text-bone">{artwork.title}</span>
              <span className="text-xs text-ash">{artwork.year}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
