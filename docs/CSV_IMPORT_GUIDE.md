# BoxCall CSV Play Import Guide

## Overview

Import multiple plays at once using CSV files. BoxCall supports flexible column naming and intelligent field detection.

## Quick Start

1. Download the template: `/public/BoxCall_Play_Import_Template.csv`
2. Fill in your plays (one per row)
3. Go to Playbook page → Import CSV
4. Upload your file

## Templates Available

### Simple Template (`BoxCall_Play_Import_Template.csv`)

Basic columns for quick play entry:

- **formation**: Formation name (e.g., "Twins", "I-Formation", "Shotgun")
- **play_name**: Play name (e.g., "QB Shirt", "Power", "Four Verts")
- **p_type**: Play type (e.g., "RPO", "Pass", "Run", "Screen", "Play Action")
- **personnel**: Personnel grouping (e.g., "11", "12", "21", "10")
- **one_word_play**: One-word call/audible (e.g., "TANGO", "POWER", "VERTS")

### Full Template (`BoxCall_Play_Import_Template_Full.csv`)

All available columns for complete play details.

## Column Reference

### Core Required Fields (Minimum)

| Column      | Description    | Examples                                    |
| ----------- | -------------- | ------------------------------------------- |
| `formation` | Formation name | Twins, I-Formation, Shotgun, Pistol, Empty  |
| `play_name` | Play name      | QB Shirt, Power, Four Verts, Mesh Cross     |
| `p_type`    | Play type      | Pass, Run, RPO, Screen, Play Action, Option |

### Formation Details

| Column       | Description         | Examples                                          |
| ------------ | ------------------- | ------------------------------------------------- |
| `personnel`  | Personnel grouping  | 11 (1 RB, 1 TE), 12 (1 RB, 2 TE), 21 (2 RB, 1 TE) |
| `f_type`     | Formation type      | Twins, Trips, Doubles, Empty                      |
| `f_dir`      | Formation direction | Left, Right, Balanced                             |
| `ftag1`      | Formation tag 1     | Open, Closed, Tight                               |
| `ftag2`      | Formation tag 2     | Stack, Nasty, Bunch                               |
| `back_align` | Backfield alignment | Pro I, Offset, Pistol, Empty                      |
| `shift`      | Formation shift     | Trey to Deuce, Twins to Trips                     |
| `motion`     | Pre-snap motion     | Y Orbit, Z Jet, H Cross, Fly                      |

### Play Details

| Column          | Description      | Examples                  |
| --------------- | ---------------- | ------------------------- |
| `one_word_play` | One-word audible | TANGO, POWER, VERTS, MESH |
| `p_dir`         | Play direction   | Left, Right, Middle       |
| `p_tag1`        | Play tag 1       | Quick, Iso, Lead          |
| `p_tag2`        | Play tag 2       | Boot, Rollout, Sprint     |

### Protection & Blocking

| Column       | Description            | Examples                          |
| ------------ | ---------------------- | --------------------------------- |
| `protection` | Pass protection scheme | BOB, Slide, Man, Max, Half Slide  |
| `p_str`      | Protection strength    | Left, Right, Middle, Strong, Weak |
| `r_str`      | Route/Run strength     | Left, Right, Middle, Strong, Weak |

### Key Players & Alignments

| Column        | Description          | Examples                  |
| ------------- | -------------------- | ------------------------- |
| `key_player1` | Primary key player   | QB, RB, X, Y, Z, H        |
| `key_player2` | Secondary key player | FB, TE, Slot              |
| `h_align`     | H receiver alignment | Slot, Wing, Nasty, Off    |
| `z_align`     | Z receiver alignment | Wide, Tight, Slot         |
| `back_route`  | Running back route   | Wheel, Flat, Swing, Angle |
| `check_into`  | Check/hot route      | Hot, Slant, Fade          |

### Situational Preferences

