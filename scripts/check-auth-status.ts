import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAuthStatus() {
  console.log('=== Auth Status Check ===');
  
  // Get current session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('Session error:', sessionError);
    return;
  }
  
  if (!session) {
    console.log('❌ No active session');
    return;
  }
  
  console.log('✅ Active session found');
  console.log('User ID:', session.user.id);
  console.log('Email:', session.user.email);
  console.log('Role:', session.user.role);
  
  // Test if we can query our own profile with user auth
  console.log('\n=== Testing Profile Query with User Auth ===');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
  if (profileError) {
    console.error('❌ Profile query error:', profileError);
  } else {
    console.log('✅ Profile found:', profile);
  }
  
  // Test team memberships query
  console.log('\n=== Testing Team Memberships Query ===');
  const { data: memberships, error: membershipError } = await supabase
    .from('team_members')
    .select(`
      id,
      role,
      status,
      capabilities,
      team:teams(id, name, sport)
    `)
    .eq('user_id', session.user.id)
    .eq('status', 'active');
  
  if (membershipError) {
    console.error('❌ Memberships query error:', membershipError);
  } else {
    console.log('✅ Memberships found:', memberships);
  }
}

checkAuthStatus().catch(console.error);