# Play System Excellence Roadmap

> **Goal**: Make the BoxCall play creation and management system bulletproof, consistent, and maintainable.

**Created**: December 29, 2025  
**Branch**: `cleanup/dec19-elite-cleanup`

---

## Current Architecture

```
AddNewPlayModal (UI)
    │
    ├─► usePlayFormState (form state management)
    │       • PlayFormData interface (camelCase)
    │
    └─► onCreatePlay callback
            │
            ▼
useOptimisticPlays.handleCreatePlay
    │
    ├─► Optimistic UI update (temp ID)
    │
    └─► SecurePlaysService.createPlay
            │
            ├─► Rate limiting
            ├─► Zod validation (PlayCreateSchema)
            │
            └─► PlaysService.createPlay
                    │
                    ├─► PlayValidationService (redundant!)
                    ├─► buildNewPlayData (snake_case)
                    │
                    └─► Supabase INSERT
                            │
                            ▼
                    usePlaybookData (PLAY_SELECT_FIELDS)
                            │
                            ▼
                    PlayList + PlayCard
```

---

## Phase 1: Foundation Fixes (Day 1)

### 1.1 ✅ Field Consistency Audit

**Status**: Complete  
**Files**: `usePlaybookData.ts`, `playDataBuilders.ts`, `playSchemas.ts`

- [x] Added `pref_field_pos` and `pref_situation` to PLAY_SELECT_FIELDS
- [x] Added fields to DatabasePlay interface
- [x] Fixed direction value format (`Left`/`Right` not `LEFT`/`RIGHT`)
- [ ] Audit `useTeamsData.ts` for missing play fields
- [ ] Verify all 50+ play fields flow end-to-end

### 1.2 ✅ Validation Consolidation

**Status**: Complete  
**Files**: `securePlaysService.ts`, `playsService.ts`, `playValidation.ts`

```
Before:  SecurePlaysService (Zod) → PlaysService (PlayValidationService)
After:   SecurePlaysService (Zod only) → PlaysService (no validation)
```

**Completed**:
- [x] Removed `PlayValidationService.validatePlayServer` call from `PlaysService.createPlay`
- [x] Removed unused import of PlayValidationService
- [x] Zod validation in SecurePlaysService is now single source of truth
- [x] PlayValidationService still available for **warnings** (analytics quality suggestions)

### 1.3 ✅ Field Length Consistency

**Status**: Complete

| Location | Max Length |
|----------|------------|
| Zod Schema | ~~100~~ → **200** |
| PlayValidationService | 200 |
| Database | 200 |

**Completed**:
- [x] Updated PlayCreateSchema to use 200 chars for play_name
- [x] Updated PlayNameSchema max length error message
- [ ] Add test for max length validation

---

## Phase 2: Error Handling Excellence (Day 2)

### 2.1 Unified Error Types

**Create**: `src/errors/playErrors.ts`

```typescript
export class PlayValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public code: string
  ) {
    super(message);
    this.name = "PlayValidationError";
  }
}

export class PlayDuplicateError extends Error {
  constructor(
    public existingPlayId?: string,
    public formation?: string,
    public playName?: string
  ) {
    super(`Play "${playName}" in "${formation}" already exists`);
    this.name = "PlayDuplicateError";
  }
}

export class PlayRateLimitError extends Error {
  constructor(public retryAfterSeconds: number) {
    super(`Rate limited. Retry in ${retryAfterSeconds}s`);
    this.name = "PlayRateLimitError";
  }
}
```

### 2.2 User-Friendly Error Messages

**Location**: `AddNewPlayModal.tsx`

**Current**:
```typescript
setErrorMessage("Failed to create play. Please try again.");
```

**Target**:
```typescript
if (error instanceof PlayDuplicateError) {
  setErrorMessage(`A play named "${error.playName}" already exists in ${error.formation}. Try a different name or formation.`);
} else if (error instanceof PlayValidationError) {
  setErrorMessage(`${error.field}: ${error.message}`);
} else if (error instanceof PlayRateLimitError) {
  setErrorMessage(`Slow down! You can create another play in ${formatSeconds(error.retryAfterSeconds)}`);
} else {
  setErrorMessage("Something went wrong. Please try again.");
  logError("Unexpected play creation error:", error);
}
```

### 2.3 Error Deduplication

**Problem**: Both `useOptimisticPlays` and `AddNewPlayModal` show errors

**Solution**:
- `useOptimisticPlays` handles **optimistic rollback** only (no toast)
- `AddNewPlayModal` handles **all user feedback** (inline error + toast)

---

## Phase 3: Type Safety & Documentation (Day 3)

### 3.1 Single Source of Truth for Play Type

**Create**: `src/types/play.schema.ts` (auto-generates from Zod)

```typescript
import { z } from "zod";
import { PlayCreateSchema, PlayUpdateSchema } from "../validation-services/playSchemas";

// Auto-generated types from Zod schemas
export type PlayCreateInput = z.infer<typeof PlayCreateSchema>;
export type PlayUpdateInput = z.infer<typeof PlayUpdateSchema>;

// Full Play type (database row + computed fields)
export interface Play extends PlayCreateInput {
  id: string;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  // Computed fields
  times_called: number;
  times_successful: number;
}
```

