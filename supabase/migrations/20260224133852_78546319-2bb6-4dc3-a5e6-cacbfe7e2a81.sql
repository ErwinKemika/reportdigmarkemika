-- Allow anonymous (non-authenticated) users to read dashboard data
DROP POLICY IF EXISTS "All authenticated users can read dashboard data" ON public.dashboard_data;
CREATE POLICY "Anyone can read dashboard data"
  ON public.dashboard_data
  FOR SELECT
  USING (true);