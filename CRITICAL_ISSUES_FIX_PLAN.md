# Critical Issues Fix Plan - IMMEDIATE ACTION REQUIRED

**Date**: October 12, 2025  
**Status**: 🚨 **CRITICAL DATABASE SCHEMA MISMATCH**  
**Priority**: **P0 - BLOCKING ALL DIAGRAM FEATURES**

---

## 🔥 CRITICAL ISSUE: Database Schema Out of Sync

### **Problem Summary**

The **TypeScript types include diagram fields** but the **database schema does NOT**. This means:

❌ **DiagramEditor cannot save diagrams** - DB will reject `diagram_data` field  
❌ **All diagram saves fail silently** - Using `as any` type assertions hides errors  
❌ **Data loss risk** - Diagrams may be "saving" but not persisting  
❌ **Query failures** - Can't query plays by diagram properties  

---

## 📊 Current State Analysis

### **TypeScript Types (src/types/play.ts)** ✅ CORRECT

```typescript
export interface Play {
  // ... other fields ...
  
  // Diagram fields (NEW - October 12, 2025)
  diagram_data?: DiagramDocument | null; // JSONB - structured diagram document
  diagram_version?: number | null; // integer - diagram format version
  diagram_url?: string | null; // text - PNG thumbnail URL only
}
```

**Status**: ✅ Types are correct and include diagram fields

---

### **Database Schema (database/schema.sql)** ❌ MISSING FIELDS

```sql
CREATE TABLE plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playbook_id UUID REFERENCES playbooks(id) ON DELETE CASCADE,
  -- ... fields ...
  notes TEXT,
  confidence_base INTEGER DEFAULT 70,
  times_called INTEGER DEFAULT 0,
  times_successful INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
  -- ❌ MISSING: diagram_data JSONB
  -- ❌ MISSING: diagram_version INTEGER
  -- ✅ HAS: diagram_url (but not in schema file shown)
);
```

**Status**: ❌ Database schema file is missing diagram fields

---

### **DiagramService (src/services/diagramService.ts)** ⚠️ ASSUMES FIELDS EXIST

```typescript
// This code assumes diagram_data exists in database
static async updateDiagramData(
  playId: string,
  document: DiagramDocument,
  options?: { updateFormation?: boolean }
): Promise<UpdateDiagramResult> {
  const updateData: any = {
    diagram_data: document,  // ❌ Will fail if column doesn't exist
    diagram_version: document.version,
    updated_at: new Date().toISOString(),
  };
  // ...
}
```

**Status**: ⚠️ Service layer is built correctly but will fail if DB columns missing

---

## 🎯 IMMEDIATE FIX REQUIRED

### **Step 1: Check Actual Database State** ⚡ DO THIS FIRST

**Before making any changes**, verify what's actually in your Supabase database:

```sql
-- Run this in Supabase SQL Editor:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'plays'
  AND column_name IN ('diagram_data', 'diagram_version', 'diagram_url', 'created_by', 'is_archived')
ORDER BY column_name;
```

**Expected Results:**

```
column_name      | data_type | is_nullable
-----------------+-----------+-------------
diagram_data     | jsonb     | YES
diagram_version  | integer   | YES  
diagram_url      | text      | YES
```

**If columns are MISSING**, proceed to Step 2.  
**If columns EXIST**, skip to Step 3.

---

### **Step 2: Add Missing Database Columns** (If Needed)

**Option A: Using Supabase Dashboard (RECOMMENDED)**

1. Open Supabase Dashboard → SQL Editor
2. Run this migration:

```sql
-- Migration: Add diagram fields to plays table
-- Date: October 12, 2025

BEGIN;

-- Add diagram_data column (JSONB for structured data)
ALTER TABLE plays
ADD COLUMN IF NOT EXISTS diagram_data JSONB;

-- Add diagram_version column (track format version)
ALTER TABLE plays
ADD COLUMN IF NOT EXISTS diagram_version INTEGER;

-- Verify diagram_url exists (should already be there)
-- If not, add it:
ALTER TABLE plays
ADD COLUMN IF NOT EXISTS diagram_url TEXT;

-- Add created_by if missing (required by Play interface)
ALTER TABLE plays
ADD COLUMN IF NOT EXISTS created_by TEXT NOT NULL DEFAULT 'system';

-- Add is_archived if missing
ALTER TABLE plays
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- Create GIN indexes for fast JSONB queries
CREATE INDEX IF NOT EXISTS idx_plays_diagram_data 
ON plays USING GIN (diagram_data);

CREATE INDEX IF NOT EXISTS idx_plays_diagram_players 
ON plays USING GIN ((diagram_data->'players'));

CREATE INDEX IF NOT EXISTS idx_plays_diagram_version 
ON plays (diagram_version);

-- Add helpful comments
COMMENT ON COLUMN plays.diagram_data IS 
'JSONB diagram document (v2+). Contains players, routes, field settings, and drawing elements.';

COMMENT ON COLUMN plays.diagram_version IS 
'Diagram format version (1-10). Used for backward compatibility during migrations.';

COMMENT ON COLUMN plays.diagram_url IS 
'PNG thumbnail URL only. Use diagram_data for actual diagram structure.';

COMMIT;
```

