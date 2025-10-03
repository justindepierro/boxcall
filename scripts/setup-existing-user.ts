import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupExistingUser() {
  console.log('=== Setting Up Existing User ===');
  
  const userEmail = 'justin@burkecatholic.edu';
  const userId = '2f699ee9-c8cf-4a98-a481-32b5c8247f4e'; // From previous output
  
  // Create/update profile
  console.log('📝 Creating/updating profile...');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email: userEmail,
      full_name: 'Justin DePierro',
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select();
  
  if (profileError) {
    console.error('❌ Profile creation error:', profileError);
    return;
  }
  
  console.log('✅ Profile created:', profile);
  
  // Create Development Team
  console.log('\n🏀 Creating Development Team...');
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert({
      name: 'Development Team',
      school_name: 'Dev School',
      mascot: 'Coders',
      season_year: new Date().getFullYear()
    })
    .select()
    .single();
  
  if (teamError) {
    console.error('❌ Team creation error:', teamError);
    return;
  }
  
  console.log('✅ Team created:', team);
  
  // Add user to team
  console.log('\n👥 Adding user to team...');
  const { data: membership, error: membershipError } = await supabase
    .from('team_members')
    .insert({
      team_id: team.id,
      user_id: userId,
      team_role: 'head_coach',
      status: 'active',
      capabilities: {
        "can_manage_team": true,
        "can_manage_games": true,
        "can_manage_social": true,
        "can_manage_players": true,
        "can_view_analytics": true,
        "can_manage_playbook": true,
        "can_manage_practice": true,
        "can_manage_equipment": true
      }
    })
    .select();
  
  if (membershipError) {
    console.error('❌ Membership creation error:', membershipError);
    return;
  }
  
  console.log('✅ Team membership created:', membership);
  
  console.log('\n🎉 Setup Complete!');
  console.log('========================');
  console.log('Email: justin@burkecatholic.edu');
  console.log('Password: dev123456');
  console.log('User ID:', userId);
  console.log('Team:', team.name);
  console.log('Role: head_coach');
  console.log('========================');
  console.log('You can now sign in to the app!');
}

setupExistingUser().catch(console.error);