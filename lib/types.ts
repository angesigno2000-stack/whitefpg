export type Category =
  | "PNG"
  | "COVERS"
  | "POSTERS"
  | "LOGOS"
  | "ARTWORK"
  | "OTHER";

export const CATEGORIES: Category[] = [
  "PNG",
  "COVERS",
  "POSTERS",
  "LOGOS",
  "ARTWORK",
  "OTHER",
];

export interface Artwork {
  id: string;
  title: string;
  slug: string;
  category: Category;
  year: number;
  description: string;
  tags: string[];
  featured: boolean;
  published: boolean;
  sortOrder: number;
  originalFile: string;
  width: number;
  height: number;
  dateAdded: string;
  updatedAt: string;
}

export interface PublicArtwork {
  id: string;
  title: string;
  slug: string;
  category: string;
  year: number;
  description: string;
  tags: string[];
  featured: boolean;
  number: number;
  total: number;
  width: number;
  height: number;
  dateAdded: string;
}
