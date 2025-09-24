-- Fix profiles RLS policies to work with simplified team_members policies
-- Drop problematic policies that use complex EXISTS queries
DROP POLICY IF EXISTS "Users can view profiles of team members" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON profiles;

-- Create simplified policies
CREATE POLICY "Users can view their own profile" ON profiles
FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update their own profile" ON profiles
FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Users can insert their own profile" ON profiles
FOR INSERT WITH CHECK (auth.uid()::text = id);

-- Allow authenticated users to view profiles (simplified for now)
-- This can be refined later for better team-based access
CREATE POLICY "Authenticated users can view profiles" ON profiles
FOR SELECT USING (auth.uid() IS NOT NULL);
