#!/bin/bash

# BoxCall Workspace Doctor
# Comprehensive diagnostic and repair tool for workspace issues

set -e  # Exit on any error

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Counters
ISSUES_FOUND=0
FIXES_APPLIED=0

echo -e "${CYAN}🩺 BoxCall Workspace Doctor${NC}"
echo -e "${CYAN}===============================${NC}"
echo ""

# Function to log issues
log_issue() {
    echo -e "  ❌ ${RED}$1${NC}"
    ((ISSUES_FOUND++))
}

# Function to log fixes
log_fix() {
    echo -e "  🔧 ${GREEN}$1${NC}"
    ((FIXES_APPLIED++))
}

# Function to log warnings
log_warning() {
    echo -e "  ⚠️  ${YELLOW}$1${NC}"
}

# Function to log success
log_success() {
    echo -e "  ✅ ${GREEN}$1${NC}"
}

# Function to log info
log_info() {
    echo -e "  ℹ️  ${BLUE}$1${NC}"
}

echo -e "${PURPLE}Phase 1: Critical File Integrity${NC}"
echo "=================================="

# Check critical files for content
CRITICAL_FILES=(
    "src/App.tsx"
    "src/main.tsx" 
    "src/components/auth/AuthProvider.tsx"
    "src/app/auth-store.ts"
    "src/lib/supabase.ts"
    "package.json"
    "tsconfig.json"
    "vite.config.ts"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        if [ -s "$file" ]; then
            log_success "$file has content"
        else
            log_issue "$file is EMPTY!"
            echo -e "    ${CYAN}Available recovery options:${NC}"
            echo "    git show HEAD~1:$file > $file"
            echo "    git show 500e83f:$file > $file  # Known good commit"
        fi
    else
        log_warning "$file does not exist"
        echo -e "    ${CYAN}This file should probably exist for BoxCall${NC}"
    fi
done

echo ""
echo -e "${PURPLE}Phase 2: Dependencies & Package Health${NC}"
echo "========================================"

# Check package.json integrity
if [ -f "package.json" ]; then
    if jq empty package.json 2>/dev/null; then
        log_success "package.json is valid JSON"
    else
        log_issue "package.json has invalid JSON syntax"
    fi
else
    log_issue "package.json is missing"
fi

# Check if node_modules exists and is healthy
if [ -d "node_modules" ]; then
    log_success "node_modules directory exists"
    
    # Check for common problematic packages
    if [ -d "node_modules/.bin" ]; then
        log_success "Binary packages are installed"
    else
        log_warning "Binary packages directory missing"
    fi
    
    # Check package-lock integrity
    if [ -f "package-lock.json" ]; then
        if npm list >/dev/null 2>&1; then
            log_success "Dependencies are properly installed"
        else
            log_issue "Dependency tree has issues"
            log_info "Run: npm install --force to fix"
        fi
    else
        log_warning "package-lock.json missing - dependencies may be inconsistent"
    fi
else
    log_issue "node_modules directory missing"
    log_info "Run: npm install"
fi

echo ""
echo -e "${PURPLE}Phase 3: TypeScript & Build Configuration${NC}"
echo "=============================================="

# Check TypeScript config
if [ -f "tsconfig.json" ]; then
    if npx tsc --noEmit --skipLibCheck 2>/dev/null; then
        log_success "TypeScript configuration is valid"
    else
        log_issue "TypeScript compilation errors found"
        echo -e "    ${CYAN}Run 'npm run type-check' for details${NC}"
    fi
else
    log_issue "tsconfig.json is missing"
fi

# Check Vite config
if [ -f "vite.config.ts" ]; then
    log_success "Vite configuration exists"
else
    log_warning "vite.config.ts missing - may need recreation"
fi

echo ""
echo -e "${PURPLE}Phase 4: Git Repository Health${NC}"
echo "=================================="

# Check git status
if git rev-parse --git-dir > /dev/null 2>&1; then
    log_success "Git repository is valid"
    
    # Check for uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        log_warning "Uncommitted changes detected"
        echo -e "    ${CYAN}Files with changes:${NC}"
        git status --porcelain | head -10
    else
        log_success "Working directory is clean"
    fi
    
    # Check for untracked files that might be important
    UNTRACKED=$(git ls-files --others --exclude-standard)
    if [ -n "$UNTRACKED" ]; then
        log_info "Untracked files found (may need to be added)"
        echo "$UNTRACKED" | head -5
    fi
    
    # Check current branch
    CURRENT_BRANCH=$(git branch --show-current)
    log_info "Current branch: $CURRENT_BRANCH"
    
    # Check if behind/ahead of remote
    if git remote -v | grep -q origin; then
        git fetch origin 2>/dev/null || true
        LOCAL=$(git rev-parse @)
        REMOTE=$(git rev-parse @{u} 2>/dev/null || echo "")
        if [ -n "$REMOTE" ]; then
            if [ "$LOCAL" = "$REMOTE" ]; then
                log_success "Branch is up to date with remote"
            elif [ "$(git merge-base @ @{u})" = "$LOCAL" ]; then
                log_warning "Branch is behind remote"
                echo -e "    ${CYAN}Run 'git pull' to update${NC}"
            elif [ "$(git merge-base @ @{u})" = "$REMOTE" ]; then
                log_info "Branch is ahead of remote"
                echo -e "    ${CYAN}Run 'git push' to publish changes${NC}"
            else
                log_warning "Branch has diverged from remote"
            fi
        fi
    fi
else
    log_issue "Not a git repository or git is corrupted"
fi

echo ""
echo -e "${PURPLE}Phase 5: Development Environment${NC}"
echo "===================================="

# Check Node.js version
NODE_VERSION=$(node --version 2>/dev/null || echo "not found")
if [ "$NODE_VERSION" != "not found" ]; then
    log_success "Node.js version: $NODE_VERSION"
    
    # Check if version is reasonable
    if [[ $NODE_VERSION =~ v1[8-9]|v[2-9][0-9] ]]; then
        log_success "Node.js version is modern"
    else
        log_warning "Node.js version may be outdated"
    fi
else
    log_issue "Node.js is not installed or not in PATH"
fi

# Check npm version
NPM_VERSION=$(npm --version 2>/dev/null || echo "not found")
if [ "$NPM_VERSION" != "not found" ]; then
    log_success "npm version: $NPM_VERSION"
else
    log_issue "npm is not available"
fi

echo ""
echo -e "${PURPLE}Phase 6: Auto-Fix Common Issues${NC}"
echo "================================="

AUTO_FIX=${1:-false}
if [ "$AUTO_FIX" = "--fix" ] || [ "$AUTO_FIX" = "-f" ]; then
    echo -e "${CYAN}🔧 Applying automatic fixes...${NC}"
    
    # Fix 1: Reinstall dependencies if needed
    if [ $ISSUES_FOUND -gt 0 ] && [ -f "package.json" ]; then
        if [ ! -d "node_modules" ] || ! npm list >/dev/null 2>&1; then
            echo -e "  ${YELLOW}Reinstalling dependencies...${NC}"
            rm -rf node_modules package-lock.json 2>/dev/null || true
            npm install
            log_fix "Dependencies reinstalled"
        fi
    fi
    
    # Fix 2: Clear TypeScript cache
    if [ -d "node_modules/.cache" ]; then
        rm -rf node_modules/.cache
        log_fix "Cleared TypeScript/build cache"
    fi
    
    # Fix 3: Fix common ESLint issues
    if [ -f "package.json" ] && npm list eslint >/dev/null 2>&1; then
        echo -e "  ${YELLOW}Attempting to auto-fix ESLint issues...${NC}"
        npm run lint -- --fix 2>/dev/null || true
        log_fix "Applied ESLint auto-fixes"
    fi
    
else
    echo -e "${CYAN}ℹ️  Run with --fix to apply automatic repairs${NC}"
    echo -e "${CYAN}   ./scripts/workspace-doctor.sh --fix${NC}"
fi

echo ""
echo -e "${PURPLE}Phase 7: Recommended Next Steps${NC}"
echo "=================================="

if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}🎉 Workspace is healthy!${NC}"
    echo ""
    echo -e "${CYAN}Recommended development workflow:${NC}"
    echo "  npm run dev          # Start development server"
    echo "  npm run type-check   # Verify TypeScript"
    echo "  npm run lint         # Check code quality"
    echo "  npm run build        # Test production build"
