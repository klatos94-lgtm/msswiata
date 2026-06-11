-- ============================================================
-- MIGRACJA 005: typy graczy widoczne od momentu blokady meczu
-- ============================================================
-- Co zmienia:
--   Typy (predicted_home / predicted_away) innych graczy są
--   widoczne w tabeli kartezjańskiej OD razu po starcie meczu
--   (match_date <= NOW()), a nie dopiero po zakończeniu.
--
--   Punkty (points) nadal tylko dla zakończonych meczów.
--
-- Dotknięte funkcje:
--   1. get_cartesian_table()  – tabela kartezjańska
--   2. get_user_detail()      – typy konkretnego gracza
-- ============================================================

-- -----------------------------------------------------------------
-- 1. get_cartesian_table()
-- -----------------------------------------------------------------
-- Zwraca JSON z:
--   matches     – wszystkie mecze
--   predictions – typy wszystkich graczy do każdego meczu
--   users       – lista graczy (id, nickname)
--
-- Warunek widoczności typów innych graczy:
--   PRZED:  m.finished = true
--   PO:     m.match_date <= NOW()   (mecz wystartował = obstawianie zablokowane)
-- -----------------------------------------------------------------
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
    SELECT
      p.user_id,
      p.match_id,
      CASE WHEN p.user_id = auth.uid() OR m.match_date <= NOW() THEN p.predicted_home ELSE NULL END AS predicted_home,
      CASE WHEN p.user_id = auth.uid() OR m.match_date <= NOW() THEN p.predicted_away ELSE NULL END AS predicted_away,
      CASE WHEN m.finished THEN p.points ELSE NULL END AS points
    FROM public.predictions p
    JOIN public.matches m ON m.id = p.match_id
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

-- -----------------------------------------------------------------
-- 2. get_user_detail(p_user_id)
-- -----------------------------------------------------------------
-- Zwraca JSON z nickname + typami konkretnego gracza.
-- Używane np. po kliknięciu w gracza na leaderboardzie.
--
-- Jeśli oglądasz SWOJE typy → widzisz wszystkie (bez ograniczeń).
-- Jeśli oglądasz typy INNEGO gracza:
--   PRZED:  tylko dla m.finished = true
--   PO:     tylko dla m.match_date <= NOW()   (mecz wystartował)
-- -----------------------------------------------------------------
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

  IF p_user_id = auth.uid() THEN
    SELECT JSON_AGG(row_to_json(p)) INTO v_predictions
    FROM (
      SELECT p.match_id, p.predicted_home, p.predicted_away, p.points
      FROM public.predictions p
      WHERE p.user_id = p_user_id
    ) p;
  ELSE
    SELECT JSON_AGG(row_to_json(p)) INTO v_predictions
    FROM (
      SELECT p.match_id, p.predicted_home, p.predicted_away, p.points
      FROM public.predictions p
      JOIN public.matches m ON m.id = p.match_id AND m.match_date <= NOW()
      WHERE p.user_id = p_user_id
    ) p;
  END IF;

  RETURN JSON_BUILD_OBJECT(
    'nickname', v_nickname,
    'predictions', COALESCE(v_predictions, '[]'::JSON)
  );
END;
$$;
