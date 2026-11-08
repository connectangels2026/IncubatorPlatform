-- Migration: Create startup_video_submissions table for upload-then-review flow
CREATE TABLE IF NOT EXISTS public.startup_video_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id uuid NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reason text,
  submitted_at timestamptz DEFAULT now(),
  reviewed_by text,
  reviewed_at timestamptz,
  published_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_startup_video_submissions_startup 
ON public.startup_video_submissions(startup_id, status);

ALTER TABLE public.startup_video_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated access to video submissions"
ON public.startup_video_submissions
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

