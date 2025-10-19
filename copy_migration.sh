#!/bin/bash
# Copy game plan migration to clipboard
cat database/migrations/20251019_create_game_plans.sql | pbcopy
echo "✅ Migration copied to clipboard!"
echo ""
echo "📋 Next steps:"
echo "1. Go to: https://supabase.com/dashboard/project/lvmuiqwihlpnwppdqqfl/sql/new"
echo "2. Paste the SQL (Cmd+V)"
echo "3. Click 'Run'"
echo ""
echo "The migration has been FIXED - created_by column is now added separately!"
