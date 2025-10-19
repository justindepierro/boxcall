#!/bin/bash

# Phase 5: Game Plan Builder - Quick Setup Script
# This script helps you apply the database migration

echo "🏈 BoxCall Phase 5: Game Plan Builder Setup"
echo "==========================================="
echo ""

# Check if migration file exists
if [ ! -f "database/migrations/20251019_create_game_plans.sql" ]; then
    echo "❌ Migration file not found!"
    echo "   Expected: database/migrations/20251019_create_game_plans.sql"
    exit 1
fi

echo "✅ Migration file found"
echo ""

# Display migration summary
echo "📋 This migration will create:"
echo "   • game_plans table"
echo "   • game_plan_situations table (12 Billick situations)"
echo "   • game_plan_plays table (junction)"
echo "   • RLS policies for team-based access"
echo "   • Proper indexes for performance"
echo ""

# Instructions
echo "🎯 How to Apply Migration:"
echo ""
echo "Option 1: Supabase Dashboard (Recommended)"
echo "--------------------------------------------"
echo "1. Open: https://supabase.com/dashboard/project/lvmuiqwihlpnwppdqqfl/sql/new"
echo "2. Copy the migration SQL:"
echo "   cat database/migrations/20251019_create_game_plans.sql | pbcopy"
echo "3. Paste into SQL Editor"
echo "4. Click 'Run'"
echo ""

echo "Option 2: Command Line"
echo "----------------------"
echo "psql \"\$DATABASE_URL\" -f database/migrations/20251019_create_game_plans.sql"
echo ""

# Ask if user wants to copy to clipboard
read -p "📋 Copy migration SQL to clipboard? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cat database/migrations/20251019_create_game_plans.sql | pbcopy
    echo "✅ Migration SQL copied to clipboard!"
    echo "   Now paste it in the Supabase SQL Editor"
fi

echo ""
echo "🔍 After running migration, verify with:"
echo ""
echo "SELECT table_name FROM information_schema.tables"
echo "WHERE table_schema = 'public' AND table_name LIKE 'game_plan%';"
echo ""
echo "Expected output:"
echo "  game_plans"
echo "  game_plan_situations"
echo "  game_plan_plays"
echo ""

echo "📚 Next Steps:"
echo "   1. Apply migration via Supabase Dashboard"
echo "   2. Verify tables were created"
echo "   3. Continue with: npm run dev"
echo "   4. We'll refactor the game plan service next!"
echo ""

echo "✨ Setup script complete!"
echo "   See docs/PHASE5_SETUP_INSTRUCTIONS.md for details"
