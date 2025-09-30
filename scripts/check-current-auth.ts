import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

// Create client like the app does
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkCurrentAuth() {
  console.log('🔐 Checking Current Authentication State');
  console.log('========================================\n');

  // Check if we can get the current session
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.log('❌ Session error:', sessionError);
  } else if (sessionData.session) {
    console.log('✅ Active session found!');
    console.log('👤 User ID:', sessionData.session.user.id);
    console.log('📧 Email:', sessionData.session.user.email);
    console.log('🎫 Access token exists:', !!sessionData.session.access_token);
    
    // Test an authenticated query
    console.log('\n🔍 Testing authenticated queries...');
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sessionData.session.user.id)
      .single();
      
    if (profileError) {
      console.log('❌ Profile query failed:', profileError);
    } else {
      console.log('✅ Profile query successful:', profile);
    }
    
    const { data: teamMembers, error: membersError } = await supabase
      .from('team_members')
      .select('*')
      .eq('user_id', sessionData.session.user.id);
      
    if (membersError) {
      console.log('❌ Team members query failed:', membersError);
    } else {
      console.log('✅ Team members query successful:', teamMembers);
    }
    
  } else {
    console.log('❌ No active session - user is not logged in');
    console.log('🔄 This explains why roleContext is null and queries are failing');
  }
}

// Run the check
checkCurrentAuth().catch(console.error);