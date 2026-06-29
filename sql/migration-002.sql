-- ============================================================
-- MIGRACJA: stage, RPC, RLS dla MŚ 2026
-- Uruchom w Supabase SQL Editor
-- ============================================================

-- 1. Dodaj kolumnę stage do tabeli matches
ALTER TABLE matches ADD COLUMN IF NOT EXISTS stage INTEGER DEFAULT 1;

-- 2. Dodaj indeks na stage
CREATE INDEX IF NOT EXISTS idx_matches_stage ON matches(stage);

-- 3. Utwórz RPC do przeliczania punktów po zakończeniu meczu
CREATE OR REPLACE FUNCTION calculate_match_points(
  p_match_id UUID,
  p_home_score INT,
  p_away_score INT
) RETURNS void AS $$
DECLARE
  rec RECORD;
BEGIN
  UPDATE matches
  SET home_score = p_home_score,
      away_score = p_away_score,
      finished = TRUE
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

-- 4. Zaktualizuj RLS dla predictions (serwerowa blokada czasowa)
DROP POLICY IF EXISTS "predictions_select" ON predictions;
DROP POLICY IF EXISTS "predictions_insert" ON predictions;
DROP POLICY IF EXISTS "predictions_update" ON predictions;

CREATE POLICY "predictions_select" ON predictions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "predictions_insert" ON predictions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM matches WHERE id = match_id AND match_date > NOW())
  );

CREATE POLICY "predictions_update" ON predictions
  FOR UPDATE USING (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM matches WHERE id = match_id AND match_date > NOW())
  );

-- 5. Dodaj swojego użytkownika jako admina (zastąp UUID swoim ID)
-- INSERT INTO admins (user_id) VALUES ('twój-uuid');

-- 6. Jeśli masz już mecze w bazie ustaw stage=1 dla wszystkich istniejących
UPDATE matches SET stage = 1 WHERE stage IS NULL;
