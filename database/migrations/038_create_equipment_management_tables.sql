-- Migration: Create Equipment Management Tables
-- Implements equipment tracking and management

-- Equipment table
CREATE TABLE IF NOT EXISTS public.equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('balls', 'pads', 'helmets', 'uniforms', 'training', 'medical', 'other')),
  description TEXT,
  quantity_total INTEGER DEFAULT 1,
  quantity_available INTEGER DEFAULT 1,
  condition_status TEXT DEFAULT 'good' CHECK (condition_status IN ('excellent', 'good', 'fair', 'poor', 'needs_repair')),
  purchase_date DATE,
  last_inspected DATE,
  assigned_to UUID REFERENCES auth.users(id),
  location TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_equipment_team_id ON public.equipment(team_id);
CREATE INDEX IF NOT EXISTS idx_equipment_category ON public.equipment(category);

-- Enable RLS
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY IF NOT EXISTS "Users can view equipment for their teams" ON public.equipment
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

DO $$
BEGIN
  RAISE NOTICE '✅ Equipment management tables migration completed successfully!';
  RAISE NOTICE 'Created tables: equipment';
END $$;