export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getArtworkById } from "@/lib/db";
import { ensureVariant, ensureDetailVariant, Variant, DetailIndex } from "@/lib/images";
import { verifyAdminRequest } from "@/lib/auth";

const PUBLIC_VARIANTS: Variant[] = ["thumb", "preview"];
const ADMIN_ONLY_VARIANTS: Variant[] = ["admin-preview"];

function parseDetailIndex(variant: string): DetailIndex | null {
  const match = /^detail([0-2])$/.exec(variant);
  if (!match) return null;
  return Number(match[1]) as DetailIndex;
}

export async function GET(
  req: Request,
  { params }: { params: { id: string; variant: string } }
) {
  const artwork = getArtworkById(params.id);
  if (!artwork) {
    return NextResponse.json({ error: "Artwork non trovato" }, { status: 404 });
  }

  const detailIndex = parseDetailIndex(params.variant);
  const variant = detailIndex === null ? (params.variant as Variant) : "preview";

  const isPublicVariant = detailIndex !== null || PUBLIC_VARIANTS.includes(variant);
  const isAdminVariant = detailIndex === null && ADMIN_ONLY_VARIANTS.includes(variant);

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

  let buffer: Buffer;
  let contentType: string;

  if (detailIndex !== null) {
    // Dettaglio auto-generato: usa sempre l'unica foto disponibile.
    const sourceFile = artwork.images[0] || artwork.originalFile;
    ({ buffer, contentType } = await ensureDetailVariant(
      artwork.id,
      sourceFile,
      detailIndex
    ));
  } else {
    const url = new URL(req.url);
    const indexParam = url.searchParams.get("i");
    const index = indexParam ? parseInt(indexParam, 10) : 0;
    const sourceFile =
      (Number.isFinite(index) && artwork.images[index]) || artwork.originalFile;

    // Cache dedicata per indice, così le foto della galleria non
    // si sovrascrivono a vicenda in cache.
    const cacheId = index > 0 ? `${artwork.id}_${index}` : artwork.id;

    ({ buffer, contentType } = await ensureVariant(cacheId, sourceFile, variant));
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=31536000, immutable",
      "Content-Disposition": "inline",
    },
  });
}
