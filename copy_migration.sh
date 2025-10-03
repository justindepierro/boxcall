#!/bin/bash
# Ultra-simple: Copy SQL to clipboard and give instructions

echo "🚀 Migration Helper"
echo ""
echo "I'll copy the SQL to your clipboard."
echo "Then just:"
echo "  1. Go to Supabase Dashboard → SQL Editor"
echo "  2. Click 'New Query'"
echo "  3. Paste (Cmd+V)"
echo "  4. Click 'Run'"
echo "  5. Close tab immediately after 'Success' shows"
echo ""
echo "Copying SQL to clipboard..."

# Copy to clipboard
cat database/migrations/step2_activities_minimal.sql | pbcopy

echo ""
echo "✅ SQL copied to clipboard!"
echo ""
echo "Now go run it in Supabase SQL Editor!"
echo ""
