# Token Automation Scripts 🤖

Specialized scripts for automating design token replacements across the codebase.

## Philosophy

Rather than one "do everything" script, we have **targeted automation** for specific violation types:

- ✅ **High confidence** = Full automation
- ⚠️ **Medium confidence** = Review suggestions
- 👤 **Low confidence** = Manual only

## Scripts

### 1. Exact Hex Matches (`01-replace-exact-hex-matches.ts`)

**Confidence: HIGH** ✅

Replaces hex colors with exact token equivalents where there's a perfect match.

```bash
# Dry run (see what would change)
tsx scripts/token-automation/01-replace-exact-hex-matches.ts

# Apply changes
tsx scripts/token-automation/01-replace-exact-hex-matches.ts --apply
```

**Examples:**
- `#3b82f6` → `colorTokens.blue[500]`
- `#047857` → `colorTokens.emerald[700]`
- `#111827` → `colorTokens.gray[900]`

**Handles:**
- String literals: `"#3b82f6"`
- Template literals: `` `#3b82f6` ``
- JSX attributes: `fill="#3b82f6"`
- Auto-adds imports with correct path depth

**Safe because:**
- Only replaces exact Tailwind color matches
- No context needed - direct substitution
- Type-safe token references

---

### 2. Arbitrary Font Sizes (`02-replace-arbitrary-font-sizes.ts`)

**Confidence: HIGH** ✅

Replaces arbitrary font size values with standard Tailwind classes.

```bash
# Dry run
tsx scripts/token-automation/02-replace-arbitrary-font-sizes.ts

# Apply
tsx scripts/token-automation/02-replace-arbitrary-font-sizes.ts --apply
```

**Examples:**
- `text-[12px]` → `text-xs`
- `text-[14px]` → `text-sm`
- `text-[18px]` → `text-lg`
- `text-[24px]` → `text-2xl`

**Handles:**
- Tailwind arbitrary value syntax
- Standard px-to-size mappings

**Safe because:**
- Tailwind has well-defined size scales
- No imports needed
- Simple class replacement

---

### 3. Color Parameter Defaults (`03-replace-color-parameter-defaults.ts`)

**Confidence: MEDIUM** ⚠️

Replaces default color values in function/component parameters.

```bash
# Dry run
tsx scripts/token-automation/03-replace-color-parameter-defaults.ts

# Apply (review output first!)
tsx scripts/token-automation/03-replace-color-parameter-defaults.ts --apply
```

**Examples:**
```typescript
// Before
const Arrow = ({ color = "#2563eb" }) => { ... }

// After
import { colorTokens } from "../../design-system/tokens";
const Arrow = ({ color = colorTokens.blue[600] }) => { ... }
```

**Handles:**
- Function parameter defaults
- Component prop defaults
- Auto-adds imports

**Medium confidence because:**
- Requires AST parsing
- Must preserve parameter semantics
- Import path calculation critical

---

## Run All Scripts

```bash
# Dry run all scripts
tsx scripts/token-automation/run-all.ts

# Apply all changes
tsx scripts/token-automation/run-all.ts --apply
```

Shows combined summary and statistics.

---

## What's NOT Automated (Manual Review Needed) 👤

### 1. **Semantic Color Choices**
```typescript
// Automation sees: #fbbf24 → amber-400
// Human decides: Is this selection, hover, or warning state?
const selectionColor = "#fbbf24"; // Should match our amber-400 pattern
```

### 2. **Contextual Replacements**
```typescript
// Script would replace both to amber-400
// But human knows first is selection, second is warning
<rect fill="#fbbf24" />  // Selection → amber-400 ✅
<Badge color="#fbbf24">Warning</Badge>  // Warning → amber-500 ⚠️
```

### 3. **Related Component Consistency**
```typescript
// Human reviews: "These 3 components should use same colors"
// FieldGrid.tsx uses emerald-500
// FieldMinimap.tsx should match → emerald-500
// FootballFieldCanvas.tsx should match → emerald-500
```

