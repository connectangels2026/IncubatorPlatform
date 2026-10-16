-- Add INSERT policy for users table to allow service role to create new users during signup
-- This is needed for the signup flow where we create users without requiring authentication

CREATE POLICY "Service role can insert users"
ON public.users
FOR INSERT
TO service_role
WITH CHECK (true);

-- Also add a policy for authenticated users to insert themselves
CREATE POLICY "Authenticated users can insert themselves"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
