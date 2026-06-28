-- ============================================================
-- MIGRACJA 006: Drabinka (bracket) - bracket_order + auto-advance
-- Uruchom w Supabase SQL Editor po supabase-migration.sql
-- ============================================================

-- 1. Dodaj kolumnę bracket_order
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS bracket_order INT;

CREATE INDEX IF NOT EXISTS idx_matches_bracket_order ON public.matches(bracket_order);

-- 2. UPDATE meczów R4-R8 bracket_order + drużyny
-- Dopasowujemy po (round, home_team, away_team) bo te pary były unikalne w seedzie

-- Runda 4 (1/16 finału)
UPDATE public.matches SET bracket_order = 1,  home_team = 'Republika Południowej Afryki', away_team = 'Kanada',           match_date = '2026-06-28T21:00:00Z' WHERE round = 4 AND home_team = 'Runner-up A' AND away_team = 'Runner-up B';
UPDATE public.matches SET bracket_order = 2,  home_team = 'Brazylia',                     away_team = 'Japonia',           match_date = '2026-06-29T19:00:00Z' WHERE round = 4 AND home_team = 'Winner E' AND away_team = '3rd (ABC-DF)';
UPDATE public.matches SET bracket_order = 3,  home_team = 'Niemcy',                       away_team = 'Paragwaj',          match_date = '2026-06-29T22:30:00Z' WHERE round = 4 AND home_team = 'Winner F' AND away_team = 'Runner-up C';
UPDATE public.matches SET bracket_order = 4,  home_team = 'Holandia',                     away_team = 'Maroko',            match_date = '2026-06-30T03:00:00Z' WHERE round = 4 AND home_team = 'Winner C' AND away_team = 'Runner-up F';
UPDATE public.matches SET bracket_order = 5,  home_team = 'Wybrzeże Kości Słoniowej',    away_team = 'Norwegia',           match_date = '2026-06-30T19:00:00Z' WHERE round = 4 AND home_team = 'Winner I' AND away_team = '3rd (CD-FGH)';
UPDATE public.matches SET bracket_order = 6,  home_team = 'Francja',                      away_team = 'Szwecja',            match_date = '2026-06-30T23:00:00Z' WHERE round = 4 AND home_team = 'Runner-up E' AND away_team = 'Runner-up I';
UPDATE public.matches SET bracket_order = 7,  home_team = 'Meksyk',                       away_team = 'Ekwador',            match_date = '2026-07-01T03:00:00Z' WHERE round = 4 AND home_team = 'Winner A' AND away_team = '3rd (CE-FHI)';
UPDATE public.matches SET bracket_order = 8,  home_team = 'Anglia',                       away_team = 'DR Konga',           match_date = '2026-07-01T18:00:00Z' WHERE round = 4 AND home_team = 'Winner L' AND away_team = '3rd (EH-IJK)';
UPDATE public.matches SET bracket_order = 9,  home_team = 'Belgia',                       away_team = 'Senegal',            match_date = '2026-07-01T22:00:00Z' WHERE round = 4 AND home_team = 'Winner D' AND away_team = '3rd (BE-FIJ)';
UPDATE public.matches SET bracket_order = 10, home_team = 'USA',                          away_team = 'Bośnia i Hercegowina', match_date = '2026-07-02T02:00:00Z' WHERE round = 4 AND home_team = 'Winner G' AND away_team = '3rd (AE-HIJ)';
UPDATE public.matches SET bracket_order = 11, home_team = 'Hiszpania',                    away_team = 'Austria',            match_date = '2026-07-02T21:00:00Z' WHERE round = 4 AND home_team = 'Runner-up K' AND away_team = 'Runner-up L';
UPDATE public.matches SET bracket_order = 12, home_team = 'Portugalia',                   away_team = 'Chorwacja',          match_date = '2026-07-03T01:00:00Z' WHERE round = 4 AND home_team = 'Winner H' AND away_team = 'Runner-up J';
UPDATE public.matches SET bracket_order = 13, home_team = 'Szwajcaria',                   away_team = 'Algieria',           match_date = '2026-07-03T05:00:00Z' WHERE round = 4 AND home_team = 'Winner B' AND away_team = '3rd (EF-GIJ)';
UPDATE public.matches SET bracket_order = 14, home_team = 'Australia',                    away_team = 'Egipt',              match_date = '2026-07-03T20:00:00Z' WHERE round = 4 AND home_team = 'Winner J' AND away_team = 'Runner-up H';
UPDATE public.matches SET bracket_order = 15, home_team = 'Argentyna',                    away_team = 'Republika Zielonego Przylądka', match_date = '2026-07-04T00:00:00Z' WHERE round = 4 AND home_team = 'Winner K' AND away_team = '3rd (DE-IJL)';
UPDATE public.matches SET bracket_order = 16, home_team = 'Kolumbia',                     away_team = 'Ghana',              match_date = '2026-07-04T03:30:00Z' WHERE round = 4 AND home_team = 'Runner-up D' AND away_team = 'Runner-up G';

