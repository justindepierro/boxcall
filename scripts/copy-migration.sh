#!/bin/bash

# Copy migration SQL to clipboard for easy pasting in Supabase dashboard
# Usage: npm run migrate:copy

echo "📋 Copying migration SQL to clipboard..."
echo ""

if [ ! -f database/migrations/fix_rls_policies.sql ]; then
    echo "❌ Error: Migration file not found"
    exit 1
fi

# Copy to clipboard (works on macOS)
cat database/migrations/fix_rls_policies.sql | pbcopy

echo "✅ SQL copied to clipboard!"
echo ""
echo "📝 Next steps:"
echo "   1. Open Supabase dashboard: https://supabase.com/dashboard"
echo "   2. Go to SQL Editor"
echo "   3. Click 'New Query'"
echo "   4. Paste (Cmd+V)"
echo "   5. Click 'Run'"
echo ""
echo "Or visit: https://supabase.com/dashboard/project/lvmuiqwihlpnwppdqqfl/sql/new"
echo ""
