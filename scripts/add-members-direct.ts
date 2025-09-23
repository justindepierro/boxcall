#!/usr/bin/env npx tsx

/**
 * Directly add team members using hardcoded team IDs
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://lvmuiqwihlpnwppdqqfl.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bXVpcXdpaGxwbndwcGRxcWZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjAyMjM0OCwiZXhwIjoyMDY3NTk4MzQ4fQ.cCLvqoIWqHHMN_PQoSoST5Jh1PtECbFirGpr-L46Oic';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const userId = '885a4a2c-807c-4ab7-8ba7-fd13285a81fb';
const teamIds = [
  '30190b02-afac-45e7-b02f-80a7566dbabc',
  'f039cb48-da7c-4bb7-8e02-6322f391293a'
];

async function addTeamMembers() {
  console.log('👥 Adding user as team member to demo teams...');

  try {
    for (const teamId of teamIds) {
      console.log(`\n👥 Adding user to team: ${teamId}`);

      // Try to insert (will fail if already exists due to unique constraint)
      const { data: member, error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: userId,
          role: 'coach'
        })
        .select()
        .single();

      if (memberError) {
        if (memberError.message.includes('duplicate key')) {
          console.log('✅ User is already a member of this team');
        } else {
          console.error('❌ Error adding team member:', memberError.message);
        }
        continue;
      }

      console.log('✅ User added as team member!');
      console.log('👤 Role: coach');
      console.log('📊 Member data:', member);
    }

    console.log('\n📱 Now you can access the team bulletin for all demo teams');

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

addTeamMembers();