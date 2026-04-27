export interface IgdbSuggestion {
  igdb_id: number;
  name: string;
  cover: string | null;
  year: string | null;
}

export interface Genre {
  id: number;
  name: Record<string, string>;
  slug: string;
}

export interface TrailerProduct {
  id: number;
  title: string;
  slug: string;
  type: string;
  trailer_youtube_id: string;
}

export interface TrailerSectionResponse {
  section_title: Record<string, string> | null;
  items: TrailerProduct[];
}

export interface ReviewFormData {
  id: number;
  title: string;
  cover_image: string | null;
  type: string;
  slug: string;
  categories: { id: number; name: Record<string, string>; description: Record<string, string> }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

export interface ReviewEditFormData extends ReviewFormData {
  body: string | null;
  scores: Record<string, number>;
}

export interface ProductCard {
  id: number;
  type: string;
  slug: string;
  title: string;
  cover_image: string | null;
  letter_grade: string | null;
  score_type: 'global' | 'pro' | 'igdb' | 'none';
  trust_grade?: string | null;
  follower_review?: { user_name: string; letter_grade: string } | null;
}

export interface UserReviewCard {
  id: number;
  weighted_score: number;
  letter_grade: string;
  created_at: string;
  product: {
    id: number;
    title: string;
    slug: string;
    type: string;
    cover_image: string | null;
  };
}

export interface ProductReview {
  id: number;
  user: { id: number; name: string; avatar: string | null; badges: string[] | null };
  letter_grade: string;
  weighted_score: number;
  body: string | null;
  created_at: string;
}

export interface ReviewShareData {
  review:  { id: number; body: string | null; letter_grade: string; weighted_score: number };
  product: { title: string; cover_image: string | null };
  user:    { name: string; avatar: string | null };
  scores:  { category_id: number; name: Record<string, string>; score: number }[];
}

export interface ProductDetail {
  id: number;
  type: 'game' | 'movie' | 'series';
  title: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
  genres: { id: number; name: Record<string, string>; slug: string }[];
  game_details: {
    developer: string | null;
    publisher: string | null;
    igdb_id: number | null;
    igdb_rating: number | null;
    igdb_grade: string | null;
    franchise: string | null;
    pegi_rating: string | null;
    esrb_rating: string | null;
    game_modes: string[] | null;
    themes: string[] | null;
    player_perspectives: string[] | null;
    trailer_youtube_id: string | null;
    screenshots: string[] | null;
    official_url: string | null;
  } | null;
  platforms: {
    id: number;
    name: string;
    type: string;
    release_date: string | null;
    purchase_url: Record<string, string> | null;
  }[];
  scores: {
    global_score: number | null;
    global_grade: string | null;
    pro_score: number | null;
    pro_grade: string | null;
    trust_score: number | null;
    trust_grade: string | null;
    follower_score: number | null;
    follower_grade: string | null;
  };
  user_review: { id: number; weighted_score: number; letter_grade: string } | null;
}
