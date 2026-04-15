export type TranslatableName = Record<string, string>;

export interface Genre {
  id: number;
  name: TranslatableName;
  slug: string;
  igdb_genre_id: number | null;
  categories?: CategoryWithWeight[];
}

export interface Category {
  id: number;
  name: TranslatableName;
  slug: string;
  description: TranslatableName;
}

export interface CategoryWithWeight extends Category {
  pivot: { weight: number };
}

export interface Platform {
  id: number;
  name: string;
  slug: string;
  type: 'console' | 'pc' | 'streaming';
}

export interface PlatformWithPivot extends Platform {
  pivot: { release_date: string | null; purchase_url: string | null };
}

export interface Product {
  id: number;
  type: 'game' | 'movie' | 'series';
  title: string;
  slug: string;
  genre_ids: number[];
  description: string | null;
  cover_image: string | null;
  genres?: Genre[];
  game_details?: GameDetail;
  platforms?: PlatformWithPivot[];
}

export interface GameDetail {
  product_id: number;
  igdb_id: number | null;
  developer: string | null;
  publisher: string | null;
}

export interface AdminReview {
  id: number;
  user_id: number;
  product_id: number;
  body: string | null;
  weighted_score: number;
  letter_grade: string;
  banned_at: string | null;
  ban_reason: string | null;
  created_at: string;
  user?: { id: number; name: string; email: string };
  product?: { id: number; title: string };
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'critic' | 'admin';
  avatar: string | null;
  banned_at: string | null;
  ban_reason: string | null;
  created_at: string;
}

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

export interface IgdbGame {
  id: number;
  name: string;
  cover?: { url: string };
  first_release_date?: number;
  platforms?: { name: string }[];
  genres?: { name: string }[];
}
