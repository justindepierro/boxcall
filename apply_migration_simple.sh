#!/bin/bash
# Apply activities migration via direct connection string
# This works with any Supabase connection format

echo "🚀 Applying activities table migration..."
echo ""
echo "📋 Go to Supabase Dashboard → Settings → Database → Connection String"
echo "   Copy the 'URI' connection string (it starts with postgresql://)"
echo ""

# Prompt for full connection string
read -p "Paste your connection string here: " DB_URL

# Replace [YOUR-PASSWORD] placeholder if present
if [[ $DB_URL == *"[YOUR-PASSWORD]"* ]]; then
    read -sp "Enter your database password: " DB_PASSWORD
    echo ""
    DB_URL="${DB_URL//\[YOUR-PASSWORD\]/$DB_PASSWORD}"
fi

echo ""
echo "📝 Running migration..."
echo ""

# Run the SQL file
psql "$DB_URL" -f database/migrations/step2_activities_minimal.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "🎉 The activities table is now ready!"
    echo "   - Indexes created for performance"
    echo "   - RLS policies enabled for security"
    echo "   - Your ActivityService will work perfectly!"
else
    echo ""
    echo "❌ Migration failed. Check the error message above."
    echo ""
    echo "Common issues:"
    echo "  - Wrong password (reset in Settings → Database)"
    echo "  - Firewall blocking connection"
    echo "  - Connection string format incorrect"
fi
