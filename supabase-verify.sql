-----------------------------
-- supabase-verify.sql
-- Uruchom w SQL Editorze Supabase (Dashboard > SQL Editor)
-- Sprawdza czy migracja została poprawnie zastosowana
-----------------------------

-- 1. Tabele
SELECT '=== TABELE ===' AS info;
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('profiles', 'matches', 'predictions', 'admins');

-- 2. Kolumny w tabelach
SELECT '=== KOLUMNY profiles ===' AS info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

SELECT '=== KOLUMNY matches ===' AS info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'matches'
ORDER BY ordinal_position;

SELECT '=== KOLUMNY predictions ===' AS info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'predictions'
ORDER BY ordinal_position;

SELECT '=== KOLUMNY admins ===' AS info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'admins'
ORDER BY ordinal_position;

-- 3. RLS włączone?
SELECT '=== RLS STATUS ===' AS info;
SELECT relname AS table_name, relrowsecurity AS rls_enabled
FROM pg_class
WHERE relname IN ('profiles', 'matches', 'predictions', 'admins') AND relnamespace = 'public'::regnamespace;

-- 4. Wszystkie polityki RLS
SELECT '=== POLITYKI RLS ===' AS info;
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. Wszystkie funkcje RPC
SELECT '=== FUNKCJE RPC ===' AS info;
SELECT
  p.proname AS function_name,
  pg_get_function_arguments(p.oid) AS arguments,
  CASE WHEN p.prosecdef THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END AS security,
  CASE WHEN p.provolatile = 'v' THEN 'VOLATILE' WHEN p.provolatile = 's' THEN 'STABLE' ELSE 'IMMUTABLE' END AS volatility,
  t.typname AS return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_type t ON p.prorettype = t.oid
WHERE n.nspname = 'public'
  AND p.proname IN (
    'get_leaderboard', 'get_dashboard', 'get_matches_with_predictions',
    'get_group_table', 'get_cartesian_table', 'get_user_detail',
    'calculate_match_points', 'recalculate_match_points'
  )
ORDER BY p.proname;

-- 6. Sprawdź czy RPC admina mają auth check (szukaj 'NOT EXISTS' w definicji)
SELECT '=== ADMIN RPC AUTH CHECK ===' AS info;
SELECT
  p.proname AS function_name,
  pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN ('calculate_match_points', 'recalculate_match_points');

-- 7. Podsumowanie
SELECT '=== PODSUMOWANIE ===' AS info;
SELECT 'Tabele: 4 (profiles, matches, predictions, admins)' AS status;
SELECT 'RLS: powinno być włączone na wszystkich tabelach' AS status;
SELECT 'Polityki RLS: profiles_select_own, profiles_insert_own, profiles_update_own, matches_select_all, predictions_select_own, predictions_insert_own, predictions_update_own, predictions_select_finished, admins_select_all' AS status;
SELECT 'RPC publiczne (z auth check): get_leaderboard, get_dashboard, get_matches_with_predictions, get_group_table, get_cartesian_table, get_user_detail' AS status;
SELECT 'RPC admin (z auth check admina): calculate_match_points, recalculate_match_points' AS status;
SELECT 'Wszystkie RPC wymagają auth.role() = authenticated' AS status;
