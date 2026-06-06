-- ============================================================
-- MIGRACJA: RLS fix – typowania widoczne tylko dla zakończonych meczów
-- Uruchom w Supabase SQL Editor
-- ============================================================

-- Aktualizacja polityki RLS dla predictions:
-- - użytkownik zawsze widzi SWOJE typowania
-- - typowania INNYCH użytkowników są widoczne tylko dla zakończonych meczów
DROP POLICY IF EXISTS "predictions_select" ON predictions;

CREATE POLICY "predictions_select" ON predictions
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM matches WHERE id = match_id AND finished = TRUE)
  );
