"use client";

import { Movie, Subtitle } from "@/types/movie.types";
import {
  Star,
  Clock,
  Calendar,
  Film,
  Users,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import type { ElementType } from "react";

interface MovieDetailsProps {
  movie: Movie;
}

export default function MovieDetails({ movie }: MovieDetailsProps) {
  const [showFullSummary, setShowFullSummary] = useState(false);

  const rating = Number(movie.rating ?? movie.imdb_rating ?? 0);
  const genres = movie.genre ?? movie.genres ?? [];
  const cast = movie.cast ?? [];
  const subtitles: Subtitle[] = Array.isArray(movie.subtitles)
    ? movie.subtitles
    : [];

  const formatLength = (mins?: number | null) => {
    if (!mins) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const summary = movie.summary ?? "";
  const summaryTooLong = summary.length > 300;
  const displayedSummary =
    summaryTooLong && !showFullSummary
      ? summary.slice(0, 300) + "..."
      : summary;

  const StatBadge = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: ElementType;
    label: string;
    value: string;
  }) => (
    <div className="bg-card border-2 border-border rounded-2xl px-4 py-3 flex items-center gap-3">
      <div className="w-9 h-9 bg-[#CBDDE9] dark:bg-[#2872A1]/20 rounded-xl flex items-center justify-center shrink-0">
        <Icon size={18} className="text-[#2872A1]" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-sm font-bold text-foreground">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBadge
          icon={Star}
          label="IMDb Rating"
          value={`${rating.toFixed(1)} / 10`}
        />

        {movie.year && (
          <StatBadge
            icon={Calendar}
            label="Released"
            value={String(movie.year)}
          />
        )}

        {movie.length && (
          <StatBadge
            icon={Clock}
            label="Runtime"
            value={formatLength(movie.length) ?? "N/A"}
          />
        )}

        {genres.length > 0 && (
          <StatBadge
            icon={Film}
            label="Genre"
            value={genres.slice(0, 2).join(", ")}
          />
        )}
      </div>

      {/* Genres */}
      {genres.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {genres.map((g) => (
            <span
              key={g}
              className="bg-[#CBDDE9] dark:bg-[#2872A1]/20 text-[#2872A1] dark:text-[#CBDDE9] text-sm font-semibold px-3 py-1.5 rounded-full"
            >
              {g}
            </span>
          ))}
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="space-y-2">
          <h3 className="text-lg font-black text-foreground">Synopsis</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {displayedSummary}
          </p>

          {summaryTooLong && (
            <button
              onClick={() => setShowFullSummary(!showFullSummary)}
              className="flex items-center gap-1 text-[#2872A1] text-sm font-semibold hover:text-[#1A4A6B] transition-colors"
            >
              {showFullSummary ? "Show less" : "Read more"}
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  showFullSummary ? "rotate-180" : ""
                }`}
              />
            </button>
          )}
        </div>
      )}

      {/* Cast & Crew */}
      {(movie.director || cast.length > 0) && (
        <div className="bg-card border-2 border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} className="text-[#2872A1]" />
            <h3 className="text-lg font-black text-foreground">Cast & Crew</h3>
          </div>

          {movie.director && (
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Director
              </p>
              <p className="text-sm font-semibold text-foreground">
                {movie.director}
              </p>
            </div>
          )}

          {cast.length > 0 && (
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Main Cast
              </p>
              <div className="flex flex-wrap gap-2">
                {cast.slice(0, 8).map((actor) => (
                  <span
                    key={actor}
                    className="bg-secondary text-secondary-foreground text-xs font-medium px-3 py-1.5 rounded-full"
                  >
                    {actor}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subtitles available */}
      {subtitles.length > 0 && (
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Available Subtitles
          </p>
          <div className="flex flex-wrap gap-2">
            {subtitles.map((sub) => (
              <span
                key={sub.language}
                className="bg-[#CBDDE9] dark:bg-[#2872A1]/20 text-[#2872A1] dark:text-[#CBDDE9] text-xs font-bold px-3 py-1.5 rounded-full"
              >
                {sub.language.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}