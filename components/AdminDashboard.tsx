"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, type Artwork } from "@/lib/types";
import AdminUpload from "./AdminUpload";

export default function AdminDashboard({
  initialArtworks,
}: {
  initialArtworks: Artwork[];
}) {
  const router = useRouter();
  const [artworks, setArtworks] = useState(initialArtworks);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch("/api/admin/artworks");
    if (res.ok) {
      const data = await res.json();
      setArtworks(data.artworks);
    }
  }

  async function toggle(id: string, field: "featured" | "published", value: boolean) {
    setArtworks((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
    await fetch(`/api/admin/artworks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
  }

  async function remove(id: string) {
    if (!confirm("Eliminare definitivamente questa opera e il file originale?")) return;
    setArtworks((prev) => prev.filter((a) => a.id !== id));
    await fetch(`/api/admin/artworks/${id}`, { method: "DELETE" });
  }

  async function move(id: string, direction: -1 | 1) {
    const index = artworks.findIndex((a) => a.id === id);
    const target = index + direction;
    if (target < 0 || target >= artworks.length) return;

    const reordered = [...artworks];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setArtworks(reordered);

    await fetch("/api/admin/artworks/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: reordered.map((a) => a.id) }),
    });
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="min-h-screen px-6 md:px-12 py-10">
      <header className="flex items-baseline justify-between mb-10">
        <h1 className="text-sm tracking-wider2 text-bone">WHITE F.P.G — ADMIN</h1>
        <div className="flex items-center gap-6">
          <a href="/showroom" className="text-xs tracking-wider2 text-ash hover:text-bone transition-colors">
            Vedi showroom
          </a>
          <button
            onClick={logout}
            className="text-xs tracking-wider2 text-ash hover:text-bone transition-colors"
          >
            Esci
          </button>
        </div>
      </header>

      <section className="mb-14">
        <h2 className="text-xs tracking-wider2 text-ash mb-4">NUOVO ARTWORK</h2>
        <AdminUpload onUploaded={refresh} />
      </section>

      <section>
        <h2 className="text-xs tracking-wider2 text-ash mb-4">
          ARCHIVIO ({artworks.length})
        </h2>

        {artworks.length === 0 ? (
          <p className="text-sm text-ash">Nessuna opera caricata ancora.</p>
        ) : (
          <div className="space-y-3">
            {artworks.map((artwork, index) => (
              <div
                key={artwork.id}
                className="border border-hairline p-4 flex flex-col md:flex-row md:items-center gap-4"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/img/${artwork.id}/thumb`}
                  alt={artwork.title}
                  className="w-20 h-20 object-cover bg-charcoal shrink-0"
                  draggable={false}
                />

                <div className="flex-1 min-w-0">
                  {editingId === artwork.id ? (
                    <EditForm
                      artwork={artwork}
                      onCancel={() => setEditingId(null)}
                      onSaved={(updated) => {
                        setArtworks((prev) =>
                          prev.map((a) => (a.id === updated.id ? updated : a))
                        );
                        setEditingId(null);
                      }}
                    />
                  ) : (
                    <>
                      <p className="text-sm text-bone truncate">{artwork.title}</p>
                      <p className="text-xs text-ash mt-1">
                        {artwork.category} &middot; {artwork.year} &middot;{" "}
                        {artwork.width}&times;{artwork.height}
                      </p>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-4 shrink-0 flex-wrap">
                  <label className="flex items-center gap-1.5 text-xs text-ash">
                    <input
                      type="checkbox"
                      checked={artwork.featured}
                      onChange={(e) => toggle(artwork.id, "featured", e.target.checked)}
                    />
                    Featured
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-ash">
                    <input
                      type="checkbox"
                      checked={artwork.published}
                      onChange={(e) => toggle(artwork.id, "published", e.target.checked)}
                    />
                    Pubblicato
                  </label>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => move(artwork.id, -1)}
                      disabled={index === 0}
                      aria-label="Sposta su"
                      className="text-ash hover:text-bone disabled:opacity-20 px-1"
                    >
                      &#8593;
                    </button>
                    <button
                      onClick={() => move(artwork.id, 1)}
                      disabled={index === artworks.length - 1}
                      aria-label="Sposta giù"
                      className="text-ash hover:text-bone disabled:opacity-20 px-1"
                    >
                      &#8595;
                    </button>
                  </div>

                  <button
                    onClick={() => setEditingId(artwork.id)}
                    className="text-xs tracking-wider2 text-ash hover:text-bone transition-colors"
                  >
                    Modifica
                  </button>
                  <button
                    onClick={() => remove(artwork.id)}
                    className="text-xs tracking-wider2 text-rust hover:text-bone transition-colors"
                  >
                    Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EditForm({
  artwork,
  onCancel,
  onSaved,
}: {
  artwork: Artwork;
  onCancel: () => void;
  onSaved: (a: Artwork) => void;
}) {
  const [title, setTitle] = useState(artwork.title);
  const [category, setCategory] = useState(artwork.category);
  const [year, setYear] = useState(artwork.year);
  const [description, setDescription] = useState(artwork.description);
  const [tags, setTags] = useState(artwork.tags.join(", "));
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/admin/artworks/${artwork.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        category,
        year,
        description,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      }),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      onSaved(data.artwork);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="bg-transparent border-b border-hairline focus:border-bone py-1 text-sm outline-none"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as Artwork["category"])}
        className="bg-void border-b border-hairline focus:border-bone py-1 text-sm outline-none"
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <input
        type="number"
        value={year}
        onChange={(e) => setYear(parseInt(e.target.value, 10))}
        className="bg-transparent border-b border-hairline focus:border-bone py-1 text-sm outline-none"
      />
      <input
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="tag, separati, da, virgola"
        className="bg-transparent border-b border-hairline focus:border-bone py-1 text-sm outline-none placeholder:text-ash/60"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="md:col-span-2 bg-transparent border border-hairline focus:border-bone p-2 text-sm outline-none resize-none"
      />
      <div className="md:col-span-2 flex gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="text-xs tracking-wider2 border border-hairline hover:border-bone px-4 py-2 transition-colors"
        >
          {saving ? "SALVATAGGIO..." : "SALVA"}
        </button>
        <button
          onClick={onCancel}
          className="text-xs tracking-wider2 text-ash hover:text-bone transition-colors px-4 py-2"
        >
          Annulla
        </button>
      </div>
    </div>
  );
}
