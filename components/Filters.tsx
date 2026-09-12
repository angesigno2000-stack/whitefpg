"use client";

const CATEGORY_LABELS: Record<string, string> = {
  ALL: "ALL",
  PNG: "PNG",
  COVERS: "COVERS",
  POSTERS: "POSTERS",
  LOGOS: "LOGOS",
  ARTWORK: "ARTWORK",
  OTHER: "OTHER",
};

const CATEGORY_ORDER = [
  "ALL",
  "PNG",
  "COVERS",
  "POSTERS",
  "LOGOS",
  "ARTWORK",
  "OTHER",
];

interface FiltersProps {
  active: string;
  onChange: (category: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
  resultCount: number;
  total: number;
}

export default function Filters({
  active,
  onChange,
  query,
  onQueryChange,
  resultCount,
  total,
}: FiltersProps) {
  return (
    <div className="sticky top-0 z-30 bg-void/90 backdrop-blur-sm border-b border-hairline px-6 md:px-12 py-4 md:py-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {CATEGORY_ORDER.map((cat) => (
            <button
              key={cat}
              onClick={() => onChange(cat)}
              className={`text-xs tracking-wider2 pb-1 border-b transition-colors duration-200 ${
                active === cat
                  ? "text-bone border-rust"
                  : "text-ash border-transparent hover:text-bone"
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Cerca per titolo o tag"
            className="bg-transparent border-b border-hairline focus:border-bone text-sm text-bone placeholder:text-ash py-1 px-1 outline-none w-48 md:w-64 transition-colors"
          />
          <span className="text-xs text-ash tabular-nums whitespace-nowrap">
            {String(resultCount).padStart(3, "0")} / {String(total).padStart(3, "0")}
          </span>
        </div>
      </div>
    </div>
  );
}
