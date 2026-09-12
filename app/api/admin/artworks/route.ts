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

  // Supporta sia il campo multiplo "files" (nuovo) sia il vecchio campo
  // singolo "file", per non rompere eventuali client già esistenti.
  const multiFiles = form.getAll("files").filter((f): f is File => f instanceof File);
  const singleFile = form.get("file");
  const files: File[] =
    multiFiles.length > 0
      ? multiFiles
      : singleFile instanceof File
      ? [singleFile]
      : [];

  const title = String(form.get("title") || "").trim();
  const category = String(form.get("category") || "OTHER") as Category;
  const year = parseInt(String(form.get("year") || new Date().getFullYear()), 10);
  const description = String(form.get("description") || "");
  const tagsRaw = String(form.get("tags") || "");
  const featured = String(form.get("featured") || "false") === "true";
  const published = String(form.get("published") || "false") === "true";

  if (files.length === 0) {
    return NextResponse.json({ error: "File immagine mancante" }, { status: 400 });
  }
  if (!title) {
    return NextResponse.json({ error: "Titolo obbligatorio" }, { status: 400 });
  }
  if (!CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "Categoria non valida" }, { status: 400 });
  }

  const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
  for (const file of files) {
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato non supportato. Usa PNG, JPG o WebP." },
        { status: 400 }
      );
    }
    if (file.size > 60 * 1024 * 1024) {
      return NextResponse.json({ error: "File troppo grande (max 60MB)" }, { status: 400 });
    }
  }

  // Salva tutti i file originali; il primo funge da copertina (originalFile)
  // e determina anche width/height "principali" dell'opera.
  const savedFiles: { storedName: string; width: number; height: number }[] = [];
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const saved = await saveOriginal(buffer, file.name);
    savedFiles.push(saved);
  }

  const [cover, ...rest] = savedFiles;
  const images = savedFiles.map((f) => f.storedName);

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
    originalFile: cover.storedName,
    images,
    width: cover.width,
    height: cover.height,
  });

  return NextResponse.json({ artwork }, { status: 201 });
}
