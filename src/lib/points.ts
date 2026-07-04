const DOUBLE_POINTS_DATE = new Date("2026-07-14T00:00:00Z");

function isDoublePoints(matchDate: string | Date): boolean {
  const date = matchDate instanceof Date ? matchDate : new Date(matchDate);
  return date >= DOUBLE_POINTS_DATE;
}

export function calculatePoints(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number,
  matchDate?: string | Date
): number {
  const exact = predictedHome === actualHome && predictedAway === actualAway;
  if (exact) return (matchDate && isDoublePoints(matchDate)) ? 6 : 3;

  const predictedDiff = predictedHome - predictedAway;
  const actualDiff = actualHome - actualAway;

  const sameWinner =
    (predictedDiff > 0 && actualDiff > 0) ||
    (predictedDiff < 0 && actualDiff < 0) ||
    (predictedDiff === 0 && actualDiff === 0);

  if (sameWinner) return (matchDate && isDoublePoints(matchDate)) ? 2 : 1;

  return 0;
}
