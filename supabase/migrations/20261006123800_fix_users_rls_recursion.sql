-- Fix infinite recursion in RLS policies for 'users' and 'user_roles' tables

-- 1. Create a helper function that reads the user's organization_id bypassing RLS recursion
CREATE OR REPLACE FUNCTION public.get_auth_user_org_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id FROM public.users WHERE id = auth.uid();
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.get_auth_user_org_id() TO authenticated;

-- 2. Drop existing recursive policies on 'users' and 'user_roles'
DROP POLICY IF EXISTS "Users see org members" ON public.users;
DROP POLICY IF EXISTS "Admins manage org users" ON public.users;
DROP POLICY IF EXISTS "Users see org user roles" ON public.user_roles;

-- 3. Re-create non-recursive policies on 'users'
CREATE POLICY "Users see org members"
ON public.users
FOR SELECT
TO public
USING (
  id = auth.uid() OR organization_id = public.get_auth_user_org_id()
);

CREATE POLICY "Admins manage org users"
ON public.users
FOR ALL
TO public
USING (
  organization_id IN (
    SELECT user_roles.organization_id
    FROM public.user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
  )
);

-- 4. Re-create non-recursive policy on 'user_roles'
CREATE POLICY "Users see org user roles"
ON public.user_roles
FOR SELECT
TO public
USING (
  organization_id = public.get_auth_user_org_id()
);
