# Playbook & Diagram System - Complete Refactoring Plan

**Date**: October 12, 2025  
**Updated**: October 12, 2025 (Phase 1 & 2 Progress)  
**Status**: 🔄 **PHASE 2 IN PROGRESS (80% Complete)**

---

## ✅ RECENT PROGRESS (Oct 12, 2025)

### **Phase 1: Database & Types - COMPLETE ✅**
- ✅ Added `diagram_data` JSONB field to database
- ✅ Added `diagram_version` INTEGER field
- ✅ Created 3 GIN indexes for JSON queries
- ✅ Updated Play TypeScript interface
- ✅ Created Zod validation schemas (`diagramValidation.ts`)
- ✅ All type mismatches resolved

### **Phase 2: Service Layer - 80% COMPLETE 🔄**
- ✅ Created `DiagramService` with full CRUD methods
- ✅ Integrated DiagramService into DiagramEditor
- ✅ Replaced direct Supabase calls with service layer
- ✅ Autosave uses service (2.5s debounce)
- ✅ Manual save uses service for updates
- ⏳ **BLOCKED**: Browser testing (no plays with diagrams yet)
- ⏳ **PENDING**: Update PlayCard/PlayGrid diagram previews
- ⏳ **PENDING**: Remove legacy `diagram_url` usage

### **Next Immediate Action**
📊 **ADD 100 PLAYS FOR TESTING** - See `BULK_PLAY_IMPORT_GUIDE.md`

---

## 🔍 Executive Summary

The playbook and diagram systems are **functionally working** and Phase 1-2 refactoring is nearly complete. Current focus:

### Critical Issues Found

1. **❌ Missing Database Field**: `diagram_data` (JSONB) field doesn't exist in schema
2. **⚠️ Inconsistent Data Storage**: Using `diagram_url` (TEXT) to store JSON strings
3. **🔄 Duplicate Components**: diagram-editor vs diagram-canvas have overlapping code
4. **📦 Type Mismatches**: Play types don't fully match database schema
5. **🏗️ Weak Abstraction**: Diagram save/load logic scattered across components

---

## 📊 Current State Analysis

### Database Schema Issues

#### **Problem 1: Missing diagram_data Field**

**Current Schema** (`database/schema.sql` lines 140-175):

```sql
CREATE TABLE plays (
  id UUID PRIMARY KEY,
  playbook_id UUID REFERENCES playbooks(id),
  formation TEXT NOT NULL,
  play_name TEXT NOT NULL,
  -- ... other fields ...
  diagram_url TEXT,  -- ❌ Being used for JSON, should be image URL only
  -- ❌ MISSING: diagram_data JSONB
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**What's Wrong**:

- `diagram_url` is TEXT field meant for image URLs
- Currently storing JSON diagram documents as strings in `diagram_url`
- No proper JSONB field for structured diagram data
- No indexing or querying capabilities for diagram elements

**Impact**:

- Can't query plays by player positions
- Can't analyze formation patterns
- Can't migrate diagram versions easily
- Performance issues with large JSON strings

#### **Problem 2: Type Mismatches**

**Play Interface** (`src/types/play.ts`):

```typescript
export interface Play {
  // ... fields ...
  diagram_url?: string; // ✅ Exists in DB
  // ❌ NOT IN INTERFACE:
  // diagram_data?: DiagramDocument; // Should be JSONB in DB
}
```

**DiagramEditor Save Logic** (`diagram-editor/DiagramEditor.tsx` lines 314-342):

```typescript
const playData = {
  play_name: name,
  formation: detectFormation(players),
  p_type: "Pass" as const,
  diagram_data: diagramData, // ❌ Sending to DB field that doesn't exist!
};

await supabase.from("plays").insert(playData as any); // ⚠️ Type assertion hiding error
```

### Component Architecture Issues

#### **Issue 1: Two Separate Diagram Systems**

| System              | Location      | Size       | Purpose              | Status     |
| ------------------- | ------------- | ---------- | -------------------- | ---------- |
| **diagram-editor/** | Full-featured | ~7,500 LOC | Pixi.js WebGL editor | ✅ GOOD    |
| **diagram-canvas/** | Lightweight   | ~4,200 LOC | SVG canvas sketching | ⚠️ UNUSED? |

**Analysis**:

- diagram-editor uses Pixi.js (WebGL) - modern, performant
- diagram-canvas uses SVG - older, less performant
- Both try to solve the same problem
- Significant code duplication (~30% overlap)
- Confusing which to use for new features

#### **Issue 2: Scattered Save/Load Logic**

**Current Flow**:

```
DiagramEditor.tsx (component)
  └─> Directly calls Supabase
      └─> Builds DiagramDocument inline
          └─> No validation
              └─> No proper error handling
                  └─> No caching or offline support
