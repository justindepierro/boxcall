# Play Field Mapping Reference

> Complete mapping of play data fields across UI, form state, API, and database layers.

**Last Updated**: December 29, 2025

---

## Quick Reference

| UI Label | Form State (camelCase) | API/Service (snake_case) | Database Column | Type | Notes |
|----------|------------------------|--------------------------|-----------------|------|-------|
| Formation | `formation` | `formation` | `formation` | varchar(50) | **Required** |
| Play Name | `playName` | `play_name` | `play_name` | varchar(200) | **Required** |
| Play Type | `playType` | `p_type` | `p_type` | varchar(50) | e.g., "Run", "Pass" |
| Personnel | `personnel` | `personnel` | `personnel` | varchar(50) | e.g., "11", "12", "21" |

---

## Formation Fields

| UI Label | Form State | Database | Type | Valid Values |
|----------|------------|----------|------|--------------|
| Formation Type | `formationType` | `f_type` | varchar(50) | "Shotgun", "Under Center", etc. |
| Formation Direction | `formationDir` | `f_dir` | varchar(20) | `L`, `R`, `Left`, `Right` |
| Direction Token | `formation_direction` | `formation_direction` | varchar(20) | `base`, `left`, `right` |
| Back Alignment | `backAlign` | `back_align` | varchar(50) | Free text |
| Back Left of QB | `backLeftOfQb` | `back_left_of_qb` | boolean | true/false |
| Back Right of QB | `backRightOfQb` | `back_right_of_qb` | boolean | true/false |
| Shift | `shift` | `shift` | varchar(100) | Free text |
| Motion | `motion` | `motion` | varchar(100) | Free text |
| Formation Tag 1 | `formationTags[0]` | `ftag1` | varchar(50) | Parsed from comma-separated |
| Formation Tag 2 | `formationTags[1]` | `ftag2` | varchar(50) | Parsed from comma-separated |
| Run Strength | `runStrength` | `r_str` | varchar(20) | Free text |
| Pass Strength | `passStrength` | `p_str` | varchar(20) | Free text |

---

## Play Detail Fields

| UI Label | Form State | Database | Type | Notes |
|----------|------------|----------|------|-------|
| Play Direction | `playDir` | `p_dir` | varchar(20) | `L`, `R`, `Left`, `Right` |
| Protection | `protection` | `protection` | varchar(100) | Protection scheme name |
| Check Into | `checkInto` | `check_into` | varchar(100) | Audible/check name |
| Play Tag 1 | `playTags[0]` | `p_tag1` | varchar(50) | Parsed from comma-separated |
| Play Tag 2 | `playTags[1]` | `p_tag2` | varchar(50) | Parsed from comma-separated |
| One Word Play | `oneWordPlay` | `one_word_play` | varchar(50) | Quick call name |
| Wristband # | `wristbandNumber` | `wristband_number` | varchar(20) | Wristband reference |

---

## Game Situation Preferences

| UI Label | Form State | Database | Type | Notes |
|----------|------------|----------|------|-------|
| Preferred Down | `prefDown` | `pref_down` | varchar(20) | "1st", "2nd", "3rd", "4th" |
| Preferred Distance | `prefDistance` | `pref_dis` | varchar(20) | "Short", "Medium", "Long" |
| Preferred Hash | `prefHash` | `pref_hash` | varchar(20) | "Left", "Right", "Middle" |
| Preferred Coverage | `prefCoverage` | `pref_cov` | varchar(50) | Coverage type |
| Preferred Front | `prefFront` | `pref_front` | varchar(50) | Defensive front |
| Field Position | `prefFieldPos` | `pref_field_pos` | varchar(50) | Must match Team Settings |
| Game Situation | `prefSituation` | `pref_situation` | varchar(100) | Must match Team Settings |

---

## Array Fields