-- Runda 5 (1/8 finału) - placeholders, wypełnią się automatycznie
UPDATE public.matches SET bracket_order = 17, home_team = '', away_team = '', match_date = '2026-07-04T19:00:00Z' WHERE round = 5 AND home_team = 'Winner 74' AND away_team = 'Winner 77';
UPDATE public.matches SET bracket_order = 18, home_team = '', away_team = '', match_date = '2026-07-04T23:00:00Z' WHERE round = 5 AND home_team = 'Winner 73' AND away_team = 'Winner 75';
UPDATE public.matches SET bracket_order = 19, home_team = '', away_team = '', match_date = '2026-07-05T22:00:00Z' WHERE round = 5 AND home_team = 'Winner 76' AND away_team = 'Winner 78';
UPDATE public.matches SET bracket_order = 20, home_team = '', away_team = '', match_date = '2026-07-06T02:00:00Z' WHERE round = 5 AND home_team = 'Winner 79' AND away_team = 'Winner 80';
UPDATE public.matches SET bracket_order = 21, home_team = '', away_team = '', match_date = '2026-07-06T21:00:00Z' WHERE round = 5 AND home_team = 'Winner 83' AND away_team = 'Winner 84';
UPDATE public.matches SET bracket_order = 22, home_team = '', away_team = '', match_date = '2026-07-07T02:00:00Z' WHERE round = 5 AND home_team = 'Winner 81' AND away_team = 'Winner 82';
UPDATE public.matches SET bracket_order = 23, home_team = '', away_team = '', match_date = '2026-07-07T18:00:00Z' WHERE round = 5 AND home_team = 'Winner 86' AND away_team = 'Winner 88';
UPDATE public.matches SET bracket_order = 24, home_team = '', away_team = '', match_date = '2026-07-07T22:00:00Z' WHERE round = 5 AND home_team = 'Winner 85' AND away_team = 'Winner 87';

-- Runda 6 (ćwierćfinały)
UPDATE public.matches SET bracket_order = 25, home_team = '', away_team = '', match_date = '2026-07-09T22:00:00Z' WHERE round = 6 AND home_team = 'Winner 89' AND away_team = 'Winner 90';
UPDATE public.matches SET bracket_order = 26, home_team = '', away_team = '', match_date = '2026-07-10T21:00:00Z' WHERE round = 6 AND home_team = 'Winner 93' AND away_team = 'Winner 94';
UPDATE public.matches SET bracket_order = 27, home_team = '', away_team = '', match_date = '2026-07-11T23:00:00Z' WHERE round = 6 AND home_team = 'Winner 91' AND away_team = 'Winner 92';
UPDATE public.matches SET bracket_order = 28, home_team = '', away_team = '', match_date = '2026-07-12T03:00:00Z' WHERE round = 6 AND home_team = 'Winner 95' AND away_team = 'Winner 96';

-- Runda 7 (półfinały)
UPDATE public.matches SET bracket_order = 29, home_team = '', away_team = '', match_date = '2026-07-14T21:00:00Z' WHERE round = 7 AND home_team = 'Winner 97' AND away_team = 'Winner 98';
UPDATE public.matches SET bracket_order = 30, home_team = '', away_team = '', match_date = '2026-07-15T21:00:00Z' WHERE round = 7 AND home_team = 'Winner 99' AND away_team = 'Winner 100';

-- Runda 8 (finały)
UPDATE public.matches SET bracket_order = 31, home_team = '', away_team = '', match_date = '2026-07-18T23:00:00Z' WHERE round = 8 AND home_team = 'Runner-up 101' AND away_team = 'Runner-up 102';
UPDATE public.matches SET bracket_order = 32, home_team = '', away_team = '', match_date = '2026-07-19T21:00:00Z' WHERE round = 8 AND home_team = 'Winner 101' AND away_team = 'Winner 102';

