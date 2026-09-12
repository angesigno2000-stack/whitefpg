"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Filters from "./Filters";
import ArtworkGrid from "./ArtworkGrid";
import ArtworkViewer from "./ArtworkViewer";
import type { PublicArtwork } from "@/lib/types";

export default function ShowroomClient({
  artworks,
}: {
  artworks: PublicArtwork[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [category, setCategory] = useState("ALL");
  const [query, setQuery] = useState("");
  const activeSlug = searchParams.get("piece");

  useEffect(() => {
    // niente da sincronizzare al mount: lo stato filtri resta locale
  }, []);

  const filtered = useMemo(() => {
    return artworks.filter((a) => {
      const matchesCategory = category === "ALL" || a.category === category;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [artworks, category, query]);

  function openPiece(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("piece", slug);
    router.push(`/showroom?${params.toString()}`, { scroll: false });
  }

  function closeViewer() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("piece");
    const qs = params.toString();
    router.push(qs ? `/showroom?${qs}` : "/showroom", { scroll: false });
  }

  return (
    <div>
      <header className="px-6 md:px-12 pt-8 pb-2 flex items-baseline justify-between">
        <Link href="/" className="text-xs tracking-wider2 text-ash hover:text-bone transition-colors">
          WHITE F.P.G
        </Link>
        <h1 className="text-sm tracking-wider2 text-bone">SHOWROOM</h1>
      </header>

      <Filters
        active={category}
        onChange={setCategory}
        query={query}
        onQueryChange={setQuery}
        resultCount={filtered.length}
        total={artworks.length}
      />

      <ArtworkGrid artworks={filtered} onSelect={openPiece} />

      {activeSlug && (
        <ArtworkViewer
          artworks={filtered.length > 0 ? filtered : artworks}
          activeSlug={activeSlug}
          onClose={closeViewer}
          onNavigate={openPiece}
        />
      )}
    </div>
  );
}
