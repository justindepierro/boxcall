#!/usr/bin/env npx tsx

/**
 * Check team members for the demo team
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

async function checkTeamMembers() {
  console.log('👥 Checking team members...');

  try {
    // Get the demo team
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id, name')
      .limit(5);

    if (teamsError) {
      console.error('❌ Error fetching teams:', teamsError.message);
      return;
    }

    console.log('📋 Teams found:');
    teams?.forEach(team => {
      console.log(`  ${team.name} (${team.id})`);
    });

    if (teams && teams.length > 0) {
      const demoTeam = teams[0]; // Assuming first team is demo

      // Check team members
      const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', demoTeam.id);

      if (membersError) {
        console.error('❌ Error fetching team members:', membersError.message);
        return;
      }

      console.log(`\n👥 Team members for "${demoTeam.name}":`);
      if (members && members.length > 0) {
        members.forEach(member => {
          console.log(`  User ${member.user_id} - Role: ${member.role}`);
        });
      } else {
        console.log('  ❌ No team members found');
        console.log('  💡 This means users cannot access the team bulletin!');
      }
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

checkTeamMembers();