### 3.2 Field Mapping Documentation

**Create**: `docs/PLAY_FIELD_MAPPING.md`

| UI Field | Form State | API/Service | Database | Notes |
|----------|------------|-------------|----------|-------|
| Formation | formation | formation | formation | Required |
| Formation Direction | formationDir | f_dir | f_dir | L/R/Left/Right |
| Formation Direction (token) | formation_direction | formation_direction | formation_direction | base/left/right |
| Play Name | playName | play_name | play_name | Required, max 200 |
| ... | ... | ... | ... | ... |

### 3.3 Update database/schema.sql

**Problem**: Schema file is outdated, missing ~15 columns

**Tasks**:
- [ ] Regenerate schema from Supabase
- [ ] Or run `supabase db dump --schema public > database/schema.sql`
- [ ] Add column comments for documentation

---

## Phase 4: Performance & Code Quality (Day 4)

### 4.1 Remove Dead Code

**Unused exports to remove**:

| Export | File | Action |
|--------|------|--------|
| `KNOWN_PLAY_TYPES` | playSchemas.ts | Remove (only used as type) |
| `safeValidatePlayCreate` | playSchemas.ts | Keep for future use OR remove |
| `safeValidatePlayUpdate` | playSchemas.ts | Keep for future use OR remove |
| `FormationSectionProps` | FormationSection.tsx | Remove if unused |
| `validateFormationInput` | playValidation.ts | Check usage, possibly remove |

### 4.2 PlaysService Decomposition

**Current**: `playsService.ts` - 1387 lines

**Target Structure**:
```
src/services/plays/
├── index.ts              # Re-exports
├── playsCrudService.ts   # Create, Read, Update, Delete
├── playsSearchService.ts # Fuse.js search, filtering
├── playsStatsService.ts  # Analytics, counts, trends
└── playsExportService.ts # CSV export helpers
```

### 4.3 Use buildPlayUpdateData Consistently

**Problem**: `PlaysService.updatePlay` manually maps fields instead of using `buildPlayUpdateData`

**Location**: `playsService.ts:370-420`

```typescript
// Current: Manual mapping
const updatableFields = {
  play_name: updates.play_name,
  formation: updates.formation,
  // ... 30+ more lines
};

// Target: Use helper
const updatableFields = buildPlayUpdateData(updates);
```

---

## Phase 5: Testing & Monitoring (Day 5)

### 5.1 Unit Tests for Play Flow

**Create**: `src/__tests__/plays/`

```
plays/
├── playSchemas.test.ts      # Zod validation tests
├── playDataBuilders.test.ts # Field mapping tests
├── playsService.test.ts     # CRUD operations
└── playFormState.test.ts    # Form state logic
```

**Key test cases**:
- [ ] All required fields trigger validation error if missing
- [ ] All optional fields can be null/undefined
- [ ] Direction values accept all valid formats
- [ ] Duplicate plays are detected
- [ ] Max field lengths are enforced
- [ ] Array fields (tags, key_players, etc.) serialize correctly

### 5.2 Telemetry for Play Creation

**Add to SecurePlaysService.createPlay**:

```typescript
trackEvent("play_created", {
  hasFormation: !!playData.formation,
  hasPersonnel: !!playData.personnel,
  hasDiagram: !!playData.diagram_image_url,
  hasTags: (playData.tags?.length || 0) > 0,
  fieldCount: Object.keys(playData).filter(k => playData[k] != null).length,
});
```

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Play creation success rate | ~95% | 99%+ |
| Validation error clarity | Generic | Field-specific |
| Fields saved correctly | ~45/50 | 50/50 |
| Code coverage (plays) | Unknown | 80%+ |
| PlaysService.ts lines | 1387 | <500 |

---

## Quick Reference: Files to Modify

### Phase 1
- `src/services/playsService.ts` - Remove validation call
- `src/validation-services/playSchemas.ts` - Fix max lengths
- `src/hooks/useTeamsData.ts` - Add missing SELECT fields

### Phase 2  
- `src/errors/playErrors.ts` - NEW FILE
- `src/components/playbook/AddNewPlayModal.tsx` - Better error handling
- `src/hooks/useOptimisticPlays.ts` - Remove toast, let modal handle

### Phase 3
- `src/types/play.schema.ts` - NEW FILE
- `docs/PLAY_FIELD_MAPPING.md` - NEW FILE
- `database/schema.sql` - Regenerate

### Phase 4
- `src/services/plays/` - NEW FOLDER
- `src/validation-services/playSchemas.ts` - Remove dead exports

### Phase 5
- `src/__tests__/plays/` - NEW FOLDER

---

## Implementation Order

1. **Phase 1.2**: Remove double validation (reduces complexity)
2. **Phase 1.3**: Fix field length consistency (prevents bugs)
3. **Phase 2.2**: Better error messages (improves UX)
4. **Phase 4.3**: Use buildPlayUpdateData (reduces duplication)
5. **Phase 5.1**: Add tests (prevents regressions)

*Phases 3 and 4.2 can be done in parallel or deferred.*