```

**What's Missing**:

- ❌ No DiagramService abstraction
- ❌ No diagram validation layer
- ❌ No diagram versioning strategy
- ❌ No thumbnail generation service
- ❌ No diagram migration utilities

#### **Issue 3: Personnel Integration**

**Good**: DiagramEditor loads personnel from database

```typescript
const { data: personnelConfig } = usePersonnelConfigurationByName(
  playbookId,
  personnelName
);
```

**Issues**:

- Personnel data not stored back in diagram document
- Can't recreate formation from saved diagram alone
- Missing link between play.personnel and diagram.players

---

## 🎯 Proposed Solution: Clean Architecture

### Phase 1: Database Schema Fix (HIGHEST PRIORITY)

#### **Migration: Add diagram_data Field**

**File**: `database/migrations/20251012_add_diagram_data.sql`

```sql
-- Add diagram_data JSONB column to plays table
ALTER TABLE plays
ADD COLUMN diagram_data JSONB;

-- Add GIN index for fast JSON queries
CREATE INDEX idx_plays_diagram_data ON plays USING GIN (diagram_data);

-- Add diagram metadata index
CREATE INDEX idx_plays_diagram_players ON plays
USING GIN ((diagram_data->'players'));

-- Migrate existing data from diagram_url if it contains JSON
UPDATE plays
SET diagram_data = diagram_url::jsonb
WHERE diagram_url IS NOT NULL
  AND diagram_url LIKE '{%'
  AND diagram_url::jsonb IS NOT NULL;

-- Keep diagram_url for actual image URLs only
-- (Will be populated by thumbnail generation service)

-- Add comment for documentation
COMMENT ON COLUMN plays.diagram_data IS
'JSONB diagram document (version 2+). Contains players, routes, field settings.';

COMMENT ON COLUMN plays.diagram_url IS
'PNG thumbnail URL (S3/Supabase Storage). Generated from diagram_data.';
```

#### **Migration: Add Diagram Versioning**

```sql
-- Add version tracking
ALTER TABLE plays
ADD COLUMN diagram_version INTEGER DEFAULT 2;

-- Index for migration queries
CREATE INDEX idx_plays_diagram_version ON plays (diagram_version);

-- Add validation constraint (versions 1-10 allowed)
ALTER TABLE plays
ADD CONSTRAINT plays_diagram_version_check
CHECK (diagram_version BETWEEN 1 AND 10);
```

#### **Update Play Type Interface**

**File**: `src/types/play.ts`

```typescript
import type { DiagramDocument } from "../components/playbook/diagram-editor/types/DiagramTypes";

export interface Play {
  // ... existing fields ...

  // Diagram fields (updated)
  diagram_data?: DiagramDocument | null; // ✅ NEW: JSONB diagram document
  diagram_url?: string | null; // ✅ UPDATED: PNG thumbnail only
  diagram_version?: number; // ✅ NEW: Version tracking

  // ... rest of fields ...
}
```

### Phase 2: Service Layer Refactoring

#### **Create DiagramService**

**File**: `src/services/diagramService.ts`

```typescript
/**
 * DiagramService - Centralized diagram operations
 *
 * Handles:
 * - Save/load diagram documents
 * - Thumbnail generation
 * - Diagram validation
 * - Version migration
 * - Personnel integration
 */

import { supabase } from "../lib/supabase";
import type { DiagramDocument } from "../components/playbook/diagram-editor/types/DiagramTypes";
import type { Play } from "../types/play";
import { generateThumbnail } from "../utils/diagramThumbnails";
import { validateDiagram } from "../validation/diagramValidation";

