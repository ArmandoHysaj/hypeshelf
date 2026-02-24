export const GENRES = [
  "horror",
  "action",
  "comedy",
  "drama",
  "sci-fi",
  "other",
] as const;

export type Genre = (typeof GENRES)[number];

export function isValidGenre(value: string): value is Genre {
  return GENRES.includes(value as Genre);
}
