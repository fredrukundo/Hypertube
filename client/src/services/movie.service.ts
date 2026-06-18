import api from "@/lib/axios";
import { API_URL } from "@/lib/constants";
import {
  MovieWithEngine,
  MovieEngine,
  MoviesParams,
  MovieError,
  Subtitle,
} from "@/types/movie.types";
import { AxiosError } from "axios";

// Error message mapper
function getMovieErrorMessage(code: string): string {
  const errorMessages: Record<string, string> = {
    ENGINE_MOST_BE_AVAILABLE: "Invalid engine parameter. Use archive or yts.",
    MOVIE_NOT_FOUND: "Movie not found.",
    MOVIE_IS_MISSING_SOME_PART: "Movie data is incomplete.",
    GENERAL_ERROR: "An error occurred while fetching movies.",
  };

  return errorMessages[code] || "An unexpected error occurred.";
}


// Helpers 
function toNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function toStringArray(value: unknown): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((v) => String(v).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeSubtitles(value: unknown): Subtitle[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((sub: any) => {
        if (typeof sub === "string") {
          return { language: sub, url: "" };
        }

        return {
          language: sub.language || sub.lang || "en",
          url: sub.url || sub.path || "",
          label: sub.label,
        };
      })
      .filter((sub) => sub.language);
  }

  return [];
}


function extractResults(data: any): any[] {
  if (!data) return [];

  if (Array.isArray(data)) return data;

  if (Array.isArray(data.results)) {
    return data.results;
  }

  return [];
}

function normalizeEngine(value: unknown, fallback: MovieEngine): MovieEngine {
  return value === "archive" || value === "yts" ? value : fallback;
}

export function normalizeMovie(raw: any, fallbackEngine: MovieEngine): MovieWithEngine {
  const engine = normalizeEngine(raw.engine || raw.api, fallbackEngine);

  const id = raw.id ?? raw.identifier;
  const title = raw.title ?? raw.name ?? "Untitled";

  const rating = toNumber(raw.rating ?? raw.imdb_rating) ?? 0;
  const year = toNumber(raw.year);
  const length = toNumber(raw.length ?? raw.runtime);

  const genres = toStringArray(raw.genre ?? raw.genres);
  const cast = toStringArray(raw.cast ?? raw.main_cast);

  const coverImage = raw.coverImage ?? raw.cover_image ?? raw.cover ?? null;

  // If backend returned subtitle metadata, use it.
  // Otherwise, always add a fallback pointing to the subtitle endpoint.
  const backendSubtitles = normalizeSubtitles(raw.subtitles ?? raw.subtitle);
  const movieDbId = raw.id;
  const token = typeof window !== "undefined" ? localStorage.getItem("hypertube_token") : null;
  const subtitleUrl = `${(API_URL).replace(/\/$/, "")}/movies/subtitles/${movieDbId}?token=${token}`;
  const subtitles = backendSubtitles.length > 0
    ? backendSubtitles
    : [{ language: "en", url: subtitleUrl, label: "English" }];

  return {
    ...raw,

    id,
    api: raw.api ?? engine,
    engine,
    identifier: raw.identifier ? String(raw.identifier) : undefined,

    title,
    year,
    length,

    imdb_rating: rating,
    rating,

    cover_image: coverImage,
    coverImage,

    genre: genres,
    genres,

    main_cast: raw.main_cast ?? cast.join(", "),
    cast,

    subtitles,

    watched: Boolean(
      raw.watched ||
        raw.is_watched ||
        raw.status === "watched"
    ),
  };
}

function applyClientFilters(
  movies: MovieWithEngine[],
  params: MoviesParams
): MovieWithEngine[] {
  const filters = params.filters ?? {};
  let result = [...movies];

  const genre = filters.genre;
  if (genre && genre !== "all") {
    result = result.filter((movie) =>
      movie.genre?.some((g) => g.toLowerCase() === genre.toLowerCase())
    );
  }

  const sortBy = params.sortBy ?? filters.sortBy ?? filters.sort;

  if (sortBy === "name") {
    result.sort((a, b) => a.title.localeCompare(b.title));
  }

  if (sortBy === "year") {
    result.sort((a, b) => Number(b.year ?? 0) - Number(a.year ?? 0));
  }

  if (sortBy === "rating") {
    result.sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0));
  }

  return result;
}

