
CREATE POLICY "Action plan editors can insert recommendations"
ON public.page_data FOR INSERT TO authenticated
WITH CHECK (
  page_key = 'recommendations'
  AND auth.uid() IN ('43649004-bc9b-4dbc-9ecd-6f29489ac2e1','0af999f0-1514-4925-8320-aab312be034e')
);

CREATE POLICY "Action plan editors can update recommendations"
ON public.page_data FOR UPDATE TO authenticated
USING (
  page_key = 'recommendations'
  AND auth.uid() IN ('43649004-bc9b-4dbc-9ecd-6f29489ac2e1','0af999f0-1514-4925-8320-aab312be034e')
)
WITH CHECK (
  page_key = 'recommendations'
  AND auth.uid() IN ('43649004-bc9b-4dbc-9ecd-6f29489ac2e1','0af999f0-1514-4925-8320-aab312be034e')
);
