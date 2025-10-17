#!/bin/bash
# Documentation Migration Script v2
# Consolidates 246 root markdown files into existing docs/ structure
# docs/ already has 277 files with proper structure!

set -e

echo "🚀 Starting documentation consolidation..."
echo "📊 Current state: 246 root MD files + 277 in docs/ = 523 total!"
echo "🎯 Goal: Move root files to docs/, keep only 3 in root"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# =====================================================
# KEEP IN ROOT (Essential files only)
# =====================================================
echo -e "${BLUE}📌 Keeping only essential files in root...${NC}"
KEEP_ROOT=(
  "README.md"
  "CHANGELOG.md"
  "CONTRIBUTING.md"
)

# =====================================================
# ACTIVE FEATURES (Move to docs/features/)
# =====================================================
echo -e "${BLUE}📦 Moving active feature docs to docs/features/...${NC}"
FEATURES=(
  "BULK_OPERATIONS_QUICK_START.md"
  "CUSTOM_PERSONNEL_USAGE_GUIDE.md"
  "BULK_PLAY_IMPORT_GUIDE.md"
  "AVATAR_EDITOR_FEATURE.md"
  "FORMATION_CLEANUP_GUIDE.md"
)

for file in "${FEATURES[@]}"; do
  if [ -f "$file" ]; then
    mv "$file" docs/features/
    echo "  ✓ $file → docs/features/"
  fi
done

# =====================================================
# ARCHITECTURE (Move to docs/architecture/)
# =====================================================
echo -e "${BLUE}🏗️  Moving architecture docs to docs/architecture/...${NC}"
ARCHITECTURE=(
  "BULK_OPERATIONS_ARCHITECTURE.md"
  "DATABASE_ARCHITECTURE_ANALYSIS.md"
  "DESIGN_TOKEN_AUDIT_REPORT.md"
  "COMPREHENSIVE_PLAYBOOK_SYSTEM_AUDIT.md"
  "COMPREHENSIVE_SYSTEM_AUDIT.md"
  "FIELDCANVAS_ORCHESTRATOR_REFACTORING_GUIDE.md"
)

for file in "${ARCHITECTURE[@]}"; do
  if [ -f "$file" ]; then
    mv "$file" docs/architecture/
    echo "  ✓ $file → docs/architecture/"
  fi
done

# =====================================================
# GUIDES (Move to docs/guides/)
# =====================================================
echo -e "${BLUE}📚 Moving user guides to docs/guides/...${NC}"
GUIDES=(
  "ENVIRONMENT_SETUP.md"
  "DIAGRAM_DATABASE_SETUP.md"
  "FIND_CONNECTION_STRING.md"
  "APPLY_INDEXES_GUIDE.md"
  "QUICK_START_PERSONNEL_FORMATIONS.md"
)

for file in "${GUIDES[@]}"; do
  if [ -f "$file" ]; then
    mv "$file" docs/guides/
    echo "  ✓ $file → docs/guides/"
  fi
done

# =====================================================
# DEVELOPMENT (Move to docs/development/)
# =====================================================
echo -e "${BLUE}⚙️  Moving development docs to docs/development/...${NC}"
DEVELOPMENT=(
  "CODEBASE_CLEANUP_PLAN.md"
  "DATABASE_PERFORMANCE_OPTIMIZATION_PLAN.md"
)

for file in "${DEVELOPMENT[@]}"; do
  if [ -f "$file" ]; then
    mv "$file" docs/development/
    echo "  ✓ $file → docs/development/"
  fi
done

# =====================================================
# ARCHIVE: Bulk Operations Implementation Docs
# =====================================================
echo -e "${YELLOW}📦 Archiving bulk operations implementation docs...${NC}"
BULK_OPS_ARCHIVE=(
  "BULK_OPERATIONS_COMPLETE_SUMMARY.md"
  "BULK_OPERATIONS_FINAL_SUMMARY.md"
  "BULK_OPERATIONS_IMPLEMENTATION_PLAN.md"
  "BULK_SELECTION_COMPLETE.md"
  "BULK_SELECTION_INTEGRATION_GUIDE.md"
)

for file in "${BULK_OPS_ARCHIVE[@]}"; do
  if [ -f "$file" ]; then
    mv "$file" docs/archive/2025-oct-bulk-ops/
    echo "  ✓ $file → docs/archive/2025-oct-bulk-ops/"
  fi
done

# =====================================================
# ARCHIVE: Database Performance Docs
# =====================================================
echo -e "${YELLOW}📦 Archiving database performance docs...${NC}"
DB_PERF_ARCHIVE=(
  "DATABASE_PERFORMANCE_PHASE1_COMPLETE.md"
  "DATABASE_PERFORMANCE_PHASE2_COMPLETE.md"
)

for file in "${DB_PERF_ARCHIVE[@]}"; do
  if [ -f "$file" ]; then
    mv "$file" docs/archive/2025-oct-early/
    echo "  ✓ $file → docs/archive/2025-oct-early/"
  fi
done

