export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  role: 'user' | 'critic' | 'admin';
  badges: string[];
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
  social_links: SocialLinks;
}

export interface UserConsents {
  show_email: boolean;
  consent_follower_score: boolean;
  notify_email: boolean;
  session_persistent: boolean;
  is_verified: boolean;
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

export interface ActiveSurveyOption {
  id: number;
  text: Record<string, string>;
}

export interface ActiveSurvey {
  id: number;
  title: Record<string, string>;
  question: Record<string, string>;
  audience: 'all' | 'verified' | 'press';
  options: ActiveSurveyOption[];
}

export interface ActiveAnnouncement {
  id: number;
  title: Record<string, string>;
  body: Record<string, string>;
  audience: 'all' | 'verified' | 'press';
}

export interface BadgeProgress {
  current: number;
  threshold: number;
  awarded: boolean;
  claimable: boolean;
  awarded_at?: string | null;
}

export type BadgesProgress = Record<string, BadgeProgress>;

export type VerificationRequestType   = 'verified' | 'press';
export type VerificationRequestStatus = 'pending' | 'approved' | 'rejected';

export interface VerificationRequest {
  id: number;
  type: VerificationRequestType;
  social_network:  string | null;
  social_username: string | null;
  press_url:       string | null;
  press_contact:   string | null;
  status:    VerificationRequestStatus;
  admin_note: string | null;
  created_at: string;
}

export interface FollowerUser {
  id: number;
  name: string;
  verified: boolean;
}

export interface FollowersResponse {
  total: number;
  followers: FollowerUser[];
}

export interface SocialNetworkDef {
  key: string;
  label: string;
  svgPath: string;
  urlPattern: RegExp;
}

export const SOCIAL_NETWORKS: SocialNetworkDef[] = [
  { key: 'youtube',   label: 'YouTube',   urlPattern: /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//,        svgPath: 'M21.8 8s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C16.2 5 12 5 12 5s-4.2 0-7 .1c-.4.1-1.2.1-2 .9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.8.8 2.3.8C7 19 12 19 12 19s4.2 0 7-.2c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2S22 14.3 22 12.7v-1.5C22 9.6 21.8 8 21.8 8zM10 15V9l5.3 3L10 15z' },
  { key: 'twitch',    label: 'Twitch',    urlPattern: /^https?:\/\/(www\.)?twitch\.tv\//,                       svgPath: 'M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z' },
  { key: 'kick',      label: 'Kick',      urlPattern: /^https?:\/\/(www\.)?kick\.com\//,                         svgPath: 'M5 2h4v8l7-8h5L13 11.5 21 22h-5l-7-9v9H5V2z' },
  { key: 'discord',   label: 'Discord',   urlPattern: /^https?:\/\/(www\.)?(discord\.(gg|com))\//,             svgPath: 'M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.001.022.015.045.036.057a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z' },
  { key: 'x',         label: 'X',         urlPattern: /^https?:\/\/(www\.)?(x\.com|twitter\.com)\//,           svgPath: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.213 5.567L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
  { key: 'instagram', label: 'Instagram', urlPattern: /^https?:\/\/(www\.)?instagram\.com\//,                  svgPath: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.059 1.69.073 4.949.073 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
  { key: 'facebook',  label: 'Facebook',  urlPattern: /^https?:\/\/(www\.)?(facebook\.com|fb\.com|fb\.me)\//,  svgPath: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
  { key: 'tiktok',    label: 'TikTok',    urlPattern: /^https?:\/\/(www\.)?tiktok\.com\//,                      svgPath: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z' },
  { key: 'steam',     label: 'Steam',     urlPattern: /^https?:\/\/(www\.)?steamcommunity\.com\//,             svgPath: 'M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.029 4.524 4.524s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.455 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.252 0-2.265-1.014-2.265-2.265z' },
  { key: 'linkedin',  label: 'LinkedIn',  urlPattern: /^https?:\/\/(www\.)?linkedin\.com\//,                   svgPath: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
  { key: 'github',    label: 'GitHub',    urlPattern: /^https?:\/\/(www\.)?github\.com\//,                     svgPath: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' },
];

export const SOCIAL_NETWORK_MAP: Record<string, SocialNetworkDef> = Object.fromEntries(
  SOCIAL_NETWORKS.map(n => [n.key, n])
);

export const VERIFY_SOCIAL_NETWORKS = SOCIAL_NETWORKS.filter(n =>
  ['x', 'instagram'].includes(n.key)
);
