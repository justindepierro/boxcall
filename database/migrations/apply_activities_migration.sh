#!/bin/bash
# Run this to apply the migration via Supabase CLI
# Usage: ./apply_activities_migration.sh

echo "📦 Applying activities table indexes and policies..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Apply the migration
supabase db push --db-url "$DATABASE_URL" --file database/migrations/step2_activities_minimal.sql

echo "✅ Migration applied!"
