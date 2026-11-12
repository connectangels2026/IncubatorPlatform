-- Migration: Drop default on startups.track to allow track selection on first visit
ALTER TABLE public.startups ALTER COLUMN track DROP DEFAULT;
ALTER TABLE public.startups ALTER COLUMN track DROP NOT NULL;
ALTER TABLE public.startups ADD COLUMN IF NOT EXISTS tech_stack JSONB DEFAULT '[]'::jsonb;

