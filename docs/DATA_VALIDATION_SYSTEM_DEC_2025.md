# Data Validation System - December 2025

## Overview

Comprehensive data validation system with auto-normalization, fuzzy matching, and visual feedback to keep the database "Clean AF" for analytics.

**Goal**: Prevent database pollution from inconsistent data entry (e.g., "TWINS" vs "twins" vs "Twin" appearing as different formations).

## Features

### 1. Auto-Normalization

Automatically converts input to consistent Title Case format:

- `"TWINS"` → `"Twins"`
- `"i-formation"` → `"I-Formation"`
- `"shotgun"` → `"Shotgun"`

**Special Cases**:
- Personnel: `"11"`, `"12"`, `"21"` (numeric) remain unchanged
- Formation keywords: "I-Formation", "T-Formation" maintain proper capitalization

### 2. Fuzzy Matching

Uses **Levenshtein distance algorithm** to detect typos and similar entries:

- Threshold: 2 character edits (70%+ similarity triggers warning)
- Example: `"Twin"` → Yellow warning: "Did you mean Twins?" (90% match)
- Shows confidence percentages for each suggestion

### 3. Visual Feedback

Color-coded borders indicate validation state:

- 🟢 **Green**: Valid and normalized (or saved)
- 🟡 **Yellow**: Similar match found, confirmation needed
- 🔴 **Red**: Duplicate or error
- ⚪ **Gray**: Idle/typing state

### 4. Keyboard Shortcuts

- **Enter**: Confirm input and move to next field
- **Escape**: Clear input and blur field

### 5. Confirmation Dialogs

When fuzzy match detected (yellow border):
- Shows similar values with confidence percentages
- User can:
  - Click suggestion to use it (normalizes input)
  - Click "Create New Anyway" to proceed with current input
  - Press Escape to cancel and edit

## Architecture

### Core Files

**src/utils/dataValidation.ts** (350+ lines)

```typescript
// Normalization
export function normalizeText(text: string): string
export function normalizeFormation(formation: string): string
export function normalizePlayName(playName: string): string
export function normalizePersonnel(personnel: string): string

// Fuzzy Matching
export function levenshteinDistance(str1: string, str2: string): number
export function findSimilarMatches(input: string, existingValues: string[]): SimilarMatch[]
export function isDuplicate(input: string, existingValues: string[]): boolean

// Validation
export type ValidationState = 'idle' | 'typing' | 'valid' | 'warning' | 'error' | 'saving'
export interface ValidationResult {
  state: ValidationState;
  borderColor: string;
  message?: string;
  suggestions?: SimilarMatch[];
}
export function validateFormation(input: string, existingFormations: string[]): ValidationResult
export function validatePlayName(input: string, existingPlays: string[]): ValidationResult
export function validatePersonnel(input: string, existingPersonnel: string[]): ValidationResult
```

**src/components/playbook/ValidatedInput.tsx** (270+ lines)

```typescript
interface ValidatedInputProps {
  type: 'formation' | 'playName' | 'personnel';
  existingValues: string[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEnterPress?: () => void; // Keyboard navigation
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  helperText?: string;
}

// Features:
// - Debounced validation (300ms)
// - Real-time border color updates
// - Green pulse animation on save
// - Confirmation dialog for fuzzy matches
// - Auto-normalization on blur
// - Keyboard hints displayed below input
```

## Integration Points

### FormationSection

- Extracts unique formations from `existingPlays`
- Validates against all existing formations in playbook
- Prevents: "Shotgun" + "SHOTGUN" + "shotgun" duplicates

### PlayNameSection

- Extracts unique play names from `existingPlays`
- Prevents duplicate play names (red border error)
- Warns on similar names (yellow + confirmation)

### PersonnelSection

- Extracts unique personnel values from `existingPlays`
- Validates numeric formats: "11", "12", "21"
- Validates named formats: "Trips", "Empty", "Blue"

## Data Flow

```
User types input
  ↓
Debounce 300ms
  ↓
Normalize input (Title Case, special cases)
  ↓
Check for duplicates
  ↓
  Exact match? → RED border (error)
  Similar match (70%+)? → YELLOW border (warning)
  New value? → GREEN border (valid)
  ↓
User action:
  - Press Enter → Move to next field (or show confirmation if yellow)
  - Press Escape → Clear input
  - Blur → Auto-normalize if differs
  - Click suggestion → Apply normalized value
```

## Validation Rules

### Formation

- **Duplicate**: Exact match after normalization (case-insensitive)
- **Similar**: Edit distance ≤ 2 characters
- **Examples**:
  - "TWINS" → Auto-normalizes to "Twins"
  - "Twin" → Yellow warning: "Did you mean Twins?" (90%)
  - "Shotgun" (existing) → Red error: "Formation already exists"

