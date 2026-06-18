"use client";

import Link from "next/link";
import { Star, Clock, Eye, EyeOff } from "lucide-react";
import { Movie, MovieEngine } from "@/types/movie.types";
import { isMovieWatched } from "@/services/movie.service";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {

  const id = movie.id ?? movie.identifier;
  const engine = (movie.engine ?? movie.api ?? "yts") as MovieEngine;

  const title = movie.title ?? "Untitled";
  const year = movie.year;
  const rating = Number(movie.rating ?? movie.imdb_rating ?? 0);
  const genres = movie.genre ?? movie.genres ?? [];
  const coverImage = movie.coverImage ?? movie.cover_image;
  const length = movie.length ?? undefined;
  const watched = isMovieWatched(id);

  const formatLength = (mins?: number | null) => {
    if (!mins) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <Link
      href={`/movie/${encodeURIComponent(String(id))}?engine=${engine}`}
      className="group block"
    >
      <div className="bg-card border-2 border-border rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#2872A1] hover:shadow-xl hover:shadow-[#2872A1]/10 hover:-translate-y-1">

        {/* Cover Image */}
        <div className="relative aspect-[2/3] bg-secondary overflow-hidden">
          {coverImage && coverImage.trim() !== "" ? (
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />

          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <span className="text-5xl">🎬</span>
              <span className="text-xs text-muted-foreground font-medium px-3 text-center">
                No Image
              </span>
            </div>
          )}

          {/* Watched / Unwatched badge */}
          <div className="absolute top-2 left-2">
            {watched ? (
              <span className="flex items-center gap-1 bg-[#2872A1] text-white text-xs font-bold px-2 py-1 rounded-full">
                <Eye size={10} />
                Watched
              </span>
            ) : (
              <span className="flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full">
                <EyeOff size={10} />
                New
              </span>
            )}
          </div>

          {/* Rating badge */}
          <div className="absolute top-2 right-2">
            <span className="flex items-center gap-1 bg-black/70 backdrop-blur-sm text-yellow-400 text-xs font-bold px-2 py-1 rounded-full">
              <Star size={10} fill="currentColor" />
              {rating.toFixed(1)}
            </span>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-[#2872A1]/0 group-hover:bg-[#2872A1]/10 transition-all duration-300 flex items-center justify-center">
            <span className="scale-0 group-hover:scale-100 transition-transform duration-300 bg-[#2872A1] text-white text-sm font-bold px-4 py-2 rounded-xl">
              Watch Now
            </span>
          </div>
        </div>

        {/* Card Info */}
        <div className="p-3 space-y-2">
          <h3 className="text-sm font-bold text-foreground leading-tight line-clamp-2 group-hover:text-[#2872A1] transition-colors">
            {title}
          </h3>

          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            {year && <span className="font-medium">{year}</span>}
            {year && length && <span>•</span>}
            {length && (
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {formatLength(length)}
              </span>
            )}
          </div>

          {genres.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {genres.slice(0, 2).map((g) => (
                <span
                  key={g}
                  className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full font-medium"
                >
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}