// Get Movies List
export async function getMovies(params: MoviesParams = {}): Promise<MovieWithEngine[]> {


  try {
    const filters = params.filters ?? {};

    const page = params.page ?? 1;
    const limit = params.limit ?? 50;
    const search = params.search?.trim();

    const sortBy = params.sortBy ?? filters.sortBy ?? filters.sort;
    const year = params.year ?? toNumber(filters.year);
    const minRating =
      params.minRating ?? toNumber(filters.minRating ?? filters.rating);

    const queryParams = new URLSearchParams();

    queryParams.append("page", String(page));
    queryParams.append("limit", String(limit));

    if (search) queryParams.append("search", search);
    if (sortBy) queryParams.append("sortBy", sortBy);
    if (year) queryParams.append("year", String(year));
    if (minRating) queryParams.append("minRating", String(minRating));

    const response = await api.get<any>(`/movies?${queryParams.toString()}`);

    const archiveRaw = extractResults(response.data.success.data.archive);
    const ytsRaw = extractResults(response.data.success.data.yts);

    const archiveMovies = archiveRaw.map((movie) =>
      normalizeMovie(movie, "archive")
    );

    const ytsMovies = ytsRaw.map((movie) =>
      normalizeMovie(movie, "yts")
    );

    let combined = [...archiveMovies, ...ytsMovies];

    combined = applyClientFilters(combined, params);

    return combined;
  } catch (error) {
    const axiosError = error as AxiosError<MovieError>;

    if (axiosError.response?.data?.error) {
      throw new Error(getMovieErrorMessage(axiosError.response.data.error.code));
    }

    throw new Error("Failed to fetch movies.");
  }
}

// Search Movies 
export async function searchMovies(keyword: string): Promise<MovieWithEngine[]> {

  if (!keyword || keyword.trim().length === 0) {
    return [];
  }

  try {
    const response = await api.get<any>(
      `/movies/search?keyword=${encodeURIComponent(keyword.trim())}`
    );

    const data = response.data.success.data;

    if (!data) return [];

    // In case backend returns archive/yts grouped search later
    if (data.archive || data.yts) {
      const archiveMovies = extractResults(data.archive).map((m) =>
        normalizeMovie(m, "archive")
      );

      const ytsMovies = extractResults(data.yts).map((m) =>
        normalizeMovie(m, "yts")
      );

      return [...archiveMovies, ...ytsMovies];
    }

    const results = extractResults(data);

    return results.map((movie: any) =>
      normalizeMovie(movie, normalizeEngine(movie.api, "yts"))
    );
  } catch (error) {
    const axiosError = error as AxiosError<MovieError>;

    if (axiosError.response?.data?.error) {
      throw new Error(getMovieErrorMessage(axiosError.response.data.error.code));
    }

    throw new Error("Search failed.");
  }
}

// Get Movie Details
export async function getMovieDetails(
  movieId: string | number,
  engine: MovieEngine
): Promise<MovieWithEngine> {

  try {
    const response = await api.get<any>(`/movies/${movieId}?engine=${engine}`);

    return normalizeMovie(response.data, engine);
  } catch (error) {
    const axiosError = error as AxiosError<MovieError>;

    if (axiosError.response?.data?.error) {
      throw new Error(getMovieErrorMessage(axiosError.response.data.error.code));
    }

    throw new Error("Failed to fetch movie details.");
  }
}

// Stream URL

export function getStreamUrl(
  movieId: string | number,
  engine: MovieEngine = "yts"
): string {
  const base = API_URL.replace(/\/$/, "");
  ///movies/live/${movieId}/stream
  const token = localStorage.getItem("hypertube_token");

  return `${base}/movies/live/${movieId}/stream?token=${token}`;
}

// Mark as watched

export async function markMovieAsWatched(
  movieId: string | number,
  engine: MovieEngine = "yts"
): Promise<void> {
  try {
    const key = "watched_movies";

    const existing = localStorage.getItem(key);

    const watched: Record<string, boolean> = existing
      ? JSON.parse(existing)
      : {};

    const movieKey = `${engine}_${movieId}`;

    watched[movieKey] = true;

    localStorage.setItem(key, JSON.stringify(watched));
  } catch (error) {
  }
}

export function isMovieWatched(
  movieId: string | number,
  engine: MovieEngine = "yts"
): boolean {
  try {
    const key = "watched_movies";

    const existing = localStorage.getItem(key);

    if (!existing) return false;

    const watched: Record<string, boolean> = JSON.parse(existing);

    return !!watched[`${engine}_${movieId}`];
  } catch {
    return false;
  }
}