#!/bin/bash

# Simple RLS Migration Runner
# Usage: npm run migrate:rls

echo "🚀 Running RLS Policy Migration..."
echo ""
echo "📄 File: database/migrations/fix_rls_policies.sql"
echo ""
echo "This will execute the SQL migration using psql."
echo "You'll need your Supabase database password."
echo ""

# Get Supabase URL from .env
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    exit 1
fi

SUPABASE_URL=$(grep VITE_SUPABASE_URL .env | cut -d '=' -f2)
PROJECT_REF=$(echo $SUPABASE_URL | sed -E 's/.*\/\/([^.]+).*/\1/')

echo "📡 Project: $PROJECT_REF"
echo ""

# Construct database connection string
DB_HOST="db.${PROJECT_REF}.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"

echo "🔐 Connecting to: $DB_HOST"
echo ""
read -sp "Enter your Supabase database password: " DB_PASSWORD
echo ""
echo ""

# Run the migration using psql
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f database/migrations/fix_rls_policies.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "🔍 Verifying policies..."
    echo ""
    
    # Verify the policies were created
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT policyname, cmd FROM pg_policies WHERE tablename = 'plays' ORDER BY cmd;"
    
    echo ""
    echo "🎉 Done!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Test play creation in your app"
    echo "   2. Update PlaybookPage to use SecurePlaysService"
    echo ""
else
    echo ""
    echo "❌ Migration failed. Check errors above."
    exit 1
fi
