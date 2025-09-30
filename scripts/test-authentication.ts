import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

// Create client like the app does
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUserAuthentication() {
  console.log('🔐 Testing User Authentication');
  console.log('==============================\n');

  // 1. Check if we can sign in with your credentials
  console.log('1. Testing sign in...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'justindepierro@gmail.com', // Use your actual email
    password: 'BoxCall2025!' // If you know your password, otherwise we'll check existing session
  });

  if (signInError) {
    console.log('❌ Sign in failed:', signInError.message);
    console.log('⚠️  This might be normal if password is different');
  } else {
    console.log('✅ Sign in successful!');
    console.log('👤 User ID:', signInData.user?.id);
    console.log('📧 Email:', signInData.user?.email);
  }

  // 2. Check current session
  console.log('\n2. Checking current session...');
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.log('❌ Session error:', sessionError);
  } else if (sessionData.session) {
    console.log('✅ Active session found!');
    console.log('👤 User ID:', sessionData.session.user.id);
    console.log('📧 Email:', sessionData.session.user.email);
    console.log('🎫 Access token length:', sessionData.session.access_token.length);
  } else {
    console.log('❌ No active session');
  }

  // 3. Check current user
  console.log('\n3. Checking current user...');
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    console.log('❌ Get user error:', userError);
  } else if (userData.user) {
    console.log('✅ User found!');
    console.log('👤 User ID:', userData.user.id);
    console.log('📧 Email:', userData.user.email);
  } else {
    console.log('❌ No user found');
  }

  // 4. Test authenticated query
  console.log('\n4. Testing authenticated query...');
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', 'fafcaafd-0154-4f87-9752-95fbfa2372a0');

  if (profileError) {
    console.log('❌ Profile query error:', profileError);
  } else {
    console.log('✅ Profile query result:', profileData?.length, 'records');
    if (profileData?.length) {
      console.log('📋 Profile data:', profileData[0]);
    }
  }

  // 5. Test teams query
  console.log('\n5. Testing teams query...');
  const { data: teamsData, error: teamsError } = await supabase
    .from('teams')
    .select('*');

  if (teamsError) {
    console.log('❌ Teams query error:', teamsError);
  } else {
    console.log('✅ Teams query result:', teamsData?.length, 'records');
  }
}

// Run the test
testUserAuthentication().catch(console.error);