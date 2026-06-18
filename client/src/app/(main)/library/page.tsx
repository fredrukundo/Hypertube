"use client";

import { useState, useCallback } from "react";
import { useInfiniteMovies } from "@/hooks/useInfiniteMovies";
import { MovieFilters } from "@/types/movie.types";
import SearchBar from "@/components/library/SearchBar";
import FilterBar from "@/components/library/FilterBar";
import MovieGrid from "@/components/movie/MovieGrid";
import MovieCardSkeleton from "@/components/movie/MovieCardSkeleton";
import InfiniteScroll from "@/components/library/InfiniteScroll";
import EmptyState from "@/components/common/EmptyState";
import ErrorMessage from "@/components/common/ErrorMessage";
import { useLanguage } from "@/providers/LanguageProvider";

export default function LibraryPage() {
  const { t } = useLanguage();

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Omit<MovieFilters, "search">>({
    sortBy: "name",
    sortOrder: "asc",
  });

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
    refetch,
  } = useInfiniteMovies({ search, filters });

  // Flatten + dedupe
  const allMoviesRaw = data?.pages.flatMap((page) => page.movies) ?? [];

  const allMovies = Array.from(
    new Map(allMoviesRaw.map((movie) => [movie.id, movie])).values()
  );

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleFiltersChange = useCallback(
    (newFilters: Omit<MovieFilters, "search">) => {
      setFilters(newFilters);
    },
    []
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-1 truncate">
          {search
            ? `${t.library.resultsFor} "${search}"`
            : t.library.popularMovies}
        </h1>
        <p className="text-muted-foreground text-sm">
          {search
            ? t.library.searchDescription
            : t.library.browseDescription}
        </p>
      </div>

      <SearchBar
        value={search}
        onChange={handleSearch}
        placeholder={t.library.search}
      />

      <FilterBar filters={filters} onChange={handleFiltersChange} />

      {!isLoading && allMovies.length > 0 && (
        <p className="text-sm text-muted-foreground font-medium">
          {t.library.showing}{" "}
          <span className="text-foreground font-bold">
            {allMovies.length}
          </span>{" "}
          {allMovies.length === 1
            ? t.library.movie
            : t.library.movies}
          {search && (
            <>
              {" "}
              {t.library.for}{" "}
              <span className="text-[#2872A1] font-bold">
                "{search}"
              </span>
            </>
          )}
        </p>
      )}

      {isError && (
        <ErrorMessage
          message={t.common.error}
          onRetry={() => refetch()}
        />
      )}

      {isLoading && !isError && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!isLoading && !isError && allMovies.length === 0 && (
        <EmptyState
          icon="🔍"
          title={t.library.noResults}
          description={
            search
              ? `${t.library.noResultsFor} "${search}"`
              : t.library.noMoviesAvailable
          }
          action={
            search ? (
              <button
                onClick={() => handleSearch("")}
                className="bg-[#2872A1] hover:bg-[#1A4A6B] text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all"
              >
                {t.common.cancel}
              </button>
            ) : undefined
          }
        />
      )}

      {!isLoading && !isError && allMovies.length > 0 && (
        <MovieGrid movies={allMovies} />
      )}

      {!isLoading && !isError && allMovies.length > 0 && (
        <InfiniteScroll
          hasMore={!!hasNextPage}
          isLoading={isFetchingNextPage}
          onLoadMore={handleLoadMore}
        />
      )}
    </div>
  );
}