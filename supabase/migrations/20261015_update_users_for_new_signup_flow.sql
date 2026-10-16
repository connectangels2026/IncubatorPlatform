-- Update users table to support new signup flow
-- Allow organization_id to be null (will be set after role selection)
-- Add role column to track user type (startup/incubator)
-- Add auth_user_id to link to Supabase Auth
-- Add founder_name for founder information

-- 1. Make organization_id nullable
ALTER TABLE public.users
ALTER COLUMN organization_id DROP NOT NULL;

-- 2. Add role column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'users'
    AND column_name = 'role'
  ) THEN
    ALTER TABLE public.users ADD COLUMN role character varying(50);
  END IF;
END $$;

-- 3. Add auth_user_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'users'
    AND column_name = 'auth_user_id'
  ) THEN
    ALTER TABLE public.users ADD COLUMN auth_user_id uuid UNIQUE;
  END IF;
END $$;

-- 4. Add founder_name column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'users'
    AND column_name = 'founder_name'
  ) THEN
    ALTER TABLE public.users ADD COLUMN founder_name character varying(255);
  END IF;
END $$;

-- 5. Create constraint to link auth_user_id to auth.users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_users_auth_user_id'
  ) THEN
    ALTER TABLE public.users
    ADD CONSTRAINT fk_users_auth_user_id
    FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 6. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users USING btree (auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users USING btree (role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users USING btree (email);
