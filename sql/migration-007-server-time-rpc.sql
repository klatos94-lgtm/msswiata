-- ============================================================
-- MIGRACJA 007: RPC do pobierania czasu serwera
-- Wykonaj w SQL Editorze w Supabase Dashboard
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_server_time()
RETURNS TIMESTAMPTZ
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOW();
$$;
