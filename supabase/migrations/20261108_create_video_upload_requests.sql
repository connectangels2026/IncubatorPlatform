-- Migration: Create video_upload_requests table for gating video uploads
CREATE TABLE IF NOT EXISTS video_upload_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id uuid NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reason text,
  requested_at timestamptz DEFAULT now(),
  decided_by text,
  decided_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_video_upload_requests_startup ON video_upload_requests(startup_id, status);

