#!/bin/bash
# Phase 2: Organize Documentation by Topic
# Created: October 23, 2025

set -e

DOCS_DIR="/Users/justindepierro/Documents/boxcall/docs"
cd "$DOCS_DIR"

echo "Organizing documentation by topic..."

# Create proper structure (if not exists)
mkdir -p features/playbook
mkdir -p features/practice  
mkdir -p features/analytics
mkdir -p features/mobile
mkdir -p guides/setup
mkdir -p guides/development
mkdir -p guides/testing
mkdir -p guides/deployment
mkdir -p design-system/tokens
mkdir -p design-system/components
mkdir -p design-system/patterns
mkdir -p design-system/accessibility
mkdir -p architecture/database
mkdir -p architecture/frontend
mkdir -p architecture/services
mkdir -p ops/monitoring
mkdir -p ops/deployment
mkdir -p decisions

echo "Moving playbook-related docs..."
for file in PLAYBOOK_*.md *PLAY_MODAL*.md *PLAY_DIAGRAM*.md DIAGRAM_*.md *FORMATION*.md; do
  [ -f "$file" ] && git mv "$file" features/playbook/ 2>/dev/null || true
done

echo "Moving practice-related docs..."
for file in PRACTICEPLANNER*.md; do
  [ -f "$file" ] && git mv "$file" features/practice/ 2>/dev/null || true
done

echo "Moving analytics docs..."
for file in ANALYTICS_*.md *STATS*.md; do
  [ -f "$file" ] && git mv "$file" features/analytics/ 2>/dev/null || true
done

echo "Moving mobile docs (non-archived)..."
for file in MOBILE_*GUIDE*.md MOBILE_*ARCHITECTURE*.md MOBILE_*DEVELOPMENT*.md; do
  [ -f "$file" ] && git mv "$file" features/mobile/ 2>/dev/null || true
done

echo "Moving database docs..."
for file in DATABASE_*.md *RLS*.md *MIGRATION*.md SUPABASE_*.md; do
  [ -f "$file" ] && git mv "$file" architecture/database/ 2>/dev/null || true
done

echo "Moving auth & routing docs..."
for file in AUTH_*.md *ROUTING*.md ROLE_*.md; do
  [ -f "$file" ] && git mv "$file" architecture/frontend/ 2>/dev/null || true
done

echo "Moving design system docs..."
for file in DESIGN_SYSTEM_*.md DESIGN_TOKEN_*.md COLOR_*.md TYPOGRAPHY_*.md CORNER_*.md SPACING_*.md LAYOUT_TOKEN*.md; do
  [ -f "$file" ] && git mv "$file" design-system/tokens/ 2>/dev/null || true
done

echo "Moving component docs..."
for file in COMPONENT_*.md REUSABLE_*.md; do
  [ -f "$file" ] && git mv "$file" design-system/components/ 2>/dev/null || true
done

echo "Moving accessibility docs..."
for file in ACCESSIBILITY*.md *A11Y*.md; do
  [ -f "$file" ] && git mv "$file" design-system/accessibility/ 2>/dev/null || true
done

echo "Moving setup & development docs..."
for file in SETUP*.md DEVELOPMENT*.md DOCKER_*.md DEPENDABOT_*.md GIT_*.md; do
  [ -f "$file" ] && git mv "$file" guides/development/ 2>/dev/null || true
done

echo "Moving testing docs..."
for file in *TESTING*.md *TEST_*.md E2E_*.md VISUAL_REGRESSION*.md; do
  [ -f "$file" ] && git mv "$file" guides/testing/ 2>/dev/null || true
done

echo "Moving deployment & ops docs..."
for file in DEPLOYMENT*.md *DEPLOY*.md BACKUP_*.md BRANCH_PROTECTION*.md UPTIME_*.md HEALTH_CHECK*.md FEATURE_FLAGS*.md; do
  [ -f "$file" ] && git mv "$file" ops/deployment/ 2>/dev/null || true
done

echo "Moving monitoring docs..."
for file in *MONITORING*.md *PERFORMANCE*.md SECURITY_*.md; do
  [ -f "$file" ] && git mv "$file" ops/monitoring/ 2>/dev/null || true
done

echo ""
echo "Phase 2 Complete - Topic Organization"
echo "Remaining root docs: $(ls -1 *.md 2>/dev/null | wc -l)"
