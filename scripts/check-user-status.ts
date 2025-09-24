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

async function checkUserStatus() {
  console.log('🔍 CHECKING USER AUTH STATUS');
  console.log('============================\n');

  try {
    const { data: users, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.log('❌ Failed to list users:', error.message);
      return;
    }

    const adminUser = users.users.find(user => user.email === 'justindepierro@gmail.com');

    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('User Details:');
    console.log(`  - ID: ${adminUser.id}`);
    console.log(`  - Email: ${adminUser.email}`);
    console.log(`  - Email Confirmed: ${adminUser.email_confirmed_at ? '✅' : '❌'}`);
    console.log(`  - Created: ${adminUser.created_at}`);
    console.log(`  - Last Sign In: ${adminUser.last_sign_in_at || 'Never'}`);

    // If not confirmed, confirm the user
    if (!adminUser.email_confirmed_at) {
      console.log('\n🔧 Confirming user email...');

      const { error: confirmError } = await supabase.auth.admin.updateUserById(adminUser.id, {
        email_confirm: true
      });

      if (confirmError) {
        console.log('❌ Failed to confirm user:', confirmError.message);
      } else {
        console.log('✅ User email confirmed');
      }
    }

    // Test login
    console.log('\n🔐 Testing login...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'justindepierro@gmail.com',
      password: 'TempPass123!'
    });

    if (authError) {
      console.log('❌ Login failed:', authError.message);
    } else {
      console.log('✅ Login successful');
      console.log(`  - User ID: ${authData.user?.id}`);
      console.log(`  - Access Token: ${authData.session?.access_token ? 'Present' : 'Missing'}`);
    }

  } catch (err) {
    console.error('❌ Error:', (err as Error).message);
  }
}

checkUserStatus().catch(console.error);