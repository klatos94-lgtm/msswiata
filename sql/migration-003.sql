-- ============================================================
-- MIGRACJA: recalculate_match_points – edycja wyniku po zatwierdzeniu
-- Uruchom w Supabase SQL Editor
-- ============================================================

CREATE OR REPLACE FUNCTION recalculate_match_points(
  p_match_id UUID,
  p_home_score INT,
  p_away_score INT
) RETURNS void AS $$
DECLARE
  rec RECORD;
BEGIN
  UPDATE matches
  SET home_score = p_home_score,
      away_score = p_away_score
  WHERE id = p_match_id;

  FOR rec IN
    SELECT p.id,
      CASE
        WHEN p.predicted_home = p_home_score AND p.predicted_away = p_away_score THEN 3
        WHEN (p.predicted_home - p.predicted_away > 0 AND p_home_score - p_away_score > 0) OR
             (p.predicted_home - p.predicted_away < 0 AND p_home_score - p_away_score < 0) OR
             (p.predicted_home = p.predicted_away AND p_home_score = p_away_score) THEN 1
        ELSE 0
      END AS pts
    FROM predictions p
    WHERE p.match_id = p_match_id
  LOOP
    UPDATE predictions SET points = rec.pts WHERE id = rec.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
