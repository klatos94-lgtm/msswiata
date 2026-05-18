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

export async function calculateAllPoints() {
  const { getSupabaseClient } = await import("./supabase");
  const supabase = getSupabaseClient();

  const { data: finishedMatches } = await supabase
    .from("matches")
    .select("*")
    .eq("finished", true);

  if (!finishedMatches) return;

  for (const match of finishedMatches) {
    const { data: predictions } = await supabase
      .from("predictions")
      .select("*")
      .eq("match_id", match.id);

    if (!predictions) continue;

    for (const prediction of predictions) {
      const points = calculatePoints(
        prediction.predicted_home,
        prediction.predicted_away,
        match.home_score,
        match.away_score
      );

      await supabase
        .from("predictions")
        .update({ points })
        .eq("id", prediction.id);
    }
  }
}
