
-- Create page_data table for storing page-specific dashboard data as JSONB
CREATE TABLE public.page_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  period TEXT NOT NULL,
  page_key TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (period, page_key)
);

-- Enable RLS
ALTER TABLE public.page_data ENABLE ROW LEVEL SECURITY;

-- Anyone can read
CREATE POLICY "Anyone can read page data"
  ON public.page_data
  FOR SELECT
  USING (true);

-- Only admins can insert
CREATE POLICY "Admins can insert page data"
  ON public.page_data
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update
CREATE POLICY "Admins can update page data"
  ON public.page_data
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete
CREATE POLICY "Admins can delete page data"
  ON public.page_data
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Auto-update timestamp trigger
CREATE TRIGGER update_page_data_updated_at
  BEFORE UPDATE ON public.page_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
