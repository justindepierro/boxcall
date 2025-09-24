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

async function recreateMissingTablesAndData() {
  try {
    console.log('🔧 Recreating missing demo data...');

    // Try to create demo teams
    console.log('🚀 Creating demo teams...');

    const { data: team1, error: team1Error } = await supabase
      .from('teams')
      .insert({
        name: 'Demo Football Team',
        school_name: 'Demo High School',
        mascot: 'Eagles',
        season_year: 2024
      })
      .select()
      .single();

    if (team1Error) {
      console.log('⚠️  Team 1 may already exist:', team1Error.message);
    } else {
      console.log('✅ Created team:', team1.name);
    }

    // Create admin profile
    console.log('🚀 Creating admin profile...');
    const { data: admin, error: createAdminError } = await supabase
      .from('profiles')
      .insert({
        id: 'a3794bd5-5173-46c5-9d92-dd3963bb1b3c',
        full_name: 'BoxCall Admin',
        email: 'admin@boxcall.com',
        role: 'admin'
      })
      .select()
      .single();

    if (createAdminError) {
      console.log('⚠️  Admin profile may already exist:', createAdminError.message);
    } else {
      console.log('✅ Created admin profile:', admin.full_name);
    }

    // Get a team ID to create posts
    const { data: teams, error: teamsQueryError } = await supabase
      .from('teams')
      .select('id')
      .limit(1);

    if (teamsQueryError) {
      console.error('❌ Error getting teams:', teamsQueryError.message);
    } else if (teams && teams.length > 0) {
      console.log('🚀 Creating demo team posts...');

      const { data: post, error: postError } = await supabase
        .from('team_posts')
        .insert({
          team_id: teams[0].id,
          author_id: 'a3794bd5-5173-46c5-9d92-dd3963bb1b3c',
          title: 'Welcome to BoxCall!',
          content: 'This is your team bulletin board. Use this space to share important updates, game highlights, and team announcements.',
          post_type: 'announcement'
        })
        .select()
        .single();

      if (postError) {
        console.log('⚠️  Demo post may already exist:', postError.message);
      } else {
        console.log('✅ Created demo post:', post.title);
      }
    }

    console.log('🎉 Demo data recreation attempt complete!');
    console.log('🔍 Run the database audit to check the current state.');

  } catch (error) {
    console.error('❌ Failed to recreate data:', error);
  }
}

recreateMissingTablesAndData();