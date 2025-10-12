#!/usr/bin/env node
/**
 * Debug: Why FormationBuilderPanel sees 0 formations
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://lvmuiqwihlpnwppdqqfl.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bXVpcXdpaGxwbndwcGRxcWZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjAyMjM0OCwiZXhwIjoyMDY3NTk4MzQ4fQ.cCLvqoIWqHHMN_PQoSoST5Jh1PtECbFirGpr-L46Oic'
);

const YOUR_USER_ID = 'fafcaafd-0154-4f87-9752-95fbfa2372a0';
const YOUR_PLAYBOOK_ID = '291675df-b531-4754-b359-4bec6867542d';

async function debugFormations() {
  console.log('🔍 Debugging Formation Visibility\n');

  // 1. Check formations exist
  console.log('1️⃣ Check formations in database:');
  const { data: allFormations, error: allError } = await supabase
    .from('formations')
    .select('*')
    .eq('playbook_id', YOUR_PLAYBOOK_ID);

  if (allError) {
    console.log(`   ❌ Error: ${allError.message}\n`);
  } else {
    console.log(`   ✅ Found ${allFormations?.length || 0} formations`);
    allFormations?.forEach(f => {
      console.log(`      - ${f.name} (${f.direction}) - created_by: ${f.created_by?.substring(0, 8)}...`);
    });
    console.log('');
  }

  // 2. Check RLS policies
  console.log('2️⃣ Check RLS policies on formations:');
  const { data: policies } = await supabase
    .rpc('exec_sql', {
      query: `
        SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
        FROM pg_policies
        WHERE tablename = 'formations';
      `
    }).catch(() => ({ data: null }));

  if (policies) {
    console.log('   RLS Policies:', policies);
  } else {
    console.log('   ⚠️  Could not fetch policies (need to check Supabase dashboard)');
  }
  console.log('');

  // 3. Check team membership
  console.log('3️⃣ Check your team membership:');
  const { data: playbook } = await supabase
    .from('playbooks')
    .select('id, name, team_id')
    .eq('id', YOUR_PLAYBOOK_ID)
    .single();

  console.log(`   Playbook: ${playbook?.name} (${playbook?.id?.substring(0, 8)}...)`);
  console.log(`   Team ID: ${playbook?.team_id?.substring(0, 8)}...`);

  const { data: membership } = await supabase
    .from('team_members')
    .select('*')
    .eq('team_id', playbook?.team_id)
    .eq('user_id', YOUR_USER_ID);

  if (membership && membership.length > 0) {
    console.log(`   ✅ You ARE a member: ${membership[0].team_role} (${membership[0].status})`);
  } else {
    console.log(`   ❌ You are NOT a member of this team!`);
  }
  console.log('');

  // 4. Test query as user (with anon key)
  console.log('4️⃣ Test query with anon key (as browser would):');
  const userSupabase = createClient(
    'https://lvmuiqwihlpnwppdqqfl.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bXVpcXdpaGxwbndwcGRxcWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMjIzNDgsImV4cCI6MjA2NzU5ODM0OH0.3SreGdPAJ2J5XcQVbNIbzK378j15ZJnwQqscBE2HkII'
  );

  // Sign in as user
  const { data: session } = await userSupabase.auth.signInWithPassword({
    email: 'justindepierro@gmail.com',
    password: 'test' // This will fail, but we can still test
  }).catch(() => ({ data: null }));

  console.log(`   Session: ${session ? 'Authenticated' : 'Not authenticated (expected)'}`);
  
  // Try query without auth (this is what's probably happening)
  const { data: userFormations, error: userError } = await userSupabase
    .from('formations')
    .select('*')
    .eq('playbook_id', YOUR_PLAYBOOK_ID);

  if (userError) {
    console.log(`   ❌ User query error: ${userError.message}`);
    console.log(`   ❌ This is likely the problem! RLS is blocking unauthenticated queries.\n`);
  } else {
    console.log(`   ✅ User can see ${userFormations?.length || 0} formations\n`);
  }

  // 5. Check personnel
  console.log('5️⃣ Check personnel configurations:');
  const { data: personnel, error: personnelError } = await supabase
    .from('personnel_configurations')
    .select('*')
    .eq('playbook_id', YOUR_PLAYBOOK_ID);

  if (personnelError) {
    console.log(`   ❌ Error: ${personnelError.message}\n`);
  } else {
    console.log(`   ✅ Found ${personnel?.length || 0} personnel configs`);
    personnel?.forEach(p => {
      console.log(`      - ${p.name}`);
    });
    console.log('');
  }

  // 6. Solution
  console.log('💡 LIKELY ISSUES:\n');
  console.log('   Issue #1: Browser is not authenticated');
  console.log('   Issue #2: RLS policy blocks anonymous access');
  console.log('   Issue #3: Component using wrong playbook_id\n');
  
  console.log('🔧 SOLUTIONS:\n');
  console.log('   1. Make sure you\'re logged in (check auth.users)');
  console.log('   2. Check RLS policy: formations_select_policy');
  console.log('   3. Add console.log in FormationBuilderPanel loadData()');
  console.log('   4. Verify playbookId prop is correct\n');
}

debugFormations().catch(console.error).finally(() => process.exit(0));
