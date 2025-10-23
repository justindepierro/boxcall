#!/bin/bash
# Documentation Consolidation Script
# Created: October 23, 2025
# Purpose: Systematically reorganize 358 documentation files

set -e

DOCS_DIR="/Users/justindepierro/Documents/boxcall/docs"
ARCHIVE_2025="$DOCS_DIR/archive/2025"

cd "$DOCS_DIR"

echo "Starting documentation consolidation..."
echo "Current file count: $(ls -1 *.md 2>/dev/null | wc -l)"

# 1. Move all completed phase documents to archive
echo "Archiving completed phase documents..."
for file in *PHASE*COMPLETE*.md *PHASE*FINAL*.md *PHASE*SUMMARY*.md; do
  [ -f "$file" ] && git mv "$file" "$ARCHIVE_2025/phases/" 2>/dev/null || true
done

# 2. Move mobile-specific phase docs
echo "Archiving mobile phase documents..."
for file in MOBILE_*PHASE*.md; do
  [ -f "$file" ] && git mv "$file" "$ARCHIVE_2025/mobile-redesign/" 2>/dev/null || true
done

# 3. Move PIXI implementation docs
echo "Archiving PIXI implementation documents..."
for file in PIXI_*.md; do
  [ -f "$file" ] && git mv "$file" "$ARCHIVE_2025/pixi-implementation/" 2>/dev/null || true
done

# 4. Move cleanup and session summaries
echo "Archiving session and cleanup summaries..."
for file in *CLEANUP*SUMMARY*.md *SESSION*SUMMARY*.md *CLEANUP*COMPLETE*.md *SESSION*COMPLETE*.md IMPLEMENTATION_SUMMARY*.md; do
  [ -f "$file" ] && git mv "$file" "$ARCHIVE_2025/sessions/" 2>/dev/null || true
done

# 5. Move dated cleanup documents
echo "Archiving dated documents..."
for file in *OCT*2025*.md *_2025*.md; do
  [ -f "$file" ] && git mv "$file" "$ARCHIVE_2025/sessions/" 2>/dev/null || true
done

# 6. Move specific feature completion docs
echo "Archiving feature completion documents..."
for file in *BULLETPROOF*.md *PERSONNEL*.md *DIAGRAM*REFACTOR*.md *FIELDCANVAS*.md *PLAYCARD*.md; do
  [ -f "$file" ] && git mv "$file" "$ARCHIVE_2025/sessions/" 2>/dev/null || true
done

# 7. Move design system completion docs
echo "Archiving design system docs..."
for file in DESIGN_TOKEN_*COMPLETE*.md DESIGN_TOKEN_*FIX*.md LAYOUT_TOKEN_*.md SPACING_*.md TYPOGRAPHY_*COMPLETE*.md PRIORITY_*_COMPLETE*.md; do
  [ -f "$file" ] && git mv "$file" "$ARCHIVE_2025/sessions/" 2>/dev/null || true
done

# 8. Archive specific AddNewPlayModal docs (major refactor project)
echo "Archiving AddNewPlayModal project docs..."
for file in ADDNEWPLAYMODAL_*.md; do
  [ -f "$file" ] && git mv "$file" "$ARCHIVE_2025/sessions/" 2>/dev/null || true
done

# 9. Archive practice script docs
echo "Archiving practice script docs..."
for file in PRACTICE_SCRIPT_*.md; do
  [ -f "$file" ] && git mv "$file" "$ARCHIVE_2025/sessions/" 2>/dev/null || true
done

# 10. Archive accessibility completion docs
echo "Archiving accessibility docs..."
for file in ACCESSIBILITY_*SUMMARY*.md ACCESSIBILITY_*COMPLETE*.md ACCESSIBILITY_VALIDATION*.md; do
  [ -f "$file" ] && git mv "$file" "$ARCHIVE_2025/sessions/" 2>/dev/null || true
done

echo ""
echo "Phase 1 Complete - Archival"
echo "Remaining root docs: $(ls -1 *.md 2>/dev/null | wc -l)"
echo ""
echo "Next: Review remaining docs for consolidation"
