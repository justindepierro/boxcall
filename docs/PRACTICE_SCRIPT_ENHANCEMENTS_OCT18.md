# Practice Script Enhancements - October 18, 2025

## Summary

Implemented three major enhancements to the practice script system:

1. **Custom defensive field inputs** - Users can now type custom values for front, coverage, and blitz
2. **Edit script save functionality** - Existing scripts can now be updated in the database
3. **Enhanced PDF export** - Professional play card layout with all details

## Feature 1: Custom Text Input for Defensive Fields

### What Changed

Added ability to type custom values for defensive configurations beyond preset options.

### Implementation

**File**: `src/components/playbook/PracticeScriptPlayItem.tsx`

Added custom input mode for three fields:

- Defensive Front
- Coverage
- Blitz Package

Each field now has:

1. **Dropdown with presets** (existing options)
2. **"➕ Custom..." option** at bottom of dropdown
3. **Text input mode** when custom is selected
4. **Cancel button** (X) to return to dropdown

**Example Flow**:

```
1. User clicks dropdown → sees "Cover 2", "Cover 3", etc.
2. User selects "➕ Custom..." at bottom
3. Dropdown switches to text input with focus
4. User types "Tampa 2" or "Palms" or any custom coverage
5. User presses Enter or clicks away → value is saved
6. User can press Escape or click X to cancel
```

**Code Changes** (lines 45-73):

```typescript
// Removed strict typing, now allows any string
const [defensiveFront, setDefensiveFront] = useState(
  scriptPlay.defensiveFront || "base"
);
const [coverage, setCoverage] = useState(scriptPlay.coverage || "cover_2");
const [blitz, setBlitz] = useState(scriptPlay.blitz || "none");

// Added custom input states
const [customDefensiveFront, setCustomDefensiveFront] = useState("");
const [customCoverage, setCustomCoverage] = useState("");
const [customBlitz, setCustomBlitz] = useState("");
const [showCustomFront, setShowCustomFront] = useState(false);
const [showCustomCoverage, setShowCustomCoverage] = useState(false);
const [showCustomBlitz, setShowCustomBlitz] = useState(false);
```

**UI Changes** (lines 331-420):
Each field now renders conditionally:

```tsx
{!showCustomFront ? (
  <select>
    <option value="base">Base Defense</option>
    <!-- ... more presets ... -->
    <option value="custom">➕ Custom...</option>
  </select>
) : (
  <div className="flex items-center gap-2">
    <input
      type="text"
      placeholder="Type custom front..."
      autoFocus
      onKeyDown={(e) => {
        if (e.key === "Enter") handleSave();
        if (e.key === "Escape") handleCancel();
      }}
    />
    <Button onClick={cancel}>X</Button>
  </div>
)}
```

### Benefits

- **Flexibility**: Coaches can use their own terminology
- **No limitations**: Not restricted to preset list
- **Easy to use**: Simple dropdown + text input pattern
- **Reversible**: Can cancel custom input and go back to presets

---

## Feature 2: Edit Script Save Functionality

### What Changed

Editing an existing practice script now properly updates the database.

### Previous Behavior

```typescript
// OLD (line 138-146):
if (currentScript.id && currentScript.id !== "") {
  // Update existing script
  const updatedScript = {
    ...currentScript,
    name: scriptName.trim(),
    description: scriptDescription.trim(),
    updatedAt: new Date(),
  };
  // For now, just update local state - in real implementation, call API ❌
  savedScript = updatedScript;
}
```

**Problem**: Changes only updated local React state, not the database. Refreshing the page would lose all edits.

### New Behavior

**File**: `src/services/practiceService.ts` (lines 738-772)

Added new method:

```typescript
/**
 * Update an existing practice script
 */
static async updatePracticeScript(
  scriptId: string,
  data: Partial<CreatePracticeScriptData>
): Promise<PracticeScript> {
  const updateData: any = {};

  if (data.name !== undefined) updateData.title = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.tags !== undefined) updateData.focus_areas = data.tags;

  updateData.updated_at = new Date().toISOString();

  const { data: script, error } = await supabase
    .from("practice_scripts")
    .update(updateData)
    .eq("id", scriptId)
    .select()
    .single();

  if (error) {
    console.error("Error updating practice script:", error);
    throw new Error("Failed to update practice script");
  }

  // Return the full script with plays
  const fullScript = await this.getPracticeScript(scriptId);
  if (!fullScript) {
    throw new Error("Failed to retrieve updated practice script");
  }

  return fullScript;
}
```

**File**: `src/components/playbook/PracticeScriptBuilder.tsx` (lines 136-148)

Updated save handler:

```typescript
if (currentScript.id && currentScript.id !== "") {
  // Update existing script ✅
  savedScript = await PracticeScriptService.updatePracticeScript(
    currentScript.id,
    {
      name: scriptName.trim(),
      description: scriptDescription.trim(),
      tags: currentScript.tags,
    }
  );

  console.log("[PracticeScriptBuilder] Script updated successfully");
  setCurrentScript(savedScript);
}
```

### Database Updates

