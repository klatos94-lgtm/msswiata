export function calculatePoints(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number
): number {
  const exact = predictedHome === actualHome && predictedAway === actualAway;
  if (exact) return 3;

  const predictedDiff = predictedHome - predictedAway;
  const actualDiff = actualHome - actualAway;

  const sameWinner =
    (predictedDiff > 0 && actualDiff > 0) ||
    (predictedDiff < 0 && actualDiff < 0) ||
    (predictedDiff === 0 && actualDiff === 0);

  if (sameWinner) return 1;

  return 0;
}
