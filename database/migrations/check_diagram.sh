#!/bin/bash
# Quick CLI verification for diagram migration
# Run this with: bash database/migrations/check_diagram.sh

echo "================================================"
echo "DIAGRAM MIGRATION VERIFICATION"
echo "================================================"
echo ""

echo "✓ CHECK 1: Columns exist?"
supabase db execute --sql "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'plays' AND column_name IN ('diagram_data', 'diagram_version') ORDER BY column_name;"

echo ""
echo "✓ CHECK 2: Indexes exist?"
supabase db execute --sql "SELECT indexname FROM pg_indexes WHERE tablename = 'plays' AND indexname LIKE '%diagram%' ORDER BY indexname;"

echo ""
echo "✓ CHECK 3: Constraints exist?"
supabase db execute --sql "SELECT conname FROM pg_constraint WHERE conrelid = 'plays'::regclass AND conname LIKE '%diagram%' ORDER BY conname;"

echo ""
echo "✓ CHECK 4: Functions exist?"
supabase db execute --sql "SELECT proname FROM pg_proc WHERE proname LIKE '%diagram%' ORDER BY proname;"

echo ""
echo "✓ CHECK 5: Data status?"
supabase db execute --sql "SELECT COUNT(*) FILTER (WHERE diagram_data IS NOT NULL) as with_data, COUNT(*) FILTER (WHERE diagram_version IS NOT NULL) as with_version, COUNT(*) as total FROM plays;"

echo ""
echo "✓ CHECK 6: Test function?"
supabase db execute --sql "SELECT get_diagram_player_count('{\"version\": 2, \"players\": [{\"id\": \"1\"}, {\"id\": \"2\"}]}'::jsonb) as result;"

echo ""
echo "================================================"
echo "VERIFICATION COMPLETE"
echo "================================================"
