import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!;

// Create service role client (bypasses RLS)
const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

// Create anon client (subject to RLS)
const supabaseAnon = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY!);

async function debugDatabase() {
  console.log('🔍 Database Debugging Session');
  console.log('==============================\n');

  // 1. Test service role access (should bypass RLS)
  console.log('1. Testing SERVICE ROLE access (bypasses RLS)');
  console.log('------------------------------------------------');
  
  try {
    const { data: profiles, error: profileError } = await supabaseService
      .from('profiles')
      .select('*')
      .eq('id', 'fafcaafd-0154-4f87-9752-95fbfa2372a0');
    
    console.log('✅ Service role - profiles query:', { profiles, error: profileError });
  } catch (err) {
    console.log('❌ Service role - profiles query failed:', err);
  }

  try {
    const { data: teams, error: teamsError } = await supabaseService
      .from('teams')
      .select('*')
      .limit(5);
    
    console.log('✅ Service role - teams query:', { teams: teams?.length, error: teamsError });
  } catch (err) {
    console.log('❌ Service role - teams query failed:', err);
  }

  try {
    const { data: teamMembers, error: membersError } = await supabaseService
      .from('team_members')
      .select('*')
      .eq('user_id', 'fafcaafd-0154-4f87-9752-95fbfa2372a0');
    
    console.log('✅ Service role - team_members query:', { teamMembers, error: membersError });
  } catch (err) {
    console.log('❌ Service role - team_members query failed:', err);
  }

  // 2. Test anonymous/user access (subject to RLS)
  console.log('\n2. Testing ANON/USER access (subject to RLS)');
  console.log('-----------------------------------------------');
  
  try {
    const { data: profiles, error: profileError } = await supabaseAnon
      .from('profiles')
      .select('*')
      .eq('id', 'fafcaafd-0154-4f87-9752-95fbfa2372a0');
    
    console.log('📊 Anon client - profiles query:', { profiles, error: profileError });
  } catch (err) {
    console.log('❌ Anon client - profiles query failed:', err);
  }

  try {
    const { data: teams, error: teamsError } = await supabaseAnon
      .from('teams')
      .select('*')
      .limit(5);
    
    console.log('📊 Anon client - teams query:', { teams: teams?.length, error: teamsError });
  } catch (err) {
    console.log('❌ Anon client - teams query failed:', err);
  }

  // 3. Test authenticated user simulation
  console.log('\n3. Simulating authenticated user context');
  console.log('------------------------------------------');
  
  // Create a client with user JWT (this simulates your browser session)
  const { data: authData, error: authError } = await supabaseService.auth.admin.generateLink({
    type: 'magiclink',
    email: 'justin@boxcall.app' // Replace with your actual email
  });
  
  if (authData.properties?.action_link) {
    console.log('🔐 Generated auth link for testing user session');
  } else {
    console.log('❌ Could not generate auth link:', authError);
  }
  
  console.log('\n4. Checking RLS policies');
  console.log('-------------------------');
  
  try {
    const { data: policies } = await supabaseService.rpc('get_policies_info', {});
    console.log('📋 RLS Policies info:', policies);
  } catch {
    console.log('❌ Could not fetch RLS policies info');
  }
  
  console.log('\n🎯 Summary: This will help identify if the issue is:');
  console.log('   - RLS policies blocking legitimate access');
  console.log('   - Authentication/session issues');
  console.log('   - Table permissions problems');
  console.log('   - Missing database records');
}

// Run the debug session
debugDatabase().catch(console.error);