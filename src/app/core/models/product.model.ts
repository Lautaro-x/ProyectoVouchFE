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
  score: number;
  letter_grade: string;
  score_type: 'global' | 'pro';
  trust_grade?: string | null;
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
  user: { id: number; name: string; avatar: string | null; badges: string[] };
  letter_grade: string;
  weighted_score: number;
  body: string | null;
  created_at: string;
}

export interface ProductDetail {
  id: number;
  type: 'game' | 'movie' | 'series';
  title: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
  genres: { id: number; name: Record<string, string> }[];
  game_details: { developer: string | null; publisher: string | null; igdb_id: number | null } | null;
  platforms: {
    id: number;
    name: string;
    type: string;
    release_date: string | null;
    purchase_url: string | null;
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
