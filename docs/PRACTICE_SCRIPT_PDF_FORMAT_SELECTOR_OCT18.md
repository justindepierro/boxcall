# Practice Script PDF Format Selector - October 18, 2025

## Feature Overview
Added the ability to choose between two PDF export formats when exporting practice scripts.

## PDF Format Options

### **Compact Format** 📋
- **Best for**: Quick reference cards, field use, minimal paper
- **Layout**:
  ```
  1  Twins L Cross R                    5 reps
     🛡️ base • cover 2                          ← Defense subtitle
     📍 middle • 1st & 10 • Own 25              ← Situation subtitle
     💡 Coaching Points: Watch for...
  ```
- **Features**:
  - Play name with full concatenation (formation + tags + play + direction)
  - Defensive info as compact subtitle (if set)
  - Game situation as compact subtitle (if set)
  - Coaching points (always shown)
  - **No** detailed info boxes

### **Detailed Format** 📚
- **Best for**: Complete playbooks, study material, full information
- **Layout**:
  ```
  1  Twins L Cross R                    5 reps
     🛡️ base • cover 2
     📍 middle • 1st & 10
  
  ┌─────────────────────────────────────┐
  │ OFFENSIVE DETAILS                   │
  │ [Pass] [Personnel: Blue] [Dir: R]  │
  ├─────────────────────────────────────┤
  │ DEFENSIVE LOOK                      │
  │ [Front: base] [Coverage: cover 2]  │
  ├─────────────────────────────────────┤
  │ 🎯 GAME SITUATION                   │
  │ Hash: middle • 1st & 10 • Own 25   │
  └─────────────────────────────────────┘
     💡 Coaching Points: Watch for...
  ```
- **Features**:
  - Everything from compact format PLUS:
  - Offensive Details box (type, personnel, direction)
  - Defensive Look box (front, coverage, blitz) - if set
  - Game Situation box (hash, down, field position) - if set

## User Experience

### Format Selection Dialog
When clicking the PDF button, users see a simple browser confirm dialog:

```
Choose PDF format:

OK = Compact (play names with defense/situation as subtitles)
Cancel = Detailed (full info boxes)

Compact is better for quick reference cards.
Detailed shows all information in organized sections.
```

- **OK** = Compact format
- **Cancel** = Detailed format

### File Naming
Files are automatically named with format indicator:
- Compact: `test_practice_script_compact_practice_script.pdf`
- Detailed: `test_practice_script_practice_script.pdf`

### Toast Notification
After export, shows format confirmation:
```
PDF exported for "test practice script" (compact format)
```
or
```
PDF exported for "test practice script" (detailed format)
```

## Implementation Details

### 1. PDF Component Type (`PracticeScriptPDF.tsx`)

Added format prop:
```tsx
export type PDFFormat = "compact" | "detailed";

interface PracticeScriptPDFProps {
  script: PracticeScript;
  format?: PDFFormat; // Defaults to "detailed"
}
```

### 2. Conditional Rendering

Wrapped detailed boxes in format check:
```tsx
{format === "detailed" && (
  <>
    {/* Offensive Details Box */}
    <View>...</View>
    
    {/* Defensive Look Box */}
    {(defensiveFront || coverage || blitz) && (
      <View>...</View>
    )}
    
    {/* Game Situation Box */}
    {(hash || downDistance || fieldPosition) && (
      <View>...</View>
    )}
  </>
)}

{/* Coaching Points - Always show */}
{scriptPlay.notes && (
  <View>...</View>
)}
```

### 3. Export Service (`pdfExportService.tsx`)

Updated methods to accept format parameter:
```tsx
static async exportPracticeScript(
  script: PracticeScript,
  format: PDFFormat = "detailed"
): Promise<void> {
  const { pdf, PracticeScriptPDF } = await this.loadPDFDependencies();
  const blob = await pdf(
    <PracticeScriptPDF script={script} format={format} />
  ).toBlob();
  
  // Add format suffix to filename
  const formatSuffix = format === "compact" ? "_compact" : "";
  link.download = `${scriptName}${formatSuffix}_practice_script.pdf`;
}
```

### 4. UI Handler (`PracticeScriptList.tsx`)

Show format selection dialog:
```tsx
const handleExportPDF = useCallback(
  async (script: PracticeScript) => {
    const format = window.confirm(
      'Choose PDF format:\n\n' +
      'OK = Compact (subtitles)\n' +
      'Cancel = Detailed (info boxes)'
    ) ? 'compact' : 'detailed';
    
    await PDFExportService.exportPracticeScript(script, format);
    success(`PDF exported (${format} format)`);
  },
  [success, toastError]
);
```

## What Shows in Each Format

| Element | Compact | Detailed |
|---------|---------|----------|
| Play number badge | ✅ | ✅ |
| Play name (full) | ✅ | ✅ |
| Defense subtitle | ✅ | ✅ |
| Situation subtitle | ✅ | ✅ |
| Offensive Details box | ❌ | ✅ |
| Defensive Look box | ❌ | ✅ (if data exists) |
| Game Situation box | ❌ | ✅ (if data exists) |
| Coaching Points | ✅ | ✅ |

## Testing Checklist

- [ ] Click PDF button on a practice script
- [ ] Dialog appears with format options
- [ ] Click OK → exports compact format
- [ ] Compact PDF shows:
  - Play names with defense/situation subtitles
  - No detail boxes
  - Coaching points
- [ ] Click PDF button again
- [ ] Click Cancel → exports detailed format
- [ ] Detailed PDF shows:
  - Play names with subtitles
  - All detail boxes
  - Coaching points
- [ ] File names include "_compact" suffix when appropriate
- [ ] Toast shows correct format in message

## Future Enhancements

1. **Dropdown Menu**: Replace confirm dialog with proper dropdown
   ```tsx
   <DropdownMenu>
     <DropdownMenuItem onClick={() => export('compact')}>
       Compact Format
     </DropdownMenuItem>
     <DropdownMenuItem onClick={() => export('detailed')}>
       Detailed Format
     </DropdownMenuItem>
   </DropdownMenu>
   ```

2. **Remember Preference**: Save last-used format in localStorage

3. **Preview**: Show format preview before exporting

4. **Custom Format**: Allow users to toggle individual sections

5. **Multi-Column Compact**: Fit more plays per page in compact mode

## Files Modified

### `/src/components/pdf/PracticeScriptPDF.tsx` (601 lines)
- Added `PDFFormat` type export
- Added `format` prop to component
- Wrapped detailed boxes in `{format === "detailed" && <> ... </>}`
- Coaching points always show regardless of format

### `/src/services/pdfExportService.tsx` (71 lines)
- Imported `PDFFormat` type
- Added `format` parameter to `exportPracticeScript()`
- Added `format` parameter to `generatePracticeScriptPDF()`
- Pass format to PDF component
- Add "_compact" suffix to filename when appropriate

### `/src/components/playbook/PracticeScriptList.tsx` (280 lines)
- Updated `handleExportPDF` to show format selection dialog
- Pass selected format to export service
- Include format in success toast message

## Benefits

✅ **Flexibility**: Choose the right format for your needs
✅ **Quick Reference**: Compact format perfect for field use
✅ **Complete Info**: Detailed format shows everything
✅ **User Control**: Simple dialog, clear options
✅ **Backwards Compatible**: Defaults to detailed format
✅ **Type Safe**: TypeScript ensures format validity

---

**Status**: ✅ Complete and ready for testing
**Date**: October 18, 2025
**Related**: PRACTICE_SCRIPT_PDF_REDESIGN_OCT18.md
