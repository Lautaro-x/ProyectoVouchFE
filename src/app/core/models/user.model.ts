export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  role: 'user' | 'critic' | 'admin';
  created_at: string;
}

export interface SocialLink {
  url: string;
  shared: boolean;
}

export type SocialLinks = Partial<Record<string, SocialLink>>;

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  role: 'user' | 'critic' | 'admin';
  badges: string[];
  show_email: boolean;
  reviews_public: boolean;
  social_links: SocialLinks;
}

export interface UserCardReview {
  weighted_score: number;
  letter_grade: string;
  product: { title: string; slug: string; type: string; cover_image: string | null };
}

export interface UserCardData {
  id: number;
  name: string;
  avatar: string | null;
  email: string | null;
  badges: string[];
  social_links: Partial<Record<string, string>>;
  reviews_count: number;
  followers_count: number;
  last_reviews: UserCardReview[];
  card_big_bg: string | null;
  card_mid_bg: string | null;
  card_mini_bg: string | null;
  is_following: boolean;
}

export const SOCIAL_NETWORKS: { key: string; label: string }[] = [
  { key: 'youtube',   label: 'YouTube' },
  { key: 'twitch',    label: 'Twitch' },
  { key: 'discord',   label: 'Discord' },
  { key: 'x',         label: 'X' },
  { key: 'instagram', label: 'Instagram' },
];
