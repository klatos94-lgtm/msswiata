export interface Match {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  round: number;
  stage: number;
  home_score: number | null;
  away_score: number | null;
  finished: boolean;
  bracket_order: number | null;
  created_at?: string;
}
