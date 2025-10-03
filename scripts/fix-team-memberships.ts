/**
 * Fix duplicate teams and missing memberships
 * 
 * This script will:
 * 1. Identify your user ID
 * 2. Check team_members table
 * 3. Add missing team membership if needed
 * 4. Deactivate duplicate team
 */

import { supabase } from "../src/lib/supabase.js";

async function fixTeamMemberships() {
  console.log('🔧 Fixing team memberships and duplicates...\n');
  
  try {
    // Step 1: Get current user info
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('ℹ️ No authenticated user found. Please log in first.');
      console.log('');
      console.log('Manual fix steps:');
      console.log('1. Go to Supabase dashboard');
      console.log('2. Check team_members table');
      console.log('3. Look for entries with your user_id');
      console.log('4. If none exist, add them manually');
      return;
    }
    
    console.log(`👤 Current user: ${user.email} (${user.id})`);
    
    // Step 2: Check existing team memberships
    const { data: existingMemberships, error: membershipError } = await supabase
      .from('team_members')
      .select('*')
      .eq('user_id', user.id);
    
    if (membershipError) {
      console.error('❌ Error checking memberships:', membershipError);
      return;
    }
    
    console.log(`📋 Found ${existingMemberships?.length || 0} existing memberships`);
    
    // Step 3: Get the duplicate teams
    const burkeCatholicTeams = [
      'd4e707b4-7182-40e0-8d35-f75a69e5a449',
      'e2b03ad6-1660-487a-aa35-5de132f64b82'
    ];
    
    // Check which team is newer (keep the newer one)
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id, name, created_at')
      .in('id', burkeCatholicTeams)
      .order('created_at', { ascending: false });
    
    if (teamsError || !teams || teams.length === 0) {
      console.error('❌ Error fetching teams:', teamsError);
      return;
    }
    
    const newerTeam = teams[0];
    const olderTeam = teams[1];
    
    console.log(`📅 Newer team: ${newerTeam.id} (${newerTeam.created_at})`);
    if (olderTeam) {
      console.log(`📅 Older team: ${olderTeam.id} (${olderTeam.created_at})`);
    }
    
    // Step 4: Add membership for the newer team if it doesn't exist
    const membershipExists = existingMemberships?.some(m => m.team_id === newerTeam.id);
    
    if (!membershipExists) {
      console.log('➕ Adding team membership...');
      
      const { error: insertError } = await supabase
        .from('team_members')
        .insert({
          team_id: newerTeam.id,
          user_id: user.id,
          team_role: 'head_coach',
          status: 'active'
        });
      
      if (insertError) {
        console.error('❌ Error adding membership:', insertError);
        return;
      }
      
      console.log('✅ Team membership added successfully');
    } else {
      console.log('ℹ️ Team membership already exists');
    }
    
    // Step 5: Deactivate the older duplicate team
    if (olderTeam) {
      console.log('🗑️ Deactivating duplicate team...');
      
      const { error: updateError } = await supabase
        .from('teams')
        .update({ status: 'inactive' })
        .eq('id', olderTeam.id);
      
      if (updateError) {
        console.error('❌ Error deactivating duplicate:', updateError);
        return;
      }
      
      console.log('✅ Duplicate team deactivated');
    }
    
    console.log('\n🎉 Fix completed! You should now see your team in the dropdown.');
    console.log('💡 Refresh the page to see the changes.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// If this script is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixTeamMemberships().then(() => {
    console.log('✅ Script completed');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

export { fixTeamMemberships };