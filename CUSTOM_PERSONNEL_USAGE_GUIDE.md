# How to Use Custom Personnel in Play Cards

## Current Situation

Your play currently shows "11 Personnel" because that's what's stored in the database for that play. The system is **already set up** to use your custom personnel configurations!

## How It Works

### 1. Personnel Field on Play Card

When you click on the "Personnel" field in a play card, you get an inline editor with **autocomplete suggestions** from your custom personnel configurations.

The suggestions come from your Personnel Configuration modal (the ones you can customize badges for).

### 2. Steps to Change Personnel on a Play

#### Option A: Click to Edit (Inline)

```
1. Click on the "11 Personnel" badge/text in your play card
2. A dropdown appears with your custom personnel names
3. Select one (or type a new one)
4. Press Enter or click away to save
```

#### Option B: Type-Ahead

```
1. Click on the "11 Personnel" field
2. Start typing your custom personnel name
3. Suggestions appear as you type
4. Select from dropdown or finish typing
5. Press Enter to save
```

### 3. Where Personnel Badges Show

Once you change the personnel field to match one of your custom configurations:

✅ **The badge will automatically appear with your custom styling!**

The badge shows in:

- Play card (collapsed/expanded view)
- List view header
- Tile view header

### 4. Creating Custom Personnel

To create new personnel that will show up in the dropdown:

```
1. Click "Personnel Configurations" button (or similar)
2. Click "Add Personnel Configuration"
3. Name it (e.g., "Spread", "Bunch", "I-Form")
4. Configure the players
5. Click "Customize Badge" (optional)
6. Pick style, color, font
7. Click "Save Badge"
8. Click "Save and Close"
```

Now that personnel name will appear in the dropdown for ALL plays!

## Example Flow

### Before:

```
Play: "Twins Lt Same Power Read Rt"
Personnel: "11 Personnel" (green badge)
```

### After Creating "Spread" Personnel:

```
1. Open Personnel Configurations modal
2. Create "Spread" personnel (1 QB, 1 RB, 4 WR)
3. Customize badge: Shiny style, Purple color
4. Save and close

5. Go back to play
6. Click on "11 Personnel" field
7. Select "Spread" from dropdown
8. Badge changes to purple shiny "Spread" badge! ✨
```

## Current System Status

### ✅ Already Working:

- Personnel suggestions from custom configurations
- Badge customization system
- Badge rendering in play cards
- Autocomplete dropdown
- Database persistence

### 🎯 What You Need to Do:

1. **Create your custom personnel configurations** (if you haven't already)
2. **Update your plays** to use the new personnel names
   - Just click the personnel field and select from dropdown
   - Or type the exact name you created

## Quick Test

1. Open "Personnel Configurations"
2. Check what custom personnel you have created
3. Remember the exact name (e.g., "Pro Set", "Spread", etc.)
4. Go to your play with "11 Personnel"
5. Click the "11 Personnel" field
6. Type or select your custom personnel name
7. The custom badge should appear!

## Troubleshooting

### "I don't see my personnel in the dropdown"

- Make sure you saved the personnel configuration
- Check that the name is not empty
- Refresh the page to ensure data is loaded

### "The badge doesn't change"

- Make sure the play's personnel field **exactly matches** the personnel configuration name
- Check spelling and capitalization
- If you named it "Spread", the play must say "Spread" (not "spread" or "SPREAD")

### "I want to bulk update all plays"

- Currently need to update each play individually
- Future enhancement: Bulk update tool

## Database Schema

Your play stores the personnel as a simple string:

```typescript
play.personnel = "Spread"; // or "Pro Set", "11 Personnel", etc.
```

The system looks up this name in your personnel configurations and:

1. Shows the matching badge if found
2. Uses the custom badge styling if configured
3. Falls back to default badge if no match

## Next Steps

You're all set! The system is ready. Just:

1. Create your personnel configurations with custom badges
2. Update your plays to use those personnel names
3. Enjoy your custom badges on every play! 🎉
