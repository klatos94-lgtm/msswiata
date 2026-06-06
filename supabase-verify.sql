-----------------------------
-- supabase-verify.sql
-- Uruchom w SQL Editorze Supabase (Dashboard > SQL Editor)
-- Zwraca jeden raport ze stanem bazy
-----------------------------

WITH

-- 1. Tabele
tables AS (
  SELECT '1. TABELE' AS sekcja, table_name || ' (' || table_type || ')' AS wynik
  FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name IN ('users', 'matches', 'predictions', 'admins')
),

-- 2. RLS włączone
rls AS (
  SELECT '2. RLS WLACZONE' AS sekcja,
    relname || ' -> ' || CASE WHEN relrowsecurity THEN 'TAK' ELSE 'NIE (!!!)' END AS wynik
  FROM pg_class
  WHERE relname IN ('users', 'matches', 'predictions', 'admins')
    AND relnamespace = 'public'::regnamespace
),

-- 3. Polityki RLS
policies AS (
  SELECT '3. POLITYKI RLS' AS sekcja,
    tablename || ': ' || policyname || ' (' || cmd || ')' AS wynik
  FROM pg_policies
  WHERE schemaname = 'public'
),

-- 4. Funkcje RPC
rpc_summary AS (
  SELECT '4. FUNKCJE RPC' AS sekcja,
    p.proname::text || '(' || pg_get_function_arguments(p.oid) || ') -> ' ||
    CASE WHEN p.prosecdef THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END AS wynik
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.proname IN (
      'get_leaderboard','get_dashboard','get_matches_with_predictions',
      'get_group_table','get_cartesian_table','get_user_detail',
      'calculate_match_points','recalculate_match_points'
    )
),

-- 5. Auth check w RPC (szukaj 'authenticated' lub 'NOT EXISTS' w definicji)
auth_check AS (
  SELECT '5. AUTH CHECK W RPC' AS sekcja,
    p.proname::text || ' -> ' ||
    CASE
      WHEN pg_get_functiondef(p.oid) LIKE '%authenticated%' THEN 'auth.role() check OK'
      WHEN pg_get_functiondef(p.oid) LIKE '%NOT EXISTS%' THEN 'admin check OK'
      ELSE 'BRAK (!!!)'
    END AS wynik
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.proname IN (
      'get_leaderboard','get_dashboard','get_matches_with_predictions',
      'get_group_table','get_cartesian_table','get_user_detail',
      'calculate_match_points','recalculate_match_points'
    )
),

-- 6. Indeksy
indexes AS (
  SELECT '6. INDEKSY' AS sekcja,
    indexname || ' ON ' || tablename AS wynik
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND tablename IN ('users', 'matches', 'predictions', 'admins')
),

-- 7. Sekwencje / triggery (jeśli istnieją)
triggers AS (
  SELECT '7. TRIGGERY' AS sekcja,
    trigger_name || ' ON ' || event_object_table AS wynik
  FROM information_schema.triggers
  WHERE trigger_schema = 'public'
)

-- FINALNY RAPORT
SELECT sekcja, wynik FROM tables
UNION ALL SELECT sekcja, wynik FROM rls
UNION ALL SELECT sekcja, wynik FROM policies
UNION ALL SELECT sekcja, wynik FROM rpc_summary
UNION ALL SELECT sekcja, wynik FROM auth_check
UNION ALL SELECT sekcja, wynik FROM indexes
UNION ALL SELECT sekcja, wynik FROM triggers
ORDER BY sekcja, wynik;
