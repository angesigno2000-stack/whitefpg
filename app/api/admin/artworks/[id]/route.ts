export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  CATEGORIES,
  Category,
  deleteArtwork,
  getArtworkById,
  updateArtwork,
} from "@/lib/db";
import { deleteOriginalAndCache } from "@/lib/images";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const existing = getArtworkById(params.id);
  if (!existing) {
    return NextResponse.json({ error: "Artwork non trovato" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const input: Record<string, unknown> = {};

  if (typeof body.title === "string") input.title = body.title.trim();
  if (typeof body.category === "string") {
    if (!CATEGORIES.includes(body.category as Category)) {
      return NextResponse.json({ error: "Categoria non valida" }, { status: 400 });
    }
    input.category = body.category;
  }
  if (typeof body.year === "number") input.year = body.year;
  if (typeof body.description === "string") input.description = body.description;
  if (Array.isArray(body.tags)) input.tags = body.tags.map(String);
  if (typeof body.featured === "boolean") input.featured = body.featured;
  if (typeof body.published === "boolean") input.published = body.published;
  if (typeof body.sortOrder === "number") input.sortOrder = body.sortOrder;

  const updated = updateArtwork(params.id, input);
  return NextResponse.json({ artwork: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const existing = getArtworkById(params.id);
  if (!existing) {
    return NextResponse.json({ error: "Artwork non trovato" }, { status: 404 });
  }

  await deleteOriginalAndCache(existing.id, existing.originalFile);
  deleteArtwork(params.id);

  return NextResponse.json({ ok: true });
}
