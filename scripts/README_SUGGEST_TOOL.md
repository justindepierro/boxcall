# Token Replacement Suggestion Tool

## Overview

A **safe, interactive helper tool** for replacing hardcoded design values with standard Tailwind utilities.

**Philosophy**: Human in the loop - the tool suggests, you decide.

## Features

✅ **Finds violations** - Detects arbitrary Tailwind values  
✅ **Suggests replacements** - Smart mapping to standard utilities  
✅ **Shows context** - See surrounding code  
✅ **Explains reasoning** - Understand each suggestion  
✅ **Confidence levels** - Know which changes are safe  
✅ **Interactive** - Accept, skip, or quit  
✅ **One at a time** - Review each change individually  
❌ **No auto-replace** - You stay in control!

## Usage

```bash
# Analyze and fix a single file
npx tsx scripts/suggest-token-replacements.ts src/components/ui/SomeComponent.tsx

# Interactive prompts for each violation:
# [A]ccept - Apply the suggested replacement
# [S]kip   - Leave unchanged, move to next
# [Q]quit  - Stop processing

# After completion, test your changes:
npm run type-check
npm run dev
```

## What It Detects

### 1. Arbitrary Font Sizes

- **Pattern**: `text-[11px]`, `text-[13px]`
- **Suggests**: Closest standard Tailwind font size
- **Example**: `text-[11px]` → `text-xs` (12px)

### 2. Arbitrary Heights

- **Pattern**: `h-[18px]`, `min-h-[22px]`
- **Suggests**: Standard height utilities (4px increments)
- **Example**: `min-h-[18px]` → `h-5` (20px)

### 3. Arbitrary Widths

- **Pattern**: `w-[24px]`, `max-w-[100px]`
- **Suggests**: Standard width utilities
- **Example**: `w-[24px]` → `w-6` (24px)

### 4. Arbitrary Spacing

- **Pattern**: `p-[12px]`, `mx-[8px]`, `gap-[16px]`
- **Suggests**: Standard spacing scale
- **Example**: `p-[10px]` → `p-2.5` (10px exact match!)

## Suggestion Logic

Based on learnings from Badge.tsx POC:

1. **Find closest standard utility**
2. **Calculate pixel difference**
3. **Assess confidence**:
   - **High**: 0-2px difference
   - **Medium**: 3-4px difference
   - **Low**: 5+ px difference
4. **Show trade-offs** for large differences

## Example Session

```bash
$ npx tsx scripts/suggest-token-replacements.ts src/components/ui/Badge/Badge.tsx

🔍 Token Replacement Suggestion Tool

Analyzing: src/components/ui/Badge/Badge.tsx

Found 4 violations

════════════════════════════════════════════════════════════════════════════════
Violation 1 of 4
════════════════════════════════════════════════════════════════════════════════
Line 119:
sm: "px-2 py-0.5 text-[11px] leading-tight min-h-[18px]",

  ❌ Found: text-[11px]
  ✅ Suggest: text-xs

  💡 Closest standard font size. 11px → 12px (+1px)
  🎯 Confidence: HIGH

  [A]ccept | [S]kip | [Q]uit: a
  ✅ Replacement applied!

[... continues for remaining violations ...]

Summary
══════════════════════════════════════════════════════════════════════════
✅ Accepted: 4
⏭️  Skipped: 0
📊 Total: 4

🎉 4 replacements applied to src/components/ui/Badge/Badge.tsx
   Don't forget to test the changes!
```

## Confidence Levels

### 🟢 HIGH (0-2px difference)

- Safe to accept
- Visually identical or imperceptible
- Aligns with design system

### 🟡 MEDIUM (3-4px difference)

- Generally safe
- May be slightly noticeable
- Review in browser

### 🔴 LOW (5+ px difference)

- Use caution
- Likely visually noticeable
- May require adding precision token

## When to Skip

- Component requires exact pixel precision
- Layout is fragile and sensitive to changes
- You want to batch-review similar changes
- Difference is too large (5+ px)

## When to Add Tokens Instead

If you find yourself skipping many suggestions because standard utilities are too far off, consider adding a precision token to the design system instead:

```typescript
// In tokens.ts
export const fineSpacingTokens = {
  // ... existing
  2.75: "0.6875rem", // 11px - if really needed
} as const;
```

## Safety Features

1. **One file at a time** - Isolated changes
2. **One violation at a time** - Full review
3. **No batch operations** - No accidents
4. **Quit anytime** - Stop if uncomfortable
5. **Git-friendly** - Easy to revert

## Workflow Tips

### 1. Start with high-confidence files

```bash
# Components with mostly HIGH confidence suggestions
npx tsx scripts/suggest-token-replacements.ts src/components/ui/Badge/Badge.tsx
```

### 2. Test after each component

```bash
npm run type-check  # Ensure it compiles
npm run dev         # Visual check
```

### 3. Commit after each success

```bash
git add src/components/ui/Badge/Badge.tsx
git commit -m "refactor(badge): Replace arbitrary values with standard tokens"
```

### 4. Build confidence

- Start with small components (Badge, Button)
- Progress to medium components (Card, Modal)
- Tackle large components last (FieldCanvas, Dashboard)

## Limitations

### Does NOT detect:

- Hex colors (e.g., `#fbbf24`) - Use audit script
- RGB/RGBA colors - Use audit script
- Inline styles with hardcoded values
- CSS files (only TSX/JSX)

### Does NOT handle:

- Complex calculations (e.g., `calc(100% - 20px)`)
- CSS-in-JS libraries
- Styled-components

For these cases, manual replacement is needed.

## Next Steps

After using this tool:

1. ✅ Test changes visually
2. ✅ Run type-check and lint
3. ✅ Commit successful replacements
4. ✅ Document any patterns discovered
5. ✅ Move to next file

## Related Documentation

- [Badge Replacement Template](../docs/BADGE_REPLACEMENT_TEMPLATE.md) - POC learnings
- [Design Token Standardization Project](../docs/DESIGN_TOKEN_STANDARDIZATION_PROJECT.md) - Overall plan
- [Design Token Audit Report](../DESIGN_TOKEN_AUDIT_REPORT.md) - Full violation list

---

**Remember**: This tool is your assistant, not your boss. When in doubt, skip and review manually!
