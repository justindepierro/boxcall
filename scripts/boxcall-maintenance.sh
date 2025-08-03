#!/bin/bash

# BoxCall Master Maintenance Script
# One command to rule them all - comprehensive workspace maintenance

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${PURPLE}🏈 BoxCall Master Maintenance${NC}"
echo -e "${PURPLE}==============================${NC}"
echo ""

# Function to run a script and handle its output
run_script() {
    local script_name="$1"
    local script_path="$2"
    local description="$3"
    
    echo -e "${CYAN}🔧 $script_name${NC}"
    echo -e "${CYAN}$(printf '=%.0s' {1..40})${NC}"
    echo -e "${BLUE}$description${NC}"
    echo ""
    
    if [ -f "$script_path" ]; then
        if $script_path; then
            echo -e "${GREEN}✅ $script_name completed successfully${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠️  $script_name completed with warnings${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ $script_path not found${NC}"
        return 1
    fi
    
    echo ""
}

# Function to show menu
show_menu() {
    echo -e "${CYAN}Available maintenance operations:${NC}"
    echo ""
    echo "  1. 🩺 Full Health Check        - Comprehensive workspace diagnosis"
    echo "  2. 📦 Fix Dependencies         - Resolve dependency issues"
    echo "  3. 🧹 Quick Fix               - Auto-fix common problems"
    echo "  4. 🚨 Emergency Reset          - Nuclear option for broken workspace"
    echo "  5. ☀️  Daily Checklist         - Start-of-day developer check"
    echo ""
    echo "  6. 🔄 Complete Maintenance     - Run everything (recommended)"
    echo "  7. 📋 Just Show Status         - Non-destructive status check"
    echo ""
    echo "  0. Exit"
    echo ""
}

# Function to run complete maintenance
run_complete_maintenance() {
    echo -e "${PURPLE}🔄 Running Complete Maintenance Cycle${NC}"
    echo -e "${PURPLE}=====================================${NC}"
    echo ""
    
    local total_issues=0
    
    # Phase 1: Health check
    echo -e "${CYAN}Phase 1: Comprehensive Health Check${NC}"
    if ! run_script "Workspace Doctor" "./scripts/workspace-doctor.sh" "Diagnosing workspace health"; then
        ((total_issues++))
    fi
    
    # Phase 2: Dependency management
    echo -e "${CYAN}Phase 2: Dependency Management${NC}"
    if ! run_script "Dependency Health" "./scripts/dependency-manager.sh health" "Checking dependency status"; then
        echo -e "${YELLOW}Attempting dependency fixes...${NC}"
        ./scripts/dependency-manager.sh fix
    fi
    
    # Phase 3: Daily checklist
    echo -e "${CYAN}Phase 3: Daily Developer Checklist${NC}"
    if ! run_script "Daily Checklist" "./scripts/daily-checklist.sh" "Verifying development readiness"; then
        ((total_issues++))
    fi
    
    # Summary
    echo -e "${PURPLE}🏁 Maintenance Complete${NC}"
    echo -e "${PURPLE}=======================${NC}"
    
    if [ $total_issues -eq 0 ]; then
        echo -e "${GREEN}🎉 Workspace is fully healthy and ready for development!${NC}"
        echo ""
        echo -e "${CYAN}You can now:${NC}"
        echo "  npm run dev          # Start development server"
        echo "  npm run storybook    # Launch component library"
        echo "  npm run build        # Test production build"
    else
        echo -e "${YELLOW}⚠️  Found issues in $total_issues phase(s)${NC}"
        echo -e "${CYAN}Consider running individual scripts for detailed fixes${NC}"
    fi
}

# Function to just show status
show_status_only() {
    echo -e "${BLUE}📊 BoxCall Workspace Status${NC}"
    echo -e "${BLUE}===========================${NC}"
    echo ""
    
    # Git info
    echo -e "${CYAN}Git Status:${NC}"
    echo "  Branch: $(git branch --show-current 2>/dev/null || echo 'Unknown')"
    echo "  Commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'Unknown') - $(git log -1 --oneline 2>/dev/null | cut -d' ' -f2- || echo 'Unknown')"
    echo "  Modified: $(git status --porcelain 2>/dev/null | wc -l | tr -d ' ') files"
    echo "  Untracked: $(git ls-files --others --exclude-standard 2>/dev/null | wc -l | tr -d ' ') files"
    echo ""
    
    # Environment info
    echo -e "${CYAN}Environment:${NC}"
    echo "  Node.js: $(node --version 2>/dev/null || echo 'Not found')"
    echo "  npm: $(npm --version 2>/dev/null || echo 'Not found')"
    echo "  Dependencies: $([ -d node_modules ] && echo 'Installed' || echo 'Missing')"
    echo ""
    
    # Quick health check
    echo -e "${CYAN}Quick Health Check:${NC}"
    local health_issues=0
    
    # Critical files
    local critical_files=("src/App.tsx" "src/main.tsx" "package.json")
    for file in "${critical_files[@]}"; do
        if [ -f "$file" ] && [ -s "$file" ]; then
            echo -e "  ✅ $file"
        else
            echo -e "  ❌ $file (missing or empty)"
            ((health_issues++))
        fi
    done
    
    # TypeScript check
    if npx tsc --noEmit --skipLibCheck >/dev/null 2>&1; then
        echo -e "  ✅ TypeScript compilation"
    else
        echo -e "  ❌ TypeScript compilation"
        ((health_issues++))
    fi
    
    echo ""
    if [ $health_issues -eq 0 ]; then
        echo -e "${GREEN}🟢 Workspace appears healthy${NC}"
    else
        echo -e "${RED}🔴 Workspace has $health_issues critical issues${NC}"
        echo -e "${CYAN}Run option 1 (Full Health Check) for detailed diagnosis${NC}"
    fi
}

# Main execution
case "${1:-menu}" in
    "1"|"health"|"doctor")
        run_script "Workspace Doctor" "./scripts/workspace-doctor.sh" "Comprehensive workspace diagnosis"
        ;;
    "2"|"deps"|"dependencies")
        run_script "Dependency Manager" "./scripts/dependency-manager.sh fix" "Fixing dependency issues"
        ;;
    "3"|"fix"|"quick")
        run_script "Quick Fix" "./scripts/workspace-doctor.sh --fix" "Auto-fixing common problems"
        ;;
    "4"|"emergency"|"reset")
        echo -e "${RED}⚠️  This will launch the emergency reset script${NC}"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            ./scripts/emergency-reset.sh
        else
            echo -e "${YELLOW}Emergency reset cancelled${NC}"
        fi
        ;;
    "5"|"daily"|"checklist")
        run_script "Daily Checklist" "./scripts/daily-checklist.sh" "Start-of-day developer check"
        ;;
    "6"|"complete"|"all")
        run_complete_maintenance
        ;;
    "7"|"status")
        show_status_only
        ;;
    "menu"|*)
        show_menu
        read -p "Choose an option (0-7): " choice
        ./scripts/boxcall-maintenance.sh "$choice"
        ;;
esac
