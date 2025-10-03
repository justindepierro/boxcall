#!/bin/bash
# Apply activities migration via Supabase CLI
# This script will prompt for your database password

echo "🚀 Applying activities table migration..."
echo ""
echo "You'll need your Supabase project details:"
echo "  1. Project Reference ID (from Settings → General)"
echo "  2. Database Password (from Settings → Database)"
echo ""

# Prompt for project ref
read -p "Enter your Supabase project ref (e.g., abcdefghijklmnop): " PROJECT_REF

# Prompt for password (hidden input)
read -sp "Enter your database password: " DB_PASSWORD
echo ""

# Construct connection string
DB_URL="postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres"

echo ""
echo "📝 Running migration..."

# Run the SQL file using psql via supabase
PGPASSWORD="${DB_PASSWORD}" psql "${DB_URL}" -f database/migrations/step2_activities_minimal.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
else
    echo ""
    echo "❌ Migration failed. Check the error message above."
fi
