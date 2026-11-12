-- Migration: Connect Startup Dashboard mock data to real database
-- 1. Ensure startups table has columns for milestones, hardware BOM, lab equipment, and fabrication pipeline
ALTER TABLE public.startups
  ADD COLUMN IF NOT EXISTS milestones jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS hardware_bom jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS lab_equipment jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS fabrication_pipeline jsonb DEFAULT '[]'::jsonb;

-- 2. Events table
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL DEFAULT 'Workshop',
  starts_at timestamptz NOT NULL,
  location text,
  link text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events_incubator_write" ON public.events;
CREATE POLICY "events_incubator_write" ON public.events
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.organization_id = events.organization_id
        AND users.role IN ('admin', 'incubator_admin', 'incubator', 'super-admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.organization_id = events.organization_id
        AND users.role IN ('admin', 'incubator_admin', 'incubator', 'super-admin')
    )
  );

DROP POLICY IF EXISTS "events_startup_read" ON public.events;
CREATE POLICY "events_startup_read" ON public.events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.startups
      WHERE startups.organization_id = events.organization_id
        AND (
          startups.founder_id = auth.uid() 
          OR startups.founder_email ILIKE (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    )
    OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.organization_id = events.organization_id
    )
  );

-- 3. Mentor Sessions table
CREATE TABLE IF NOT EXISTS public.mentor_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id uuid NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  mentor_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  mentor_name text,
  topic text NOT NULL,
  starts_at timestamptz NOT NULL,
  link text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.mentor_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mentor_sessions_write" ON public.mentor_sessions;
CREATE POLICY "mentor_sessions_write" ON public.mentor_sessions
  FOR ALL
  TO authenticated
  USING (
    mentor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.startups
      JOIN public.users ON users.organization_id = startups.organization_id
      WHERE startups.id = mentor_sessions.startup_id
        AND users.id = auth.uid()
        AND users.role IN ('admin', 'incubator_admin', 'incubator', 'super-admin')
    )
  )
  WITH CHECK (
    mentor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.startups
      JOIN public.users ON users.organization_id = startups.organization_id
      WHERE startups.id = mentor_sessions.startup_id
        AND users.id = auth.uid()
        AND users.role IN ('admin', 'incubator_admin', 'incubator', 'super-admin')
    )
  );

DROP POLICY IF EXISTS "mentor_sessions_read" ON public.mentor_sessions;
CREATE POLICY "mentor_sessions_read" ON public.mentor_sessions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.startups
      WHERE startups.id = mentor_sessions.startup_id
        AND (
          startups.founder_id = auth.uid() 
          OR startups.founder_email ILIKE (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    )
    OR mentor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.startups
      JOIN public.users ON users.organization_id = startups.organization_id
      WHERE startups.id = mentor_sessions.startup_id
        AND users.id = auth.uid()
    )
  );

-- 4. Startup Activity table
CREATE TABLE IF NOT EXISTS public.startup_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id uuid NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.startup_activity(id) ON DELETE CASCADE,
  author_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  author_name text,
  author_role text,
  type text NOT NULL DEFAULT 'note',
  title text,
  body text NOT NULL,
  scores jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_startup_activity_startup_created ON public.startup_activity (startup_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_startup_activity_parent ON public.startup_activity (parent_id);

ALTER TABLE public.startup_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "startup_activity_select" ON public.startup_activity;
CREATE POLICY "startup_activity_select" ON public.startup_activity
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.startups
      WHERE startups.id = startup_activity.startup_id
        AND (
          startups.founder_id = auth.uid()
          OR startups.founder_email ILIKE (SELECT email FROM auth.users WHERE id = auth.uid())
          OR EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
              AND users.organization_id = startups.organization_id
          )
        )
    )
  );

DROP POLICY IF EXISTS "startup_activity_insert" ON public.startup_activity;
CREATE POLICY "startup_activity_insert" ON public.startup_activity
  FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.startups
      WHERE startups.id = startup_activity.startup_id
        AND (
          startups.founder_id = auth.uid()
          OR startups.founder_email ILIKE (SELECT email FROM auth.users WHERE id = auth.uid())
          OR EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
              AND users.organization_id = startups.organization_id
          )
        )
    )
  );

DROP POLICY IF EXISTS "startup_activity_update" ON public.startup_activity;
CREATE POLICY "startup_activity_update" ON public.startup_activity
  FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "startup_activity_delete" ON public.startup_activity;
CREATE POLICY "startup_activity_delete" ON public.startup_activity
  FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