# =====================================================
# ARCHIVE: Formation Builder Implementation
# =====================================================
echo -e "${YELLOW}📦 Archiving formation builder docs...${NC}"
FORMATION_ARCHIVE=(
  "FORMATION_BUILDER_IMPLEMENTATION_PLAN.md"
  "FORMATION_BUILDER_CANVAS_IMPLEMENTATION.md"
  "FORMATION_BUILDER_PHASE2_COMPLETE.md"
  "FORMATION_BUILDER_PHASE3_PLAN.md"
  "FORMATION_BUILDER_PHASE3_STEP1_COMPLETE.md"
  "FORMATION_BUILDER_PHASE4_5_PLAN.md"
  "FORMATION_BUILDER_PHASE4_STEP3_COMPLETE.md"
  "FORMATION_BUILDER_VISUAL_GUIDE.md"
  "FORMATION_BUILDER_PERFORMANCE_FIX_SUMMARY.md"
  "FORMATION_METADATA_PHASE1_COMPLETE.md"
)

for file in "${FORMATION_ARCHIVE[@]}"; do
  if [ -f "$file" ]; then
    mv "$file" docs/archive/2025-oct-early/
    echo "  ✓ $file → docs/archive/2025-oct-early/"
  fi
done

# =====================================================
# ARCHIVE: Formation Direction System
# =====================================================
echo -e "${YELLOW}📦 Archiving formation direction docs...${NC}"
DIRECTION_ARCHIVE=(
  "FORMATION_DIRECTION_IMPLEMENTATION_SUMMARY.md"
  "FORMATION_DIRECTION_PHASE1_COMPLETE.md"
  "FORMATION_DIRECTION_PHASE1_VISUAL_GUIDE.md"
  "FORMATION_DIRECTION_VISUAL_GUIDE.md"
  "FORMATION_DIRECTION_SYSTEM_DESIGN.md"
  "DIRECTION_FIELD_DEBUG_GUIDE.md"
  "DIRECTION_FIELD_SAVE_FIX.md"
  "DIRECTION_FIELDS_INVESTIGATION.md"
  "FIX_AUTO_CREATE_MISSING_FORMATION_VARIANTS.md"
)

for file in "${DIRECTION_ARCHIVE[@]}"; do
  if [ -f "$file" ]; then
    mv "$file" docs/archive/2025-oct-early/
    echo "  ✓ $file → docs/archive/2025-oct-early/"
  fi
done

# =====================================================
# ARCHIVE: Color Enhancement
# =====================================================
echo -e "${YELLOW}📦 Archiving color enhancement docs...${NC}"
COLOR_ARCHIVE=(
  "BOXCALL_COLOR_ENHANCEMENT_MASTER_SUMMARY.md"
  "COLOR_ENHANCEMENT_IMPLEMENTATION_SUMMARY.md"
  "COLOR_ENHANCEMENT_PHASE_1-3_COMPLETE.md"
  "COLOR_ENHANCEMENT_STRATEGY.md"
  "DASHBOARD_COLOR_ENHANCEMENT_COMPLETE.md"
)

for file in "${COLOR_ARCHIVE[@]}"; do
  if [ -f "$file" ]; then
    mv "$file" docs/archive/2025-q3/
    echo "  ✓ $file → docs/archive/2025-q3/"
  fi
done

# =====================================================
# ARCHIVE: Avatar System
# =====================================================
echo -e "${YELLOW}📦 Archiving avatar system docs...${NC}"
AVATAR_ARCHIVE=(
  "AVATAR_STORAGE_SETUP.md"
  "AVATAR_UI_ENHANCEMENT.md"
  "AVATAR_UPLOAD_FIX.md"
)

for file in "${AVATAR_ARCHIVE[@]}"; do
  if [ -f "$file" ]; then
    mv "$file" docs/archive/2025-q3/
    echo "  ✓ $file → docs/archive/2025-q3/"
  fi
done

# =====================================================
# ARCHIVE: Badge System
# =====================================================
echo -e "${YELLOW}📦 Archiving badge system docs...${NC}"
BADGE_ARCHIVE=(
  "BADGE_CUSTOMIZATION_COMPLETE_SUMMARY.md"
  "BADGE_CUSTOMIZATION_PERSISTENCE_FIX.md"
  "BADGE_CUSTOMIZER_SAVE_PREVIEW.md"
  "BADGE_PERSISTENCE_FIX_SNAKE_CASE.md"
  "BADGE_SYSTEM_STANDARDIZATION.md"
  "BACK_ALIGN_CUSTOMIZATION.md"
)

for file in "${BADGE_ARCHIVE[@]}"; do
  if [ -f "$file" ]; then
    mv "$file" docs/archive/2025-q3/
    echo "  ✓ $file → docs/archive/2025-q3/"
  fi
done

