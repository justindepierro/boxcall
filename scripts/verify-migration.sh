#!/bin/bash

# 🔍 Post-Migration Verification Script
# Verify 300+ play upgrade was successful

echo "🚀 BoxCall Database Migration Verification"
echo "========================================="

# Check if required environment variables exist
if [ ! -f ".env" ]; then
    echo "❌ Missing .env file. Please ensure Supabase credentials are configured."
    exit 1
fi

# Source environment variables
source .env

echo "✅ Environment loaded"

# Create verification SQL script
cat > temp_verify.sql << 'EOF'
-- Verify core tables exist
SELECT 
  'Teams' as table_name,
  COUNT(*) as record_count,
  'Existing table' as status
FROM teams

UNION ALL

SELECT 
  'Playbooks' as table_name,
  COUNT(*) as record_count,
  'Existing table' as status  
FROM playbooks

UNION ALL

SELECT 
  'Plays' as table_name,
  COUNT(*) as record_count,
  CASE 
    WHEN COUNT(*) > 0 THEN 'Ready for 300+ testing'
    ELSE 'Needs sample data'
  END as status
FROM plays

UNION ALL

SELECT 
  'Practice Scripts' as table_name,
  COUNT(*) as record_count,
  'Enhanced table' as status
FROM practice_scripts

UNION ALL

SELECT 
  'Script Plays' as table_name,
  COUNT(*) as record_count,
  'Enhanced table' as status
FROM script_plays

UNION ALL

SELECT 
  'Game Plans' as table_name,
  COUNT(*) as record_count,
  'NEW - Game planning ready' as status
FROM game_plans

UNION ALL

SELECT 
  'Game Plan Situations' as table_name,
  COUNT(*) as record_count,
  'NEW - Situational planning' as status
FROM game_plan_situations

UNION ALL

SELECT 
  'Game Plan Plays' as table_name,
  COUNT(*) as record_count,
  'NEW - Play prioritization' as status
FROM game_plan_plays

ORDER BY table_name;

-- Check if search functionality is enabled
SELECT 
  'Search Index' as feature,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE indexname = 'idx_plays_search'
    ) THEN 'ENABLED ✅'
    ELSE 'MISSING ❌'
  END as status;

-- Check enhanced plays columns
SELECT 
  'Enhanced Plays Columns' as feature,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'plays' AND column_name = 'search_vector'
    ) THEN 'READY ✅'
    ELSE 'MISSING ❌'
  END as status;

-- Performance test query (should be fast even with 300+ plays)
EXPLAIN (ANALYZE, BUFFERS) 
SELECT play_name, formation, p_type 
FROM plays 
WHERE search_vector @@ to_tsquery('english', 'pass | run')
LIMIT 10;
EOF

echo "📊 Running database verification..."

# Note: This would normally connect to Supabase, but we'll provide the SQL for manual execution
echo ""
echo "🔍 Manual Verification Required:"
echo "================================"
echo "1. Copy the SQL below into your Supabase SQL Editor"
echo "2. Run it to verify your migration"
echo ""
echo "--- VERIFICATION SQL ---"
cat temp_verify.sql
echo "--- END SQL ---"
echo ""

# Cleanup
rm temp_verify.sql

echo "🎯 What to look for:"
echo "==================="
echo "✅ All 8 tables should exist (teams, playbooks, plays, practice_scripts, script_plays, game_plans, game_plan_situations, game_plan_plays)"
echo "✅ Search Index should show 'ENABLED ✅'"
echo "✅ Enhanced Plays Columns should show 'READY ✅'"
echo "✅ Performance test should complete in <100ms"
echo ""
echo "🚀 If all checks pass, you're ready for 300+ play testing!"
echo ""
echo "Next steps:"
echo "1. Run the verification SQL in Supabase"
echo "2. If successful, start the development server: npm run dev"
echo "3. Begin loading your 300+ plays!"