| UI Label | Form State | Database | Type | Max Items |
|----------|------------|----------|------|-----------|
| Tags | `tags` | `tags` | text[] | 20 |
| Key Players | `key_players` | `key_players` | text[] | 22 |
| Key Positions | `key_positions` | `key_positions` | text[] | 22 |
| Flags | `flags` | `flags` | text[] | 10 |

---

## Key Player Legacy Fields

| Form State | Database | Type | Notes |
|------------|----------|------|-------|
| - | `key_player1` | varchar(50) | Legacy - use `key_players` array |
| - | `key_player2` | varchar(50) | Legacy - use `key_players` array |

---

## Diagram Fields

| Form State | Database | Type | Notes |
|------------|----------|------|-------|
| `diagram_image_url` | `diagram_image_url` | varchar(500) | Coach-uploaded image URL |
| - | `diagram_url` | varchar(500) | Legacy/deprecated |
| - | `diagram_data` | jsonb | Structured diagram data |
| - | `diagram_version` | integer | Diagram schema version |
| - | `has_diagram` | boolean | Whether play has diagram |

---

## Performance & Tracking Fields

| Form State | Database | Type | Notes |
|------------|----------|------|-------|
| `confidence` | `confidence_base` | integer | 0-100, default 70 |
| - | `confidence_level` | integer | 0-100, calculated |
| - | `complexity_score` | integer | 1-10, default 1 |
| - | `times_called` | integer | From play_executions |
| - | `times_successful` | integer | From play_executions |

---

## Metadata Fields (Server-Generated)

| Database | Type | Notes |
|----------|------|-------|
| `id` | uuid | Primary key |
| `playbook_id` | uuid | Foreign key to playbooks |
| `created_by` | uuid | User who created |
| `created_at` | timestamptz | Auto-generated |
| `updated_at` | timestamptz | Auto-updated |
| `is_archived` | boolean | Soft delete flag |
| `duplicate_key` | varchar | Uniqueness constraint |
| `formation_id` | uuid | FK to formations table |
| `personnel_id` | uuid | FK to personnel table |

---

## Direction Value Mapping

The system supports multiple direction formats that map to canonical values:

```
Input Values       →  Legacy (f_dir)  →  Token (formation_direction)
─────────────────────────────────────────────────────────────────────
"L", "Left", "left"       →  "Left"         →  "left"
"R", "Right", "right"     →  "Right"        →  "right"
"", undefined, null       →  ""             →  "base"
```

**Important**: Never use `"LEFT"` or `"RIGHT"` (all uppercase) - validation will fail.

---

## Field Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    AddNewPlayModal.tsx                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ usePlayFormState (camelCase)                              │  │
│  │   • formation, playName, playType, formationDir...        │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────────┘
                          │ handleSubmit() converts to snake_case
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    useOptimisticPlays.ts                        │
│   • Adds optimistic entry with temp ID                          │
│   • Shows instant toast feedback                                │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│               SecurePlaysService.createPlay()                   │
│   • Rate limiting                                               │
│   • Zod validation (PlayCreateSchema)                           │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  PlaysService.createPlay()                      │
│   • buildNewPlayData() - ensures all fields present             │
│   • Supabase INSERT                                             │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Database (plays)                           │
│   • RLS policies check team membership                          │
│   • Triggers update play_count on playbooks                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Common Issues

### 1. Field Not Saving

**Symptom**: Field saves but comes back as `undefined` when fetched.

**Cause**: Field missing from `PLAY_SELECT_FIELDS` in `usePlaybookData.ts`.

**Fix**: Add field to both:
- `PLAY_SELECT_FIELDS` string
- `DatabasePlay` interface

### 2. Validation Error on Direction

**Symptom**: "Formation direction must be L, R, Left, Right, left, or right"

**Cause**: Using `"LEFT"` or `"RIGHT"` (uppercase).

**Fix**: Use `leftRightToLegacyValue()` from `utils/leftRight.ts`.

### 3. Max Length Exceeded

**Symptom**: "Play name too long"

**Fix**: Ensure max length is 200 characters (not 100).
