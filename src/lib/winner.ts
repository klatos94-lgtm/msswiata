import type { Match } from "@/types/match";

export function getMatchWinner(match: Match): string | null {
  if (!match.finished || match.home_score == null || match.away_score == null)
    return null;

  if (match.winner) return match.winner;

  if (match.home_score > match.away_score) return match.home_team;
  if (match.away_score > match.home_score) return match.away_team;

  return null;
}
