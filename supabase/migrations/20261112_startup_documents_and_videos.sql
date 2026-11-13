-- Migration: startup one_pager_url, elevator_video_url, and video submission kind/duration

ALTER TABLE public.startups
  ADD COLUMN IF NOT EXISTS one_pager_url character varying(500),
  ADD COLUMN IF NOT EXISTS elevator_video_url character varying(500);

ALTER TABLE public.startup_video_submissions
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'demo',
  ADD COLUMN IF NOT EXISTS duration_seconds integer;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.startup_video_submissions'::regclass
      AND conname = 'startup_video_submissions_kind_check'
  ) THEN
    ALTER TABLE public.startup_video_submissions
      ADD CONSTRAINT startup_video_submissions_kind_check
      CHECK (kind IN ('demo', 'elevator'));
  END IF;
END $$;
