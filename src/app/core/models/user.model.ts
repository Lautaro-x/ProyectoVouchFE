export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  role: 'user' | 'critic' | 'admin';
  created_at: string;
}
