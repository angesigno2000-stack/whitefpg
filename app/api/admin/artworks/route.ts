export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { CATEGORIES, Category, createArtwork, listArtworks } from "@/lib/db";
import { saveOriginal } from "@/lib/images";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  const artworks = listArtworks();
  return NextResponse.json({ artworks });
}

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const title = String(form.get("title") || "").trim();
  const category = String(form.get("category") || "OTHER") as Category;
  const year = parseInt(String(form.get("year") || new Date().getFullYear()), 10);
  const description = String(form.get("description") || "");
  const tagsRaw = String(form.get("tags") || "");
  const featured = String(form.get("featured") || "false") === "true";
  const published = String(form.get("published") || "false") === "true";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File immagine mancante" }, { status: 400 });
  }
  if (!title) {
    return NextResponse.json({ error: "Titolo obbligatorio" }, { status: 400 });
  }
  if (!CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "Categoria non valida" }, { status: 400 });
  }
  const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Formato non supportato. Usa PNG, JPG o WebP." },
      { status: 400 }
    );
  }
  if (file.size > 60 * 1024 * 1024) {
    return NextResponse.json({ error: "File troppo grande (max 60MB)" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { storedName, width, height } = await saveOriginal(buffer, file.name);

  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const artwork = createArtwork({
    title,
    category,
    year: Number.isFinite(year) ? year : new Date().getFullYear(),
    description,
    tags,
    featured,
    published,
    originalFile: storedName,
    width,
    height,
  });

  return NextResponse.json({ artwork }, { status: 201 });
}
