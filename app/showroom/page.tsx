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

  const payload: PublicArtwork[] = artworks.map((a, i) => {
    // Più foto caricate: ogni foto entra in galleria (indice nel campo "images").
    // Una sola foto: la galleria mostra 3 dettagli zoomati auto-generati.
    const gallery =
      a.images.length > 1
        ? a.images.map((_, idx) => `/api/img/${a.id}/preview?i=${idx}`)
        : [`/api/img/${a.id}/preview`, ...[0, 1, 2].map((idx) => `/api/img/${a.id}/detail${idx}`)];

    return {
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
      image: `/api/img/${a.id}/thumb`,
      gallery,
      width: a.width,
      height: a.height,
      dateAdded: a.dateAdded,
    };
  });

  return (
    <main className="min-h-screen">
      <Suspense fallback={null}>
        <ShowroomClient artworks={payload} />
      </Suspense>
    </main>
  );
}
