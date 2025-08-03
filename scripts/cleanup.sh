#!/bin/bash
# BoxCall Workspace Cleanup Script
# Phase 1: File System Cleanup

set -e

echo "🧹 Starting BoxCall Workspace Cleanup..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counter for cleaned files
CLEANED_COUNT=0

cleanup_file() {
    local file="$1"
    local reason="$2"
    
    if [ -f "$file" ]; then
        echo -e "${RED}🗑️  Removing: ${file} ${YELLOW}(${reason})${NC}"
        rm "$file"
        ((CLEANED_COUNT++))
    else
        echo -e "${YELLOW}⚠️  File not found (already cleaned): ${file}${NC}"
    fi
}

backup_and_move() {
    local file="$1"
    local destination="$2"
    local reason="$3"
    
    if [ -f "$file" ]; then
        echo -e "${BLUE}📦 Moving: ${file} → ${destination} ${YELLOW}(${reason})${NC}"
        mkdir -p "$(dirname "$destination")"
        mv "$file" "$destination"
        ((CLEANED_COUNT++))
    else
        echo -e "${YELLOW}⚠️  File not found (already moved): ${file}${NC}"
    fi
}

echo -e "${BLUE}Phase 1.1: Removing Outdated & Duplicate Files${NC}"
echo "---------------------------------------------"

# Remove old/backup files
cleanup_file "src/components/dashboard/PersonalTrophyShelf-original.tsx" "superseded by current version"
cleanup_file "src/pages/Playground-old.tsx" "superseded by current Playground.tsx"

# Remove empty component files
cleanup_file "src/components/AuthTest.tsx" "empty file"
cleanup_file "src/components/AuthProvider.tsx" "empty file"

# Remove empty mobile store file
cleanup_file "mobile/react-native/src/store/useAppStore.ts" "empty file"

# Remove duplicate database schema
cleanup_file "database-schema.sql" "duplicate of database/database-schema.sql"

echo ""
echo -e "${BLUE}Phase 1.2: Cleaning Empty Documentation Files${NC}"
echo "-------------------------------------------"

# Create archives directory first
mkdir -p "docs/archives/completed-phases"
mkdir -p "docs/archives/old-roadmaps"
mkdir -p "docs/archives/deprecated"

# Remove truly empty docs (0 bytes)
cleanup_file "docs/archives/README_NEW.md" "empty file"
cleanup_file "docs/archives/PHASE_4_AUTH_LOG.md" "empty file"
cleanup_file "docs/cleanup/MAJOR_CLEANUP_PLAN.md" "empty file"
cleanup_file "docs/DATABASE_INTEGRATION.md" "empty file"
cleanup_file "docs/COMPONENT_SYSTEM_SUMMARY.md" "empty file"
cleanup_file "docs/COMPLETE_SCHEMA_REFERENCE.md" "empty file"
cleanup_file "docs/phases/PHASE_4_AUTH_LOG.md" "empty file"
cleanup_file "docs/SUPABASE_SETUP.md" "empty file"

echo ""
echo -e "${BLUE}Phase 1.3: Archiving Completed Phase Documents${NC}"
echo "--------------------------------------------"

# Move completed phase documents to archives
backup_and_move "docs/PHASE_4_3_COMPLETE_SUMMARY.md" "docs/archives/completed-phases/PHASE_4_3_COMPLETE_SUMMARY.md" "completed phase"
backup_and_move "docs/milestones/PHASE_2_3_COMPLETE.md" "docs/archives/completed-phases/PHASE_2_3_COMPLETE.md" "completed phase"
backup_and_move "docs/milestones/PHASE_3_COMPLETE.md" "docs/archives/completed-phases/PHASE_3_COMPLETE.md" "completed phase"
backup_and_move "docs/phases/PHASE_2_3_COMPLETE.md" "docs/archives/completed-phases/PHASE_2_3_COMPLETE.md" "completed phase"
backup_and_move "docs/phases/PHASE_4.3_INITIATION_COMPLETE.md" "docs/archives/completed-phases/PHASE_4.3_INITIATION_COMPLETE.md" "completed phase"
backup_and_move "docs/phases/PHASE_4.3_INTEGRATION_COMPLETE.md" "docs/archives/completed-phases/PHASE_4.3_INTEGRATION_COMPLETE.md" "completed phase"

# Move old roadmaps
backup_and_move "docs/ROADMAP_UPDATED.md" "docs/archives/old-roadmaps/ROADMAP_UPDATED.md" "superseded roadmap"
backup_and_move "docs/architecture/CALENDAR_ROADMAP.md" "docs/archives/old-roadmaps/CALENDAR_ROADMAP.md" "completed roadmap"
backup_and_move "docs/design/PHASE_4.3_ADVANCED_FEATURES_ROADMAP.md" "docs/archives/old-roadmaps/PHASE_4.3_ADVANCED_FEATURES_ROADMAP.md" "completed roadmap"

# Move deprecated architecture docs
backup_and_move "docs/ARCHITECTURE_AUDIT_COMPLETE.md" "docs/archives/deprecated/ARCHITECTURE_AUDIT_COMPLETE.md" "audit complete"
backup_and_move "docs/ARCHITECTURE_AUDIT_PHASE4_PREP.md" "docs/archives/deprecated/ARCHITECTURE_AUDIT_PHASE4_PREP.md" "prep phase complete"

echo ""
echo -e "${BLUE}Phase 1.4: Cleaning .gitkeep Files in Active Directories${NC}"
echo "----------------------------------------------------"

# Only remove .gitkeep files from directories that now have content
if [ "$(find src/components/ui -name "*.tsx" -o -name "*.ts" | wc -l)" -gt 0 ]; then
    cleanup_file "src/components/ui/.gitkeep" "directory has content"
fi

if [ "$(find src/components/layout -name "*.tsx" -o -name "*.ts" | wc -l)" -gt 0 ]; then
    cleanup_file "src/components/layout/.gitkeep" "directory has content"
fi

if [ "$(find src/hooks -name "*.tsx" -o -name "*.ts" | wc -l)" -gt 0 ]; then
    cleanup_file "src/hooks/.gitkeep" "directory has content"
fi

echo ""
echo -e "${GREEN}✅ Cleanup Complete!${NC}"
echo "===================="
echo -e "${GREEN}📊 Files processed: ${CLEANED_COUNT}${NC}"
echo -e "${GREEN}🎯 Ready for Phase 2: Documentation Restructure${NC}"

# Generate cleanup report
echo ""
echo "📋 Generating cleanup report..."
{
    echo "# Workspace Cleanup Report"
    echo "Generated: $(date)"
    echo ""
    echo "## Files Cleaned: $CLEANED_COUNT"
    echo ""
    echo "## Remaining File Structure:"
    echo "\`\`\`"
    tree -I 'node_modules|.git' -a -L 3
    echo "\`\`\`"
    echo ""
    echo "## Next Steps:"
    echo "1. Run Phase 2: Documentation restructure"
    echo "2. Update main README.md"
    echo "3. Implement performance tooling"
} > "CLEANUP_REPORT.md"

echo -e "${GREEN}📄 Report saved to: CLEANUP_REPORT.md${NC}"
echo ""
echo -e "${BLUE}🚀 Ready to continue with Phase 2!${NC}"