export class DiagramService {
  /**
   * Save diagram to database
   */
  static async saveDiagram(
    playId: string,
    document: DiagramDocument,
    options?: {
      generateThumbnail?: boolean;
      updateMetadata?: boolean;
    }
  ): Promise<{ success: boolean; thumbnailUrl?: string; error?: string }> {
    try {
      // 1. Validate diagram document
      const validation = validateDiagram(document);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // 2. Prepare update payload
      const updateData: any = {
        diagram_data: document,
        diagram_version: document.version,
        updated_at: new Date().toISOString(),
      };

      // 3. Generate thumbnail if requested
      if (options?.generateThumbnail !== false) {
        const thumbnail = await generateThumbnail(document);
        if (thumbnail.success) {
          updateData.diagram_url = thumbnail.url;
        }
      }

      // 4. Auto-detect formation from players
      if (options?.updateMetadata !== false && document.players) {
        updateData.formation = this.detectFormation(document.players);
      }

      // 5. Save to database
      const { data, error } = await supabase
        .from("plays")
        .update(updateData)
        .eq("id", playId)
        .select()
        .single();

      if (error) {
        console.error("❌ Failed to save diagram:", error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        thumbnailUrl: updateData.diagram_url,
      };
    } catch (err) {
      console.error("❌ DiagramService.saveDiagram error:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }

  /**
   * Load diagram from database
   */
  static async loadDiagram(playId: string): Promise<{
    success: boolean;
    document?: DiagramDocument;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from("plays")
        .select("diagram_data, diagram_version, personnel, playbook_id")
        .eq("id", playId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.diagram_data) {
        return { success: false, error: "No diagram data found" };
      }

      // Handle version migration if needed
      const document = await this.migrateDiagramVersion(
        data.diagram_data,
        data.diagram_version
      );

      return { success: true, document };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }

  /**
   * Create new diagram from personnel
   */
  static async createFromPersonnel(
    playbookId: string,
    personnelName: string
  ): Promise<DiagramDocument> {
    // TODO: Load personnel configuration
    // TODO: Auto-position players
    // TODO: Return populated diagram
    return {
      version: 2,
      players: [],
      meta: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    };
  }

  /**
   * Detect formation from player positions
   */
  private static detectFormation(players: any[]): string {
    // TODO: Implement formation detection algorithm
    return "Custom";
  }

  /**
   * Migrate old diagram versions to current
   */
  private static async migrateDiagramVersion(
    data: any,
    version: number
  ): Promise<DiagramDocument> {
    if (version === 2) {
      return data as DiagramDocument;
    }

    // TODO: Handle version 1 migration
    throw new Error(`Unsupported diagram version: ${version}`);
  }
}
```

#### **Create Diagram Validation**

**File**: `src/validation/diagramValidation.ts`

```typescript
import { z } from "zod";
import type { DiagramDocument } from "../components/playbook/diagram-editor/types/DiagramTypes";

const PlayerSchema = z.object({
  id: z.string(),
  x: z.number().min(0).max(53.333),
  y: z.number().min(0).max(35),
  label: z.string(),
  team: z.enum(["offense", "defense"]),
  position: z.string().optional(),
  alignment: z.enum(["left", "middle", "right"]).optional(),
});

const DiagramDocumentSchema = z.object({
  version: z.literal(2),
  players: z.array(PlayerSchema).max(22, "Max 22 players allowed"),
  meta: z
    .object({
      createdAt: z.number(),
      updatedAt: z.number(),
    })
    .optional(),
});

export function validateDiagram(document: unknown): {
  valid: boolean;
  error?: string;
} {
  try {
    DiagramDocumentSchema.parse(document);
    return { valid: true };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        valid: false,
        error: err.errors.map((e) => e.message).join(", "),
      };
    }
    return { valid: false, error: "Invalid diagram format" };
  }
}
```

### Phase 3: Component Refactoring

#### **Update DiagramEditor Save Logic**

**File**: `src/components/playbook/diagram-editor/DiagramEditor.tsx`

**Before** (lines 310-358):

```typescript
const performSave = useCallback(
  async (name: string) => {
    const diagramData: DiagramDocument = {
      version: 2,
      players,
      // ...
    };

    const playData = {
      play_name: name,
      formation: detectFormation(players),
      p_type: "Pass" as const,
      diagram_data: diagramData, // ❌ Goes to non-existent field
    };

    await supabase.from("plays").insert(playData as any);
  },
  [players]
);
```

**After**:

```typescript
import { DiagramService } from "../../../services/diagramService";

const performSave = useCallback(
  async (name: string) => {
    try {
      // 1. Build diagram document
      const diagramDoc: DiagramDocument = {
        version: 2,
        players,
        meta: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      };

      // 2. Create play first (without diagram)
      const { data: play, error: playError } = await supabase
        .from("plays")
        .insert({
          play_name: name,
          p_type: "Pass" as const,
          playbook_id: play?.playbook_id,
        })
        .select()
        .single();

      if (playError) throw playError;

      // 3. Save diagram using service
      const result = await DiagramService.saveDiagram(play.id, diagramDoc, {
        generateThumbnail: true,
        updateMetadata: true,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      // 4. Success
      setIsDirty(false);
      setShowSaveDialog(false);
      showAlertModal("✅ Success", `Play "${name}" saved!`);
    } catch (err) {
      console.error("❌ Save failed:", err);
      showAlertModal("❌ Save Failed", err.message);
    }
  },
  [players, play?.playbook_id]
);
```

#### **Consolidate Diagram Systems**

**Decision**: Keep diagram-editor (Pixi.js), deprecate diagram-canvas (SVG)

**Rationale**:

- Pixi.js is more performant (WebGL vs SVG)
- Better mobile support
- More modern codebase
- Active development

**Action**:

```bash
# Move diagram-canvas to archive
mkdir -p archive/deprecated/diagram-canvas-svg-20251012
mv src/components/playbook/diagram-canvas archive/deprecated/diagram-canvas-svg-20251012/

# Update all imports to use diagram-editor
# (Will be done programmatically)
```

### Phase 4: Testing & Validation

#### **Test Checklist**

- [ ] Database migration runs successfully
- [ ] Existing diagrams load correctly
- [ ] New diagrams save with diagram_data JSONB
- [ ] Thumbnails generate correctly
- [ ] Formation detection works
- [ ] Personnel integration works
- [ ] Type checking passes
- [ ] No console errors
- [ ] Performance is acceptable

---

## 📋 Implementation Plan

### Week 1: Database & Types

**Day 1: Database Migration**

```bash
# Create migration file
touch database/migrations/20251012_add_diagram_data.sql

# Apply migration
npm run migrate:apply

# Verify schema
npm run db:verify
```

**Day 2: Update TypeScript Types**

- Update Play interface
- Update DiagramDocument types
- Run type checks
- Fix type errors

**Day 3: Testing**

- Test existing diagrams still load
- Test new diagrams save correctly
- Verify JSONB queries work

### Week 2: Service Layer

**Day 4-5: Create DiagramService**

- Implement save/load methods
- Add validation
- Add thumbnail generation
- Write unit tests

**Day 6: Integrate with DiagramEditor**

- Update save logic
- Update load logic
- Test end-to-end flow

**Day 7: Buffer/Testing**

- Fix bugs
- Performance optimization
- Documentation

### Week 3: Cleanup & Optimization

**Day 8-9: Deprecate diagram-canvas**

- Move to archive
- Update imports
- Remove dead code

**Day 10: Performance Optimization**

- Add caching
- Optimize queries
- Test mobile performance

**Day 11-12: Documentation**

- Update ARCHITECTURE.md
- Create DIAGRAM_API.md
- Document migration path

---

## 🎯 Success Criteria

1. ✅ **Database**: diagram_data JSONB field exists and works
2. ✅ **Types**: No type errors, Play interface matches schema
3. ✅ **Service**: DiagramService handles all diagram operations
4. ✅ **Components**: DiagramEditor uses service layer
5. ✅ **Performance**: Diagram save/load < 500ms
6. ✅ **Testing**: All tests pass
7. ✅ **Documentation**: Complete API docs and migration guide

---

## 🚀 Future Enhancements (Post-Refactor)

Once the foundation is solid:

1. **Route Drawing** - Add route/line drawing tools
2. **Formations Library** - Pre-built formation templates
3. **Diagram Sharing** - Share diagrams between playbooks
4. **Diagram Versioning** - Track diagram history
5. **AI Formation Detection** - Auto-detect formations from player positions
6. **Export Formats** - PDF, SVG, PNG export options
7. **Collaborative Editing** - Real-time multi-user editing
8. **Diagram Analytics** - Track most-used formations

---

## ⚠️ Breaking Changes

### For Users

- **None** - Existing diagrams will be migrated automatically

### For Developers

- Import path changes (diagram-canvas → diagram-editor)
- Save logic must use DiagramService
- diagram_url now only stores image URLs (not JSON)

---

## 📚 Related Documentation

- [DIAGRAM_SYSTEM_ARCHITECTURE.md](./DIAGRAM_SYSTEM_ARCHITECTURE.md)
- [DIAGRAM_REFACTOR_PLAN_OCT7_2025.md](./DIAGRAM_REFACTOR_PLAN_OCT7_2025.md)
- [PERSONNEL_SYSTEM_ARCHITECTURE.md](./PERSONNEL_SYSTEM_ARCHITECTURE.md)
- [DATABASE_SCHEMA_REFERENCE.md](./database/COMPLETE_SCHEMA_REFERENCE.md)

---

## ✅ Ready to Start?

**First Step**: Review this plan, then:

```bash
# 1. Create feature branch
git checkout -b refactor/playbook-diagram-system

# 2. Start with database migration
code database/migrations/20251012_add_diagram_data.sql

# 3. Follow the implementation plan day by day
```

**Questions? Issues?** Comment in this document or create GitHub issue.

---

**Last Updated**: October 12, 2025  
**Approved By**: System Architect  
**Status**: ✅ Ready for Implementation
