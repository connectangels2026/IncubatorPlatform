-- Row-Level Security for co_incubations table
-- (Create or update policies only - no table/schema modifications)

ALTER TABLE public.co_incubations ENABLE ROW LEVEL SECURITY;

-- 1. Read Policy: Primary and co-incubator organizations can read their own rows
DROP POLICY IF EXISTS "co_incubations_org_read" ON public.co_incubations;
CREATE POLICY "co_incubations_org_read" ON public.co_incubations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND (
          users.organization_id = co_incubations.primary_incubator_id
          OR users.organization_id = co_incubations.co_incubator_id
          OR users.role IN ('super-admin', 'super_admin')
        )
    )
  );

-- 2. Insert Policy: Insert only by startup's primary incubator (primary_incubator_id = startup.organization_id) with status 'pending'
DROP POLICY IF EXISTS "co_incubations_primary_insert" ON public.co_incubations;
CREATE POLICY "co_incubations_primary_insert" ON public.co_incubations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    status = 'pending'
    AND EXISTS (
      SELECT 1 FROM public.startups
      WHERE startups.id = co_incubations.startup_id
        AND startups.organization_id = co_incubations.primary_incubator_id
    )
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND (
          users.organization_id = co_incubations.primary_incubator_id
          OR users.role IN ('super-admin', 'super_admin')
        )
    )
  );

-- 3. Update Policy:
-- - Co-incubator organization can set status 'active' (with start_date, decided_by, decided_at) or 'rejected' (reject_reason required)
-- - Either primary or co-incubator can set status 'ended'
DROP POLICY IF EXISTS "co_incubations_decision_and_lifecycle_update" ON public.co_incubations;
CREATE POLICY "co_incubations_decision_and_lifecycle_update" ON public.co_incubations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND (
          users.organization_id = co_incubations.co_incubator_id
          OR (users.organization_id = co_incubations.primary_incubator_id AND co_incubations.status IN ('active', 'pending'))
          OR users.role IN ('super-admin', 'super_admin')
        )
    )
  )
  WITH CHECK (
    -- Case A: Co-incubator sets 'active' or 'rejected'
    (
      status = 'active'
      AND start_date IS NOT NULL
      AND decided_by IS NOT NULL
      AND decided_at IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
          AND (users.organization_id = co_incubations.co_incubator_id OR users.role IN ('super-admin', 'super_admin'))
      )
    )
    OR
    (
      status = 'rejected'
      AND reject_reason IS NOT NULL
      AND decided_by IS NOT NULL
      AND decided_at IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
          AND (users.organization_id = co_incubations.co_incubator_id OR users.role IN ('super-admin', 'super_admin'))
      )
    )
    -- Case B: Either side can set status to 'ended'
    OR
    (
      status = 'ended'
      AND EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
          AND (
            users.organization_id = co_incubations.primary_incubator_id
            OR users.organization_id = co_incubations.co_incubator_id
            OR users.role IN ('super-admin', 'super_admin')
          )
      )
    )
  );

-- 4. Startup Read Policy: Startup reads only its own active rows
DROP POLICY IF EXISTS "co_incubations_startup_read" ON public.co_incubations;
CREATE POLICY "co_incubations_startup_read" ON public.co_incubations
  FOR SELECT
  TO authenticated
  USING (
    status = 'active'
    AND EXISTS (
      SELECT 1 FROM public.startups
      WHERE startups.id = co_incubations.startup_id
        AND (
          startups.founder_id = auth.uid()
          OR startups.founder_email = auth.email()
          OR startups.email = auth.email()
        )
    )
  );

