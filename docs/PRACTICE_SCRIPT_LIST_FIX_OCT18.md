# Practice Script List Rendering Fix - October 18, 2025

## Issue

Practice script list was not rendering saved scripts on the Playbook page. The component was showing empty state even though script was saved.

## Root Cause Analysis

### 1. Property Name Mismatch

**Problem**: Component was looking for `script.name` but mapper returns `script.title`

**Mapper behavior** (`practiceService.ts` line 973):

```typescript
return {
  title: scriptData.title || scriptData.name || "Untitled Script",
  // ...
};
```

**Component usage** (`PracticeScriptList.tsx` line 186):

```typescript
{
  script.name;
} // ❌ undefined
```

### 2. Undefined Array Access

**Problem**: Component accessed `script.plays.length` and `script.tags.length` without optional chaining

**Error**: `'script.plays' is possibly 'undefined'`

## Fixes Applied

### 1. Fixed Property Access (Line 186-190)

```typescript
// BEFORE
<Typography title={script.name}>
  {script.name}
</Typography>

// AFTER
<Typography title={script.title || script.name}>
  {script.title || script.name}
</Typography>
```

### 2. Added Optional Chaining for Arrays (Line 212)

```typescript
// BEFORE
<span>{script.plays.length} plays</span>

// AFTER
<span>{script.plays?.length || 0} plays</span>
```

### 3. Fixed Tags Conditional (Line 216-228)

```typescript
// BEFORE
{script.tags.length > 0 && (
  <div>
    {script.tags.slice(0, 3).map(...)}
  </div>
)}

// AFTER
{script.tags && script.tags.length > 0 && (
  <div>
    {script.tags.slice(0, 3).map(...)}
  </div>
)}
```

### 4. Fixed Delete Handler (Line 262)

```typescript
// BEFORE
onClick={() => handleDeleteScript(script.id, script.name)}

// AFTER
onClick={() => handleDeleteScript(script.id, script.title || script.name || "Untitled")}
```

## Files Modified

1. **src/components/playbook/PracticeScriptList.tsx** (4 edits)
   - Line 186-190: Changed `script.name` → `script.title || script.name`
   - Line 212: Added optional chaining `script.plays?.length || 0`
   - Line 216: Added existence check `script.tags && script.tags.length > 0`
   - Line 262: Fixed delete handler parameter

## Expected Result

After these fixes:
✅ Script list should render saved scripts  
✅ Script name displays correctly
✅ Play count shows "7 plays" instead of error
✅ Tags display if they exist (focus_areas)
✅ No TypeScript errors for undefined properties

## Testing

1. Refresh the browser
2. Go to Playbook → Practice tab
3. Scroll to "Practice Scripts" section
4. Should see 1 script card with:
   - Title: Your script name
   - Description (if provided)
   - Duration: 2h (or calculated duration)
   - Plays: 7 plays
   - Tags: Any focus areas you selected
   - Action buttons: PDF, Edit, Duplicate, Delete

## Related Issues

The PracticeScript interface has both `title` and `name` as optional properties for backward compatibility:

```typescript
export interface PracticeScript extends Partial<BasePracticeScript> {
  title?: string; // Optional for backward compatibility
  name?: string; // Alias for title
  // ...
}
```

This caused confusion where different parts of the codebase used different properties. The mapper always sets `title`, so components should use `script.title || script.name` as fallback.
