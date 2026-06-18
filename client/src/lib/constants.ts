// Mock mode: set to false when backend is ready
export const USE_MOCK = false;

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7002";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
];

export const MOVIE_GENRES = [
  "Action", "Adventure", "Animation", "Comedy",
  "Crime", "Documentary", "Drama", "Fantasy",
  "Horror", "Romance", "Sci-Fi", "Thriller",
];

export const SORT_OPTIONS = [
  { value: "name", label: "Name" },
  { value: "year", label: "Year" },
  { value: "rating", label: "Rating" },
];

export const ITEMS_PER_PAGE = 20;
