-- BoxCall Missing Core Tables Setup
-- Add the essential tables that are missing from your database

-- Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  season text,
  league text,
  division text,
  coach_name text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create team_members table  
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text CHECK (role IN ('coach', 'assistant_coach', 'player', 'manager')),
  jersey_number integer,
  position text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Create playbooks table
CREATE TABLE IF NOT EXISTS public.playbooks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create plays table
CREATE TABLE IF NOT EXISTS public.plays (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  playbook_id uuid REFERENCES public.playbooks(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  play_type text CHECK (play_type IN ('run', 'pass', 'special', 'defense')),
  formation text,
  personnel_group text,
  play_call text,
  success_rate numeric(3,2),
  complexity_rating integer CHECK (complexity_rating >= 1 AND complexity_rating <= 10),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plays ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view teams they belong to" ON public.teams
  FOR SELECT USING (
    id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can view their team" ON public.team_members
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view playbooks for their teams" ON public.playbooks
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view plays for their team playbooks" ON public.plays
  FOR SELECT USING (
    playbook_id IN (
      SELECT p.id FROM public.playbooks p
      JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

-- Insert demo data
INSERT INTO public.teams (name, season, league, division, coach_name) VALUES
('Demo Warriors', '2024-25', 'BoxCall League', 'North Division', 'Coach Demo'),
('Test Eagles', '2024-25', 'BoxCall League', 'South Division', 'Coach Test')
ON CONFLICT DO NOTHING;

-- Get team IDs for demo data
DO $$
DECLARE
  demo_team_id uuid;
  test_team_id uuid;
  demo_playbook_id uuid;
BEGIN
  -- Get team IDs
  SELECT id INTO demo_team_id FROM public.teams WHERE name = 'Demo Warriors' LIMIT 1;
  SELECT id INTO test_team_id FROM public.teams WHERE name = 'Test Eagles' LIMIT 1;
  
  -- Insert demo playbook
  INSERT INTO public.playbooks (team_id, name, description) VALUES
  (demo_team_id, 'Base Offense', 'Core offensive plays for Demo Warriors')
  ON CONFLICT DO NOTHING;
  
  -- Get playbook ID
  SELECT id INTO demo_playbook_id FROM public.playbooks WHERE name = 'Base Offense' LIMIT 1;
  
  -- Insert demo plays
  INSERT INTO public.plays (playbook_id, name, description, play_type, formation, personnel_group) VALUES
  (demo_playbook_id, 'Power Run Right', 'Basic power running play to the right side', 'run', 'I-Formation', '21 Personnel'),
  (demo_playbook_id, 'Quick Slant', 'Quick 3-step slant pass', 'pass', 'Shotgun', '11 Personnel'),
  (demo_playbook_id, 'Play Action Deep', 'Play action pass with deep routes', 'pass', 'I-Formation', '21 Personnel'),
  (demo_playbook_id, 'Sweep Left', 'Outside sweep to the left', 'run', 'Wing-T', '21 Personnel')
  ON CONFLICT DO NOTHING;
END $$;
