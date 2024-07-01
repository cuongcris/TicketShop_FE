import { ShowTime } from "./ShowTime";
export interface Movie {
  posterPath: string;
  adult: boolean;
  overview: string;
  director: string;
  cast: string;
  releaseDate: string;
  homePage: string;
  release_date: string;
  genre_ids: number[];
  id: string;
  original_title: string;
  language: string;
  runTime: string;
  title: string;
  backdropPath: string;
  popularity: number;
  vote_count: number;
  video: boolean;
  vote_average: number;
  revenue?: number;
  runtime?: number;
  status?: boolean;
  tagline?: string;
  genres?: Genre[];
  budget?: number;
  videos: Video[];
  video?: boolean;
  showTimes?: ShowTime[];
}

export interface Video {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Dates {
  maximum: string;
  minimum: string;
}

export interface MovieResponse {
  page: number;
  results: Movie[];
  dates: Dates;
  total_pages: number;
  total_results: number;
}
