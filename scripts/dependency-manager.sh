#!/bin/bash

# BoxCall Dependency Manager
# Handles dependency issues, conflicts, and updates safely

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}📦 BoxCall Dependency Manager${NC}"
echo -e "${CYAN}==============================${NC}"
echo ""

# Function to backup package files
backup_package_files() {
    echo -e "${BLUE}Creating backup of package files...${NC}"
    cp package.json package.json.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
    cp package-lock.json package-lock.json.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
    echo -e "${GREEN}✅ Backup created${NC}"
}

# Function to clean install
clean_install() {
    echo -e "${YELLOW}🧹 Performing clean dependency installation...${NC}"
    
    # Remove existing installations
    rm -rf node_modules
    rm -f package-lock.json
    
    # Clear npm cache
    npm cache clean --force
    
    # Fresh install
    npm install
    
    echo -e "${GREEN}✅ Clean installation complete${NC}"
}

# Function to fix common dependency issues
fix_dependency_issues() {
    echo -e "${YELLOW}🔧 Fixing common dependency issues...${NC}"
    
    # Fix peer dependency warnings
    npm install --legacy-peer-deps
    
    # Update outdated packages (safely)
    npm update
    
    # Audit and fix vulnerabilities
    npm audit fix --force
    
    echo -e "${GREEN}✅ Common issues fixed${NC}"
}

# Function to check for dependency conflicts
check_conflicts() {
    echo -e "${BLUE}🔍 Checking for dependency conflicts...${NC}"
    
    # Check for duplicate packages
    if command -v npx >/dev/null 2>&1; then
        echo "Checking for duplicate packages..."
        npx npm-check-duplicates || true
    fi
    
    # Check npm list for issues
    if npm list >/dev/null 2>&1; then
        echo -e "${GREEN}✅ No dependency tree conflicts${NC}"
    else
        echo -e "${RED}❌ Dependency tree has conflicts${NC}"
        echo "Running npm list to show details..."
        npm list || true
    fi
}

# Function to update TypeScript and related packages
update_typescript() {
    echo -e "${YELLOW}📝 Updating TypeScript ecosystem...${NC}"
    
    # Get current versions
    echo "Current TypeScript version: $(npx tsc --version 2>/dev/null || echo 'Not found')"
    
    # Update TypeScript and related packages
    npm install --save-dev typescript@latest
    npm install --save-dev @types/node@latest
    npm install --save-dev @types/react@latest
    npm install --save-dev @types/react-dom@latest
    
    echo -e "${GREEN}✅ TypeScript ecosystem updated${NC}"
}

# Function to show dependency health report
show_health_report() {
    echo -e "${CYAN}📊 Dependency Health Report${NC}"
    echo "================================"
    
    # Package.json validity
    if jq empty package.json 2>/dev/null; then
        echo -e "✅ ${GREEN}package.json is valid JSON${NC}"
    else
        echo -e "❌ ${RED}package.json has syntax errors${NC}"
    fi
    
    # Node modules status
    if [ -d "node_modules" ]; then
        echo -e "✅ ${GREEN}node_modules exists${NC}"
        echo "   Size: $(du -sh node_modules 2>/dev/null | cut -f1)"
        echo "   Packages: $(find node_modules -maxdepth 1 -type d | wc -l | tr -d ' ') directories"
    else
        echo -e "❌ ${RED}node_modules missing${NC}"
    fi
    
    # Package-lock status
    if [ -f "package-lock.json" ]; then
        echo -e "✅ ${GREEN}package-lock.json exists${NC}"
    else
        echo -e "⚠️  ${YELLOW}package-lock.json missing${NC}"
    fi
    
    # Outdated packages
    echo ""
    echo -e "${BLUE}📈 Outdated packages:${NC}"
    npm outdated || echo "All packages are up to date"
    
    # Security audit
    echo ""
    echo -e "${BLUE}🔒 Security audit:${NC}"
    npm audit --audit-level=moderate || true
}

# Function to emergency reset
emergency_reset() {
    echo -e "${RED}🚨 EMERGENCY RESET - This will restore to known working dependencies${NC}"
    echo -e "${YELLOW}This will:${NC}"
    echo "1. Backup current package files"
    echo "2. Reset to a known working state"
    echo "3. Clean install all dependencies"
    echo ""
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        backup_package_files
        
        # If we have a known good commit, restore package.json from there
        if git rev-parse --verify 500e83f >/dev/null 2>&1; then
            echo -e "${BLUE}Restoring package.json from known good commit...${NC}"
            git show 500e83f:package.json > package.json
        fi
        
        clean_install
        echo -e "${GREEN}✅ Emergency reset complete${NC}"
    else
        echo -e "${YELLOW}Emergency reset cancelled${NC}"
    fi
}

# Main menu
case "${1:-help}" in
    "health"|"status"|"check")
        show_health_report
        ;;
    "clean")
        backup_package_files
        clean_install
        ;;
    "fix")
        backup_package_files
        fix_dependency_issues
        ;;
    "conflicts")
        check_conflicts
        ;;
    "typescript"|"ts")
        backup_package_files
        update_typescript
        ;;
    "emergency"|"reset")
        emergency_reset
        ;;
    "full"|"complete")
        echo -e "${CYAN}🔄 Running complete dependency maintenance...${NC}"
        backup_package_files
        clean_install
        fix_dependency_issues
        check_conflicts
        show_health_report
        ;;
    *)
        echo -e "${CYAN}Usage: ./scripts/dependency-manager.sh [command]${NC}"
        echo ""
        echo -e "${YELLOW}Available commands:${NC}"
        echo "  health      - Show dependency health report"
        echo "  clean       - Clean install all dependencies"
        echo "  fix         - Fix common dependency issues"
        echo "  conflicts   - Check for dependency conflicts"
        echo "  typescript  - Update TypeScript ecosystem"
        echo "  emergency   - Emergency reset to known working state"
        echo "  full        - Run complete maintenance cycle"
        echo ""
        echo -e "${CYAN}Examples:${NC}"
        echo "  ./scripts/dependency-manager.sh health"
        echo "  ./scripts/dependency-manager.sh clean"
        echo "  ./scripts/dependency-manager.sh fix"
        echo "  ./scripts/dependency-manager.sh emergency"
        ;;
esac