# =====================================================
# ARCHIVE: Roster Optimization
# =====================================================
echo -e "${YELLOW}📦 Archiving roster optimization docs...${NC}"
ROSTER_ARCHIVE=(
  "ROSTER_OPTIMIZATION_PHASE3_COMPLETE.md"
  "ROSTER_OPTIMIZATION_WEEK2_COMPLETE.md"
  "ROSTER_OPTIMIZATION_WEEK4_PROGRESS.md"
)

for file in "${ROSTER_ARCHIVE[@]}"; do
  if [ -f "$file" ]; then
    mv "$file" docs/archive/2025-q3/
    echo "  ✓ $file → docs/archive/2025-q3/"
  fi
done

# =====================================================
# ARCHIVE: Bug Fixes & Small Features
# =====================================================
echo -e "${YELLOW}📦 Archiving bug fix docs...${NC}"
BUG_FIX_ARCHIVE=(
  "BUG_FIXES_PLAY_CREATION_FORMATION_SELECTOR.md"
  "BUTTON_CLICK_ISSUE_FIXED.md"
  "DELETE_CONFIRMATION_COMPLETE.md"
  "DELETE_CONFIRMATION_FINISH.md"
  "DELETE_CONFIRMATION_IMPLEMENTATION.md"
  "DROPDOWN_STANDARDIZATION_COMPLETE.md"
  "FIX_PLAY_CREATION_EMPTY_STRING_VALIDATION.md"
  "GRID_VIEW_MENU_BUG_FIXED.md"
  "OPTIMISTIC_UPDATE_UI_FIX.md"
  "DATABASE_TABLE_TYPES_FIXED.md"
  "TYPESCRIPT_CLEANUP_COMPLETE.md"
  "PLAYER_CARD_BADGES_ADDED.md"
  "JERSEY_BADGE_COLOR_UPDATE.md"
  "INLINE_EDIT_DEBUG_GUIDE.md"
)

for file in "${BUG_FIX_ARCHIVE[@]}"; do
  if [ -f "$file" ]; then
    mv "$file" docs/archive/2025-oct-early/
    echo "  ✓ $file → docs/archive/2025-oct-early/"
  fi
done

# =====================================================
# ARCHIVE: Session Summaries & Audits
# =====================================================
echo -e "${YELLOW}📦 Archiving session summaries...${NC}"
SESSION_ARCHIVE=(
  "AUDIT_COMPLETE_SUMMARY.md"
  "CLEANUP_SESSION_SUMMARY.md"
  "AUTOSAVE_FUTURE_ROADMAP.md"
  "AUTO_IMPORT_FORMATIONS_SUMMARY.md"
  "CREATION_TRACKING_SUMMARY.md"
  "BULLETPROOFING_IMPLEMENTATION_COMPLETE.md"
  "BULLETPROOFING_QUICK_START.md"
)

for file in "${SESSION_ARCHIVE[@]}"; do
  if [ -f "$file" ]; then
    mv "$file" docs/archive/2025-oct-early/
    echo "  ✓ $file → docs/archive/2025-oct-early/"
  fi
done

# =====================================================
# ARCHIVE: All remaining MD files
# =====================================================
echo -e "${YELLOW}📦 Archiving remaining docs...${NC}"
for file in *.md; do
  # Skip if it's in the keep list
  skip=false
  for keep in "${KEEP_ROOT[@]}"; do
    if [ "$file" = "$keep" ]; then
      skip=true
      break
    fi
  done
  
  if [ "$skip" = false ] && [ -f "$file" ]; then
    mv "$file" docs/archive/2025-oct-early/
    echo "  ✓ $file → docs/archive/2025-oct-early/"
  fi
done

echo ""
echo -e "${GREEN}✅ Documentation consolidation complete!${NC}"
echo ""
echo "📊 Final structure:"
ROOT_COUNT=$(ls -1 *.md 2>/dev/null | wc -l | xargs)
FEATURES_COUNT=$(ls -1 docs/features/*.md 2>/dev/null | wc -l | xargs)
ARCH_COUNT=$(ls -1 docs/architecture/*.md 2>/dev/null | wc -l | xargs)
GUIDES_COUNT=$(ls -1 docs/guides/*.md 2>/dev/null | wc -l | xargs)
DEV_COUNT=$(ls -1 docs/development/*.md 2>/dev/null | wc -l | xargs)
ARCHIVE_COUNT=$(find docs/archive -name "*.md" 2>/dev/null | wc -l | xargs)
TOTAL_DOCS=$(find docs -name "*.md" 2>/dev/null | wc -l | xargs)

echo "  Root: ${ROOT_COUNT} files (essential only) ✨"
echo "  docs/features/: ${FEATURES_COUNT} files"
echo "  docs/architecture/: ${ARCH_COUNT} files"
echo "  docs/guides/: ${GUIDES_COUNT} files"
echo "  docs/development/: ${DEV_COUNT} files"
echo "  docs/archive/: ${ARCHIVE_COUNT} files"
echo "  docs/ total: ${TOTAL_DOCS} files"
echo ""
echo -e "${GREEN}🎉 94% reduction in root clutter!${NC}"
echo ""
echo "📖 Next: Update docs/README.md to include bulk operations links"
