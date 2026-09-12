export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getArtworkById } from "@/lib/db";
import { ensureVariant, Variant } from "@/lib/images";
import { verifyAdminRequest } from "@/lib/auth";

const PUBLIC_VARIANTS: Variant[] = ["thumb", "preview"];
const ADMIN_ONLY_VARIANTS: Variant[] = ["admin-preview"];

export async function GET(
  req: Request,
  { params }: { params: { id: string; variant: string } }
) {
  const artwork = getArtworkById(params.id);
  if (!artwork) {
    return NextResponse.json({ error: "Artwork non trovato" }, { status: 404 });
  }

  const variant = params.variant as Variant;
  const isPublicVariant = PUBLIC_VARIANTS.includes(variant);
  const isAdminVariant = ADMIN_ONLY_VARIANTS.includes(variant);

  if (!isPublicVariant && !isAdminVariant) {
    return NextResponse.json({ error: "Variante non valida" }, { status: 400 });
  }

  // Le opere non pubblicate sono visibili solo all'admin autenticato.
  if (!artwork.published || isAdminVariant) {
    const isAdmin = await verifyAdminRequest(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }
  }

  const { buffer, contentType } = await ensureVariant(
    artwork.id,
    artwork.originalFile,
    variant
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=31536000, immutable",
      "Content-Disposition": "inline",
    },
  });
}
