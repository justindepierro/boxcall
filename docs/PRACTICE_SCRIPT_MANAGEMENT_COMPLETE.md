# Practice Script Management Complete!

## ✅ What's Working Now

### 1. **View Saved Scripts**

- Navigate to **Playbook → Practice Scripts** section
- See list of all your saved practice scripts
- Shows: name, play count, total reps, last updated date
- Each script card displays key metadata

### 2. **Edit Scripts**

- Click the **Edit button** (pencil icon) on any script card
- Modal opens with all plays and their scenarios
- Modify:
  - Script name & description
  - Play scenarios (hash, down/distance, field position, etc.)
  - Repetitions for each play
  - Drag & drop to reorder plays
- Click **Save Script** to persist changes

### 3. **Export to PDF** 📄

- Click the **Download button** (download icon) on any script card
- Generates professional PDF with:
  - **Script name** & creation date
  - **Play list** with:
    - Play name & formation
    - Repetitions
    - **Game scenarios** (hash, down/distance, field position, defensive front, coverage, blitz)
    - Coaching notes
  - **Summary stats** (total plays, total reps, average reps per play)
- PDF automatically downloads to your computer
- Printer-friendly format for practice sessions

### 4. **Delete Scripts**

- Click the **Delete button** (trash icon) on any script card
- Confirmation prompt: "Are you sure you want to delete?"
- Permanently removes script and all associated plays

### 5. **Duplicate Scripts**

- Click the **Copy button** (copy icon) on any script card
- Creates a copy of the script with all plays/scenarios
- Useful for creating variations (e.g., "vs Cover 2" → "vs Cover 3")

## 🎯 How to Use

### View Your Scripts:

1. Go to **Playbook** page
2. Click **Practice Scripts** tab (icon with clipboard)
3. See your script: "Practice Scripts (1)" showing 7 plays, 2h duration

### Edit a Script:

1. Click the **Edit** button (pencil icon)
2. Modal opens with all 7 plays
3. Each play shows:
   - Repetitions stepper (1-20)
   - 6 scenario dropdowns (hash, down/distance, field position, front, coverage, blitz)
4. Make changes
5. Click **Save Script**
6. Modal closes, list refreshes

### Export to PDF:

1. Click the **Download** button on your script card
2. PDF generates and downloads automatically
3. Open PDF to see:

   ```
   [Script Name]
   Created: October 18, 2025

   Practice Script
   1. Twins L - Smaug
      5 reps
      Formation: Twins • Type: Pass
      Hash: middle • Down: 1st & 10 • Field: plus_territory •
      Front: base • Coverage: cover_2 • Blitz: none

   2. Trips R - Slice (R)
      5 reps
      ...

   Practice Summary
   Total Plays: 7
   Total Repetitions: 35
   Average Reps per Play: 5
   ```

## 📋 Features Included

- ✅ List view with script cards
- ✅ Edit functionality (reuses PracticeScriptBuilder)
- ✅ PDF export with scenario details
- ✅ Delete with confirmation
- ✅ Duplicate script capability
- ✅ Real-time updates (list refreshes after save/delete)
- ✅ Loading states & error handling
- ✅ Responsive design (mobile + desktop)
- ✅ Empty state (prompts to create first script)

## 🔄 Workflow Integration

```
Create Script → Configure Scenarios → Save
         ↓
    View in List
         ↓
    Edit | Export PDF | Duplicate | Delete
```

## 📄 PDF Format

The exported PDF includes:

- **Header**: Script name, description, creation date, tags
- **Play List**: Each play with:
  - Number & name
  - Repetitions
  - Formation & play type
  - **Scenario details** (hash/down/field/front/coverage/blitz)
  - Coaching notes
- **Summary**: Total plays, reps, averages

Perfect for:

- Printing for practice sessions
- Sharing with assistant coaches
- Team handouts
- Practice planning meetings

## 🎉 Complete Feature Set

You now have a fully functional practice script management system:

1. **Create** scripts from selected plays
2. **Configure** game scenarios for each play
3. **Save** to database with all scenario data
4. **View** list of all scripts
5. **Edit** existing scripts
6. **Export** to printer-friendly PDF
7. **Duplicate** scripts for variations
8. **Delete** scripts with confirmation

The PDF export is **scenario-focused** (not time-based) and shows realistic game situations for each play! 🏈
