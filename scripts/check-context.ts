/**
 * Check Current User and Playbook Context
 * 
 * This will help us understand which user and playbook you're viewing in the UI
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkContext() {
  console.log('🔍 CHECKING USER & PLAYBOOK CONTEXT\n');
  console.log('='.repeat(70));

  // Check current user (will be null since we're using anon key)
  const { data: { user } } = await supabase.auth.getUser();
  console.log('\n👤 Current User:');
  if (user) {
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
  } else {
    console.log('   ❌ No authenticated user (using anon key)');
    console.log('   This is expected - the script uses anonymous access');
  }

  // Try to query ALL data without filters to see what exists
  console.log('\n\n📊 CHECKING ALL TABLES (no RLS filters):\n');

  const tables = ['teams', 'playbooks', 'plays', 'formations'];
  
  for (const table of tables) {
    try {
      // Use service role or check with select *
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' });

      if (error) {
        console.log(`   ${table}: ❌ Error - ${error.message}`);
      } else {
        console.log(`   ${table}: ${count || 0} rows total`);
        if (data && data.length > 0) {
          console.log(`      Sample IDs: ${data.slice(0, 3).map(r => r.id?.substring(0, 8)).join(', ')}...`);
        }
      }
    } catch (err) {
      console.log(`   ${table}: ❌ ${err}`);
    }
  }

  // The issue is RLS (Row Level Security) policies!
  console.log('\n\n💡 IMPORTANT INSIGHT:');
  console.log('='.repeat(70));
  console.log('The tables exist and MAY have data, but we cannot see it because:');
  console.log('1. Row Level Security (RLS) is enabled on these tables');
  console.log('2. This script uses the anon key (not authenticated)');
  console.log('3. The UI shows data because YOU are logged in');
  console.log('\nYour browser session has your authentication token, so it can see');
  console.log('your teams, playbooks, and plays. But this script cannot.\n');

  console.log('🔧 SOLUTION OPTIONS:\n');
  console.log('1. Use the browser console to run queries (you\'re already logged in)');
  console.log('2. Check the Data Diagnostic tab in your UI (already working!)');
  console.log('3. I can modify the existing components to show you the data\n');

  console.log('='.repeat(70));
}

checkContext()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
