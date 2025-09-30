import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCurrentUser() {
  console.log('=== Current User Check ===');
  
  const userId = 'fafcaafd-0154-4f87-9752-95fbfa2372a0'; // From console logs
  
  // Check if this user exists
  console.log('👤 Checking user profile...');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (profileError) {
    console.error('❌ Profile not found:', profileError);
  } else {
    console.log('✅ Profile found:', profile);
  }
  
  // Check team memberships
  console.log('\n👥 Checking team memberships...');
  const { data: memberships, error: membershipError } = await supabase
    .from('team_members')
    .select(`
      id,
      team_role,
      status,
      capabilities,
      team:teams(id, name, mascot)
    `)
    .eq('user_id', userId)
    .eq('status', 'active');
  
  if (membershipError) {
    console.error('❌ Memberships error:', membershipError);
  } else {
    console.log('✅ Memberships found:', memberships);
  }
  
  // Check if this user exists in auth
  console.log('\n🔐 Checking auth user...');
  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
  
  if (authError) {
    console.error('❌ Auth user not found:', authError);
  } else {
    console.log('✅ Auth user found:', authUser.user?.email);
  }
}

checkCurrentUser().catch(console.error);