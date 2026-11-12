-- Migration: mentor_feedback_scores, activity_logs, read-only shared startup RPC, realtime, and privacy RLS

-- 1. Structured mentor evaluation scores on mentorship_sessions
ALTER TABLE public.mentorship_sessions
  ADD COLUMN IF NOT EXISTS mentor_feedback_scores jsonb DEFAULT '{}'::jsonb;

-- 2. activity_logs audit table (safe if not already created)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  actor_email text,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_org ON public.activity_logs(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "activity_logs_org_read" ON public.activity_logs;
CREATE POLICY "activity_logs_org_read" ON public.activity_logs
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND (
          u.role IN ('super-admin', 'super_admin')
          OR (u.organization_id = activity_logs.organization_id AND u.role IN ('admin', 'incubator_admin', 'incubator'))
        )
    )
  );

-- 3. Server RPC returning ONLY read-only non-financial shared startup fields for a mentor
CREATE OR REPLACE FUNCTION public.get_mentor_allocated_startups(p_mentor_id uuid)
RETURNS TABLE (
  id uuid,
  organization_id uuid,
  startup_name text,
  sector text,
  stage text,
  logo_url text,
  founder_name text,
  founder_email text,
  description text,
  problem_statement text,
  team_size integer,
  customer_count integer,
  tagline text,
  website text,
  allocation_id uuid,
  allocation_status character varying,
  mentor_type character varying,
  domain text,
  notes text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_is_allowed boolean := false;
BEGIN
  IF v_uid IS NULL THEN
    -- Service-role server invocation
    v_is_allowed := true;
  ELSE
    SELECT EXISTS (
      SELECT 1 FROM public.mentors m WHERE m.id = p_mentor_id AND m.user_id = v_uid
    ) OR EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.mentors m ON m.id = p_mentor_id
      WHERE u.id = v_uid
        AND (
          u.role IN ('super-admin', 'super_admin')
          OR (u.organization_id = m.organization_id AND u.role IN ('admin', 'incubator_admin', 'incubator'))
        )
    ) INTO v_is_allowed;
  END IF;

  IF NOT v_is_allowed THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    s.id,
    s.organization_id,
    s.startup_name::text,
    s.sector::text,
    s.stage::text,
    s.logo_url::text,
    s.founder_name::text,
    s.founder_email::text,
    s.description::text,
    s.problem_statement::text,
    s.team_size,
    s.customer_count,
    s.tagline::text,
    s.website::text,
    sm.id AS allocation_id,
    sm.status AS allocation_status,
    sm.mentor_type,
    sm.domain,
    sm.notes
  FROM public.startup_mentors sm
  JOIN public.startups s ON s.id = sm.startup_id
  WHERE sm.mentor_id = p_mentor_id
    AND sm.status = 'active'
    AND s.deleted_at IS NULL
  ORDER BY sm.created_at DESC;
END;
$$;

-- 4. Privacy RLS: mentors see ONLY their own sessions/ratings (never other mentors' ratings or org-wide sessions)
DROP POLICY IF EXISTS "mentorship_sessions_read" ON public.mentorship_sessions;
CREATE POLICY "mentorship_sessions_read" ON public.mentorship_sessions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.mentors m
      WHERE m.id = mentorship_sessions.mentor_id AND m.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.startups s
      WHERE s.id = mentorship_sessions.startup_id
        AND (s.founder_id = auth.uid() OR lower(s.founder_email) = lower(coalesce(auth.jwt() ->> 'email', '')))
    )
    OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND (
          u.role IN ('super-admin', 'super_admin')
          OR (u.organization_id = mentorship_sessions.organization_id AND u.role IN ('admin', 'incubator_admin', 'incubator'))
        )
    )
  );

-- 5. Enable Supabase Realtime publication on mentorship_sessions and startup_mentors
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.mentorship_sessions;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.startup_mentors;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