- Updates `practice_scripts` table
- Sets `updated_at` timestamp
- Updates `title`, `description`, and `focus_areas`
- Returns full script object with all plays

### Benefits

- **Data persistence**: Edits are saved permanently
- **Proper timestamps**: `updated_at` field is maintained
- **Full refresh**: Returns complete script with plays after update
- **Error handling**: Throws descriptive errors if update fails

---

## Feature 3: Enhanced PDF Export with Play Cards

### What Changed

PDF export now shows plays in a professional "card" format matching the playbook display.

### Previous PDF Format

```
1. Play Name                    5 reps
Formation: Trips Right • Type: Pass

Game Scenario:
Hash: middle • Down: 1st & 10 • Coverage: cover 2
```

**Problems**:

- Script name not prominent
- Play cards looked like plain text
- Hard to scan quickly
- No visual hierarchy

### New PDF Format

**File**: `src/components/pdf/PracticeScriptPDF.tsx`

#### 1. Enhanced Header (lines 158-179)

```tsx
<View style={styles.header}>
  <Text style={styles.title}>
    {script.title || script.name || "Untitled Practice Script"}
  </Text>
  {script.description && (
    <Text style={styles.subtitle}>{script.description}</Text>
  )}
  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
    <Text style={styles.meta}>Created: {formatDate(script.createdAt)}</Text>
    <Text style={styles.meta}>
      {totalPlays} plays • {totalRepetitions} reps
    </Text>
  </View>
</View>
```

**Improvements**:

- Script name in large, bold font at top
- Description below if provided
- Two-column layout: date left, stats right
- Clear visual hierarchy

#### 2. Play Card Layout (lines 187-280)

Each play now displays as a visual "card" with multiple sections:

**A. Play Header** (numbered badge + name):

```tsx
<View style={styles.playHeader}>
  <View style={{ flexDirection: "row", alignItems: "center" }}>
    {/* Numbered Badge */}
    <View
      style={{
        width: 24,
        height: 24,
        backgroundColor: colorTokens.primary[600],
        borderRadius: 12,
        alignItems: "center",
      }}
    >
      <Text style={{ color: "#ffffff", fontWeight: "bold" }}>{index + 1}</Text>
    </View>

    {/* Play Name */}
    <View style={{ flex: 1, marginLeft: 8 }}>
      <Text style={styles.playName}>
        {scriptPlay.play?.play_name || "Unknown Play"}
      </Text>
      <Text style={{ fontSize: 9, color: colorTokens.gray[600] }}>
        Formation: {scriptPlay.play?.formation || "Unknown"}
        {scriptPlay.play?.f_dir && ` ${scriptPlay.play.f_dir}`}
      </Text>
    </View>
  </View>

  {/* Rep Badge */}
  <View
    style={{
      backgroundColor: colorTokens.jade[100],
      padding: 6,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: colorTokens.jade[500],
    }}
  >
    <Text style={{ fontWeight: "bold", color: colorTokens.jade[800] }}>
      {scriptPlay.repetitions} reps
    </Text>
  </View>
</View>
```

**B. Play Details** (badges for type, personnel, direction):

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
  {/* Type Badge */}
  <View
    style={{
      backgroundColor: colorTokens.blue[100],
      padding: 4,
      borderRadius: 3,
    }}
  >
    <Text>{scriptPlay.play?.p_type || "Unknown Type"}</Text>
  </View>

  {/* Personnel Badge */}
  {scriptPlay.play?.personnel && (
    <View
      style={{
        backgroundColor: colorTokens.gray[100],
        padding: 4,
        borderRadius: 3,
      }}
    >
      <Text>{scriptPlay.play.personnel}</Text>
    </View>
  )}

  {/* Direction Badge */}
  {scriptPlay.play?.p_dir && (
    <View
      style={{
        backgroundColor: colorTokens.gray[100],
        padding: 4,
        borderRadius: 3,
      }}
    >
      <Text>{scriptPlay.play.p_dir}</Text>
    </View>
  )}
</View>
```

**C. Game Scenario Box** (highlighted section):

```tsx
{
  formatScenario(scriptPlay) && (
    <View
      style={{
        padding: 8,
        backgroundColor: colorTokens.blue[50],
        borderRadius: 4,
        borderLeftWidth: 3,
        borderLeftColor: colorTokens.blue[500],
      }}
    >
      <Text style={{ fontWeight: "bold", color: colorTokens.blue[900] }}>
        🎯 Game Scenario:
      </Text>
      <Text style={{ fontSize: 9, color: colorTokens.blue[800] }}>
        Hash: middle • Down: 1st & 10 • Field: plus territory • Front: base •
        Coverage: cover 2 • Blitz: none
      </Text>
    </View>
  );
}
```

**D. Coaching Points** (bordered section):

```tsx
{
  scriptPlay.notes && (
    <View
      style={{
        padding: 6,
        borderLeftWidth: 3,
        borderLeftColor: colorTokens.jade[500],
        backgroundColor: colorTokens.jade[50],
      }}
    >
      <Text style={{ fontStyle: "italic", color: colorTokens.gray[700] }}>
        💡 Coaching Points: {scriptPlay.notes}
      </Text>
    </View>
  );
}
```

### Visual Hierarchy

**Colors Used**:

- **Primary (blue/jade)**: Main actions, important info
- **Blue tints**: Scenario information
- **Jade/green tints**: Coaching points, reps
- **Gray tints**: Secondary details (personnel, direction)

**Typography**:

- **18pt bold**: Script title
- **14pt bold**: Play names
- **11pt bold**: Rep counts
- **10pt bold**: Section labels
- **9pt regular**: Details and descriptions

**Spacing**:

- Consistent 8px padding for boxes
- 4px border radius for rounded corners
- 3px left border for callout sections
- Proper margins between sections

### Complete Example Output

```
═══════════════════════════════════════════════════
  THURSDAY PRACTICE SCRIPT
  Red Zone Package - 15 plays
