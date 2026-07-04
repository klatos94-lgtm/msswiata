-- ============================================================
-- MIGRACJA 007: Kolumna winner + aktualizacja RPC do obsługi remisów
-- Uruchom w Supabase SQL Editor
-- ============================================================

-- 1. Dodaj kolumnę winner
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS winner TEXT;
CREATE INDEX IF NOT EXISTS idx_matches_winner ON public.matches(winner);

-- 2. Zaktualizuj advance_bracket_winner – przyjmuje p_winner, obsługuje remisy
CREATE OR REPLACE FUNCTION public.advance_bracket_winner(
  p_match_id UUID,
  p_winner TEXT DEFAULT NULL
)
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

  -- Ustal zwycięzcę: najpierw p_winner (ręcznie wskazany), potem po wyniku
  IF p_winner IS NOT NULL THEN
    v_winner := p_winner;
  ELSIF v_home_score > v_away_score THEN
    v_winner := v_home_team;
  ELSIF v_away_score > v_home_score THEN
    v_winner := v_away_team;
  ELSE
    -- Remis bez wskazanego zwycięzcy → nie awansuj
    RETURN;
  END IF;

  -- Zapisz zwycięzcę w kolumnie winner (jeśli nie był wcześniej ustawiony)
  UPDATE public.matches
  SET winner = v_winner
  WHERE id = p_match_id AND winner IS NULL;

  -- Przegrany
  IF v_winner = v_home_team THEN
    v_loser := v_away_team;
  ELSE
    v_loser := v_home_team;
  END IF;

  -- Mapa awansu
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

-- 3. Zaktualizuj calculate_match_points – przyjmuje p_winner
CREATE OR REPLACE FUNCTION public.calculate_match_points(
  p_match_id UUID,
  p_home_score INT,
  p_away_score INT,
  p_winner TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stage INT;
  v_match_date TIMESTAMPTZ;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT stage, match_date INTO v_stage, v_match_date FROM public.matches WHERE id = p_match_id;

  UPDATE public.matches
  SET home_score = p_home_score,
      away_score = p_away_score,
      finished = true,
      winner = COALESCE(p_winner, winner)
  WHERE id = p_match_id;

  UPDATE public.predictions
  SET points = (
    CASE
      WHEN predicted_home = p_home_score AND predicted_away = p_away_score
        THEN (CASE WHEN v_match_date >= '2026-07-14T00:00:00Z' THEN 6 ELSE 3 END)
      WHEN (predicted_home - predicted_away > 0 AND p_home_score - p_away_score > 0)
        OR (predicted_home - predicted_away < 0 AND p_home_score - p_away_score < 0)
        OR (predicted_home - predicted_away = 0 AND p_home_score - p_away_score = 0)
        THEN (CASE WHEN v_match_date >= '2026-07-14T00:00:00Z' THEN 2 ELSE 1 END)
      ELSE 0
    END
  )
  WHERE match_id = p_match_id;

  -- Auto-advance dla meczów pucharowych
  IF v_stage >= 2 THEN
    PERFORM public.advance_bracket_winner(p_match_id, p_winner);
  END IF;
END;
$$;

-- 4. Zaktualizuj recalculate_match_points – też przyjmuje p_winner
CREATE OR REPLACE FUNCTION public.recalculate_match_points(
  p_match_id UUID,
  p_home_score INT,
  p_away_score INT,
  p_winner TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stage INT;
  v_match_date TIMESTAMPTZ;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT stage, match_date INTO v_stage, v_match_date FROM public.matches WHERE id = p_match_id;

  UPDATE public.matches
  SET home_score = p_home_score,
      away_score = p_away_score,
      winner = COALESCE(p_winner, winner)
  WHERE id = p_match_id;

  UPDATE public.predictions
  SET points = (
    CASE
      WHEN predicted_home = p_home_score AND predicted_away = p_away_score
        THEN (CASE WHEN v_match_date >= '2026-07-14T00:00:00Z' THEN 6 ELSE 3 END)
      WHEN (predicted_home - predicted_away > 0 AND p_home_score - p_away_score > 0)
        OR (predicted_home - predicted_away < 0 AND p_home_score - p_away_score < 0)
        OR (predicted_home - predicted_away = 0 AND p_home_score - p_away_score = 0)
        THEN (CASE WHEN v_match_date >= '2026-07-14T00:00:00Z' THEN 2 ELSE 1 END)
      ELSE 0
    END
  )
  WHERE match_id = p_match_id;

  -- Auto-advance dla meczów pucharowych
  IF v_stage >= 2 THEN
    PERFORM public.advance_bracket_winner(p_match_id, p_winner);
  END IF;
END;
$$;