### 4. **CSS Files**
CSS files can't import TypeScript tokens - need CSS variable migration strategy.

### 5. **Edge Cases**
- Pure black (`#000000`) - keep literal or use gray-900?
- Pure white (`#ffffff`) - keep literal or use gray-50?
- Non-Tailwind colors (`#ff6b35`) - closest match or custom token?

---

## Workflow

### Recommended Process:

1. **Run automation scripts** (dry run first!)
   ```bash
   tsx scripts/token-automation/run-all.ts
   ```

2. **Review output** - Check suggestions make sense

3. **Apply automated changes**
   ```bash
   tsx scripts/token-automation/run-all.ts --apply
   ```

4. **Type-check**
   ```bash
   npm run type-check
   ```

5. **Manual review remaining violations**
   ```bash
   tsx scripts/audit-design-tokens.ts
   ```

6. **Handle semantic choices manually** - Files where context matters

7. **Commit incrementally** - One script's changes at a time

---

## Script Architecture

Each script follows the same pattern:

```typescript
// 1. Find violations
function findViolations(file): Violation[]

// 2. Show dry run
console.log(summary)

// 3. Apply if --apply flag
if (apply) {
  sourceFile.replaceWithText(newText)
  sourceFile.save()
}
```

**Benefits:**
- Safe dry run by default
- Clear before/after preview
- Incremental application
- Type-safe with ts-morph

---

## Statistics

After running all scripts:

```
Script 1: Exact Hex Matches       →  ~120 violations (8% of total)
Script 2: Arbitrary Font Sizes    →  ~30 violations  (2% of total)
Script 3: Color Parameter Defaults →  ~25 violations  (1.7% of total)
──────────────────────────────────────────────────────
Total Automated:                  →  ~175 violations (11.7% of 1,498)
Remaining Manual:                 →  ~1,323 violations
```

**Impact:**
- Saves ~2-3 hours of manual work
- Eliminates mechanical errors
- Focuses human effort on semantic decisions

---

## Future Scripts to Add

### 4. **Replace Inline RGB Colors**
```typescript
rgb(59, 130, 246) → colorTokens.blue[500]
rgba(59, 130, 246, 0.8) → colorTokens.blue[500] + opacity
```

### 5. **Replace Arbitrary Border Radius**
```typescript
rounded-[8px] → rounded-lg
rounded-[16px] → rounded-2xl
```

### 6. **Replace Arbitrary Spacing**
```typescript
p-[12px] → p-3
m-[16px] → m-4
```

### 7. **CSS Variable Migration**
```css
color: #3b82f6; → color: var(--color-blue-500);
```

### 8. **Consolidate Duplicate Colors**
Find components using similar but different colors that should be unified.

---

## Adding New Scripts

Template:

```typescript
#!/usr/bin/env tsx
/**
 * Script N: [Description]
 * 
 * [What it handles]
 * 
 * CONFIDENCE: [HIGH/MEDIUM/LOW]
 */

import { Project } from 'ts-morph';
import { resolve } from 'path';

function findViolations(filePath: string, project: Project) {
  // Your logic here
}

async function main() {
  const project = new Project({ /* ... */ });
  const sourceFiles = project.getSourceFiles();
  
  // Find violations
  // Show summary
  // Apply if --apply flag
}

main().catch(console.error);
```

Then add to `run-all.ts` scripts array.

---

## Testing

Before committing automated changes:

1. **Type-check**: `npm run type-check`
2. **Lint**: `npm run lint`
3. **Build**: `npm run build`
4. **Visual review**: Check a few files manually
5. **Incremental commits**: Commit each script's changes separately

---

## Notes

- Scripts use `ts-morph` for safe AST manipulation
- Import paths calculated dynamically based on file depth
- Preserves formatting and comments
- No changes made without `--apply` flag
- All output shows file paths and line numbers for review

---

**Let's automate the boring stuff and focus human judgment where it matters!** 🚀
