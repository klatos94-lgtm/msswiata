export function calculatePoints(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number,
  stage: number = 1
): number {
  const mult = stage || 1;
  const exact = predictedHome === actualHome && predictedAway === actualAway;
  if (exact) return 3 * mult;

  const predictedDiff = predictedHome - predictedAway;
  const actualDiff = actualHome - actualAway;

  const sameWinner =
    (predictedDiff > 0 && actualDiff > 0) ||
    (predictedDiff < 0 && actualDiff < 0) ||
    (predictedDiff === 0 && actualDiff === 0);

  if (sameWinner) return 1 * mult;

  return 0;
}
