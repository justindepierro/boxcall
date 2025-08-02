#!/bin/bash

# BoxCall Database Update Script
# This script updates existing Supabase tables with team management features

echo "🏈 BoxCall Database Update"
echo "========================="
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

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ Error: psql not found"
    echo "Please install PostgreSQL client tools"
    echo "On macOS: brew install postgresql"
    echo "On Ubuntu/Debian: sudo apt-get install postgresql-client"
    exit 1
fi

echo "✅ Found psql client"
echo ""

# Extract database URL for psql connection
POSTGRES_URL="${VITE_SUPABASE_URL/https:\/\//postgresql://}"
POSTGRES_URL="${POSTGRES_URL/supabase.co/supabase.co:5432}"
POSTGRES_URL="${POSTGRES_URL}/postgres"

echo "🔍 Checking existing database structure..."
echo ""

# Check if teams table exists
TEAMS_EXISTS=$(psql "$POSTGRES_URL" -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'teams');" 2>/dev/null | tr -d ' \n')

if [ "$TEAMS_EXISTS" = "t" ]; then
    echo "📋 Found existing tables - running ENHANCEMENT migration"
    echo "This will safely enhance your existing schema with team management features"
    echo ""
    
    # Run the enhancement migration
    echo "🔗 Running migration: database/migrations/003_enhance_existing_schema.sql"
    psql "$POSTGRES_URL" -f "database/migrations/003_enhance_existing_schema.sql"
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 Database enhancement completed successfully!"
        echo ""
        echo "📋 Enhanced existing tables:"
        echo "  ✅ teams - Added missing columns and team codes"
        echo "  ✅ team_members - Enhanced with permissions and status"
        echo "  ✅ team_invites - Enhanced invitation system"
        echo "  ✅ user_profiles - Enhanced player management"
        echo ""
        echo "🔒 Row Level Security policies updated"
        echo "📈 Performance indexes optimized"
        echo "🔧 Helper functions installed"
    else
        echo ""
        echo "❌ Database enhancement failed"
        echo "Please check the error messages above and try again"
        exit 1
    fi
else
    echo "🆕 No existing tables found - running FRESH migration"
    echo "This will create all tables from scratch"
    echo ""
    
    # Run the fresh migration
    echo "🔗 Running migration: database/migrations/001_create_team_tables.sql"
    psql "$POSTGRES_URL" -f "database/migrations/001_create_team_tables.sql"
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 Database setup completed successfully!"
        echo ""
        echo "📋 Tables created:"
        echo "  ✅ teams"
        echo "  ✅ team_members"
        echo "  ✅ team_players"
        echo "  ✅ team_invites"
        echo ""
        echo "🔒 Row Level Security enabled with proper policies"
        echo "📈 Performance indexes created"
        echo "🔧 Helper functions installed"
    else
        echo ""
        echo "❌ Database setup failed"
        echo "Please check the error messages above and try again"
        exit 1
    fi
fi

echo ""
echo "🚀 Your BoxCall database is ready!"
echo ""
echo "Next steps:"
echo "1. Start the development server: npm run dev"
echo "2. Use the Dev Mode Switcher to test different user roles"
echo "3. Create your team and start adding players!"
echo ""
echo "🛠️ Dev Mode Options:"
echo "  👑 Super Admin (Your Team) - Full access with your real data"
echo "  🧪 Super Admin (Mock Data) - Testing with Eastside Eagles"
echo "  🏆 View as Head Coach - Coach perspective"
echo "  🏃‍♂️ View as Player - Player dashboard"
echo "  👨‍👩‍👧‍👦 View as Family - Parent portal"