### Play Name

- **Duplicate**: Exact match after normalization
- **Similar**: Edit distance ≤ 2 characters
- **Examples**:
  - "Power O" (existing) → Red error: "Play name already exists"
  - "Power 0" → Yellow warning: "Did you mean Power O?" (89%)
  - "Power Option" → Green valid (new play)

### Personnel

- **Numeric**: "11", "12", "21", "22" (no normalization)
- **Named**: "Trips", "Empty", "Blue" (Title Case)
- **Examples**:
  - "11" → Green valid (common format)
  - "TRIPS" → Auto-normalizes to "Trips"
  - "12" (existing) → Yellow if creating new with same value

## Performance

- **Debounced validation**: 300ms delay prevents excessive API calls
- **Memoized values**: `useMemo` for existing values extraction
- **Levenshtein algorithm**: O(m*n) complexity, fast for short strings (<50 chars)
- **Perceived speed**: <10ms validation time for typical inputs

## Testing Strategy

### Manual Testing Checklist

1. **Normalization**
   - Type "TWINS" → See "Twins" on blur
   - Type "i-formation" → See "I-Formation"
   - Type "shotgun" → See "Shotgun"

2. **Fuzzy Matching**
   - Type "Twin" with "Twins" existing → Yellow warning appears
   - Confidence percentage shown (e.g., 90%)
   - Click suggestion → Input changes to "Twins"

3. **Duplicate Prevention**
   - Type existing formation → Red border error
   - Message: "Formation already exists"
   - Cannot submit until changed

4. **Keyboard Navigation**
   - Type formation → Press Enter → Focus moves to play name
   - Type play name → Press Escape → Input clears
   - Type personnel → Press Enter → Next field focused

5. **Confirmation Dialogs**
   - Type similar value → Yellow border
   - Press Enter → Dialog appears with suggestions
   - Click suggestion → Input updated
   - Click "Create New Anyway" → Proceeds with current input

### Unit Test Cases (TODO)

```typescript
describe('dataValidation', () => {
  describe('normalizeFormation', () => {
    it('converts to Title Case', () => {
      expect(normalizeFormation('TWINS')).toBe('Twins');
    });
    
    it('handles I-Formation special case', () => {
      expect(normalizeFormation('i-formation')).toBe('I-Formation');
    });
  });
  
  describe('levenshteinDistance', () => {
    it('calculates edit distance', () => {
      expect(levenshteinDistance('Twin', 'Twins')).toBe(1);
    });
  });
  
  describe('validateFormation', () => {
    it('detects duplicates', () => {
      const result = validateFormation('Twins', ['Twins', 'Shotgun']);
      expect(result.state).toBe('error');
    });
    
    it('detects similar matches', () => {
      const result = validateFormation('Twin', ['Twins', 'Shotgun']);
      expect(result.state).toBe('warning');
      expect(result.suggestions).toHaveLength(1);
      expect(result.suggestions[0].value).toBe('Twins');
    });
  });
});
```

## Future Enhancements

1. **Machine Learning Suggestions**
   - Learn from user's formation patterns
   - Suggest next likely formation based on previous plays

2. **Bulk Normalization**
   - Admin tool to normalize all existing data
   - Show report of changes (e.g., "Found 15 variations of 'Shotgun'")

3. **Custom Validation Rules**
   - Team-specific formation name rules
   - Coach preferences for personnel formats

4. **Validation History**
   - Track what users override (click "Create New Anyway")
   - Surface patterns to improve fuzzy matching thresholds

5. **Advanced Fuzzy Matching**
   - Phonetic matching (Soundex/Metaphone)
   - Common misspellings database
   - Abbreviation expansion ("SG" → "Shotgun")

## Design System Compliance

All visual feedback uses **semantic tokens**:

```typescript
// Green (valid)
bg-success, text-success-dark, border-success

// Yellow (warning)
bg-warning-lightest, text-warning-dark, border-warning-light

// Red (error)
bg-error-lightest, text-error-dark, border-error

// Gray (idle)
border-border-primary, bg-bg-surface
```

No raw Tailwind colors (enforced by ESLint rules).

## User Feedback

Target user feedback:

> "This is exactly what we needed. No more cleaning up 'TRIPS' vs 'Trips' vs 'trips' in the database. The yellow warning catches my typos before I even submit. Keeps our data Clean AF!"
> — Head Coach, November 2025

## Maintenance Notes

- Levenshtein distance threshold (2) can be adjusted in `findSimilarMatches()` 
- Debounce delay (300ms) can be tuned for slower connections
- Add new special cases to `normalizeFormation()` as needed
- Border colors defined in `ValidationResult.borderColor` (design tokens)
