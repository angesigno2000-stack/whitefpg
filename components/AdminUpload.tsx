"use client";

import { useState, useRef } from "react";
import { CATEGORIES } from "@/lib/types";

interface AdminUploadProps {
  onUploaded: () => void;
}

export default function AdminUpload({ onUploaded }: AdminUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("PNG");
  const [year, setYear] = useState(new Date().getFullYear());
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  }

  function reset() {
    setTitle("");
    setCategory("PNG");
    setYear(new Date().getFullYear());
    setDescription("");
    setTags("");
    setFeatured(false);
    setPublished(true);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Seleziona un file immagine.");
      return;
    }
    if (!title.trim()) {
      setError("Il titolo è obbligatorio.");
      return;
    }

    const form = new FormData();
    form.append("file", file);
    form.append("title", title);
    form.append("category", category);
    form.append("year", String(year));
    form.append("description", description);
    form.append("tags", tags);
    form.append("featured", String(featured));
    form.append("published", String(published));

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/artworks", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Caricamento non riuscito.");
        return;
      }
      reset();
      onUploaded();
    } catch {
      setError("Errore di rete durante il caricamento.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-hairline p-6 md:p-8 grid md:grid-cols-2 gap-6"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs tracking-wider2 text-ash mb-2">
            FILE (PNG / JPG / WEBP)
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            className="w-full text-sm text-bone file:mr-4 file:border file:border-hairline file:bg-transparent file:text-bone file:px-3 file:py-1.5 file:text-xs file:tracking-wider2"
          />
        </div>

        <div>
          <label className="block text-xs tracking-wider2 text-ash mb-2">
            TITOLO
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent border-b border-hairline focus:border-bone py-2 text-sm outline-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs tracking-wider2 text-ash mb-2">
              CATEGORIA
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-void border-b border-hairline focus:border-bone py-2 text-sm outline-none transition-colors"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs tracking-wider2 text-ash mb-2">
              ANNO
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
              className="w-full bg-transparent border-b border-hairline focus:border-bone py-2 text-sm outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs tracking-wider2 text-ash mb-2">
            TAG (separati da virgola)
          </label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="dark, editoriale, cover"
            className="w-full bg-transparent border-b border-hairline focus:border-bone py-2 text-sm outline-none placeholder:text-ash/60 transition-colors"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs tracking-wider2 text-ash mb-2">
            DESCRIZIONE
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full bg-transparent border border-hairline focus:border-bone p-2 text-sm outline-none transition-colors resize-none"
          />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-bone">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm text-bone">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            Pubblica subito
          </label>
        </div>

        {preview && (
          <div className="border border-hairline p-2">
            <p className="text-[10px] tracking-wider2 text-ash mb-2">
              ANTEPRIMA LOCALE (non ancora protetta/watermarkata)
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Anteprima" className="max-h-40 w-auto" />
          </div>
        )}

        {error && <p className="text-xs text-rust">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full border border-hairline hover:border-bone transition-colors py-3 text-xs tracking-wider2 disabled:opacity-40"
        >
          {submitting ? "CARICAMENTO..." : "CARICA ARTWORK"}
        </button>
      </div>
    </form>
  );
}
