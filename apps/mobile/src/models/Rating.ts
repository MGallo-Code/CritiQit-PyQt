export interface MovieInput {
  title: string;
  year?: number;
  externalSource?: string;
  externalId?: string;
}

export interface CreateMovieRatingInput extends MovieInput {
  oneScore?: number; // 0..10000 -> converts to 0.000..10.000
  textReview?: string;
  watchedCount?: number; // default 1
  tags?: string[];
}

export interface UpdateMovieRatingInput {
  id: number; // movie_rating id
  oneScore?: number; // 0..10000 -> converts to 0.000..10.000
  textReview?: string | null;
  watchedCount?: number;
  tags?: string[]; // replace
}

export interface MovieRecord {
  id: number;
  title: string;
  year?: number | null;
  externalSource?: string | null;
  externalId?: string | null;
}

export interface MovieRatingRecord {
  id: number; // movie_rating id
  movie: MovieRecord;
  oneScore: number;
  textReview?: string | null;
  watchedCount: number;
  ratedAt: number;
  updatedAt: number;
  tags: string[];
}