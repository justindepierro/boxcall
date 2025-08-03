#!/bin/bash

# BoxCall Daily Developer Checklist
# Run this at the start of each development session

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}☀️  BoxCall Daily Developer Checklist${NC}"
echo -e "${CYAN}=====================================${NC}"
echo "$(date)"
echo ""

# Function to check and report status
check_status() {
    local check_name="$1"
    local command="$2"
    local success_msg="$3"
    local fail_msg="$4"
    local fix_cmd="$5"
    
    echo -n "  $check_name... "
    
    if eval "$command" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ $success_msg${NC}"
        return 0
    else
        echo -e "${RED}❌ $fail_msg${NC}"
        if [ -n "$fix_cmd" ]; then
            echo -e "    ${CYAN}Fix: $fix_cmd${NC}"
        fi
        return 1
    fi
}

ISSUES=0

echo -e "${BLUE}🔍 Workspace Health Check${NC}"
echo "========================="

# Check 1: Critical files integrity
if ! check_status "Critical files" \
    "[ -s src/App.tsx ] && [ -s src/main.tsx ] && [ -s package.json ]" \
    "All critical files present" \
    "Critical files missing or empty" \
    "./scripts/emergency-reset.sh"; then
    ((ISSUES++))
fi

# Check 2: Git status
if ! check_status "Git repository" \
    "git rev-parse --git-dir" \
    "Repository is healthy" \
    "Git repository issues" \
    "Check git status"; then
    ((ISSUES++))
fi

# Check 3: Dependencies
if ! check_status "Dependencies" \
    "[ -d node_modules ] && npm list >/dev/null 2>&1" \
    "Dependencies are installed" \
    "Dependency issues detected" \
    "npm install or ./scripts/dependency-manager.sh fix"; then
    ((ISSUES++))
fi

# Check 4: TypeScript
if ! check_status "TypeScript" \
    "npx tsc --noEmit --skipLibCheck" \
    "TypeScript compiles cleanly" \
    "TypeScript errors found" \
    "npm run type-check for details"; then
    ((ISSUES++))
fi

# Check 5: Build system
if ! check_status "Build system" \
    "npm run build --dry-run 2>/dev/null || npm run dev --help >/dev/null" \
    "Build system is ready" \
    "Build system issues" \
    "Check package.json scripts"; then
    ((ISSUES++))
fi

echo ""
echo -e "${BLUE}📊 Development Environment${NC}"
echo "=========================="

# Show useful information
echo -e "  Node.js: ${GREEN}$(node --version)${NC}"
echo -e "  npm: ${GREEN}$(npm --version)${NC}"
echo -e "  Current branch: ${GREEN}$(git branch --show-current)${NC}"
echo -e "  Last commit: ${GREEN}$(git log -1 --oneline)${NC}"

# Check for uncommitted changes
UNCOMMITTED=$(git status --porcelain | wc -l | tr -d ' ')
if [ "$UNCOMMITTED" -gt 0 ]; then
    echo -e "  Uncommitted changes: ${YELLOW}$UNCOMMITTED files${NC}"
else
    echo -e "  Uncommitted changes: ${GREEN}None${NC}"
fi

# Check for untracked files
UNTRACKED=$(git ls-files --others --exclude-standard | wc -l | tr -d ' ')
if [ "$UNTRACKED" -gt 0 ]; then
    echo -e "  Untracked files: ${YELLOW}$UNTRACKED files${NC}"
else
    echo -e "  Untracked files: ${GREEN}None${NC}"
fi

echo ""
echo -e "${BLUE}🚀 Ready to Code?${NC}"
echo "================="

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}🎉 All systems go! Your workspace is ready for development.${NC}"
    echo ""
    echo -e "${CYAN}Suggested workflow:${NC}"
    echo "  1. npm run dev           # Start development server"
    echo "  2. npm run storybook     # Start component library (optional)"
    echo "  3. Create a feature branch: git checkout -b feature/your-feature"
    echo "  4. Make your changes"
    echo "  5. npm run lint          # Check code quality"
    echo "  6. npm run type-check    # Verify TypeScript"
    echo "  7. git add . && git commit -m 'Your changes'"
    echo ""
    echo -e "${YELLOW}💡 Tips:${NC}"
    echo "  - Run this checklist if you encounter issues: ./scripts/daily-checklist.sh"
    echo "  - Use workspace doctor for problems: ./scripts/workspace-doctor.sh"
    echo "  - Emergency reset if broken: ./scripts/emergency-reset.sh"
    
else
    echo -e "${YELLOW}⚠️  Found $ISSUES issue(s) that should be fixed before coding${NC}"
    echo ""
    echo -e "${CYAN}Quick fixes:${NC}"
    echo "  ./scripts/workspace-doctor.sh --fix    # Auto-fix common issues"
    echo "  ./scripts/dependency-manager.sh fix    # Fix dependency issues"
    echo "  npm install                            # Reinstall dependencies"
    echo ""
    echo -e "${CYAN}If problems persist:${NC}"
    echo "  ./scripts/emergency-reset.sh           # Nuclear option"
    echo ""
fi

# Quick development server test (if no issues)
if [ $ISSUES -eq 0 ]; then
    echo -e "${BLUE}🌐 Development Server Test${NC}"
    echo "=========================="
    
    echo -n "  Testing dev server startup... "
    if timeout 10 npm run dev -- --help >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Ready to start${NC}"
    else
        echo -e "${YELLOW}⚠️  May have issues${NC}"
        echo -e "    ${CYAN}Try: npm run dev to see any errors${NC}"
    fi
fi

echo ""
echo -e "${CYAN}Happy coding! 🚀${NC}"

exit $ISSUES
