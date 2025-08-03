#!/bin/bash

# BoxCall Emergency Workspace Reset
# Nuclear option for when everything is broken

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${RED}🚨 BoxCall Emergency Workspace Reset${NC}"
echo -e "${RED}====================================${NC}"
echo ""
echo -e "${YELLOW}⚠️  WARNING: This will reset your workspace to a known working state${NC}"
echo -e "${YELLOW}⚠️  Any uncommitted changes will be LOST${NC}"
echo ""

# Known good commits (you can update these)
KNOWN_GOOD_COMMITS=(
    "500e83f:herewegoagain - Last known fully working state"
    "bd44fd5:With safety measures - Current with protections"
)

echo -e "${CYAN}Available reset targets:${NC}"
for i in "${!KNOWN_GOOD_COMMITS[@]}"; do
    echo "  $((i+1)). ${KNOWN_GOOD_COMMITS[$i]}"
done
echo "  0. Cancel and exit"
echo ""

# Function to show current workspace status
show_status() {
    echo -e "${BLUE}Current workspace status:${NC}"
    echo "  Branch: $(git branch --show-current 2>/dev/null || echo 'Unknown')"
    echo "  Commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'Unknown')"
    echo "  Modified files: $(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')"
    echo "  Untracked files: $(git ls-files --others --exclude-standard 2>/dev/null | wc -l | tr -d ' ')"
    echo ""
}

# Function to create safety backup
create_safety_backup() {
    echo -e "${BLUE}Creating safety backup...${NC}"
    
    # Create a timestamped branch
    BACKUP_BRANCH="emergency-backup-$(date +%Y%m%d_%H%M%S)"
    
    # Stash any uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        git stash push -m "Emergency backup before reset - $(date)"
        echo -e "${GREEN}✅ Stashed uncommitted changes${NC}"
    fi
    
    # Create backup branch
    git branch "$BACKUP_BRANCH"
    echo -e "${GREEN}✅ Created backup branch: $BACKUP_BRANCH${NC}"
    
    # Backup important files
    mkdir -p .emergency-backup
    cp package.json .emergency-backup/package.json.backup 2>/dev/null || true
    cp package-lock.json .emergency-backup/package-lock.json.backup 2>/dev/null || true
    cp tsconfig.json .emergency-backup/tsconfig.json.backup 2>/dev/null || true
    cp -r .env* .emergency-backup/ 2>/dev/null || true
    
    echo -e "${GREEN}✅ Backed up configuration files to .emergency-backup/${NC}"
    echo ""
}

# Function to reset to specific commit
reset_to_commit() {
    local commit_hash=$1
    local description=$2
    
    echo -e "${YELLOW}Resetting to: $commit_hash ($description)${NC}"
    
    # Hard reset to the commit
    git reset --hard "$commit_hash"
    
    # Clean any untracked files (with confirmation)
    if [ -n "$(git clean -n)" ]; then
        echo -e "${YELLOW}The following untracked files will be removed:${NC}"
        git clean -n
        echo ""
        read -p "Remove these files? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git clean -fd
            echo -e "${GREEN}✅ Cleaned untracked files${NC}"
        fi
    fi
    
    echo -e "${GREEN}✅ Reset to $commit_hash complete${NC}"
}

# Function to reinstall dependencies
reinstall_dependencies() {
    echo -e "${YELLOW}Reinstalling dependencies...${NC}"
    
    # Remove existing node_modules and lock file
    rm -rf node_modules
    rm -f package-lock.json
    
    # Clear npm cache
    npm cache clean --force
    
    # Fresh install
    npm install
    
    echo -e "${GREEN}✅ Dependencies reinstalled${NC}"
}

# Function to verify reset success
verify_reset() {
    echo -e "${CYAN}Verifying reset success...${NC}"
    
    local issues=0
    
    # Check critical files
    local critical_files=("src/App.tsx" "src/main.tsx" "package.json")
    for file in "${critical_files[@]}"; do
        if [ -f "$file" ] && [ -s "$file" ]; then
            echo -e "  ✅ ${GREEN}$file${NC} exists and has content"
        else
            echo -e "  ❌ ${RED}$file${NC} is missing or empty"
            ((issues++))
        fi
    done
    
    # Check TypeScript compilation
    if npx tsc --noEmit --skipLibCheck 2>/dev/null; then
        echo -e "  ✅ ${GREEN}TypeScript compilation${NC} successful"
    else
        echo -e "  ❌ ${RED}TypeScript compilation${NC} has errors"
        ((issues++))
    fi
    
    # Check if dev server can start (dry run)
    if npm run dev -- --help >/dev/null 2>&1; then
        echo -e "  ✅ ${GREEN}Development server${NC} command is available"
    else
        echo -e "  ❌ ${RED}Development server${NC} command failed"
        ((issues++))
    fi
    
    echo ""
    if [ $issues -eq 0 ]; then
        echo -e "${GREEN}🎉 Reset verification PASSED - workspace is healthy!${NC}"
        echo ""
        echo -e "${CYAN}Next steps:${NC}"
        echo "  npm run dev          # Start development server"
        echo "  npm run type-check   # Verify TypeScript"
        echo "  npm run lint         # Check code quality"
    else
        echo -e "${RED}⚠️  Reset verification found $issues issues${NC}"
        echo -e "${YELLOW}You may need to manually fix remaining issues${NC}"
    fi
}

# Function to show recovery options
show_recovery_info() {
    echo -e "${CYAN}Recovery information:${NC}"
    echo "  Your work has been backed up to:"
    echo "    - Git stash (if you had uncommitted changes)"
    echo "    - Branch: emergency-backup-* (latest branch)"
    echo "    - Files: .emergency-backup/ directory"
    echo ""
    echo -e "${CYAN}To recover your work later:${NC}"
    echo "  git stash list                    # See stashed changes"
    echo "  git stash pop                     # Restore last stashed changes"
    echo "  git branch -a                     # See all branches including backups"
    echo "  git checkout emergency-backup-*   # Switch to backup branch"
    echo ""
}

# Main execution
show_status

read -p "Choose reset target (0-${#KNOWN_GOOD_COMMITS[@]}): " choice

case $choice in
    0)
        echo -e "${YELLOW}Reset cancelled${NC}"
        exit 0
        ;;
    1)
        COMMIT="500e83f"
        DESCRIPTION="herewegoagain - Last known fully working state"
        ;;
    2)
        COMMIT="bd44fd5"
        DESCRIPTION="With safety measures - Current with protections"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${RED}Final confirmation:${NC}"
echo "  Target: $COMMIT ($DESCRIPTION)"
echo "  This will RESET your workspace and LOSE uncommitted changes"
echo "  Backups will be created automatically"
echo ""
read -p "Are you absolutely sure? Type 'RESET' to confirm: " confirmation

if [ "$confirmation" = "RESET" ]; then
    echo ""
    echo -e "${CYAN}🚀 Starting emergency reset...${NC}"
    echo ""
    
    create_safety_backup
    reset_to_commit "$COMMIT" "$DESCRIPTION"
    reinstall_dependencies
    verify_reset
    show_recovery_info
    
    echo ""
    echo -e "${GREEN}🎉 Emergency reset complete!${NC}"
    echo -e "${CYAN}Your workspace has been restored to a working state.${NC}"
    
else
    echo -e "${YELLOW}Reset cancelled - confirmation not received${NC}"
    exit 0
fi
