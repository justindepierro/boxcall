-- BoxCall Football Management Database Schema
-- Run this in your Supabase SQL Editor

-- 1. First, let's see what we have in profiles
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public';

-- 2. Create teams table (if it needs to be recreated)
-- Note: This will only create if it doesn't exist
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  school TEXT,
  division TEXT,
  conference TEXT,
  season TEXT DEFAULT '2024',
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create players table
CREATE TABLE IF NOT EXISTS public.players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  position TEXT NOT NULL,
  jersey_number INTEGER NOT NULL,
  height TEXT,
  weight INTEGER,
  grade TEXT CHECK (grade IN ('Freshman', 'Sophomore', 'Junior', 'Senior')),
  gpa DECIMAL(3,2),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, jersey_number)
);

-- 4. Create coaches table
CREATE TABLE IF NOT EXISTS public.coaches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'assistant', -- 'head', 'assistant', 'coordinator'
  speciality TEXT, -- 'offense', 'defense', 'special_teams'
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create team_members table (to fix the RLS issue)
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('player', 'coach', 'admin', 'parent')),
  active BOOLEAN DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, team_id)
);

-- 6. Update profiles table to ensure it has the right structure
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id),
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'player' CHECK (role IN ('player', 'coach', 'admin', 'parent')),
ADD COLUMN IF NOT EXISTS position TEXT,
ADD COLUMN IF NOT EXISTS jersey_number INTEGER;

-- 7. Enable RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- 8. Create simple RLS policies (replace the problematic ones)
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Team members can view team" ON public.teams;

-- Create new, simple policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Teams are viewable by everyone" 
ON public.teams FOR SELECT USING (true);

CREATE POLICY "Team members can view team data" 
ON public.team_members FOR SELECT USING (true);

-- 9. Insert some sample data for testing
INSERT INTO public.teams (name, school, division, conference) VALUES
('Varsity Eagles', 'Central High School', 'Division I', 'Metro Conference'),
('JV Eagles', 'Central High School', 'JV', 'Metro Conference')
ON CONFLICT DO NOTHING;

-- 10. Grant necessary permissions
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.teams TO anon, authenticated;
GRANT ALL ON public.players TO anon, authenticated;
GRANT ALL ON public.coaches TO anon, authenticated;
GRANT ALL ON public.team_members TO anon, authenticated;
