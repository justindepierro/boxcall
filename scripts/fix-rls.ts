import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!
)

async function fixRLSPolicies() {
  console.log('Temporarily disabling RLS to break circular dependency...')

  // First, disable RLS to allow queries to work
  const { error: disableError } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
      ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
    `
  })

  if (disableError) {
    console.error('Error disabling RLS:', disableError)
    // Try alternative approach
    console.log('Trying alternative approach...')
    await alternativeFix()
    return
  }

  console.log('RLS disabled, now dropping old policies...')

  // Drop existing problematic policies
  const { error: dropError } = await supabase.rpc('exec_sql', {
    sql: `
      DROP POLICY IF EXISTS "Users can view teams they belong to" ON teams;
      DROP POLICY IF EXISTS "Users can view team members for their teams" ON team_members;
      DROP POLICY IF EXISTS "Team coaches can manage team members" ON team_members;
    `
  })

  if (dropError) {
    console.error('Error dropping policies:', dropError)
    return
  }

  // Create fixed policies
  const { error: createError } = await supabase.rpc('exec_sql', {
    sql: `
      -- Team members: Users can view their own membership records
      CREATE POLICY "Users can view their own team membership" ON team_members
        FOR SELECT USING (user_id = auth.uid());

      -- TEMPORARY: Allow authenticated users to view team members to break circular dependency
      CREATE POLICY "TEMP: Authenticated users can view team members" ON team_members
        FOR SELECT USING (auth.uid() IS NOT NULL);

      -- Teams: Users can view teams they belong to
      CREATE POLICY "Users can view teams they belong to" ON teams
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM team_members tm
            WHERE tm.team_id = teams.id
            AND tm.user_id = auth.uid()
            AND tm.is_active = true
          )
        );

      -- Re-enable RLS
      ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
      ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
    `
  })

  if (createError) {
    console.error('Error creating policies:', createError)
    return
  }

  console.log('RLS policies fixed and re-enabled')
}

async function alternativeFix() {
  console.log('Using alternative approach - creating SQL migration file...')

  const sql = `
    -- Fix RLS circular dependency
    ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
    ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can view teams they belong to" ON teams;
    DROP POLICY IF EXISTS "Users can view team members for their teams" ON team_members;
    DROP POLICY IF EXISTS "Team coaches can manage team members" ON team_members;

    -- Team members: Users can view their own membership records
    CREATE POLICY "Users can view their own team membership" ON team_members
      FOR SELECT USING (user_id = auth.uid());

    -- TEMPORARY: Allow authenticated users to view team members to break circular dependency
    CREATE POLICY "TEMP: Authenticated users can view team members" ON team_members
      FOR SELECT USING (auth.uid() IS NOT NULL);

    -- Teams: Users can view teams they belong to
    CREATE POLICY "Users can view teams they belong to" ON teams
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.team_id = teams.id
          AND tm.user_id = auth.uid()
          AND tm.is_active = true
        )
      );

    ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
    ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
  `

  // Write to a file for manual execution
  const fs = await import('fs')
  fs.writeFileSync('fix-rls-migration.sql', sql)
  console.log('SQL migration written to fix-rls-migration.sql')
  console.log('Please execute this SQL in your Supabase SQL editor')
}

fixRLSPolicies().catch(console.error)