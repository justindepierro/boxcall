#!/usr/bin/env npx tsx

/**
 * Add user as team member to demo team
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://lvmuiqwihlpnwppdqqfl.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bXVpcXdpaGxwbndwcGRxcWZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjAyMjM0OCwiZXhwIloydC6MjA2NzU5ODM0OH0.3SreGdPAJ2J5XcQVbNIbzK378j15ZJnwQqscBE2HkII';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// User ID for justindepierro@gmail.com
const userId = '885a4a2c-807c-4ab7-8ba7-fd13285a81fb';

async function addTeamMember() {
  console.log('👥 Adding user as team member...');

  try {
    // Get all demo teams
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id, name')
      .eq('name', 'Demo Team');

    if (teamsError || !teams || teams.length === 0) {
      console.error('❌ No demo teams found');
      return;
    }

    console.log(`📋 Found ${teams.length} demo teams`);

    // Add user to each team
    for (const team of teams) {
      console.log(`\n� Adding user to team: ${team.name} (${team.id})`);

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', team.id)
        .eq('user_id', userId)
        .single();

      if (existingMember) {
        console.log('✅ User is already a member of this team');
        continue;
      }

      // Add user as team member
      const { data: member, error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: userId,
          role: 'coach' // Give them coach role so they can access everything
        })
        .select()
        .single();

      if (memberError) {
        console.error('❌ Error adding team member:', memberError.message);
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

addTeamMember();