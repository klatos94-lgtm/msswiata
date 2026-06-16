-- ============================================================
-- MIGRACJA 006: dodaj tomorrow_matches do get_dashboard RPC
-- Wykonaj w SQL Editorze w Supabase Dashboard
-- ============================================================

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
  v_tomorrow_matches JSON;
  v_user_predictions JSON;
BEGIN
  IF auth.role() <> 'authenticated' THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
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

  SELECT JSON_AGG(row_to_json(t)) INTO v_tomorrow_matches
  FROM (
    SELECT m.*
    FROM public.matches m
    WHERE m.match_date >= date_trunc('day', now() AT TIME ZONE 'UTC') + INTERVAL '1 day'
      AND m.match_date < date_trunc('day', now() AT TIME ZONE 'UTC') + INTERVAL '2 days'
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
    'tomorrow_matches', COALESCE(v_tomorrow_matches, '[]'::JSON),
    'predictions', COALESCE(v_user_predictions, '[]'::JSON)
  );
END;
$$;
