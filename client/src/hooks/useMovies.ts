"use client";

import { useQuery, useInfiniteQuery, useMutation } from "@tanstack/react-query";
import {
  getMovies,
  searchMovies,
  getMovieDetails,
  markMovieAsWatched,
} from "@/services/movie.service";
import { MovieEngine, MoviesParams } from "@/types/movie.types";

// Infinite Movies
export function useMovies(params: Omit<MoviesParams, "page"> = {}) {
  return useInfiniteQuery({
    queryKey: ["movies", params],
    queryFn: ({ pageParam = 1 }) =>
      getMovies({
        ...params,
        page: pageParam,
        limit: params.limit || 20,
      }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length > 0) {
        return allPages.length + 1;
      }

      return undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  });
}

// Search Movies
export function useSearchMovies(keyword: string) {
  return useQuery({
    queryKey: ["movies", "search", keyword],
    queryFn: () => searchMovies(keyword),
    enabled: keyword.trim().length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

// Movie Details
export function useMovieDetails(
  movieId: string | number,
  engine: MovieEngine
) {
  return useQuery({
    queryKey: ["movie", movieId, engine],
    queryFn: () => getMovieDetails(movieId, engine),
    enabled: !!movieId && !!engine,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}

// Mark as Watched
export function useMarkAsWatched() {
  return useMutation({
    mutationFn: ({
      movieId,
      engine,
    }: {
      movieId: string | number;
      engine?: MovieEngine;
    }) => markMovieAsWatched(movieId, engine ?? "yts"),
  });
}