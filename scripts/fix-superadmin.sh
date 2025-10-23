#!/bin/bash
# ============================================================================
# BoxCall SuperAdmin Fix Script
# ============================================================================
# This script ensures your superadmin setup is working correctly
# Usage: ./scripts/fix-superadmin.sh

set -e  # Exit on error

echo "🔧 BoxCall SuperAdmin Fix Script"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Check environment variables
echo "📋 Step 1: Checking environment variables..."
if [ -f .env ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
    
    # Check critical variables
    if grep -q "VITE_SUPER_ADMIN_EMAIL=justindepierro@gmail.com" .env; then
        echo -e "${GREEN}✓${NC} VITE_SUPER_ADMIN_EMAIL is set correctly"
    else
        echo -e "${RED}✗${NC} VITE_SUPER_ADMIN_EMAIL is missing or incorrect"
        echo "  Adding VITE_SUPER_ADMIN_EMAIL to .env..."
        echo "" >> .env
        echo "VITE_SUPER_ADMIN_EMAIL=justindepierro@gmail.com" >> .env
    fi
    
    if grep -q "VITE_DEFAULT_DEV_MODE=production" .env; then
        echo -e "${GREEN}✓${NC} VITE_DEFAULT_DEV_MODE is set to production"
    else
        echo -e "${YELLOW}⚠${NC} VITE_DEFAULT_DEV_MODE should be 'production'"
    fi
else
    echo -e "${RED}✗${NC} .env file not found!"
    exit 1
fi
echo ""

# 2. Check database connection
echo "📋 Step 2: Testing database connection..."
if command -v psql &> /dev/null; then
    DB_URL=$(grep "^DATABASE_URL=" .env | cut -d'=' -f2-)
    if [ -n "$DB_URL" ]; then
        if psql "$DB_URL" -c "SELECT 1;" > /dev/null 2>&1; then
            echo -e "${GREEN}✓${NC} Database connection successful"
        else
            echo -e "${RED}✗${NC} Database connection failed"
            echo "  Please check your DATABASE_URL in .env"
        fi
    else
        echo -e "${RED}✗${NC} DATABASE_URL not found in .env"
    fi
else
    echo -e "${YELLOW}⚠${NC} psql not installed, skipping database check"
fi
echo ""

# 3. Verify user in database
echo "📋 Step 3: Checking your user account..."
DB_URL=$(grep "^DATABASE_URL=" .env | cut -d'=' -f2-)
if [ -n "$DB_URL" ]; then
    USER_CHECK=$(psql "$DB_URL" -t -A -c "SELECT email, raw_user_meta_data->>'role' FROM auth.users WHERE email = 'justindepierro@gmail.com';" 2>/dev/null || echo "")
    
    if [ -n "$USER_CHECK" ]; then
        echo -e "${GREEN}✓${NC} User found in database"
        echo "  $USER_CHECK"
    else
        echo -e "${RED}✗${NC} User not found in database"
        echo "  Please ensure you've created an account with justindepierro@gmail.com"
    fi
fi
echo ""

# 4. Check team memberships
echo "📋 Step 4: Checking team memberships..."
if [ -n "$DB_URL" ]; then
    TEAMS=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM public.team_members WHERE user_id = (SELECT id FROM auth.users WHERE email = 'justindepierro@gmail.com');" 2>/dev/null || echo "0")
    
    if [ "$TEAMS" -gt 0 ]; then
        echo -e "${GREEN}✓${NC} You are a member of $TEAMS team(s)"
    else
        echo -e "${YELLOW}⚠${NC} You are not a member of any teams"
        echo "  You may need to create or join a team"
    fi
fi
echo ""

# 5. Verify RLS helper functions
echo "📋 Step 5: Checking RLS helper functions..."
if [ -n "$DB_URL" ]; then
    FUNCTIONS=$(psql "$DB_URL" -t -A -c "SELECT COUNT(*) FROM pg_proc WHERE proname IN ('is_active_team_member', 'is_coaching_team_member', 'get_playbook_team_id');" 2>/dev/null || echo "0")
    
    if [ "$FUNCTIONS" -eq 3 ]; then
        echo -e "${GREEN}✓${NC} All RLS helper functions exist"
    else
        echo -e "${RED}✗${NC} Missing RLS helper functions"
        echo "  Running migration to add helper functions..."
        
        # Apply the RLS fix migration
        psql "$DB_URL" -f supabase/migrations/20251023160001_fix_team_access_policies.sql > /dev/null 2>&1 && \
            echo -e "${GREEN}✓${NC} RLS helper functions created" || \
            echo -e "${RED}✗${NC} Failed to create RLS helper functions"
    fi
fi
echo ""

# 6. Check if dev server is running
echo "📋 Step 6: Checking development server..."
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠${NC} Development server is running on port 5173"
    echo "  You should restart it after these fixes"
else
    echo -e "${GREEN}✓${NC} Development server is not running"
fi
echo ""

# 7. Summary and next steps
echo "=================================="
echo -e "${GREEN}✓${NC} Fix script completed!"
echo ""
echo "Next steps:"
echo "1. Clear your browser's localStorage:"
echo "   - Open DevTools (F12)"
echo "   - Go to Application > Local Storage"
echo "   - Delete the 'boxcall-dev-mode' key"
echo ""
echo "2. Restart your dev server:"
echo "   npm run dev"
echo ""
echo "3. Login with: justindepierro@gmail.com"
echo ""
echo "4. You should now see:"
echo "   - Your teams in the sidebar"
echo "   - 'Production' mode badge"
echo "   - Access to all playbooks"
echo ""

exit 0
