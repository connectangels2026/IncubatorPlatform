-- Add columns to support the super-admin review flow:
--   - incubator_name_text : the incubator name the startup typed in (free text)
--   - selected_incubator_id : the actual incubator org the super admin assigns later (NULL until assigned)
--   - super_admin_status : lifecycle state for the super-admin review queue
--   - super_admin_reviewed_at : timestamp when the super admin completed the review
--   - super_admin_notes : optional notes left by the super admin during assignment

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS incubator_name_text character varying(255),
  ADD COLUMN IF NOT EXISTS selected_incubator_id uuid,
  ADD COLUMN IF NOT EXISTS super_admin_status character varying(50) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS super_admin_reviewed_at timestamp without time zone,
  ADD COLUMN IF NOT EXISTS super_admin_notes text;

-- Index the review queue so the super-admin dashboard can filter quickly
CREATE INDEX IF NOT EXISTS idx_applications_super_admin_status
  ON public.applications USING btree (super_admin_status);

-- Allow the super admin (service role) to update the assignment columns.
-- The applications table already grants all operations to service_role, but we
-- add an explicit policy for authenticated super-admins as well.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policy
    WHERE polname = 'Super admin can manage incubator assignment'
  ) THEN
    CREATE POLICY "Super admin can manage incubator assignment"
    ON public.applications
    FOR UPDATE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid()
          AND u.role IN ('super-admin', 'super_admin', 'admin')
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid()
          AND u.role IN ('super-admin', 'super_admin', 'admin')
      )
    );
  END IF;
END $$;