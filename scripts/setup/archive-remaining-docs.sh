#!/bin/bash
# Phase 3: Archive Remaining Session Docs and Organize Strategic Docs
# Created: October 23, 2025

set -e

DOCS_DIR="/Users/justindepierro/Documents/boxcall/docs"
ARCHIVE_2025="$DOCS_DIR/archive/2025"

cd "$DOCS_DIR"

echo "Phase 3: Final archival and organization..."

# Create roadmaps directory
mkdir -p roadmaps

# Move remaining mobile session docs to archive
echo "Archiving remaining mobile session docs..."
for file in MOBILE_*_PROGRESS.md MOBILE_*_SUMMARY.md MOBILE_*_IMPLEMENTATION*.md MOBILE_*_AUDIT.md MOBILE_*_FIXES.md MOBILE_*_TIMELINE.md MOBILE_QUICK_WIN_*.md; do
  [ -f "$file" ] && git mv "$file" "$ARCHIVE_2025/mobile-redesign/" 2>/dev/null || true
done

# Move fix and troubleshooting summaries to archive
echo "Archiving fix and troubleshooting docs..."
for file in *_FIX*.md *TROUBLESHOOTING*.md *_RESOLUTION*.md FIX_*.md CSP_*.md DEFENSE_ALIGNMENT*.md LOCALSTORAGE*.md NESTED_*.md TRIPS_*.md; do
  [ -f "$file" ] && git mv "$file" "$ARCHIVE_2025/sessions/" 2>/dev/null || true
done

# Move audit and cleanup reports to archive
echo "Archiving audit reports..."
for file in *_AUDIT*.md *AUDIT_*.md *_REPORT*.md LEGACY_*.md LOCKDOWN_*.md INLINE_STYLE*.md STYLE_*.md; do
  [ -f "$file" ] && git mv "$file" "$ARCHIVE_2025/sessions/" 2>/dev/null || true
done

# Move progress tracking docs to archive
echo "Archiving progress docs..."
for file in *_PROGRESS*.md STAGE*.md BULLET_PROOFING*.md; do
  [ -f "$file" ] && git mv "$file" "$ARCHIVE_2025/sessions/" 2>/dev/null || true
done

# Move implementation summaries to archive
echo "Archiving implementation summaries..."
for file in IMPLEMENTATION_*.md DOC_UPDATE*.md ALL_DOCUMENTS*.md; do
  [ -f "$file" ] && git mv "$file" "$ARCHIVE_2025/sessions/" 2>/dev/null || true
done

# Move celebration/milestone docs
echo "Archiving milestone docs..."
for file in CELEBRATION.md FAST_TRACK*.md; do
  [ -f "$file" ] && git mv "$file" "$ARCHIVE_2025/sessions/" 2>/dev/null || true
done

# Organize strategic roadmap docs
echo "Organizing roadmap documents..."
for file in *ROADMAP*.md *STRATEGIC*.md; do
  [ -f "$file" ] && git mv "$file" roadmaps/ 2>/dev/null || true
done

# Move quick reference docs to guides
echo "Organizing quick references..."
for file in *QUICK_REF*.md *QUICK_START*.md *QUICKSTART*.md; do
  [ -f "$file" ] && git mv "$file" guides/ 2>/dev/null || true
done

# Move workflow and visualization docs to architecture
echo "Organizing workflow docs..."
for file in *WORKFLOW*.md *VISUALIZATION*.md; do
  [ -f "$file" ] && git mv "$file" architecture/ 2>/dev/null || true
done

# Move design language docs to design-system
echo "Organizing design language docs..."
for file in *DESIGN_LANGUAGE*.md ANIMATION_SYSTEM*.md BADGE_*.md; do
  [ -f "$file" ] && git mv "$file" design-system/ 2>/dev/null || true
done

echo ""
echo "Phase 3 Complete - Final Organization"
echo "Remaining root docs: $(ls -1 *.md 2>/dev/null | wc -l)"
echo ""
echo "These should be core index files only"
