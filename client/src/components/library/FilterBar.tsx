"use client";

import { useState } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { MovieFilters } from "@/types/movie.types";
import { MOVIE_GENRES } from "@/lib/constants";

interface FilterBarProps {
  filters: Omit<MovieFilters, "search">;
  onChange: (filters: Omit<MovieFilters, "search">) => void;
}

// Years range for the year filter
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 50 }, (_, i) => currentYear - i);

// Sort options
const SORT_OPTIONS = [
  { value: "name", label: "Name" },
  { value: "year", label: "Year" },
  { value: "rating", label: "Rating" },
  { value: "seeds", label: "Seeds" },
];

const RATING_OPTIONS = [
  { value: "", label: "Any Rating" },
  { value: "9", label: "9+ ⭐" },
  { value: "8", label: "8+ ⭐" },
  { value: "7", label: "7+ ⭐" },
  { value: "6", label: "6+ ⭐" },
  { value: "5", label: "5+ ⭐" },
];

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters =
    !!filters.genre || !!filters.year || !!filters.minRating;

  const update = (key: keyof typeof filters, value: string | number | undefined) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  const clearAll = () => {
    onChange({ sortBy: filters.sortBy, sortOrder: filters.sortOrder });
  };

  // Reusable select
  const Select = ({
    label,
    value,
    options,
    onSelect,
  }: {
    label: string;
    value: string | number | undefined;
    options: { value: string | number; label: string }[];
    onSelect: (val: string) => void;
  }) => (
    <div className="relative">
      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
        {label}
      </label>
      <div className="relative">
        <select
          value={value ?? ""}
          onChange={(e) => onSelect(e.target.value)}
          className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl border-2 border-border bg-card text-foreground text-sm font-medium outline-none focus:border-[#2872A1] transition-all cursor-pointer"
        >
          <option value="">All</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Top bar: Sort + Filter toggle */}
      <div className="flex items-center gap-3 flex-wrap">

        {/* Sort By */}
        <div className="flex items-center gap-2 bg-card border-2 border-border rounded-xl px-3 py-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
            Sort by
          </span>
          <select
            value={filters.sortBy ?? "name"}
            onChange={(e) =>
              update("sortBy", e.target.value as MovieFilters["sortBy"])
            }
            className="appearance-none bg-transparent text-foreground text-sm font-semibold outline-none cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Order */}
        <div className="flex rounded-xl border-2 border-border overflow-hidden">
          {(["asc", "desc"] as const).map((order) => (
            <button
              key={order}
              onClick={() => update("sortOrder", order)}
              className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                (filters.sortOrder ?? "asc") === order
                  ? "bg-[#2872A1] text-white"
                  : "bg-card text-muted-foreground hover:bg-secondary"
              }`}
            >
              {order === "asc" ? "↑ Asc" : "↓ Desc"}
            </button>
          ))}
        </div>

        {/* Filter toggle button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
            isOpen || hasActiveFilters
              ? "bg-[#2872A1] text-white border-[#2872A1]"
              : "bg-card text-foreground border-border hover:border-[#2872A1]"
          }`}
        >
          <SlidersHorizontal size={15} />
          Filters
          {hasActiveFilters && (
            <span className="bg-white text-[#2872A1] text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
              !
            </span>
          )}
        </button>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all border-2 border-destructive/30"
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>

      {/* Expanded filters panel */}
      {isOpen && (
        <div className="bg-card border-2 border-border rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Genre"
            value={filters.genre}
            options={MOVIE_GENRES.map((g) => ({ value: g, label: g }))}
            onSelect={(val) => update("genre", val)}
          />
          <Select
            label="Year"
            value={filters.year}
            options={YEARS.map((y) => ({ value: y, label: String(y) }))}
            onSelect={(val) => update("year", val ? Number(val) : undefined)}
          />
          <Select
            label="Min Rating"
            value={filters.minRating}
            options={RATING_OPTIONS.slice(1).map((r) => ({
              value: r.value,
              label: r.label,
            }))}
            onSelect={(val) =>
              update("minRating", val ? Number(val) : undefined)
            }
          />
        </div>
      )}
    </div>
  );
}