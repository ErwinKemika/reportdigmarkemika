-- 1. Add 'editor' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'editor';

-- 2. Drop old UNIQUE(user_id, role) and replace with UNIQUE(user_id)
--    so each user has exactly one role (prevents ambiguity in fetchRole)
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);

-- 3. Update the new-user trigger to use ON CONFLICT so it doesn't break
--    if the constraint is already satisfied
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'viewer')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 4. Update page_data RLS: editor can insert/update only recommendations
DROP POLICY IF EXISTS "Admins can insert page data" ON public.page_data;
DROP POLICY IF EXISTS "Admins can update page data" ON public.page_data;

CREATE POLICY "Admins can insert page data"
  ON public.page_data
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Editors can insert action plan data"
  ON public.page_data
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'editor'::app_role)
    AND page_key = 'recommendations'
  );

CREATE POLICY "Admins can update page data"
  ON public.page_data
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Editors can update action plan data"
  ON public.page_data
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'editor'::app_role)
    AND page_key = 'recommendations'
  );

-- 5. Assign editor role to ariefrzky@gmail.com and hilmi@gmail.com
--    (runs only if their accounts already exist; safe to re-run)
DO $$
BEGIN
  UPDATE public.user_roles
  SET role = 'editor'
  WHERE user_id IN (
    SELECT id FROM auth.users
    WHERE email IN ('ariefrzky@gmail.com', 'hilmi@gmail.com')
  );
END;
$$;
