# Typography Standardization Strategy

**Created:** January 20, 2025  
**Status:** In Progress

## Current State Analysis

### Violations Found
- **Total:** 96 arbitrary font size values
- **Font Weight:** 0 violations ✅
- **Line Height:** 0 violations ✅
- **Letter Spacing:** 0 violations ✅

### Font Size Breakdown

| Arbitrary Value | Count | Tailwind Equivalent | Action |
|----------------|-------|---------------------|---------|
| `text-[10px]` | 30 | None (too small) | Add `text-2xs` (10px) |
| `text-[11px]` | 55 | None | Keep as `text-[11px]` or round to xs |
| `text-[12px]` | 8 | `text-xs` (12px) | ✅ Replace |
| `text-[13px]` | 1 | None | Round to xs or sm |
| `text-[2rem]` | 2 | `text-3xl` (1.875rem) | Evaluate case-by-case |

**Total:** 96 violations

---

## Strategy Decision

### Option 1: Add Custom Sizes (Recommended)
**Pros:**
- Preserves exact design intent
- No visual changes required
- Respects existing design decisions

**Cons:**
- Adds non-standard Tailwind classes
- May confuse developers not familiar with extensions

**Implementation:**
```javascript
// tailwind.config.js
fontSize: {
  "2xs": ["0.625rem", { lineHeight: "0.875rem", fontWeight: "400" }], // 10px
  xs: ["0.75rem", { lineHeight: "1rem", fontWeight: "400" }],          // 12px
  // ... rest of sizes
}
```

**Replace:**
- `text-[10px]` → `text-2xs` (30 instances)
- `text-[11px]` → Keep as arbitrary (55 instances) - between sizes
- `text-[12px]` → `text-xs` (8 instances)

### Option 2: Round to Standard Sizes
**Pros:**
- Uses only standard Tailwind
- Simpler mental model
- Better scalability

**Cons:**
- Visual changes required
- Design review needed
- May affect UI density

**Implementation:**
- `text-[10px]` → `text-xs` (12px) - 2px larger
- `text-[11px]` → `text-xs` (12px) - 1px larger  
- `text-[12px]` → `text-xs` (12px) - no change

---

## Recommended Approach

**Phase 1: Extend Tailwind with `text-2xs`**
```javascript
fontSize: {
  "2xs": ["0.625rem", { lineHeight: "0.875rem", fontWeight: "400" }], // 10px
  xs: ["0.75rem", { lineHeight: "1rem", fontWeight: "400" }],          // 12px
  sm: ["0.875rem", { lineHeight: "1.25rem", fontWeight: "400" }],      // 14px
  // ...existing sizes
}
```

**Phase 2: Standardize in Categories**

### Category A: Direct Replacements (38 violations)
- `text-[10px]` → `text-2xs` (30 instances)
- `text-[12px]` → `text-xs` (8 instances)

### Category B: Keep Arbitrary (58 violations)
- `text-[11px]` → Keep as `text-[11px]` (55 instances)
  - **Rationale:** 11px is intentionally between xs (12px) and 2xs (10px)
  - Common in: badges, labels, compact UI elements
  - Design decision to maintain
  
- `text-[13px]` → Keep as `text-[13px]` (1 instance)
  - **Rationale:** Specific design requirement

- `text-[2rem]` → Keep as `text-[2rem]` (2 instances)
  - **Rationale:** Large display text, evaluate context

---

## ESLint Rule Strategy

### Allow List
ESLint rule should **allow** these arbitrary values:
```javascript
const ALLOWED_ARBITRARY_FONT_SIZES = [
  "text-[11px]",  // Intentional between xs and 2xs
  "text-[13px]",  // Intentional between xs and sm
  "text-[2rem]",  // Display text
  // Add others as needed with documentation
];
```

### Error on Everything Else
```javascript
// ❌ Error
text-[10px]  → Use text-2xs
text-[12px]  → Use text-xs
text-[14px]  → Use text-sm
text-[16px]  → Use text-base
text-[1.5rem] → Use text-2xl

// ✅ Allowed (documented exceptions)
text-[11px]  → Intentional design decision
text-[13px]  → Intentional design decision
text-[2rem]  → Display text
```

---

## Implementation Plan

### Step 1: Extend Tailwind Config
- Add `text-2xs` (10px) to Tailwind config
- Document in design system

### Step 2: Replace Direct Mappings
- Replace all `text-[10px]` → `text-2xs` (30 instances)
- Replace all `text-[12px]` → `text-xs` (8 instances)

### Step 3: Document Exceptions
- Add comments explaining why `text-[11px]` is kept
- Update design system documentation

### Step 4: Create ESLint Rule
- Flag unauthorized arbitrary font sizes
- Allow documented exceptions
- Provide helpful suggestions

### Step 5: Update Documentation
- Document `text-2xs` in design system
- Explain when to use arbitrary values
- Update typography guidelines

---

## Files Most Affected

Based on grep results:

1. **`PlayerSidebar.tsx`** - 20+ instances of `text-[10px]` and `text-[11px]`
   - Compact player roster UI
   - Intentional dense layout

2. **`Tag.tsx`** - Small label component
   - Uses `text-[11px]`
   - Intentional compact sizing

3. **`ToolPalette.tsx`** - Diagram toolbar
   - Uses `text-[12px]`
   - Can standardize to `text-xs`

4. **`ActiveFilterChips.tsx`** - Filter pills
   - Uses `text-[11px]`
   - Intentional compact sizing

---

## Expected Outcomes

### After Phase 1 (Extend Tailwind)
- ✅ `text-2xs` available for 10px text
- ✅ Design system updated
- ✅ Documentation complete

### After Phase 2 (Replacements)
- ✅ 38 violations fixed (10px → 2xs, 12px → xs)
- ⚠️ 58 violations remain (intentional)
- ✅ All intentional exceptions documented

### After Phase 3 (ESLint)
- ✅ Future violations prevented
- ✅ Exceptions whitelisted
- ✅ Helpful error messages

---

## Success Criteria

1. **Standardization:** All unintentional arbitrary values removed
2. **Documentation:** All intentional arbitrary values documented
3. **Enforcement:** ESLint prevents future violations
4. **No Visual Changes:** UI appearance unchanged
5. **Type Check:** All changes pass TypeScript validation

---

## Open Questions

1. **Should we round 11px to 12px?**
   - **Decision:** No - maintain exact design intent
   - **Rationale:** 11px is intentionally compact for labels/badges

2. **Should we add more custom sizes?**
   - **Decision:** Only `text-2xs` for now
   - **Rationale:** Minimize non-standard classes, document exceptions

3. **How to handle one-off sizes?**
   - **Decision:** Keep as arbitrary with documentation
   - **Rationale:** Better than adding many custom classes

---

## Next Steps

1. ✅ Extend Tailwind config with `text-2xs`
2. 🔄 Replace `text-[10px]` → `text-2xs` (30 instances)
3. 🔄 Replace `text-[12px]` → `text-xs` (8 instances)
4. 📝 Document intentional `text-[11px]` usage
5. 🔒 Create ESLint rule with whitelist
6. 📚 Update design system docs

---

**Last Updated:** January 20, 2025  
**Status:** Ready to implement
