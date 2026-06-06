export interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  created_at?: string;
}

export interface LeaderboardEntry {
  user_id: string;
  nickname: string;
  total_points: number;
}
