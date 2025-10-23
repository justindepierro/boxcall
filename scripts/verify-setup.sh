#!/bin/bash
# Quick verification that everything is working

set -e

echo "🔍 Quick Verification Test"
echo "=========================="
echo ""

DB_URL=$(grep "^DATABASE_URL=" .env | cut -d'=' -f2-)

# Test 1: Database connection
echo "✓ Testing database connection..."
psql "$DB_URL" -c "SELECT 1;" > /dev/null 2>&1 && echo "  ✓ Connected" || echo "  ✗ Failed"

# Test 2: Your user exists
echo "✓ Checking your user..."
USER_EXISTS=$(psql "$DB_URL" -t -A -c "SELECT COUNT(*) FROM auth.users WHERE email = 'justindepierro@gmail.com';" 2>/dev/null)
[ "$USER_EXISTS" = "1" ] && echo "  ✓ User found" || echo "  ✗ User not found"

# Test 3: Team memberships
echo "✓ Checking team memberships..."
TEAM_COUNT=$(psql "$DB_URL" -t -A -c "SELECT COUNT(*) FROM public.team_members WHERE user_id = (SELECT id FROM auth.users WHERE email = 'justindepierro@gmail.com');" 2>/dev/null)
echo "  ✓ Member of $TEAM_COUNT team(s)"

# Test 4: RLS functions
echo "✓ Checking RLS functions..."
FUNC_COUNT=$(psql "$DB_URL" -t -A -c "SELECT COUNT(*) FROM pg_proc WHERE proname IN ('is_active_team_member', 'is_coaching_team_member', 'get_playbook_team_id');" 2>/dev/null)
[ "$FUNC_COUNT" = "3" ] && echo "  ✓ All functions exist" || echo "  ✗ Missing functions"

# Test 5: Policy count
echo "✓ Checking RLS policies..."
POLICY_COUNT=$(psql "$DB_URL" -t -A -c "SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'teams';" 2>/dev/null)
[ "$POLICY_COUNT" = "2" ] && echo "  ✓ Clean policies (2 per table)" || echo "  ⚠ Unexpected policy count: $POLICY_COUNT"

# Test 6: Environment variables
echo "✓ Checking environment variables..."
grep -q "VITE_SUPER_ADMIN_EMAIL=justindepierro@gmail.com" .env && echo "  ✓ Super admin email set" || echo "  ✗ Super admin email missing"
grep -q "VITE_DEFAULT_DEV_MODE=production" .env && echo "  ✓ Dev mode set to production" || echo "  ⚠ Dev mode not production"

echo ""
echo "=========================="
echo "✓ Verification complete!"
echo ""
echo "Next: Clear browser localStorage and restart dev server"
