import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function signInAndTest() {
  console.log('=== Sign In Test ===');
  
  // Try to sign in with the user we created
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'justin@burkecatholic.edu',
    password: 'dev123456'
  });
  
  if (authError) {
    console.error('❌ Sign in error:', authError);
    return;
  }
  
  console.log('✅ Sign in successful');
  console.log('User ID:', authData.user.id);
  console.log('Email:', authData.user.email);
  
  // Wait a moment for auth to settle
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Now test profile query
  console.log('\n=== Testing Profile Query After Auth ===');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();
  
  if (profileError) {
    console.error('❌ Profile query error:', profileError);
  } else {
    console.log('✅ Profile found:', profile);
  }
  
  // Test team memberships
  console.log('\n=== Testing Team Memberships ===');
  const { data: memberships, error: membershipError } = await supabase
    .from('team_members')
    .select(`
      id,
      team_role,
      status,
      capabilities,
      team:teams(id, name, mascot)
    `)
    .eq('user_id', authData.user.id)
    .eq('status', 'active');
  
  if (membershipError) {
    console.error('❌ Memberships query error:', membershipError);
  } else {
    console.log('✅ Memberships found:', memberships);
  }
  
  // Sign out
  await supabase.auth.signOut();
  console.log('\n✅ Signed out');
}

signInAndTest().catch(console.error);