-- Migration: 20261102_superadmin_and_role_security.sql
-- Role-based security hardening, superadmin table, application linkage, and RLS policies

-- 1. Create superadmin table
CREATE TABLE IF NOT EXISTS public.superadmin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on superadmin
ALTER TABLE public.superadmin ENABLE ROW LEVEL SECURITY;

-- Seed default Super Admin
INSERT INTO public.superadmin (email, name)
VALUES ('shadmannc0516@gmail.com', 'Super Admin')
ON CONFLICT (email) DO NOTHING;

-- Drop existing policies if any to prevent errors on rerun
DROP POLICY IF EXISTS "superadmin_select_self" ON public.superadmin;
DROP POLICY IF EXISTS "superadmin_service_role" ON public.superadmin;

CREATE POLICY "superadmin_select_self" ON public.superadmin
    FOR SELECT
    USING (lower(auth.jwt() ->> 'email') = lower(email));

-- 2. Ensure application_id exists on startups table
ALTER TABLE public.startups 
    ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_startups_application_id ON public.startups(application_id);

-- 3. Organizations RLS security
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "organizations_disallow_startup_insert" ON public.organizations;
CREATE POLICY "organizations_disallow_startup_insert" ON public.organizations
    FOR INSERT
    WITH CHECK (
        NOT EXISTS (
            SELECT 1 FROM public.users
            WHERE lower(users.email) = lower(auth.jwt() ->> 'email')
            AND users.role = 'startup'
        )
    );

-- 4. Startups RLS security
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "startups_disallow_startup_insert" ON public.startups;
CREATE POLICY "startups_disallow_startup_insert" ON public.startups
    FOR INSERT
    WITH CHECK (
        NOT EXISTS (
            SELECT 1 FROM public.users
            WHERE lower(users.email) = lower(auth.jwt() ->> 'email')
            AND users.role = 'startup'
        )
    );

DROP POLICY IF EXISTS "startups_select_own" ON public.startups;
CREATE POLICY "startups_select_own" ON public.startups
    FOR SELECT
    USING (
        lower(founder_email) = lower(auth.jwt() ->> 'email')
        OR EXISTS (
            SELECT 1 FROM public.users
            WHERE lower(users.email) = lower(auth.jwt() ->> 'email')
            AND (users.organization_id = startups.organization_id OR users.role IN ('admin', 'super-admin'))
        )
    );

-- 5. Applications RLS security
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "applications_select_owner_or_org" ON public.applications;
CREATE POLICY "applications_select_owner_or_org" ON public.applications
    FOR SELECT
    USING (
        lower(applicant_email) = lower(auth.jwt() ->> 'email')
        OR EXISTS (
            SELECT 1 FROM public.users
            WHERE lower(users.email) = lower(auth.jwt() ->> 'email')
            AND (users.organization_id = applications.organization_id OR users.role IN ('admin', 'super-admin'))
        )
    );

