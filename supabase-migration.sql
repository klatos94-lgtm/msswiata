-- ============================================================
-- WORLD CUP BETTING — Supabase Migration
-- Wykonaj w SQL Editorze w Supabase Dashboard
-- ============================================================

-- ============================================================
-- 1. TWORZENIE TABEL (jeśli nie istnieją)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nickname TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  match_date TIMESTAMPTZ NOT NULL,
  round INT DEFAULT 1,
  stage INT DEFAULT 1,
  home_score INT,
  away_score INT,
  finished BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  predicted_home INT NOT NULL,
  predicted_away INT NOT NULL,
  points INT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, match_id)
);

CREATE TABLE IF NOT EXISTS public.admins (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE
);

-- ============================================================
-- 2. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- --- users ---
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_select_public" ON public.users;
CREATE POLICY "users_select_public" ON public.users
  FOR SELECT USING (true);

-- --- matches ---
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "matches_select_all" ON public.matches;
CREATE POLICY "matches_select_all" ON public.matches
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "matches_insert_admin" ON public.matches;
CREATE POLICY "matches_insert_admin" ON public.matches
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "matches_update_admin" ON public.matches;
CREATE POLICY "matches_update_admin" ON public.matches
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
  );

-- --- predictions ---
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "predictions_select_own" ON public.predictions;
CREATE POLICY "predictions_select_own" ON public.predictions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "predictions_select_admin" ON public.predictions;
CREATE POLICY "predictions_select_admin" ON public.predictions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "predictions_select_finished" ON public.predictions;
CREATE POLICY "predictions_select_finished" ON public.predictions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.matches m WHERE m.id = match_id AND m.finished)
  );

DROP POLICY IF EXISTS "predictions_insert_own" ON public.predictions;
CREATE POLICY "predictions_insert_own" ON public.predictions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "predictions_update_own" ON public.predictions;
CREATE POLICY "predictions_update_own" ON public.predictions
  FOR UPDATE USING (auth.uid() = user_id);

-- --- admins ---
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_select_all" ON public.admins;
CREATE POLICY "admins_select_all" ON public.admins
  FOR SELECT USING (true);

-- ============================================================
-- 3. FUNKCJE RPC (Remote Procedure Calls)
-- ============================================================

