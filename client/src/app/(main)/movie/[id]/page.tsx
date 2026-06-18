"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useMovieDetails } from "@/hooks/useMovies";
import { MovieEngine } from "@/types/movie.types";
import MovieDetails from "@/components/movie/MovieDetails";
import MoviePlayer from "@/components/movie/MoviePlayer";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import CommentSection from "@/components/movie/CommentSection";

interface MoviePageProps {
  params: Promise<{ id: string }>;
}

export default function MoviePage({ params }: MoviePageProps) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  
  // Get engine from URL query param
  const engine = (searchParams.get("engine") || "yts") as MovieEngine;

  const { 
    data: movie, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useMovieDetails(id, engine);

  // Loading state
  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading movie..." />;
  }

  // Error state
  if (isError || !movie) {
    return (
      <div className="max-w-4xl mx-auto">
        <Link
          href="/library"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-[#2872A1] transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Library
        </Link>

        <ErrorMessage
          message={error?.message || "Failed to load movie details"}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const title = movie.title || "Untitled";
  const coverImage = movie.coverImage || movie.cover_image;
  const subtitles = Array.isArray(movie.subtitles) ? movie.subtitles : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/*  Back button  */}
      <Link
        href="/library"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-[#2872A1] transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Library
      </Link>

      {/*  Movie header with backdrop  */}
      <div className="relative rounded-3xl overflow-hidden bg-card border-2 border-border">
        {/* Backdrop blur */}
        {coverImage && (
          <div 
            className="absolute inset-0 opacity-20 blur-2xl"
            style={{
              backgroundImage: `url(${coverImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}

        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Movie poster */}
            <div className="w-full md:w-64 shrink-0">
              {coverImage ? (
                <img
                  src={coverImage}
                  alt={title}
                  className="w-full aspect-[2/3] object-cover rounded-2xl border-2 border-border shadow-xl"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-secondary rounded-2xl border-2 border-border flex items-center justify-center">
                  <span className="text-6xl">🎬</span>
                </div>
              )}
            </div>

            {/* Movie info */}
            <div className="flex-1 space-y-4">
              <h1 className="text-3xl md:text-4xl font-black text-foreground">
                {title}
              </h1>

              <MovieDetails movie={movie} />
            </div>
          </div>
        </div>
      </div>

      {/* Video Player  */}
      <div className="bg-card border-2 border-border rounded-3xl p-6">
        <h2 className="text-2xl font-black text-foreground mb-4">
          Watch Now
        </h2>

        <MoviePlayer
          movieId={String(id)}
          engine={engine}
          title={title}
          subtitles={subtitles}
          preferredLanguage={movie.language || "en"}
        />
      </div>

      {/*  Comments section  */}
        <CommentSection movieId={movie.id} />

    </div>
  );
}