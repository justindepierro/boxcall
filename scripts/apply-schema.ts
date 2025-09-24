#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '../.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function applySchema() {
  console.log('🏗️  APPLYING DATABASE SCHEMA');
  console.log('=============================\n');

  try {
    // Check if we have exec_sql function
    console.log('Checking for exec_sql function...');
    const { data: functions, error: funcError } = await supabase
      .from('pg_proc')
      .select('proname')
      .eq('proname', 'exec_sql');

    if (funcError || !functions || functions.length === 0) {
      console.log('❌ exec_sql function not found');
      console.log('💡 Please run this SQL in Supabase dashboard first:');
      console.log(`
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;
      `);
      return;
    }

    console.log('✅ exec_sql function found');

    // Create playbooks table
    console.log('1. Creating playbooks table...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.playbooks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          description TEXT,
          is_active BOOLEAN DEFAULT true,
          created_by UUID REFERENCES auth.users(id),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_playbooks_team_active ON public.playbooks(team_id, is_active);
        
        ALTER TABLE public.playbooks ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Team members can view playbooks" ON public.playbooks 
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.team_members tm
              WHERE tm.team_id = playbooks.team_id
              AND tm.user_id = auth.uid()
              AND tm.status = 'active'
            )
          );
        
        CREATE POLICY "Team coaches can manage playbooks" ON public.playbooks 
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM public.team_members tm
              WHERE tm.team_id = playbooks.team_id
              AND tm.user_id = auth.uid()
              AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
              AND tm.status = 'active'
            )
          );
        
        CREATE POLICY "Service role full access" ON public.playbooks 
          FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
      `
    });

    console.log('✅ Playbooks table created!');
    console.log('💡 Run database audit to verify');

  } catch (err) {
    console.error('❌ Schema application failed:', (err as Error).message);
  }
}

applySchema().catch(console.error);
