import Hero from "@/components/Hero";
import FeaturedStrip from "@/components/FeaturedStrip";
import { listArtworks } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const all = listArtworks({ onlyPublished: true });
  const featured = all.filter((a) => a.featured);
  const picks = featured.length > 0 ? featured : all;

  return (
    <main>
      <Hero />
      <FeaturedStrip artworks={picks} />
      <footer className="px-6 md:px-12 py-10 flex items-center justify-between text-xs text-ash tracking-wider2">
        <span>WHITE F.P.G &copy; 2026</span>
        <span>{all.length} opere in archivio</span>
      </footer>
    </main>
  );
}
