# Badge Customization Not Saving - FIX APPLIED

## Root Cause

The database stores `badge_customization` in **snake_case**, but our TypeScript code uses **camelCase** (`badgeCustomization`). Supabase was returning the snake_case field from the database, but we weren't converting it to camelCase when reading data.

## The Problem

```typescript
// ❌ BEFORE - Using spread operator
return configs.map((config) => ({
  ...config,  // This includes badge_customization (snake_case)
  players: playersByConfig[config.id] || [],
}));

// Our TypeScript expects:
interface PersonnelConfiguration {
  badgeCustomization?: BadgeCustomization; // camelCase
}

// But database returns:
{
  badge_customization: {...}  // snake_case
}
```

When we spread `...config`, we got `badge_customization` but our code looked for `badgeCustomization`, so it appeared as `undefined`.

## The Solution

Explicitly map all fields and convert snake_case to camelCase:

```typescript
// ✅ AFTER - Explicit field mapping
return configs.map((config) => ({
  id: config.id,
  playbook_id: config.playbook_id,
  name: config.name,
  description: config.description,
  created_at: config.created_at,
  updated_at: config.updated_at,
  badgeCustomization: config.badge_customization, // ← Convert!
  players: playersByConfig[config.id] || [],
}));
```

## Changes Made

### File: `src/services/personnelService.ts`

**1. getAllPersonnelConfigurations (lines 72-80):**

```typescript
// Convert snake_case to camelCase
return configs.map((config) => ({
  id: config.id,
  playbook_id: config.playbook_id,
  name: config.name,
  description: config.description,
  created_at: config.created_at,
  updated_at: config.updated_at,
  badgeCustomization: config.badge_customization, // ← KEY FIX
  players: playersByConfig[config.id] || [],
}));
```

**2. getPersonnelConfigurationByName (lines 123-131):**

```typescript
return {
  id: config.id,
  playbook_id: config.playbook_id,
  name: config.name,
  description: config.description,
  created_at: config.created_at,
  updated_at: config.updated_at,
  badgeCustomization: config.badge_customization, // ← KEY FIX
  players: players || [],
};
```

**3. createPersonnelConfiguration (lines 190-198):**

```typescript
return {
  id: newConfig.id,
  playbook_id: newConfig.playbook_id,
  name: newConfig.name,
  description: newConfig.description,
  created_at: newConfig.created_at,
  updated_at: newConfig.updated_at,
  badgeCustomization: newConfig.badge_customization, // ← KEY FIX
  players: players || [],
};
```

**4. updatePersonnelConfiguration (lines 267-275 and 288-296):**

```typescript
// Both return paths now convert snake_case to camelCase
return {
  id: updatedConfig.id,
  playbook_id: updatedConfig.playbook_id,
  name: updatedConfig.name,
  description: updatedConfig.description,
  created_at: updatedConfig.created_at,
  updated_at: updatedConfig.updated_at,
  badgeCustomization: updatedConfig.badge_customization, // ← KEY FIX
  players: players || [],
};
```

## Data Flow (Now Fixed)

```
1. User customizes badge → updates local state (camelCase)
   badgeCustomization: { style: "shiny", colorPresetId: "electric-blue" }

2. Click "Save Badge" → closes editor

3. Badge appears in header → reads from badgeCustomization

4. Click "Save and Close" → sends to PersonnelService
   PersonnelService.createPersonnelConfiguration({
     badgeCustomization: { ... }  // camelCase
   })

5. Service converts to snake_case for INSERT
   .insert({
     badge_customization: { ... }  // snake_case for DB
   })

6. Database stores JSONB
   personnel_configurations.badge_customization (JSONB column)

7. Modal reopens → loads from database
   SELECT * FROM personnel_configurations
   Returns: { badge_customization: { ... } }  // snake_case

8. Service converts BACK to camelCase ← THIS WAS MISSING!
   badgeCustomization: config.badge_customization

9. TypeScript interface happy
   ✓ badgeCustomization field exists
   ✓ Badge renders in header
   ✓ Badge persists across sessions
```

## Why This Happened

PostgreSQL uses snake_case naming convention, but JavaScript/TypeScript uses camelCase. We need to explicitly convert between these conventions because:

1. **INSERT/UPDATE**: We were converting camelCase → snake_case ✅
2. **SELECT/READ**: We were NOT converting snake_case → camelCase ❌

The spread operator (`...config`) just passed through the snake_case fields, which didn't match our TypeScript interface.

## Testing

### Before Fix:

```
1. Customize badge → looks good
2. Click "Save Badge" → editor closes, badge shows
3. Click "Save and Close" → saves to DB
4. Reopen modal → badge customization GONE! ❌
```

### After Fix:

```
1. Customize badge → looks good
2. Click "Save Badge" → editor closes, badge shows
3. Click "Save and Close" → saves to DB
4. Reopen modal → badge customization STILL THERE! ✅
```

## Files Modified

- `src/services/personnelService.ts` - Added explicit camelCase conversion in all 4 return statements

## Database Schema (Already Correct)

```sql
-- Column already exists from previous migration
ALTER TABLE personnel_configurations
ADD COLUMN badge_customization JSONB;
```

✅ Database: `badge_customization` (snake_case)  
✅ TypeScript: `badgeCustomization` (camelCase)  
✅ Service: Converts between both ← **THIS WAS THE FIX**

## Note on Type Errors

The TypeScript errors in personnelService.ts are from Supabase's generated schema types being out of date. These are cosmetic only - the actual runtime code now works correctly. To fix the type errors, run:

```bash
npx supabase gen types typescript --project-id lvmuiqwihlpnwppdqqfl > src/types/supabase-schema.ts
```
