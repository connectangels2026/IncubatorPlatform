-- Migration: startup_mentors allocation table, unified mentorship_sessions lifecycle, and RLS
-- 1. Ensure mentors.status exists cleanly (for environments without earlier mentor status alteration)
ALTER TABLE public.mentors
  ADD COLUMN IF NOT EXISTS status character varying(20) NOT NULL DEFAULT 'active';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.mentors'::regclass
      AND conname = 'mentors_status_check'
  ) THEN
    ALTER TABLE public.mentors
      ADD CONSTRAINT mentors_status_check
      CHECK (status IN ('draft', 'pending', 'active', 'rejected'));
  END IF;
END $$;

-- 2. Create startup_mentors allocation table
CREATE TABLE IF NOT EXISTS public.startup_mentors (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  startup_id uuid NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  mentor_id uuid NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  mentor_type character varying(50) DEFAULT 'General',
  domain text,
  notes text,
  status character varying(20) NOT NULL DEFAULT 'pending',
  decline_reason text,
  allocated_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure columns exist if startup_mentors already existed prior to this migration
ALTER TABLE public.startup_mentors
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS mentor_type character varying(50) DEFAULT 'General',
  ADD COLUMN IF NOT EXISTS domain text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS status character varying(20) NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS decline_reason text,
  ADD COLUMN IF NOT EXISTS allocated_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS decided_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.startup_mentors'::regclass
      AND conname = 'startup_mentors_status_check'
  ) THEN
    ALTER TABLE public.startup_mentors
      ADD CONSTRAINT startup_mentors_status_check
      CHECK (status IN ('pending', 'active', 'declined', 'ended'));
  END IF;
END $$;

UPDATE public.startup_mentors sm
SET organization_id = s.organization_id
FROM public.startups s
WHERE sm.startup_id = s.id AND sm.organization_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_startup_mentors_open_pair
  ON public.startup_mentors (startup_id, mentor_id)
  WHERE status IN ('pending', 'active');

CREATE INDEX IF NOT EXISTS idx_startup_mentors_startup ON public.startup_mentors(startup_id);
CREATE INDEX IF NOT EXISTS idx_startup_mentors_mentor ON public.startup_mentors(mentor_id);
CREATE INDEX IF NOT EXISTS idx_startup_mentors_org ON public.startup_mentors(organization_id);

-- 3. Normalize mentorship_sessions status, columns, and anti-double-booking index
ALTER TABLE public.mentorship_sessions
  ADD COLUMN IF NOT EXISTS decline_reason text,
  ADD COLUMN IF NOT EXISTS mentor_name text,
  ADD COLUMN IF NOT EXISTS rescheduled_from uuid;

-- Normalize legacy status values before adding CHECK constraint
UPDATE public.mentorship_sessions
SET status = CASE
  WHEN lower(coalesce(status, 'requested')) IN ('pending', 'requested') THEN 'requested'
  WHEN lower(status) IN ('confirmed', 'scheduled') THEN 'scheduled'
  WHEN lower(status) = 'completed' THEN 'completed'
  WHEN lower(status) = 'declined' THEN 'declined'
  WHEN lower(status) = 'cancelled' THEN 'cancelled'
  ELSE 'requested'
END;

ALTER TABLE public.mentorship_sessions
  ALTER COLUMN status SET DEFAULT 'requested';

