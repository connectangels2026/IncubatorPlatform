-- Create a function that can insert users without RLS restrictions
-- This function uses SECURITY DEFINER to run with superuser privileges

CREATE OR REPLACE FUNCTION public.create_user_profile(
  p_organization_id uuid,
  p_email varchar,
  p_first_name varchar,
  p_last_name varchar,
  p_full_name varchar,
  p_is_active boolean,
  p_email_verified boolean
)
RETURNS TABLE(
  id uuid,
  organization_id uuid,
  email varchar,
  first_name varchar,
  last_name varchar,
  full_name varchar,
  is_active boolean,
  email_verified boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (
    organization_id,
    email,
    first_name,
    last_name,
    full_name,
    is_active,
    email_verified
  ) VALUES (
    p_organization_id,
    p_email,
    p_first_name,
    p_last_name,
    p_full_name,
    p_is_active,
    p_email_verified
  )
  RETURNING
    public.users.id,
    public.users.organization_id,
    public.users.email,
    public.users.first_name,
    public.users.last_name,
    public.users.full_name,
    public.users.is_active,
    public.users.email_verified;
END;
$$;

-- Grant execute permission to authenticated and service_role
GRANT EXECUTE ON FUNCTION public.create_user_profile TO authenticated, service_role, anon;