-- 3. RPC: advance_bracket_winner - przesuwa zwycięzcę/przegranego do następnej rundy
CREATE OR REPLACE FUNCTION public.advance_bracket_winner(p_match_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_home_team TEXT;
  v_away_team TEXT;
  v_home_score INT;
  v_away_score INT;
  v_winner TEXT;
  v_loser TEXT;
  v_order INT;
  v_target_id UUID;
  rec RECORD;
BEGIN
  SELECT home_team, away_team, home_score, away_score, bracket_order
  INTO v_home_team, v_away_team, v_home_score, v_away_score, v_order
  FROM public.matches WHERE id = p_match_id;

  IF v_home_score IS NULL OR v_away_score IS NULL OR v_home_team = '' OR v_away_team = '' THEN
    RETURN;
  END IF;

  IF v_home_score > v_away_score THEN
    v_winner := v_home_team;
    v_loser := v_away_team;
  ELSE
    v_winner := v_away_team;
    v_loser := v_home_team;
  END IF;

  -- Mapa awansu: (source_order, target_order, slot, team_type)
  FOR rec IN
    SELECT * FROM (VALUES
      (1::int, 17::int, 'home'::text, 'winner'::text),
      (4, 17, 'away', 'winner'),
      (3, 18, 'home', 'winner'),
      (6, 18, 'away', 'winner'),
      (2, 19, 'home', 'winner'),
      (5, 19, 'away', 'winner'),
      (7, 20, 'home', 'winner'),
      (8, 20, 'away', 'winner'),
      (12, 21, 'home', 'winner'),
      (11, 21, 'away', 'winner'),
      (10, 22, 'home', 'winner'),
      (9, 22, 'away', 'winner'),
      (15, 23, 'home', 'winner'),
      (14, 23, 'away', 'winner'),
      (13, 24, 'home', 'winner'),
      (16, 24, 'away', 'winner'),
      (17, 25, 'home', 'winner'),
      (18, 25, 'away', 'winner'),
      (21, 26, 'home', 'winner'),
      (22, 26, 'away', 'winner'),
      (19, 27, 'home', 'winner'),
      (20, 27, 'away', 'winner'),
      (23, 28, 'home', 'winner'),
      (24, 28, 'away', 'winner'),
      (25, 29, 'home', 'winner'),
      (26, 29, 'away', 'winner'),
      (27, 30, 'home', 'winner'),
      (28, 30, 'away', 'winner'),
      (29, 32, 'home', 'winner'),
      (30, 32, 'away', 'winner'),
      (29, 31, 'home', 'loser'),
      (30, 31, 'away', 'loser')
    ) AS t(source_order, target_order, slot, team_type)
    WHERE source_order = v_order
  LOOP
    SELECT id INTO v_target_id
    FROM public.matches
    WHERE bracket_order = rec.target_order;

    IF rec.team_type = 'winner' THEN
      IF rec.slot = 'home' THEN
        UPDATE public.matches SET home_team = v_winner WHERE id = v_target_id;
      ELSE
        UPDATE public.matches SET away_team = v_winner WHERE id = v_target_id;
      END IF;
    ELSE
      IF rec.slot = 'home' THEN
        UPDATE public.matches SET home_team = v_loser WHERE id = v_target_id;
      ELSE
        UPDATE public.matches SET away_team = v_loser WHERE id = v_target_id;
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- 4. Zaktualizuj calculate_match_points - dodaj wywołanie advance_bracket_winner dla stage=2
CREATE OR REPLACE FUNCTION public.calculate_match_points(
  p_match_id UUID,
  p_home_score INT,
  p_away_score INT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stage INT;
  v_mult INT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT stage INTO v_stage FROM public.matches WHERE id = p_match_id;
  v_mult := CASE WHEN v_stage >= 2 THEN 2 ELSE 1 END;

  UPDATE public.matches
  SET home_score = p_home_score,
      away_score = p_away_score,
      finished = true
  WHERE id = p_match_id;

  UPDATE public.predictions
  SET points = (
    CASE
      WHEN predicted_home = p_home_score AND predicted_away = p_away_score
        THEN 3 * v_mult
      WHEN (predicted_home - predicted_away > 0 AND p_home_score - p_away_score > 0)
        OR (predicted_home - predicted_away < 0 AND p_home_score - p_away_score < 0)
        OR (predicted_home - predicted_away = 0 AND p_home_score - p_away_score = 0)
        THEN 1 * v_mult
      ELSE 0
    END
  )
  WHERE match_id = p_match_id;

  -- Auto-advance dla meczów pucharowych
  IF v_stage >= 2 THEN
    PERFORM public.advance_bracket_winner(p_match_id);
  END IF;
END;
$$;

-- 5. Zaktualizuj recalculate_match_points - też wywołaj advance dla stage=2
CREATE OR REPLACE FUNCTION public.recalculate_match_points(
  p_match_id UUID,
  p_home_score INT,
  p_away_score INT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stage INT;
  v_mult INT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT stage INTO v_stage FROM public.matches WHERE id = p_match_id;
  v_mult := CASE WHEN v_stage >= 2 THEN 2 ELSE 1 END;

  UPDATE public.matches
  SET home_score = p_home_score,
      away_score = p_away_score
  WHERE id = p_match_id;

  UPDATE public.predictions
  SET points = (
    CASE
      WHEN predicted_home = p_home_score AND predicted_away = p_away_score
        THEN 3 * v_mult
      WHEN (predicted_home - predicted_away > 0 AND p_home_score - p_away_score > 0)
        OR (predicted_home - predicted_away < 0 AND p_home_score - p_away_score < 0)
        OR (predicted_home - predicted_away = 0 AND p_home_score - p_away_score = 0)
        THEN 1 * v_mult
      ELSE 0
    END
  )
  WHERE match_id = p_match_id;

  -- Auto-advance dla meczów pucharowych (ważne przy zmianie wyniku)
  IF v_stage >= 2 THEN
    PERFORM public.advance_bracket_winner(p_match_id);
  END IF;
END;
$$;

-- 6. Zaktualizuj get_cartesian_table - dodaj bracket_order, ukryj nierozwiązane sloty drabinki
CREATE OR REPLACE FUNCTION public.get_cartesian_table()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_matches JSON;
  v_predictions JSON;
  v_users JSON;
BEGIN
  IF auth.role() <> 'authenticated' THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT JSON_AGG(row_to_json(m)) INTO v_matches
  FROM (
    SELECT id, home_team, away_team, match_date, round, stage, home_score, away_score, finished, bracket_order
    FROM public.matches
    WHERE home_team <> ''
    ORDER BY match_date
  ) m;

  SELECT JSON_AGG(row_to_json(p)) INTO v_predictions
  FROM (
    SELECT
      p.user_id,
      p.match_id,
      CASE WHEN p.user_id = auth.uid() OR m.match_date <= NOW() THEN p.predicted_home ELSE NULL END AS predicted_home,
      CASE WHEN p.user_id = auth.uid() OR m.match_date <= NOW() THEN p.predicted_away ELSE NULL END AS predicted_away,
      CASE WHEN m.finished THEN p.points ELSE NULL END AS points
    FROM public.predictions p
    JOIN public.matches m ON m.id = p.match_id
    WHERE m.home_team <> ''
  ) p;

  SELECT JSON_AGG(row_to_json(u)) INTO v_users
  FROM (
    SELECT id, nickname
    FROM public.users
  ) u;

  RETURN JSON_BUILD_OBJECT(
    'matches', COALESCE(v_matches, '[]'::JSON),
    'predictions', COALESCE(v_predictions, '[]'::JSON),
    'users', COALESCE(v_users, '[]'::JSON)
  );
END;
$$;

-- 7. Zaktualizuj get_matches_with_predictions - ukryj nierozwiązane sloty drabinki
CREATE OR REPLACE FUNCTION public.get_matches_with_predictions(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_matches JSON;
  v_predictions JSON;
BEGIN
  IF auth.role() <> 'authenticated' THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT JSON_AGG(row_to_json(m)) INTO v_matches
  FROM (
    SELECT * FROM public.matches WHERE home_team <> '' ORDER BY match_date
  ) m;

  SELECT JSON_AGG(row_to_json(p)) INTO v_predictions
  FROM (
    SELECT match_id, predicted_home, predicted_away, points
    FROM public.predictions WHERE user_id = p_user_id
  ) p;

  RETURN JSON_BUILD_OBJECT(
    'matches', COALESCE(v_matches, '[]'::JSON),
    'predictions', COALESCE(v_predictions, '[]'::JSON)
  );
END;
$$;

-- 8. UPDATE stage=1 dla meczów grupowych (jeśli brak)
UPDATE public.matches SET stage = 1 WHERE stage IS NULL;
