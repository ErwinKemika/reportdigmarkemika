
-- 1. Role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'viewer');

-- 2. User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Security definer helper to check role (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. RLS policies for user_roles
CREATE POLICY "Authenticated users can read own role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Auto-assign viewer role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'viewer');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. Dashboard data table (stores all raw metrics per month & channel)
CREATE TABLE public.dashboard_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period TEXT NOT NULL,
  channel TEXT NOT NULL,
  -- Traffic & Conversion
  traffic INTEGER DEFAULT 0,
  target_traffic INTEGER DEFAULT 0,
  conversion_rate NUMERIC(5,2) DEFAULT 0,
  target_cr NUMERIC(5,2) DEFAULT 0,
  -- Revenue & Budget
  revenue NUMERIC DEFAULT 0,
  target_revenue NUMERIC DEFAULT 0,
  budget NUMERIC DEFAULT 0,
  ad_spend NUMERIC DEFAULT 0,
  -- Engagement
  sessions INTEGER DEFAULT 0,
  users_count INTEGER DEFAULT 0,
  orders INTEGER DEFAULT 0,
  units_sold INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  -- Auto-calculated fields (computed via trigger)
  achievement_pct NUMERIC(6,2) GENERATED ALWAYS AS (
    CASE WHEN target_revenue > 0 THEN (revenue / target_revenue * 100) ELSE 0 END
  ) STORED,
  roas NUMERIC(8,2) GENERATED ALWAYS AS (
    CASE WHEN ad_spend > 0 THEN (revenue / ad_spend) ELSE 0 END
  ) STORED,
  roi_pct NUMERIC(8,2) GENERATED ALWAYS AS (
    CASE WHEN budget > 0 THEN ((revenue - budget) / budget * 100) ELSE 0 END
  ) STORED,
  traffic_achievement_pct NUMERIC(6,2) GENERATED ALWAYS AS (
    CASE WHEN target_traffic > 0 THEN (traffic::NUMERIC / target_traffic * 100) ELSE 0 END
  ) STORED,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Unique constraint for upsert
  UNIQUE (period, channel)
);

ALTER TABLE public.dashboard_data ENABLE ROW LEVEL SECURITY;

-- 7. RLS policies for dashboard_data
CREATE POLICY "All authenticated users can read dashboard data"
  ON public.dashboard_data FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert dashboard data"
  ON public.dashboard_data FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update dashboard data"
  ON public.dashboard_data FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete dashboard data"
  ON public.dashboard_data FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 8. Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_dashboard_data_updated_at
  BEFORE UPDATE ON public.dashboard_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
