-- Add missing INSERT policy for profiles table
-- This allows users to create their own profiles during signup/registration

CREATE POLICY "Users can insert their own profiles" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());