**Option B: Using Migration File**

Create file: `database/migrations/20251012_add_diagram_fields.sql`

```sql
-- Same SQL as above
```

Then apply: `supabase db push` (if using Supabase CLI)

---

### **Step 3: Update schema.sql Documentation**

After confirming columns exist in database, update the schema file:

**File**: `database/schema.sql` (around line 140-175)

```sql
CREATE TABLE plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playbook_id UUID REFERENCES playbooks(id) ON DELETE CASCADE,
  
  -- Core play data (required)
  formation TEXT NOT NULL,
  play_name TEXT NOT NULL,
  p_type TEXT NOT NULL CHECK (p_type IN ('Pass', 'Run', 'RPO', 'Play Action')),
  
  -- Optional core fields
  one_word_play TEXT,
  personnel TEXT,
  f_type TEXT,
  f_dir TEXT,
  protection TEXT,
  p_dir TEXT,
  r_str TEXT,
  p_str TEXT,
  
  -- Preferences
  pref_down TEXT,
  pref_dis TEXT,
  pref_hash TEXT,
  pref_cov TEXT,
  pref_front TEXT,
  
  -- Tags
  ftag1 TEXT,
  ftag2 TEXT,
  p_tag1 TEXT,
  p_tag2 TEXT,
  
  -- Additional data
  back_align TEXT,
  shift TEXT,
  motion TEXT,
  key_player1 TEXT,
  key_player2 TEXT,
  check_into TEXT,
  notes TEXT,
  
  -- Performance metrics
  confidence_base INTEGER DEFAULT 70,
  times_called INTEGER DEFAULT 0,
  times_successful INTEGER DEFAULT 0,
  
  -- Diagram fields (added Oct 12, 2025)
  diagram_data JSONB,              -- Structured diagram document (v2+)
  diagram_version INTEGER,         -- Format version for migrations
  diagram_url TEXT,                -- PNG thumbnail URL
  
  -- Metadata
  created_by TEXT NOT NULL DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT false
);

-- Indexes for diagram queries
CREATE INDEX idx_plays_diagram_data ON plays USING GIN (diagram_data);
CREATE INDEX idx_plays_diagram_players ON plays USING GIN ((diagram_data->'players'));
CREATE INDEX idx_plays_diagram_version ON plays (diagram_version);
```

---

### **Step 4: Test Diagram Save**

After applying migration, test immediately:

1. **Open DiagramEditor** in browser
2. **Create a new play** with diagram
3. **Check browser console** for errors
4. **Verify in Supabase Dashboard**:
   ```sql
   SELECT id, play_name, 
          diagram_data IS NOT NULL as has_diagram,
          diagram_version,
          jsonb_array_length(diagram_data->'players') as player_count
   FROM plays
   WHERE diagram_data IS NOT NULL
   LIMIT 5;
   ```

**Expected Result**: Should see plays with `has_diagram = true` and valid player counts

---

## 📋 Secondary Issues (After Critical Fix)

### **Issue 2: diagram-canvas Component** (Not Critical)

**Status**: May still exist but unused

**Action**: Archive if not being used

```bash
# Check if diagram-canvas is imported anywhere
grep -r "diagram-canvas" src/ --exclude-dir=node_modules

# If no results, safe to archive:
mkdir -p archive/deprecated/diagram-canvas-svg-20251012
mv src/components/playbook/diagram-canvas archive/deprecated/diagram-canvas-svg-20251012/
```

**Priority**: P2 (can wait until after critical fix)

---

### **Issue 3: Update Refactoring Plan Document**

The `PLAYBOOK_DIAGRAM_REFACTOR_PLAN_OCT12_2025.md` document is **outdated** and lists issues that are already fixed.

**Action**: Update to reflect actual current state:

- ✅ Phase 1: Database & Types - COMPLETE (after Step 2 above)
- ✅ Phase 2: Service Layer - COMPLETE (already done)
- ⏳ Phase 3: Testing & Cleanup - IN PROGRESS

**Priority**: P3 (documentation cleanup)

---

## ✅ Success Criteria

After completing fixes, you should have:

- [x] Database columns: `diagram_data`, `diagram_version`, `diagram_url` exist
- [x] GIN indexes created for fast JSONB queries
- [x] DiagramEditor can save diagrams without errors
- [x] Saved diagrams visible in Supabase Dashboard
- [x] schema.sql file matches actual database structure
- [x] No TypeScript errors when saving diagrams

---

## 🚀 Quick Start Checklist

1. [ ] Run Step 1 query to check current database state
2. [ ] If columns missing, run Step 2 migration in Supabase
3. [ ] Update schema.sql file (Step 3)
4. [ ] Test diagram save in browser (Step 4)
5. [ ] Import 100 plays via CSV (original plan)
6. [ ] Add diagrams to 5-10 plays for testing
7. [ ] Verify autosave works (2.5s debounce)

---

## 📞 Need Help?

**If migration fails:**
- Check Supabase logs for errors
- Verify you have admin access to database
- Check if any plays table triggers/policies are blocking

**If tests fail:**
- Check browser console for specific errors
- Verify network tab shows successful POST to Supabase
- Check Supabase auth is working

---

**Ready to fix?** Start with Step 1 above! 🚀
