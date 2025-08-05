# Enhanced CSV Import System

## Overview

The CSV import system has been enhanced to provide a more intelligent and user-friendly experience when importing play data. The new system is more lenient with data validation while providing helpful guidance to users.

## Key Features

### 1. Lenient Validation

- **Only `play_name` is truly required** - plays without a name will show a red error
- **Missing formation or play type** triggers a confirmation dialog instead of blocking import
- **Smart defaults** are applied for missing required database fields

### 2. Intelligent Column Mapping

- **Case-sensitive exact matching** prioritized for database field names (e.g., `p_Type` → `p_type`)
- **Comprehensive football field support** including advanced fields like:
  - `keyPlayer1`, `keyPlayer2` for key players
  - `prefDown`, `prefDis` for preferences
  - `hAlign`, `zAlign` for alignments
  - `success_rate`, `times_called` for metrics
  - 40+ total football-specific field mappings

### 3. User-Friendly Confirmations

- **Missing fields confirmation**: "I see X plays are missing formation and/or play type. Are you sure you wish to continue?"
- **"Don't ask me again" checkbox** that saves user preference
- **Quality warning** for plays with insufficient data (< 5 filled fields)

### 4. Quality Assessment

- **Automatic quality detection** based on number of filled important fields
- **Helpful suggestions** with link to templates page
- **Threshold-based warnings** (shows warning if ≥50% of plays have < 5 fields)

## Technical Implementation

### Enhanced CSV Service (`csvService.ts`)

```typescript
// New interfaces support confirmation and quality warnings
interface CSVImportResult {
  needsConfirmation?: boolean;
  confirmationMessage?: string;
  qualityWarning?: string;
  // ... existing fields
}
```

### User Preferences Service (`userPreferencesService.ts`)

```typescript
// Manages user preferences for confirmation dialogs
interface UserPreferences {
  csvImport: {
    skipMissingFieldsConfirmation: boolean;
    skipQualityWarnings: boolean;
  };
}
```

### UI Components

- **`CSVImportConfirmation.tsx`**: Modal dialog with "don't ask again" option
- **`CSVQualityWarning.tsx`**: Dismissible warning with templates page link

## Validation Rules

### Required Fields

- **`play_name`**: Only field that causes import failure if missing
- **`formation`**: Missing triggers confirmation dialog (defaults to "Unknown Formation")
- **`p_type`**: Missing triggers confirmation dialog (defaults to "Run")

### Quality Metrics

Important fields for quality assessment:

1. `formation`
2. `play_name`
3. `p_type`
4. `personnel`
5. `protection`

### Auto-Corrections

The system automatically corrects common issues:

- **Play types**: "pass" → "Pass", "pa" → "Play Action"
- **Formations**: "gun" → "Shotgun", "i" → "I-Formation"
- **Personnel**: "1" → "11" (single digit gets "1" appended)

## Column Mapping Examples

### Exact Case-Sensitive Matches (Highest Priority)

```
keyPlayer1 → key_player1
p_Type → p_type
prefDown → pref_down
hAlign → h_align
```

### Fuzzy Matching (Fallback)

```
"Play Name" → play_name
"Formation" → formation
"Type" → p_type
```

## User Experience Flow

1. **Upload CSV**: User selects CSV file
2. **Intelligent Parsing**: System detects columns and validates data
3. **Preview with Warnings**: Shows all plays with color-coded validation status
4. **Confirmation Dialog**: If missing formation/play_type and user hasn't disabled
5. **Quality Warning**: If many plays have insufficient data
6. **Import Success**: All valid plays imported with smart defaults

## Error Handling

### Parse Errors (Red - Blocks Import)

- Missing `play_name` field
- Malformed CSV structure

### Warnings (Yellow - Allows Import)

- Missing formation or play type
- Short field values
- Unrecognized play types

### Quality Notices (Amber - Informational)

- Insufficient field completion
- Suggestions for improvement

## Integration Points

### Frontend Components

```typescript
// Example usage in import component
const handleImport = async (csvData: string) => {
  const parseResult = CSVService.parseCSVForPreview(csvData);

  if (parseResult.summary.needsConfirmation) {
    setShowConfirmation(true);
    setConfirmationMessage(parseResult.summary.confirmationMessage);
  }

  if (parseResult.summary.qualityWarning) {
    setQualityWarning(parseResult.summary.qualityWarning);
  }
};
```

### User Preferences Integration

```typescript
// Check if user wants to skip confirmations
if (!UserPreferencesService.shouldSkipCSVMissingFieldsConfirmation()) {
  // Show confirmation dialog
}
```

## Benefits

1. **Reduced Friction**: Users can import plays even with incomplete data
2. **Better UX**: Clear feedback and helpful suggestions
3. **Intelligent Mapping**: Handles real-world coach export formats
4. **Customizable**: Users can disable repetitive confirmations
5. **Quality Guidance**: Encourages complete data without blocking workflow

## Future Enhancements

- **Template suggestions** based on detected play patterns
- **Bulk auto-correction** options
- **Advanced field validation** (e.g., personnel format checking)
- **Import history** and rollback functionality
