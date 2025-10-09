# Diagram Editor Database Setup

## ✅ Migrations Created

I've created two new Supabase migrations for storing diagram data:

1. **`20251009135555_add_diagram_data_to_plays.sql`** - Adds the `diagram_data` column to the plays table
2. **`20251009135600_add_diagram_helper_functions.sql`** - Adds helper functions for diagram operations

## 📋 What Was Added

### New Column: `diagram_data`

- **Type**: `JSONB`
- **Purpose**: Stores the complete Pixi.js diagram editor state
- **Indexed**: Yes (GIN index for fast queries)

### Helper Functions

1. **`update_play_diagram(play_id, diagram_data)`** - Updates diagram and tracks modification timestamp
2. **`get_play_with_diagram(play_id)`** - Retrieves play with diagram data
3. **`count_diagram_players(diagram_data)`** - Returns number of players in a diagram

## 🚀 How to Apply Migrations

### Option 1: Remote Database (Recommended)

```bash
cd /Users/justindepierro/Documents/boxcall
supabase db push
```

### Option 2: Local Database

```bash
cd /Users/justindepierro/Documents/boxcall
supabase start
supabase db reset
```

### Option 3: Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Copy and paste the contents of both migration files
5. Run them in order

## 📊 Diagram Data Structure

The `diagram_data` column stores data in this format:

```json
{
  "version": 2,
  "players": [
    {
      "id": "player-123",
      "x": 26.666,
      "y": 25.5,
      "jerseyNumber": "QB",
      "team": "offense",
      "position": "center"
    }
  ],
  "meta": {
    "createdAt": 1728480000000,
    "updatedAt": 1728480000000,
    "fieldPosition": "midfield",
    "colorMode": "jade"
  }
}
```

## 🔗 Integration with DiagramEditor

The `DiagramEditor` component is already set up to save this data. When you implement the database save:

```typescript
const performSave = async (name: string) => {
  const diagramData: DiagramDocument = {
    version: 2,
    players,
    meta: {
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  };

  // Call Supabase
  const { data, error } = await supabase.from("plays").upsert({
    play_name: name,
    formation: "Spread", // or detect from players
    p_type: "Pass", // user would select this
    diagram_data: diagramData,
  });

  if (!error) {
    setIsDirty(false);
    console.log("✅ Play saved!", data);
  }
};
```

## 📝 Example Queries

### Save a new play with diagram

```sql
INSERT INTO plays (play_name, formation, p_type, diagram_data)
VALUES (
  'Spider 2 Y Banana',
  'Shotgun',
  'Pass',
  '{"version":2,"players":[...],"meta":{...}}'::jsonb
);
```

### Update diagram for existing play

```sql
SELECT update_play_diagram(
  'play-id-uuid',
  '{"version":2,"players":[...],"meta":{...}}'::jsonb
);
```

### Get play with diagram

```sql
SELECT * FROM get_play_with_diagram('play-id-uuid');
```

### Count players in a diagram

```sql
SELECT
  play_name,
  count_diagram_players(diagram_data) as player_count
FROM plays
WHERE diagram_data IS NOT NULL;
```

## ✨ Next Steps

1. **Apply migrations** using one of the options above
2. **Update the `performSave` function** in `DiagramEditor.tsx` to call Supabase
3. **Add load functionality** to populate the editor from saved diagrams
4. **Add play browser** to list and load saved plays

## 🎯 Features Enabled

Once migrations are applied, you'll be able to:

- ✅ Save play diagrams to database
- ✅ Load saved plays into the editor
- ✅ Track when diagrams were created/modified
- ✅ Query plays by number of players
- ✅ Store complete formation data (positions, jersey numbers, etc.)
