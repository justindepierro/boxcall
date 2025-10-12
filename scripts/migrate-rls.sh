#!/bin/bash

# RLS Policy Migration Runner
# Runs the fix_rls_policies.sql migration using Supabase CLI

set -e  # Exit on error

echo "🚀 Starting RLS Policy Migration..."
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI not found"
    echo "Install it with: brew install supabase/tap/supabase"
    exit 1
fi

# Check if migration file exists
MIGRATION_FILE="database/migrations/fix_rls_policies.sql"
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "✅ Found migration file: $MIGRATION_FILE"
echo ""

# Get Supabase URL from .env
if [ -f .env ]; then
    SUPABASE_URL=$(grep VITE_SUPABASE_URL .env | cut -d '=' -f2)
    PROJECT_REF=$(echo $SUPABASE_URL | sed -E 's/https:\/\/([^.]+).*/\1/')
    echo "📡 Supabase Project: $PROJECT_REF"
else
    echo "❌ Error: .env file not found"
    exit 1
fi

echo ""
echo "⚠️  This will:"
echo "   1. Drop the broken 'Team coaches can manage plays' policy"
echo "   2. Create separate INSERT, UPDATE, DELETE policies"
echo "   3. Remove duplicate SELECT policy on playbooks"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Migration cancelled"
    exit 0
fi

echo ""
echo "🔄 Running migration..."
echo ""

# Link to the project (will prompt for credentials if needed)
supabase link --project-ref $PROJECT_REF 2>/dev/null || true

# Run the migration using db push
if supabase db push; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "🔍 Verifying policies..."
    
    # Verify policies
    echo ""
    echo "SELECT policyname, cmd FROM pg_policies WHERE tablename = 'plays' ORDER BY cmd;" | supabase db query
    
    echo ""
    echo "🎉 Done! Your database is now secured."
    echo ""
    echo "📝 Next steps:"
    echo "   1. Test play creation in your app"
    echo "   2. Update PlaybookPage to use SecurePlaysService"
    echo "   3. Run: npm run dev"
    echo ""
else
    echo ""
    echo "❌ Migration failed. See errors above."
    exit 1
fi
