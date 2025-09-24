import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function createEssentialDemoData() {
  try {
    console.log('🔧 Creating essential demo data...');

    // Create admin profile (this should work since profiles table exists)
    console.log('🚀 Creating admin profile...');
    const { data: admin, error: adminError } = await supabase
      .from('profiles')
      .insert({
        id: 'a3794bd5-5173-46c5-9d92-dd3963bb1b3c',
        full_name: 'BoxCall Admin',
        role: 'admin'
      })
      .select()
      .single();

    if (adminError) {
      console.log('⚠️  Admin profile creation failed:', adminError.message);
    } else {
      console.log('✅ Created admin profile:', admin.full_name);
    }

    // Get the team that was created
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id')
      .limit(1);

    if (teamsError || !teams || teams.length === 0) {
      console.error('❌ No teams found');
      return;
    }

    const teamId = teams[0].id;
    console.log('📋 Using team ID:', teamId);

    // Create team membership for admin
    console.log('🚀 Creating team membership for admin...');
    const { data: _membership, error: membershipError } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: 'a3794bd5-5173-46c5-9d92-dd3963bb1b3c',
        team_role: 'head_coach',
        status: 'active'
      })
      .select()
      .single();

    if (membershipError) {
      console.log('⚠️  Team membership creation failed:', membershipError.message);
    } else {
      console.log('✅ Created team membership for admin');
    }

    // Create a simple team post
    console.log('🚀 Creating welcome team post...');
    const { data: _post, error: postError } = await supabase
      .from('team_posts')
      .insert({
        team_id: teamId,
        author_id: 'a3794bd5-5173-46c5-9d92-dd3963bb1b3c',
        content: 'Welcome to BoxCall! This is your team bulletin board. Use this space to share important updates, game highlights, and team announcements.',
        is_pinned: true
      })
      .select()
      .single();

    if (postError) {
      console.log('⚠️  Team post creation failed:', postError.message);
    } else {
      console.log('✅ Created welcome team post');
    }

    // Create a playbook
    console.log('🚀 Creating demo playbook...');
    const { data: _playbook, error: playbookError } = await supabase
      .from('playbooks')
      .insert({
        team_id: teamId,
        name: 'Demo Playbook',
        description: 'A sample playbook to get you started'
      })
      .select()
      .single();

    if (playbookError) {
      console.log('⚠️  Playbook creation failed:', playbookError.message);
    } else {
      console.log('✅ Created demo playbook');
    }

    console.log('🎉 Essential demo data creation complete!');
    console.log('🔍 Run the database audit to verify everything is working.');

  } catch (error) {
    console.error('❌ Failed to create demo data:', error);
  }
}

createEssentialDemoData();