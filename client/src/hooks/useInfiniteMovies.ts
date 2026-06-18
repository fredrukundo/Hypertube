"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getMovies } from "@/services/movie.service";
import { MoviesParams } from "@/types/movie.types";

export function useInfiniteMovies(
  params: Omit<MoviesParams, "page"> & {
    search?: string;
    filters?: {
      genre?: string;
      year?: number | string;
      minRating?: number | string;
      sortBy?: string;
      sortOrder?: string;
    };
  } = {}
) {
  return useInfiniteQuery({
    queryKey: ["movies", "infinite", params],
    queryFn: async ({ pageParam = 1 }) => {
      const movies = await getMovies({
        ...params,
        page: pageParam,
        limit: params.limit || 50,
      });

      // Return in the format your library page expects
      return {
        movies,
        page: pageParam,
        hasMore: movies.length >= (params.limit || 50),
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      // Continue if we got a full page
      if (lastPage.movies.length >= (params.limit || 50)) {
        return allPages.length + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  });
}