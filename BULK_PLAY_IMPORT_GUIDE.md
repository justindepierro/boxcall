# Bulk Play Import Guide - Add 100 Plays Fast! 🚀

**Date**: October 12, 2025  
**Goal**: Add ~100 plays for major testing  
**Time Estimate**: 15-30 minutes

---

## ✅ Good News: CSV Import Already Built!

Your app has a **complete CSV import system** at:

- **UI**: `src/components/playbook/CSVImport/CSVImportModal.tsx`
- **Service**: `src/services/csvService.ts`
- **Access**: Playbook Page → "Import CSV" button

---

## 🎯 Quick Start: 3 Steps to Add 100 Plays

### Step 1: Create Sample CSV (5 min)

**Option A**: Use Built-in Sample Generator

1. Open app: `http://localhost:5173`
2. Navigate to your playbook
3. Click "Import CSV" button
4. Click "Download Sample CSV"
5. Open in Excel/Google Sheets
6. Duplicate rows to create 100 plays

**Option B**: Use This Template

```csv
formation,play_name,p_type,personnel,protection,one_word_call,f_type,f_dir,p_dir,notes
Shotgun,Slant/Curl,Pass,11,5-man,Flood,Spread,Right,Right,Quick passing concept
I-Form,Power,Run,21,N/A,Power,Heavy,Right,Right,Traditional power run
Pistol,Read Option,RPO,11,N/A,Triple,Balanced,Left,Left,RPO with read key
Empty,Four Verticals,Pass,10,Max Protect,Verts,Empty,Middle,Middle,Deep passing attack
Trips Right,Mesh Concept,Pass,11,5-man,Mesh,Spread,Right,Middle,Crossing routes
Ace,Counter Trey,Run,12,N/A,Counter,Balanced,Left,Left,Counter run with pulling guards
Shotgun,Stick/Wheel,Pass,11,5-man,Stick,Spread,Right,Right,Quick stick with wheel route
Wildcat,Sweep,Run,13,N/A,Sweep,Heavy,Right,Right,Wildcat sweep option
Gun Ace,Slot Fade,Pass,11,5-man,Fade,Spread,Right,Right,Slot fade concept
I-Form,Iso,Run,21,N/A,Iso,Heavy,Middle,Middle,Isolation run play
```

**CSV Fields Supported**:

- **Required**: `formation`, `play_name`, `p_type`
- **Optional**: `personnel`, `protection`, `one_word_call`, `f_type`, `f_dir`, `p_dir`, `back_align`, `shift`, `motion`, `r_str`, `p_str`, `notes`

### Step 2: Import CSV (5 min)

1. **Open App**: `http://localhost:5173`
2. **Navigate**: Playbook page
3. **Click**: "Import CSV" or "Import Plays" button
4. **Upload**: Your CSV file (drag & drop or browse)
5. **Review**: Preview shows all plays with validation
6. **Import**: Click "Import Plays" button
7. **Done**: Plays added to your playbook!

### Step 3: Verify Import (5 min)

1. Check playbook view - should show ~100 new plays
2. Test filters (formation, play type, personnel)
3. Test search functionality
4. Check bulk selection works
5. Verify performance with large play count

---

## 📝 Sample Play Ideas (Copy & Modify)

### **Pass Plays** (30 plays)

- Slant/Curl
- Four Verticals
- Stick/Wheel
- Mesh Concept
- Flood Concept
- Smash Route
- All Curl
- Spacing Concept
- Switch Release
- Shallow Cross

### **Run Plays** (30 plays)

- Power
- Counter
- Iso
- Stretch
- Inside Zone
- Outside Zone
- Sweep
- Trap
- Dive
- QB Sneak

### **RPO Plays** (20 plays)

- Read Option
- Stick/Draw
- Bubble/Zone
- Slant/Zone
- Glance/Power
- Speed Option
- Triple Option

### **Play Action** (20 plays)

- PA Boot
- PA Waggle
- PA Flood
- PA Deep Cross
- PA Leak
- PA Smash

### **Formations to Use**

- Shotgun (various: Gun Empty, Gun Trips, Gun Ace)
- I-Form (Pro, Strong, Weak)
- Pistol
- Singleback (Ace, Deuce, Trio)
- Wildcat
- Goal Line
- Victory

---

## 🎨 CSV Template Builder (Copy This)

