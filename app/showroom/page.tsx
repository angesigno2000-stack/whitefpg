import { Suspense } from "react";
import { listArtworks } from "@/lib/db";
import type { PublicArtwork } from "@/lib/types";
import ShowroomClient from "@/components/ShowroomClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Showroom — WHITE F.P.G",
};

export default function ShowroomPage() {
  const artworks = listArtworks({ onlyPublished: true });

  const payload: PublicArtwork[] = artworks.map((a, i) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    category: a.category,
    year: a.year,
    description: a.description,
    tags: a.tags,
    featured: a.featured,
    number: i + 1,
    total: artworks.length,
    width: a.width,
    height: a.height,
    dateAdded: a.dateAdded,
  }));

  return (
    <main className="min-h-screen">
      <Suspense fallback={null}>
        <ShowroomClient artworks={payload} />
      </Suspense>
    </main>
  );
}
