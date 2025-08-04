#!/bin/bash

# BoxCall Professional Dev Profile Setup Script
# This script creates professional development profiles in Supabase for realistic testing

echo "🛠️ BoxCall Professional Dev Profile Setup"
echo "=========================================="
echo ""

# Check if environment variables are set
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: Supabase environment variables not found"
    echo "Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file"
    exit 1
fi

echo "✅ Found Supabase environment variables"
echo "📊 Supabase URL: $VITE_SUPABASE_URL"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}📝 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "This script must be run from the BoxCall project root directory"
    exit 1
fi

print_step "Setting up professional development profiles..."
echo ""

# Create TypeScript setup script content
cat > /tmp/setup-dev-profiles.ts << 'EOF'
import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/types/database';

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Professional dev profile data
const DEV_PROFILES = [
  {
    email: 'dev_head_coach@boxcall.dev',
    full_name: 'Coach Sarah Martinez',
    role: 'coach' as const,
    description: 'Professional head coach with 8 years experience. Leads Eagles varsity team.',
    team_name: 'Eagles Varsity Football',
    team_role: 'head_coach' as const,
    has_achievements: true,
    has_calendar: true,
    has_playbook: true
  },
  {
    email: 'dev_assistant_coach@boxcall.dev',
    full_name: 'Coach Mike Johnson',
    role: 'coach' as const,
    description: 'Assistant coach specializing in defensive strategy and player development.',
    team_name: 'Eagles Varsity Football',
    team_role: 'assistant_coach' as const,
    has_achievements: true,
    has_calendar: true,
    has_playbook: false
  },
  {
    email: 'dev_player@boxcall.dev',
    full_name: 'Alex Thompson',
    role: 'player' as const,
    description: 'Senior quarterback with strong leadership skills.',
    team_name: 'Eagles Varsity Football',
    team_role: 'player' as const,
    has_achievements: true,
    has_calendar: true,
    has_playbook: false
  },
  {
    email: 'dev_super_admin@boxcall.dev',
    full_name: 'Admin Jessica Chen',
    role: 'admin' as const,
    description: 'BoxCall system administrator with full platform access.',
    team_name: 'Eagles Varsity Football',
    team_role: 'admin' as const,
    has_achievements: true,
    has_calendar: true,
    has_playbook: true
  }
];

async function setupDevProfiles() {
  console.log('🚀 Creating professional development profiles...\n');

  // Create a professional development team
  const teamData = {
    name: 'Eagles Varsity Football (Dev)',
    description: 'Professional development team for realistic testing scenarios',
    team_code: 'EAGLES_DEV_2024',
    subscription_type: 'team_premium' as const,
    created_by: null // Will be set after we create the first profile
  };

  try {
    console.log('📋 Creating development team...');
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert([teamData])
      .select()
      .single();

    if (teamError) {
      console.error('❌ Error creating team:', teamError);
      return;
    }

    console.log('✅ Created team:', team.name);
    console.log('🏷️ Team ID:', team.id);
    console.log('🔑 Team Code:', team.team_code);
    console.log('');

    // Create professional dev profiles
    for (const profile of DEV_PROFILES) {
      console.log(`👤 Creating profile: ${profile.full_name} (${profile.email})`);
      
      try {
        // Create user profile
        const { data: userProfile, error: profileError } = await supabase
          .from('user_profiles')
          .insert([{
            email: profile.email,
            full_name: profile.full_name,
            role: profile.role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (profileError) {
          console.error(`❌ Error creating profile for ${profile.email}:`, profileError);
          continue;
        }

        console.log(`   ✅ Created user profile`);

        // Create team membership
        const { error: membershipError } = await supabase
          .from('team_members')
          .insert([{
            user_id: userProfile.id,
            team_id: team.id,
            role: profile.team_role,
            permissions: null,
            joined_at: new Date().toISOString()
          }]);

        if (membershipError) {
          console.error(`❌ Error creating team membership for ${profile.email}:`, membershipError);
          continue;
        }

        console.log(`   ✅ Added to team as ${profile.team_role}`);

        // Create realistic data based on profile type
        if (profile.has_achievements) {
          const achievements = [
            {
              user_id: userProfile.id,
              team_id: team.id,
              title: `${profile.role === 'player' ? 'Player' : 'Coach'} Excellence`,
              description: `Outstanding ${profile.role === 'player' ? 'performance' : 'leadership'} in recent season`,
              icon: profile.role === 'player' ? '🏆' : '⭐',
              earned_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
            }
          ];

          const { error: achievementError } = await supabase
            .from('achievements')
            .insert(achievements);

          if (!achievementError) {
            console.log(`   ✅ Added realistic achievements`);
          }
        }

        if (profile.has_calendar) {
          const events = [
            {
              team_id: team.id,
              title: 'Team Practice',
              description: 'Regular practice session',
              event_type: 'practice' as const,
              start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              end_time: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
              location: 'Main Field',
              created_by: userProfile.id
            },
            {
              team_id: team.id,
              title: 'vs. Tigers',
              description: 'Away game against Tigers',
              event_type: 'game' as const,
              start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
              location: 'Tigers Stadium',
              created_by: userProfile.id
            }
          ];

          const { error: eventError } = await supabase
            .from('calendar_events')
            .insert(events);

          if (!eventError) {
            console.log(`   ✅ Added realistic calendar events`);
          }
        }

        console.log(`   ✅ Profile setup complete\n`);

      } catch (error) {
        console.error(`❌ Unexpected error setting up ${profile.email}:`, error);
      }
    }

    console.log('🎉 Professional development profiles setup complete!');
    console.log('');
    console.log('📋 Available Dev Profiles:');
    console.log('━'.repeat(50));
    
    DEV_PROFILES.forEach(profile => {
      console.log(`👤 ${profile.full_name}`);
      console.log(`   📧 ${profile.email}`);
      console.log(`   🎭 ${profile.role} (${profile.team_role})`);
      console.log(`   📝 ${profile.description}`);
      console.log('');
    });

    console.log('🔧 Usage in QuickDevPanel:');
    console.log('• dev_head_coach    → Coach Sarah Martinez');
    console.log('• dev_assistant_coach → Coach Mike Johnson');
    console.log('• dev_player        → Alex Thompson');
    console.log('• dev_super_admin   → Admin Jessica Chen');
    console.log('• blank_slate       → New user experience');
    console.log('');
    console.log('✨ These profiles provide realistic data for testing all user roles!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupDevProfiles();
EOF

# Check if TypeScript is available
if ! command -v npx &> /dev/null; then
    print_error "npx not found. Please install Node.js and npm."
    exit 1
fi

print_step "Running TypeScript setup script..."
echo ""

# Set environment variables and run the setup
export NODE_ENV=development
npx tsx /tmp/setup-dev-profiles.ts

if [ $? -eq 0 ]; then
    print_success "Professional dev profiles setup complete!"
    echo ""
    print_step "Next Steps:"
    echo "1. 🔄 Restart your development server"
    echo "2. 🛠️ Open the QuickDevPanel (enhanced version)"
    echo "3. 🎭 Switch between professional dev profiles"
    echo "4. 🧪 Test realistic scenarios for each role"
    echo ""
    print_warning "Note: These are development profiles only!"
    print_warning "They should not be used in production."
else
    print_error "Setup failed. Check the error messages above."
    exit 1
fi

# Cleanup
rm -f /tmp/setup-dev-profiles.ts

echo ""
print_success "🎉 Professional Dev Profile Setup Complete!"
echo ""
echo "Your BoxCall application now has realistic development profiles"
echo "for testing all user roles with proper data separation."
echo ""
echo "Happy coding! 🚀"
