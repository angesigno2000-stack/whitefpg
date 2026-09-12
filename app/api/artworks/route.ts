import { NextResponse } from "next/server";
import { listArtworks } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const artworks = listArtworks({ onlyPublished: true });

  const payload = artworks.map((a, index) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    category: a.category,
    year: a.year,
    description: a.description,
    tags: a.tags,
    featured: a.featured,
    number: index + 1,
    total: artworks.length,
    width: a.width,
    height: a.height,
    dateAdded: a.dateAdded,
  }));

  return NextResponse.json({ artworks: payload, total: artworks.length });
}
