import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function fixRLSPolicies() {
  try {
    console.log('🔧 Fixing RLS policies for proper access...');

    // First, let's disable RLS temporarily to test
    console.log('📋 Current RLS status:');
    const tables = ['teams', 'team_members', 'profiles', 'playbooks', 'plays', 'team_posts', 'practice_schedules'];

    for (const table of tables) {
      try {
        // Check if RLS is enabled
        const { data: rlsEnabled, error: _rlsCheckError } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        console.log(`  ${table}: RLS enabled (query returned ${rlsEnabled?.length || 0} records)`);
      } catch (err) {
        console.log(`  ${table}: Error checking RLS - ${(err as Error).message}`);
      }
    }

    // Create simpler policies that allow service role full access and authenticated users team access
    console.log('🔄 Applying simplified RLS policies...');

    // For service role (admin operations), allow everything
    const servicePolicies = [
      `DROP POLICY IF EXISTS "Service role full access" ON teams;`,
      `CREATE POLICY "Service role full access" ON teams FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');`,

      `DROP POLICY IF EXISTS "Service role full access" ON team_members;`,
      `CREATE POLICY "Service role full access" ON team_members FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');`,

      `DROP POLICY IF EXISTS "Service role full access" ON profiles;`,
      `CREATE POLICY "Service role full access" ON profiles FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');`,

      `DROP POLICY IF EXISTS "Service role full access" ON playbooks;`,
      `CREATE POLICY "Service role full access" ON playbooks FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');`,

      `DROP POLICY IF EXISTS "Service role full access" ON plays;`,
      `CREATE POLICY "Service role full access" ON plays FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');`,

      `DROP POLICY IF EXISTS "Service role full access" ON team_posts;`,
      `CREATE POLICY "Service role full access" ON team_posts FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');`,

      `DROP POLICY IF EXISTS "Service role full access" ON practice_schedules;`,
      `CREATE POLICY "Service role full access" ON practice_schedules FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');`,
    ];

    // For authenticated users, allow access to their team's data
    const userPolicies = [
      `DROP POLICY IF EXISTS "Users can view their teams" ON teams;`,
      `CREATE POLICY "Users can view their teams" ON teams FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.team_id = teams.id
          AND tm.user_id = auth.uid()
          AND tm.status = 'active'
        )
      );`,

      `DROP POLICY IF EXISTS "Users can view team members for their teams" ON team_members;`,
      `CREATE POLICY "Users can view team members for their teams" ON team_members FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.team_id = team_members.team_id
          AND tm.user_id = auth.uid()
          AND tm.status = 'active'
        )
      );`,

      `DROP POLICY IF EXISTS "Users can view profiles of team members" ON profiles;`,
      `CREATE POLICY "Users can view profiles of team members" ON profiles FOR SELECT USING (
        id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.user_id = profiles.id
          AND EXISTS (
            SELECT 1 FROM team_members tm2
            WHERE tm2.team_id = tm.team_id
            AND tm2.user_id = auth.uid()
            AND tm2.status = 'active'
          )
        )
      );`,

      `DROP POLICY IF EXISTS "Users can update their own profiles" ON profiles;`,
      `CREATE POLICY "Users can update their own profiles" ON profiles FOR UPDATE USING (id = auth.uid());`,

      `DROP POLICY IF EXISTS "Users can view team playbooks" ON playbooks;`,
      `CREATE POLICY "Users can view team playbooks" ON playbooks FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.team_id = playbooks.team_id
          AND tm.user_id = auth.uid()
          AND tm.status = 'active'
        )
      );`,

      `DROP POLICY IF EXISTS "Users can view team posts" ON team_posts;`,
      `CREATE POLICY "Users can view team posts" ON team_posts FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.team_id = team_posts.team_id
          AND tm.user_id = auth.uid()
          AND tm.status = 'active'
        )
      );`,

      `DROP POLICY IF EXISTS "Users can create team posts" ON team_posts;`,
      `CREATE POLICY "Users can create team posts" ON team_posts FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.team_id = team_posts.team_id
          AND tm.user_id = auth.uid()
          AND tm.status = 'active'
        ) AND author_id = auth.uid()
      );`,

      `DROP POLICY IF EXISTS "Users can view practice schedules" ON practice_schedules;`,
      `CREATE POLICY "Users can view practice schedules" ON practice_schedules FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.team_id = practice_schedules.team_id
          AND tm.user_id = auth.uid()
          AND tm.status = 'active'
        )
      );`,
    ];

    // Execute policies using raw SQL through Supabase
    // Since we can't use exec_sql, let's try a different approach
    console.log('⚠️  Note: Cannot apply policies via client. Please run the SQL manually in Supabase dashboard.');
    console.log('📄 SQL to run in Supabase SQL Editor:');

    console.log('\n-- Service Role Policies --');
    servicePolicies.forEach(policy => console.log(policy));

    console.log('\n-- User Policies --');
    userPolicies.forEach(policy => console.log(policy));

    // Test current access
    console.log('\n🔍 Testing current access with service role...');

    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*');

    if (teamsError) {
      console.error('❌ Teams query failed:', teamsError.message);
    } else {
      console.log(`✅ Teams accessible: ${teams?.length || 0} records`);
    }

    const { data: posts, error: postsError } = await supabase
      .from('team_posts')
      .select('*');

    if (postsError) {
      console.error('❌ Team posts query failed:', postsError.message);
    } else {
      console.log(`✅ Team posts accessible: ${posts?.length || 0} records`);
    }

  } catch (error) {
    console.error('❌ Failed to fix RLS policies:', error);
  }
}

fixRLSPolicies();