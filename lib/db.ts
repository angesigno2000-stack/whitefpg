import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";
import { Category, CATEGORIES, Artwork } from "./types";

export { CATEGORIES };
export type { Category, Artwork };

const DATA_DIR = path.join(process.cwd(), "storage");
const DB_PATH = path.join(DATA_DIR, "showroom.db");

// Singleton across hot reloads in dev; lazy-initialized so importing this
// module (e.g. during `next build`'s page-data collection) never touches
// the real database file on disk.
const globalForDb = globalThis as unknown as { __wfpgDb?: Database.Database };

function ensureDb(): Database.Database {
  if (globalForDb.__wfpgDb) return globalForDb.__wfpgDb;

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const instance = new Database(DB_PATH);
  instance.pragma("journal_mode = WAL");
  instance.pragma("busy_timeout = 10000");

  instance.exec(`
CREATE TABLE IF NOT EXISTS artworks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'OTHER',
  year INTEGER NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '[]',
  featured INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 0,
  sortOrder INTEGER NOT NULL DEFAULT 0,
  originalFile TEXT NOT NULL,
  images TEXT NOT NULL DEFAULT '[]',
  width INTEGER NOT NULL DEFAULT 0,
  height INTEGER NOT NULL DEFAULT 0,
  dateAdded TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token TEXT PRIMARY KEY,
  createdAt TEXT NOT NULL,
  expiresAt TEXT NOT NULL
);
`);

  // Migrazione: se il DB esisteva già prima dell'introduzione di "images",
  // la colonna non viene creata dal CREATE TABLE IF NOT EXISTS qui sopra.
  const columns = instance
    .prepare(`PRAGMA table_info(artworks)`)
    .all() as { name: string }[];
  const hasImages = columns.some((c) => c.name === "images");
  if (!hasImages) {
    instance.exec(
      `ALTER TABLE artworks ADD COLUMN images TEXT NOT NULL DEFAULT '[]'`
    );
  }

  globalForDb.__wfpgDb = instance;
  if (process.env.NODE_ENV !== "production") globalForDb.__wfpgDb = instance;
  return instance;
}

export const db: Database.Database = new Proxy({} as Database.Database, {
  get(_target, prop, receiver) {
    const real = ensureDb();
    const value = Reflect.get(real, prop, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
}) as Database.Database;

type Row = Omit<Artwork, "tags" | "featured" | "published" | "images"> & {
  tags: string;
  featured: number;
  published: number;
  images: string;
};

function rowToArtwork(row: Row): Artwork {
  return {
    ...row,
    tags: JSON.parse(row.tags || "[]"),
    images: JSON.parse(row.images || "[]"),
    featured: !!row.featured,
    published: !!row.published,
  };
}

function slugify(title: string, id: string) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base || "artwork"}-${id.slice(0, 6)}`;
}

export function listArtworks(opts: { onlyPublished?: boolean } = {}): Artwork[] {
  const rows = opts.onlyPublished
    ? db
        .prepare(
          `SELECT * FROM artworks WHERE published = 1 ORDER BY sortOrder ASC, dateAdded DESC`
        )
        .all()
    : db.prepare(`SELECT * FROM artworks ORDER BY sortOrder ASC, dateAdded DESC`).all();
  return (rows as Row[]).map(rowToArtwork);
}

export function getArtworkById(id: string): Artwork | null {
  const row = db.prepare(`SELECT * FROM artworks WHERE id = ?`).get(id) as Row | undefined;
  return row ? rowToArtwork(row) : null;
}

export function getArtworkBySlug(slug: string): Artwork | null {
  const row = db.prepare(`SELECT * FROM artworks WHERE slug = ?`).get(slug) as Row | undefined;
  return row ? rowToArtwork(row) : null;
}

export interface CreateArtworkInput {
  title: string;
  category: Category;
  year: number;
  description: string;
  tags: string[];
  featured: boolean;
  published: boolean;
  originalFile: string;
  images: string[];
  width: number;
  height: number;
}

export function createArtwork(input: CreateArtworkInput): Artwork {
  const id = nanoid(10);
  const now = new Date().toISOString();
  const maxOrder = db
    .prepare(`SELECT COALESCE(MAX(sortOrder), -1) as m FROM artworks`)
    .get() as { m: number };

  const artwork: Artwork = {
    id,
    title: input.title,
    slug: slugify(input.title, id),
    category: input.category,
    year: input.year,
    description: input.description,
    tags: input.tags,
    featured: input.featured,
    published: input.published,
    sortOrder: maxOrder.m + 1,
    originalFile: input.originalFile,
    images: input.images,
    width: input.width,
    height: input.height,
    dateAdded: now,
    updatedAt: now,
  };

  db.prepare(
    `INSERT INTO artworks
      (id, title, slug, category, year, description, tags, featured, published, sortOrder, originalFile, images, width, height, dateAdded, updatedAt)
     VALUES (@id, @title, @slug, @category, @year, @description, @tags, @featured, @published, @sortOrder, @originalFile, @images, @width, @height, @dateAdded, @updatedAt)`
  ).run({
    ...artwork,
    tags: JSON.stringify(artwork.tags),
    images: JSON.stringify(artwork.images),
    featured: artwork.featured ? 1 : 0,
    published: artwork.published ? 1 : 0,
  });

  return artwork;
}

export interface UpdateArtworkInput {
  title?: string;
  category?: Category;
  year?: number;
  description?: string;
  tags?: string[];
  featured?: boolean;
  published?: boolean;
  sortOrder?: number;
  images?: string[];
}

export function updateArtwork(id: string, input: UpdateArtworkInput): Artwork | null {
  const existing = getArtworkById(id);
  if (!existing) return null;

  const merged: Artwork = {
    ...existing,
    ...input,
    tags: input.tags ?? existing.tags,
    images: input.images ?? existing.images,
    updatedAt: new Date().toISOString(),
  };

  db.prepare(
    `UPDATE artworks SET title=@title, category=@category, year=@year, description=@description,
      tags=@tags, featured=@featured, published=@published, sortOrder=@sortOrder, images=@images, updatedAt=@updatedAt
     WHERE id=@id`
  ).run({
    ...merged,
    tags: JSON.stringify(merged.tags),
    images: JSON.stringify(merged.images),
    featured: merged.featured ? 1 : 0,
    published: merged.published ? 1 : 0,
  });

  return merged;
}

export function deleteArtwork(id: string): void {
  db.prepare(`DELETE FROM artworks WHERE id = ?`).run(id);
}

export function reorderArtworks(orderedIds: string[]): void
 {
  const stmt = db.prepare(`UPDATE artworks SET sortOrder = ? WHERE id = ?`);
  const tx = db.transaction((ids: string[]) => {
    ids.forEach((id, index) => stmt.run(index, id));
  });
  tx(orderedIds);
}