else
    echo -e "${YELLOW}⚠️  Found $ISSUES_FOUND issue(s) that need attention${NC}"
    echo ""
    echo -e "${CYAN}Priority fixes:${NC}"
    
    if [ ! -d "node_modules" ]; then
        echo "  1. npm install                    # Install dependencies"
    fi
    
    if [ $ISSUES_FOUND -gt 2 ]; then
        echo "  2. ./scripts/workspace-doctor.sh --fix  # Auto-fix common issues"
    fi
    
    echo "  3. git status                     # Review changes"
    echo "  4. ./scripts/health-check.sh      # Run health check"
    
    echo ""
    echo -e "${CYAN}If issues persist:${NC}"
    echo "  git stash                         # Save current work"
    echo "  git reset --hard 500e83f          # Reset to known good state"
    echo "  npm install                       # Reinstall dependencies"
fi

echo ""
echo -e "${PURPLE}Summary${NC}"
echo "======="
echo -e "Issues found: ${RED}$ISSUES_FOUND${NC}"
echo -e "Fixes applied: ${GREEN}$FIXES_APPLIED${NC}"

if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "Status: ${GREEN}HEALTHY${NC} 🟢"
    exit 0
elif [ $ISSUES_FOUND -le 3 ]; then
    echo -e "Status: ${YELLOW}NEEDS ATTENTION${NC} 🟡"
    exit 1
else
    echo -e "Status: ${RED}REQUIRES MAJOR FIXES${NC} 🔴"
    exit 2
fi
