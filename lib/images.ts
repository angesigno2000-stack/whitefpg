import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import fsSync from "fs";

const STORAGE_DIR = path.join(process.cwd(), "storage");
export const ORIGINALS_DIR = path.join(STORAGE_DIR, "originals");
const CACHE_DIR = path.join(STORAGE_DIR, "cache");

for (const dir of [ORIGINALS_DIR, CACHE_DIR]) {
  if (!fsSync.existsSync(dir)) fsSync.mkdirSync(dir, { recursive: true });
}

export type Variant = "thumb" | "preview" | "admin-preview";

const VARIANT_CONFIG: Record<
  Variant,
  { width: number; quality: number; watermark: boolean }
> = {
  // griglia showroom
  thumb: { width: 900, quality: 78, watermark: true },
  // viewer fullscreen
  preview: { width: 2400, quality: 85, watermark: true },
  // anteprima admin prima della pubblicazione: nessun watermark, ma comunque non l'originale grezzo
  "admin-preview": { width: 1600, quality: 82, watermark: false },
};

const WATERMARK_TEXT = "WHITE F.P.G \u00A9 2026";

function buildWatermarkSvg(width: number, height: number): Buffer {
  // Pattern ripetuto, discreto, ruotato leggermente: difficile da rimuovere in modo pulito
  // senza intaccare l'immagine, ma non invasivo sulla lettura visiva dell'opera.
  const tile = Math.max(260, Math.round(width / 4));
  const fontSize = Math.max(14, Math.round(width / 90));
  const cols = Math.ceil(width / tile) + 2;
  const rows = Math.ceil(height / tile) + 2;

  let texts = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * tile - tile / 2;
      const y = r * tile - tile / 2;
      texts += `<text x="${x}" y="${y}" font-family="Helvetica, Arial, sans-serif" font-size="${fontSize}" fill="rgba(255,255,255,0.14)" letter-spacing="2">${WATERMARK_TEXT}</text>`;
    }
  }

  const svg = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <g transform="rotate(-28, ${width / 2}, ${height / 2})">
      ${texts}
    </g>
    <text x="${width - 16}" y="${height - 16}" text-anchor="end"
      font-family="Helvetica, Arial, sans-serif" font-size="${Math.max(16, Math.round(width / 60))}"
      fill="rgba(255,255,255,0.55)" letter-spacing="1.5">${WATERMARK_TEXT}</text>
  </svg>`;

  return Buffer.from(svg);
}

function cachePath(id: string, variant: Variant, ext: string) {
  return path.join(CACHE_DIR, `${id}-${variant}.${ext}`);
}

export async function ensureVariant(
  id: string,
  originalFile: string,
  variant: Variant
): Promise<{ buffer: Buffer; contentType: string }> {
  const outPath = cachePath(id, variant, "webp");

  if (fsSync.existsSync(outPath)) {
    const buffer = await fs.readFile(outPath);
    return { buffer, contentType: "image/webp" };
  }

  const originalPath = path.join(ORIGINALS_DIR, originalFile);
  const config = VARIANT_CONFIG[variant];

  let pipeline = sharp(originalPath).rotate().resize({
    width: config.width,
    withoutEnlargement: true,
  });

  if (config.watermark) {
    const meta = await sharp(originalPath)
      .rotate()
      .resize({ width: config.width, withoutEnlargement: true })
      .toBuffer({ resolveWithObject: true });

    const { width, height } = meta.info;
    const svg = buildWatermarkSvg(width, height);

    pipeline = sharp(meta.data).composite([{ input: svg, top: 0, left: 0 }]);
  }

  const buffer = await pipeline.webp({ quality: config.quality }).toBuffer();
  await fs.writeFile(outPath, buffer);

  return { buffer, contentType: "image/webp" };
}

export async function saveOriginal(
  fileBuffer: Buffer,
  filename: string
): Promise<{ storedName: string; width: number; height: number }> {
  const ext = path.extname(filename).toLowerCase() || ".png";
  const storedName = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}${ext}`;
  const dest = path.join(ORIGINALS_DIR, storedName);

  const meta = await sharp(fileBuffer).metadata();
  await fs.writeFile(dest, fileBuffer);

  return {
    storedName,
    width: meta.width || 0,
    height: meta.height || 0,
  };
}

export async function deleteOriginalAndCache(id: string, originalFile: string) {
  const originalPath = path.join(ORIGINALS_DIR, originalFile);
  if (fsSync.existsSync(originalPath)) await fs.unlink(originalPath);

  for (const variant of Object.keys(VARIANT_CONFIG) as Variant[]) {
    const p = cachePath(id, variant, "webp");
    if (fsSync.existsSync(p)) await fs.unlink(p);
  }
}
