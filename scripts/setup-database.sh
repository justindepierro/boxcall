#!/bin/bash

# BoxCall Database Setup Script
# This script sets up the team management tables in Supabase

echo "🏈 BoxCall Database Setup"
echo "========================"
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
# Convert Supabase URL to postgres connection string
POSTGRES_URL="${VITE_SUPABASE_URL/https:\/\//postgresql://}"
POSTGRES_URL="${POSTGRES_URL/supabase.co/supabase.co:5432}"
POSTGRES_URL="${POSTGRES_URL}/postgres"

echo "🔗 Connecting to database..."
echo "Running migration: database/migrations/001_create_team_tables.sql"
echo ""

# Run the migration
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
    echo ""
    echo "🚀 Your BoxCall database is ready!"
    echo ""
    echo "Next steps:"
    echo "1. Start the development server: npm run dev"
    echo "2. Use the Dev Mode Switcher to test different user roles"
    echo "3. Create your team and start adding players!"
else
    echo ""
    echo "❌ Database setup failed"
    echo "Please check the error messages above and try again"
    exit 1
fi
