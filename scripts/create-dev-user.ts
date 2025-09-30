import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createDevUser() {
  console.log('=== Creating Development User ===');
  
  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'justin@burkecatholic.edu',
    password: 'dev123456',
    email_confirm: true, // Skip email confirmation
    user_metadata: {
      full_name: 'Justin DePierro',
      role: 'admin'
    }
  });
  
  if (authError) {
    console.error('❌ Auth user creation error:', authError);
    return;
  }
  
  console.log('✅ Auth user created');
  console.log('User ID:', authData.user.id);
  console.log('Email:', authData.user.email);
  
  // Wait for auth to settle
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Create/update profile
  console.log('\n=== Creating Profile ===');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: authData.user.id,
      email: 'justin@burkecatholic.edu',
      full_name: 'Justin DePierro',
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select();
  
  if (profileError) {
    console.error('❌ Profile creation error:', profileError);
  } else {
    console.log('✅ Profile created:', profile);
  }
  
  console.log('\n=== User Creation Complete ===');
  console.log('Email: justin@burkecatholic.edu');
  console.log('Password: dev123456');
  console.log('User ID:', authData.user.id);
}

createDevUser().catch(console.error);