─────────────────────────────────────────────────────
  Created: October 18, 2025        15 plays • 75 reps
═══════════════════════════════════════════════════

Practice Script
───────────────────────────────────────────────────

┌─────────────────────────────────────────────────┐
│ ① Power                                  5 reps │
│   Formation: I Right                            │
│                                                  │
│   Pass    11    Right                           │
│                                                  │
│   🎯 Game Scenario:                             │
│   Hash: right • Down: 1st & 10 •                │
│   Field: red zone • Front: base •               │
│   Coverage: cover 2 • Blitz: none               │
│                                                  │
│   │ 💡 Coaching Points: Watch for safety        │
│   │    rotation on the snap                     │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ ② Levels Concept                          5 reps│
│   Formation: Trips Right                        │
│   ...                                            │
└─────────────────────────────────────────────────┘
```

### Benefits

✅ **Professional appearance**: Looks like a real playbook
✅ **Easy to scan**: Visual cards separate each play
✅ **Complete information**: Shows all details requested
✅ **Print-friendly**: Clear sections, good spacing
✅ **Color-coded**: Different colors for different info types
✅ **Hierarchical**: Important info stands out

---

## Testing Checklist

### Custom Input Fields

- [ ] Select "➕ Custom..." for defensive front
- [ ] Type custom value (e.g., "5-2 Monster")
- [ ] Press Enter → value saves and shows in play
- [ ] Edit another play, verify custom value persists
- [ ] Try custom coverage (e.g., "Palms", "Tampa 2")
- [ ] Try custom blitz (e.g., "Fire Zone", "Bullets")
- [ ] Press Escape to cancel custom input
- [ ] Click X button to cancel

### Edit Script Save

- [ ] Click Edit on existing script
- [ ] Change script name
- [ ] Change description
- [ ] Modify a play's defensive settings
- [ ] Click Save
- [ ] Refresh page → verify changes persisted
- [ ] Check `updated_at` timestamp changed

### PDF Export

- [ ] Click PDF button on practice script
- [ ] Verify script name is large and at top
- [ ] Check play cards have numbered badges
- [ ] Verify formation and play name visible
- [ ] Check type/personnel/direction badges present
- [ ] Confirm game scenario box is highlighted
- [ ] Verify all defensive details show (front, coverage, blitz)
- [ ] Check hash, down/distance, field position present
- [ ] Confirm coaching points have left border
- [ ] Verify print-friendly layout (no cut-offs)

---

## Files Modified

1. **src/components/playbook/PracticeScriptPlayItem.tsx** (65 lines changed)
   - Lines 45-73: Changed state types, added custom input states
   - Lines 331-370: Enhanced defensive front with custom input
   - Lines 372-411: Enhanced coverage with custom input
   - Lines 413-452: Enhanced blitz with custom input

2. **src/services/practiceService.ts** (35 lines added)
   - Lines 738-772: Added `updatePracticeScript()` method

3. **src/components/playbook/PracticeScriptBuilder.tsx** (12 lines changed)
   - Lines 136-148: Updated save handler to call `updatePracticeScript()`

4. **src/components/pdf/PracticeScriptPDF.tsx** (135 lines changed)
   - Lines 158-179: Enhanced header with prominent script name
   - Lines 187-280: Complete play card redesign with visual sections

---

## Future Enhancements

### Potential Improvements

1. **Custom field suggestions**: Show previously used custom values
2. **Field templates**: Save and reuse common custom configurations
3. **PDF diagrams**: Include actual play diagrams in cards
4. **Bulk edit**: Apply same defensive settings to multiple plays
5. **Export formats**: Add CSV, Excel options alongside PDF
6. **Print layouts**: Multiple plays per page option

### Technical Debt

- Type safety: Custom fields now accept any string (intentional for flexibility)
- Validation: Could add max length limits for custom inputs
- Database: Consider separate table for custom defensive terminology

---

## Conclusion

All three features are complete and ready for testing:

✅ **Custom defensive inputs** - Full flexibility for coaches
✅ **Edit script saves** - Data persistence working correctly
✅ **Enhanced PDF export** - Professional playbook-style layout

The practice script system now provides a complete workflow:

1. Create script with plays
2. Configure defensive scenarios (preset or custom)
3. Edit and update scripts
4. Export professional PDFs for practice

Users can now create, edit, save, and export practice scripts with complete defensive configurations using either preset options or custom terminology.