-- --- get_leaderboard: ranking graczy (punkty, nickname) ---
CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE (
  user_id UUID,
  nickname TEXT,
  total_points BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() <> 'authenticated' THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT
    u.id AS user_id,
    u.nickname,
    COALESCE(SUM(p.points), 0)::BIGINT AS total_points
  FROM public.users u
  LEFT JOIN public.predictions p ON p.user_id = u.id
  GROUP BY u.id, u.nickname
  ORDER BY total_points DESC;
END;
$$;

-- --- get_dashboard: dane dla dashboardu w jednym zapytaniu ---
CREATE OR REPLACE FUNCTION public.get_dashboard(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nickname TEXT;
  v_total_points BIGINT;
  v_prediction_count INT;
  v_correct_results INT;
  v_exact_scores INT;
  v_today_matches JSON;
  v_user_predictions JSON;
BEGIN
  IF auth.role() <> 'authenticated' THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT u.nickname INTO v_nickname
  FROM public.users u WHERE u.id = p_user_id;

  SELECT
    COALESCE(SUM(p.points), 0)::BIGINT,
    COUNT(p.id)::INT,
    COUNT(p.id) FILTER (WHERE p.points = 1)::INT,
    COUNT(p.id) FILTER (WHERE p.points >= 3)::INT
  INTO v_total_points, v_prediction_count, v_correct_results, v_exact_scores
  FROM public.predictions p
  WHERE p.user_id = p_user_id;

  SELECT JSON_AGG(row_to_json(t)) INTO v_today_matches
  FROM (
    SELECT m.*
    FROM public.matches m
    WHERE m.match_date >= date_trunc('day', now() AT TIME ZONE 'UTC')
      AND m.match_date < date_trunc('day', now() AT TIME ZONE 'UTC') + INTERVAL '1 day'
    ORDER BY m.match_date
  ) t;

  SELECT JSON_AGG(row_to_json(t)) INTO v_user_predictions
  FROM (
    SELECT p.match_id, p.predicted_home, p.predicted_away, p.points
    FROM public.predictions p
    WHERE p.user_id = p_user_id
  ) t;

  RETURN JSON_BUILD_OBJECT(
    'nickname', v_nickname,
    'total_points', v_total_points,
    'prediction_count', v_prediction_count,
    'correct_results', v_correct_results,
    'exact_scores', v_exact_scores,
    'today_matches', COALESCE(v_today_matches, '[]'::JSON),
    'predictions', COALESCE(v_user_predictions, '[]'::JSON)
  );
END;
$$;

-- --- calculate_match_points: zakończ mecz i przelicz punkty ---
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
END;
$$;

-- --- recalculate_match_points: przelicz punkty dla istniejącego meczu ---
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
END;
$$;

-- --- get_matches_with_predictions: mecze + typy usera w jednym zapytaniu ---
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

  SELECT JSON_AGG(row_to_json(m)) INTO v_matches
  FROM (
    SELECT * FROM public.matches ORDER BY match_date
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

-- --- get_group_table: oblicza tabelę grupową ---
CREATE OR REPLACE FUNCTION public.get_group_table()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
BEGIN
  IF auth.role() <> 'authenticated' THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  WITH group_teams (team, group_label) AS (
    VALUES
      ('Meksyk', 'A'), ('Republika Południowej Afryki', 'A'), ('Korea Południowa', 'A'), ('Czechy', 'A'),
      ('Kanada', 'B'), ('Bośnia i Hercegowina', 'B'), ('Szwajcaria', 'B'), ('Katar', 'B'),
      ('USA', 'C'), ('Paragwaj', 'C'), ('Australia', 'C'), ('Turcja', 'C'),
      ('Haiti', 'D'), ('Szkocja', 'D'), ('Brazylia', 'D'), ('Maroko', 'D'),
      ('Niemcy', 'E'), ('Curacao', 'E'), ('Wybrzeże Kości Słoniowej', 'E'), ('Ekwador', 'E'),
      ('Holandia', 'F'), ('Japonia', 'F'), ('Szwecja', 'F'), ('Tunezja', 'F'),
      ('Hiszpania', 'G'), ('Republika Zielonego Przylądka', 'G'), ('Arabia Saudyjska', 'G'), ('Urugwaj', 'G'),
      ('Belgia', 'H'), ('Egipt', 'H'), ('Iran', 'H'), ('Nowa Zelandia', 'H'),
      ('Francja', 'I'), ('Senegal', 'I'), ('Irak', 'I'), ('Norwegia', 'I'),
      ('Argentyna', 'J'), ('Algieria', 'J'), ('Austria', 'J'), ('Jordania', 'J'),
      ('Portugalia', 'K'), ('DR Konga', 'K'), ('Uzbekistan', 'K'), ('Kolumbia', 'K'),
      ('Anglia', 'L'), ('Chorwacja', 'L'), ('Ghana', 'L'), ('Panama', 'L')
  ),
  team_stats AS (
    SELECT
      gt.team,
      gt.group_label,
      COUNT(m.id) FILTER (WHERE m.finished) AS pld,
      COUNT(m.id) FILTER (WHERE m.finished AND m.home_score > m.away_score AND m.home_team = gt.team) +
        COUNT(m.id) FILTER (WHERE m.finished AND m.away_score > m.home_score AND m.away_team = gt.team) AS w,
      COUNT(m.id) FILTER (WHERE m.finished AND m.home_score = m.away_score AND (m.home_team = gt.team OR m.away_team = gt.team)) AS d,
      COUNT(m.id) FILTER (WHERE m.finished AND m.home_score < m.away_score AND m.home_team = gt.team) +
        COUNT(m.id) FILTER (WHERE m.finished AND m.away_score < m.home_score AND m.away_team = gt.team) AS l,
      COALESCE(SUM(CASE WHEN m.home_team = gt.team THEN m.home_score ELSE 0 END), 0) +
        COALESCE(SUM(CASE WHEN m.away_team = gt.team THEN m.away_score ELSE 0 END), 0) AS gf,
      COALESCE(SUM(CASE WHEN m.home_team = gt.team THEN m.away_score ELSE 0 END), 0) +
        COALESCE(SUM(CASE WHEN m.away_team = gt.team THEN m.home_score ELSE 0 END), 0) AS ga
    FROM group_teams gt
    LEFT JOIN public.matches m ON (m.home_team = gt.team OR m.away_team = gt.team) AND m.finished AND m.stage = 1
    GROUP BY gt.team, gt.group_label
  )
  SELECT JSON_AGG(json_build_object(
    'group_label', ts.group_label,
    'teams', (SELECT JSON_AGG(json_build_object(
      'team', ts2.team,
      'pld', ts2.pld,
      'w', ts2.w,
      'd', ts2.d,
      'l', ts2.l,
      'gf', ts2.gf,
      'ga', ts2.ga,
      'gd', ts2.gf - ts2.ga,
      'pts', ts2.w * 3 + ts2.d
    ) ORDER BY (ts2.w * 3 + ts2.d) DESC, (ts2.gf - ts2.ga) DESC, ts2.gf DESC)
    FROM team_stats ts2 WHERE ts2.group_label = ts.group_label)
  ) ORDER BY ts.group_label)
  INTO v_result
  FROM team_stats ts
  GROUP BY ts.group_label;

  RETURN COALESCE(v_result, '[]'::JSON);
END;
$$;

-- --- get_cartesian_table: wszystkie typy + mecze + userzy do tabeli kartezjańskiej ---
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
    SELECT id, home_team, away_team, match_date, round, stage, home_score, away_score, finished
    FROM public.matches ORDER BY match_date
  ) m;

  SELECT JSON_AGG(row_to_json(p)) INTO v_predictions
  FROM (
    SELECT user_id, match_id, predicted_home, predicted_away, points
    FROM public.predictions
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

-- --- get_user_detail: typy konkretnego usera (do rankingu) ---
CREATE OR REPLACE FUNCTION public.get_user_detail(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nickname TEXT;
  v_predictions JSON;
BEGIN
  IF auth.role() <> 'authenticated' THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT u.nickname INTO v_nickname
  FROM public.users u WHERE u.id = p_user_id;

  SELECT JSON_AGG(row_to_json(p)) INTO v_predictions
  FROM (
    SELECT p.match_id, p.predicted_home, p.predicted_away, p.points
    FROM public.predictions p
    WHERE p.user_id = p_user_id
  ) p;

  RETURN JSON_BUILD_OBJECT(
    'nickname', v_nickname,
    'predictions', COALESCE(v_predictions, '[]'::JSON)
  );
END;
$$;

-- ============================================================
-- 4. SEED: wgraj mecze z JSON (uruchom osobno po dodaniu danych)
-- ============================================================
-- Skopiuj dane z data/matches.json i wklej jako:
--
-- INSERT INTO public.matches (round, stage, home_team, away_team, match_date)
-- VALUES
--   (1, 1, 'Meksyk', 'Republika Południowej Afryki', '2026-06-11T19:00:00Z'),
--   ...
-- ON CONFLICT DO NOTHING;
