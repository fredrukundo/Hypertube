export type MovieEngine = "archive" | "yts";

export interface Subtitle {
  language: string;
  url: string;
  label?: string;
}

export interface Movie {
  // Backend fields
  id: string | number;
  api?: MovieEngine | string;
  identifier?: string;
  title: string;
  year?: number | null;
  summary?: string | null;
  length?: number | null;
  main_cast?: string | null;
  imdb_rating?: number | null;
  director?: string | null;
  cover_image?: string | null;
  downloaded_path?: string | null;
  torrent_link?: string | null;
  subtitle?: unknown;
  subtitles?: Subtitle[];
  last_watched?: string | null;
  language?: string | null;
  status?: string | null;
  created_at?: string;
  commentsCount?: number;

  // Frontend/UI aliases
  engine?: MovieEngine;
  rating?: number;
  coverImage?: string | null;
  genre?: string[];
  genres?: string[];
  cast?: string[];
  watched?: boolean;
}

export interface MovieWithEngine extends Movie {
  engine: MovieEngine;
}

export interface MoviesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  year?: number;
  minRating?: number;

  filters?: {
    genre?: string;
    year?: number | string;
    minRating?: number | string;
    rating?: number | string;
    sortBy?: string;
    sort?: string;
  };
}

export interface MovieError {
  error: {
    code:
      | "ENGINE_MOST_BE_AVAILABLE"
      | "MOVIE_NOT_FOUND"
      | "MOVIE_IS_MISSING_SOME_PART"
      | "GENERAL_ERROR"
      | string;
  };
}

export interface MovieFilters {
  search?: string;
  genre?: string;
  year?: number | string;
  minRating?: number | string;
  rating?: number | string;
  sortBy?: string;
  sortOrder?: string;
}