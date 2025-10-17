# Quick Guide: Update Play to Use Custom Personnel Badge

## What You're Seeing Now

```
┌─────────────────────────────────────┐
│ Twins Lt Same Power Read Rt         │
│ ┌──────────────┐                    │
│ │ 11 Personnel │ ← This is hardcoded│
│ └──────────────┘                    │
│ Formation: Base                     │
│ Personnel: 11 Personnel             │
│ Direction: Rt                       │
└─────────────────────────────────────┘
```

## What You Want

```
┌─────────────────────────────────────┐
│ Twins Lt Same Power Read Rt         │
│ ┌─────┐                             │
│ │ Pro │ ← Custom badge with shiny   │
│ └─────┘    purple styling!          │
│ Formation: Base                     │
│ Personnel: Pro Set                  │
│ Direction: Rt                       │
└─────────────────────────────────────┘
```

## 3-Step Process

### Step 1: Create Your Custom Personnel (One Time Setup)

1. **Find the Personnel Configurations button** in your playbook
   - Usually in top toolbar or settings
2. **Click "Add Personnel Configuration"**

3. **Name it something meaningful:**
   - "Pro Set" (traditional 2-back)
   - "Spread" (empty backfield, 4-5 WR)
   - "I-Form" (FB + RB)
   - "Bunch" (3 WR bunched)
   - etc.

4. **Configure the players:**
   - QB (locked at position 0)
   - RB, TE, WR positions
   - Labels (Q, R, T, X, Y, Z, etc.)

5. **Customize the badge (OPTIONAL):**
   - Click "Customize Badge"
   - Pick style: Solid, Border, Gradient, or Shiny
   - Pick color: Electric Blue, Crimson Red, etc.
   - Pick font: Default, Mono, or Serif
   - Click "Save Badge"

6. **Click "Save and Close"**

### Step 2: Update Your Play

1. **Find the personnel field** in your play card (shows "11 Personnel" now)
2. **Click on it** - it should become editable with a dropdown

3. **Either:**
   - **Type the name** you created (e.g., "Pro Set")
   - **Select from dropdown** that shows your custom personnel

4. **Press Enter** or click away to save

### Step 3: Enjoy!

The badge will automatically update with your custom styling! ✨

## Visual Example

### Creating "Spread" Personnel:

```
Personnel Configuration Modal
┌───────────────────────────────────────┐
│ Name: [Spread________________]        │
│                                       │
│ Players:                              │
│ • Q (QB) - locked                     │
│ • R (RB)                              │
│ • X (WR)                              │
│ • Y (WR)                              │
│ • Z (WR)                              │
│ • H (WR)                              │
│                                       │
│ [Customize Badge ▼]                   │
│ ┌─────────────────────────────────┐  │
│ │ Style: [Shiny]                  │  │
│ │ Color: [Purple]                 │  │
│ │ Font: [Default]                 │  │
│ │ Preview: [Spread] ✨            │  │
│ │              [Save Badge]       │  │
│ └─────────────────────────────────┘  │
│                                       │
│ [Cancel]           [Save and Close]   │
└───────────────────────────────────────┘
```

### Editing Play:

```
Play Card - BEFORE
┌────────────────────────────────┐
│ Personnel: │11 Personnel│  ←── Click here!
└────────────────────────────────┘

Play Card - EDITING
┌────────────────────────────────┐
│ Personnel: [Spread________▼] │
│            ┌──────────────┐   │
│            │ Spread       │   │ ← Dropdown appears
│            │ Pro Set      │   │   with your custom
│            │ I-Form       │   │   personnel
│            │ 11 Personnel │   │
│            └──────────────┘   │
└────────────────────────────────┘

Play Card - AFTER
┌────────────────────────────────┐
│ Personnel: [Spread] ✨         │ ← Custom shiny purple badge!
└────────────────────────────────┘
```

## Important Notes

### ✅ DO:

- Use consistent naming (e.g., always "Spread", not sometimes "spread")
- Create personnel configurations BEFORE updating plays
- Make badge names SHORT (2-5 characters display best)

### ❌ DON'T:

- Mix capitalization (pick one style)
- Use really long names (they might get cut off in badge)
- Delete a personnel config that plays are using (they'll show default badge)

## Troubleshooting

### "I click on 11 Personnel but nothing happens"

- Make sure you're clicking on the **"Personnel"** field/row, not just the badge
- Look for the row that says "Personnel" in the play details section

### "I don't see a dropdown"

- The suggestions might be empty
- Make sure you've created at least one personnel configuration
- Refresh the page to load latest configurations

### "The badge doesn't match my customization"

- Check that the play's personnel name **exactly matches** your configuration name
- "Spread" ≠ "spread" ≠ "SPREAD" (case sensitive)
- Check for extra spaces

### "Where is the Personnel Configurations button?"

- Look in:
  - Top toolbar (hamburger menu or settings)
  - Playbook settings
  - Or search documentation for "Personnel Configuration Modal"

## System is Ready! 🎉

The code is all in place. You just need to:

1. ✅ Create your custom personnel (with badges if you want)
2. ✅ Click the personnel field on your plays
3. ✅ Select your custom personnel from the dropdown
4. ✅ Watch the custom badge appear!

That's it! No code changes needed - just use the UI!