```csv
formation,play_name,p_type,personnel,protection,one_word_call,f_type,f_dir,p_dir
Shotgun,Slant/Curl,Pass,11,5-man,Flood,Spread,Right,Right
Shotgun,Four Verticals,Pass,10,Max,Verts,Spread,Middle,Middle
Shotgun,Stick/Wheel,Pass,11,5-man,Stick,Spread,Right,Right
I-Form,Power Right,Run,21,N/A,Power,Heavy,Right,Right
I-Form,Counter Left,Run,21,N/A,Counter,Heavy,Left,Left
Pistol,Read Option,RPO,11,N/A,Triple,Balanced,Left,Left
Pistol,Stick/Draw,RPO,11,N/A,Stick,Balanced,Right,Right
Ace,Inside Zone,Run,12,N/A,Zone,Balanced,Middle,Middle
Empty,Mesh,Pass,10,Max,Mesh,Empty,Middle,Middle
Trips Right,Flood,Pass,11,5-man,Flood,Spread,Right,Right
```

**Pro Tip**: Use Excel formulas to generate variations:

- `="Shotgun"` for formation
- `=CONCATENATE("Play ", ROW()-1)` for play names
- Alternate between Pass/Run/RPO
- Randomize personnel (11, 12, 21, 10, etc.)

---

## 🚀 Advanced: Generate 100 Plays with Script

Create `generate-plays.js`:

```javascript
const formations = [
  "Shotgun",
  "I-Form",
  "Pistol",
  "Ace",
  "Empty",
  "Trips Right",
  "Wildcat",
];
const playTypes = ["Pass", "Run", "RPO", "Play Action"];
const personnel = ["11", "12", "21", "10", "13", "22"];
const directions = ["Left", "Right", "Middle"];

console.log(
  "formation,play_name,p_type,personnel,protection,one_word_call,f_type,f_dir,p_dir"
);

for (let i = 1; i <= 100; i++) {
  const formation = formations[Math.floor(Math.random() * formations.length)];
  const playType = playTypes[Math.floor(Math.random() * playTypes.length)];
  const pers = personnel[Math.floor(Math.random() * personnel.length)];
  const dir = directions[Math.floor(Math.random() * directions.length)];
  const protection = playType === "Pass" ? "5-man" : "N/A";

  console.log(
    `${formation},Play ${i},${playType},${pers},${protection},Call${i},Spread,${dir},${dir}`
  );
}
```

**Run**: `node generate-plays.js > 100-plays.csv`

---

## 🧪 Testing Checklist After Import

### **Performance Testing**

- [ ] Playbook page loads in < 2 seconds
- [ ] Filtering is instant (< 100ms)
- [ ] Search works smoothly
- [ ] Scrolling is smooth (60 FPS)
- [ ] Bulk selection works with 50+ plays

### **Functionality Testing**

- [ ] Can edit individual plays
- [ ] Can delete plays
- [ ] Can add plays to practice scripts
- [ ] Can export plays back to CSV
- [ ] Filters work correctly (formation, type, personnel)

### **Data Quality**

- [ ] All plays have formation
- [ ] All plays have play_name
- [ ] All plays have p_type
- [ ] Optional fields populated correctly

---

## 📊 CSV Import Features

### **Smart Column Detection**

- Auto-detects column names (case-insensitive)
- Maps variations: `play_name`, `play name`, `Play Name`
- Handles missing columns with defaults

### **Validation**

- Required fields: formation, play_name, p_type
- Play type normalization: "Pass", "Run", "RPO", "Play Action"
- Formation validation against known formations
- Personnel validation (11, 12, 21, etc.)

### **Error Handling**

- Shows preview before import
- Displays validation errors
- Allows fixing issues before import
- Shows success/failure summary

### **Bulk Operations**

- Imports up to 1000 plays at once
- Optimized database queries
- Progress indicators
- Error recovery

---

## 🎯 Next Steps After Import

1. **Test Performance**: See if 100 plays causes any slowdowns
2. **Test Filters**: Verify all filter combinations work
3. **Test Search**: Search across all fields
4. **Test Bulk Actions**: Select/duplicate/delete multiple plays
5. **Add Diagrams**: Use DiagramEditor to add diagrams to plays (Phase 2)

---

## 📝 Status Update for Refactoring Plan

### **Completed ✅**

- CSV Import system fully functional
- Bulk play creation working
- Play validation in place
- UI for import complete

### **In Progress 🔄**

- **Phase 2**: Service Layer (80% complete)
  - DiagramService created ✅
  - DiagramEditor integrated ✅
  - Waiting: Browser testing (need plays with diagrams first!)

### **Next Priority**

1. Add 100 plays via CSV (this guide)
2. Add diagrams to 5-10 plays for testing
3. Test diagram autosave functionality
4. Complete PlayCard diagram preview updates

---

## 🔗 Related Files

- CSV Import Modal: `src/components/playbook/CSVImport/CSVImportModal.tsx`
- CSV Service: `src/services/csvService.ts`
- Data Sync Service: `src/services/dataSyncService.ts`
- Play Types: `src/types/play.ts`

---

**Ready to add 100 plays? Follow Step 1-3 above! 🚀**