DO $$
DECLARE
  c record;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.mentorship_sessions'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%status%'
  LOOP
    EXECUTE format('ALTER TABLE public.mentorship_sessions DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

ALTER TABLE public.mentorship_sessions
  ADD CONSTRAINT mentorship_sessions_status_check
  CHECK (status IN ('requested', 'scheduled', 'completed', 'cancelled', 'declined'));

-- 4. Migrate any rows from legacy mentor_sessions into mentorship_sessions and drop mentor_sessions
ALTER TABLE public.mentorship_sessions ALTER COLUMN mentor_id DROP NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'mentor_sessions'
  ) THEN
    EXECUTE $mig$
      INSERT INTO public.mentorship_sessions (
        id,
        organization_id,
        startup_id,
        mentor_id,
        mentor_name,
        session_title,
        scheduled_date,
        start_time,
        end_time,
        duration_minutes,
        meeting_mode,
        meeting_link,
        status,
        created_at,
        updated_at
      )
      SELECT
        ms.id,
        s.organization_id,
        ms.startup_id,
        COALESCE(
          (SELECT m.id FROM public.mentors m WHERE m.id = ms.mentor_id LIMIT 1),
          (SELECT m.id FROM public.mentors m WHERE m.user_id = ms.mentor_id AND m.organization_id = s.organization_id LIMIT 1),
          (SELECT m.id FROM public.mentors m WHERE m.user_id = ms.mentor_id LIMIT 1)
        ),
        COALESCE(
          NULLIF(to_jsonb(ms)->>'mentor_name', ''),
          NULLIF(to_jsonb(ms)->>'speaker', ''),
          (
            SELECT COALESCE(NULLIF(u.full_name, ''), NULLIF(trim(concat_ws(' ', u.first_name, u.last_name)), ''), u.email)
            FROM public.mentors m
            JOIN public.users u ON u.id = m.user_id
            WHERE m.id = ms.mentor_id OR m.user_id = ms.mentor_id
            LIMIT 1
          )
        ),
        COALESCE(NULLIF(ms.topic, ''), 'Mentorship Session'),
        (ms.starts_at AT TIME ZONE 'UTC')::date,
        (ms.starts_at AT TIME ZONE 'UTC')::time,
        ((ms.starts_at + interval '45 minutes') AT TIME ZONE 'UTC')::time,
        45,
        'online',
        ms.link,
        CASE
          WHEN lower(coalesce(ms.status, 'scheduled')) IN ('pending', 'requested') THEN 'requested'
          WHEN lower(ms.status) IN ('confirmed', 'scheduled') THEN 'scheduled'
          WHEN lower(ms.status) = 'completed' THEN 'completed'
          WHEN lower(ms.status) = 'declined' THEN 'declined'
          WHEN lower(ms.status) = 'cancelled' THEN 'cancelled'
          ELSE 'scheduled'
        END,
        COALESCE(ms.created_at, now()),
        now()
      FROM public.mentor_sessions ms
      JOIN public.startups s ON s.id = ms.startup_id
      WHERE NOT EXISTS (
        SELECT 1 FROM public.mentorship_sessions existing WHERE existing.id = ms.id
      );
    $mig$;

    DROP TABLE IF EXISTS public.mentor_sessions CASCADE;
  END IF;
END $$;

-- Unique partial index preventing double-booking same mentor + date + start_time for active sessions
CREATE UNIQUE INDEX IF NOT EXISTS ux_mentorship_sessions_no_double_book
  ON public.mentorship_sessions (mentor_id, scheduled_date, start_time)
  WHERE mentor_id IS NOT NULL AND status IN ('requested', 'scheduled');

-- 5. Row-Level Security Policies
ALTER TABLE public.startup_mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_sessions ENABLE ROW LEVEL SECURITY;

-- startup_mentors policies
DROP POLICY IF EXISTS "startup_mentors_read" ON public.startup_mentors;
CREATE POLICY "startup_mentors_read" ON public.startup_mentors
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.mentors m
      WHERE m.id = startup_mentors.mentor_id AND m.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.startups s
      WHERE s.id = startup_mentors.startup_id
        AND (s.founder_id = auth.uid() OR lower(s.founder_email) = lower(coalesce(auth.jwt() ->> 'email', '')))
    )
    OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND (u.organization_id = startup_mentors.organization_id OR u.role IN ('super-admin', 'super_admin'))
    )
  );

DROP POLICY IF EXISTS "startup_mentors_incubator_manage" ON public.startup_mentors;
CREATE POLICY "startup_mentors_incubator_manage" ON public.startup_mentors
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND (
          (u.organization_id = startup_mentors.organization_id AND u.role IN ('admin', 'incubator_admin', 'incubator'))
          OR u.role IN ('super-admin', 'super_admin')
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND (
          (u.organization_id = startup_mentors.organization_id AND u.role IN ('admin', 'incubator_admin', 'incubator'))
          OR u.role IN ('super-admin', 'super_admin')
        )
    )
  );

DROP POLICY IF EXISTS "startup_mentors_mentor_decide" ON public.startup_mentors;
CREATE POLICY "startup_mentors_mentor_decide" ON public.startup_mentors
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.mentors m
      WHERE m.id = startup_mentors.mentor_id AND m.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.mentors m
      WHERE m.id = startup_mentors.mentor_id AND m.user_id = auth.uid()
    )
  );

-- mentorship_sessions policies
DROP POLICY IF EXISTS "mentorship_sessions_read" ON public.mentorship_sessions;
CREATE POLICY "mentorship_sessions_read" ON public.mentorship_sessions
  FOR SELECT
  TO authenticated
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
        AND (u.organization_id = mentorship_sessions.organization_id OR u.role IN ('super-admin', 'super_admin'))
    )
  );

DROP POLICY IF EXISTS "mentorship_sessions_write" ON public.mentorship_sessions;
CREATE POLICY "mentorship_sessions_write" ON public.mentorship_sessions
  FOR ALL
  TO authenticated
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
          (u.organization_id = mentorship_sessions.organization_id AND u.role IN ('admin', 'incubator_admin', 'incubator'))
          OR u.role IN ('super-admin', 'super_admin')
        )
    )
  )
  WITH CHECK (
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
          (u.organization_id = mentorship_sessions.organization_id AND u.role IN ('admin', 'incubator_admin', 'incubator'))
          OR u.role IN ('super-admin', 'super_admin')
        )
    )
  );