| Column       | Description           | Examples                                     |
| ------------ | --------------------- | -------------------------------------------- |
| `pref_down`  | Preferred down        | 1st & 10, 2nd & Short, 3rd & Long, Goal Line |
| `pref_dis`   | Preferred distance    | 1-3, 4-7, 8-12, 10+, Short, Medium, Long     |
| `pref_hash`  | Preferred hash        | Left, Right, Middle, Strong, Weak            |
| `pref_cov`   | Preferred vs coverage | Cover 2, Cover 3, Man, Zone                  |
| `pref_front` | Preferred vs front    | Base, Nickel, Dime, Bear                     |
| `pref_blitz` | Preferred vs blitz    | Yes, No, Any                                 |

### Analytics & Metadata

| Column            | Description          | Examples                                 |
| ----------------- | -------------------- | ---------------------------------------- |
| `confidence_base` | Base confidence %    | 0-100 (default: 70)                      |
| `tags`            | Comma-separated tags | "quick,rpo,read" or "power,run,physical" |
| `notes`           | General notes        | Any text description                     |

Note: Usage/success statistics are derived from live execution tracking (`play_executions`) and are not importable via CSV.

## Column Name Flexibility

BoxCall intelligently detects column names. These variations are all recognized:

### Formation

- `formation`, `form`, `format`, `alignment`, `formation_name`

### Play Name

- `play_name`, `play name`, `playname`, `name`, `play`, `title`

### Play Type

- `p_type`, `play_type`, `type`, `category`, `playtype`

### Personnel

- `personnel`, `package`, `grouping`, `personnel group`

### One Word Play

- `one_word_play`, `audible`, `call`, `quick_call`, `signal`, `code`

_See `src/services/csv/CSVColumnMapper.ts` for complete list of recognized variations._

## Import Process

1. **Navigate**: Go to Playbook page
2. **Click**: "Import CSV" button
3. **Upload**: Select your CSV file
4. **Review**: Check detected plays and any validation warnings
5. **Import**: Confirm to add plays to your playbook

## Tips & Best Practices

### Required Fields Only

At minimum, provide:

```csv
formation,play_name,p_type
Twins,QB Shirt,RPO
I-Formation,Power,Run
```

### Add Personnel & Calls

For better organization:

```csv
formation,play_name,p_type,personnel,one_word_play
Twins,QB Shirt,RPO,11,TANGO
I-Formation,Power,Run,21,POWER
```

### Full Detail

Use all columns for complete play documentation:

```csv
formation,play_name,p_type,personnel,one_word_play,motion,protection,pref_down,tags,notes
Twins,QB Shirt,RPO,11,TANGO,Y Orbit,BOB,1st & 10,"quick,rpo","Quick RPO with orbit motion"
```

### Tag Usage

Separate multiple tags with commas:

```
tags
"quick,rpo,read"
"power,run,physical"
"vertical,pass,air"
```

### Quotes for Commas

Use quotes if your text contains commas:

```csv
notes
"Quick RPO play, read the defensive end, if he crashes hand off"
"Power run to strong side, pulling guard leads through hole"
```

## Common Issues

### Missing Required Fields

**Error**: "Missing required column: formation"
**Fix**: Ensure your CSV has `formation`, `play_name`, and `p_type` columns

### Duplicate Plays

**Warning**: Plays with same formation + play_name will be flagged
**Fix**: Either update existing play or change the name

### Invalid Personnel

**Error**: Invalid personnel format
**Fix**: Use standard formats: 11, 12, 21, 22, 10, 01, 20, 02

### Empty Rows

**Warning**: Empty rows will be skipped
**Fix**: Remove blank rows from your CSV

## Export Reference

To see your current playbook format:

1. Go to Playbook page
2. Click "Export" → "Export CSV"
3. Use exported file as template

## Technical Details

- **File Format**: UTF-8 encoded CSV
- **Max File Size**: 10MB
- **Max Plays**: 1000 per import
- **Validation**: Real-time fuzzy matching and suggestions
- **Duplicate Detection**: Automatic checking for existing plays

## Support

For issues or questions:

- Check validation messages during import
- Review console logs for detailed errors
- See `docs/features/playbook/` for more documentation
