# Global Search - Visual Guide 🎨

## 🔍 Search Bar Location

```
┌─────────────────────────────────────────────────────────────────┐
│  [☰] BoxCall                  [🔍 Search... ⌘K]         [👤]    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Location**: Top center of app header (always visible)  
**Shortcut**: `⌘K` / `Ctrl+K` to focus from anywhere

---

## 💬 Search States

### 1. **Empty State** (Before typing)
```
┌──────────────────────────────────────────────┐
│ 🔍  Search plays, formations, personnel...   │
│                                  ⌘K          │
└──────────────────────────────────────────────┘
```
Shows keyboard shortcut hint

---

### 2. **Loading State** (While searching)
```
┌──────────────────────────────────────────────┐
│ 🔍  trips                           ✕        │
└──────────────────────────────────────────────┘
│                                              │
│           ⟳  Searching...                    │
│                                              │
└──────────────────────────────────────────────┘
```

---

### 3. **Results Dropdown** (With matches)
```
┌──────────────────────────────────────────────┐
│ 🔍  trips                           ✕        │
└──────────────────────────────────────────────┘
┌──────────────────────────────────────────────┐
│  🟢 P   Trips Right 999                   →  │
│         Trips • Pass                         │
│                                              │
│  🟢 P   Trips Left Slot                   →  │
│         Trips • Pass                         │
│                                              │
│  🟠 F   Trips                             →  │
│         ← Left • Spread • 11 personnel       │
│                                              │
│  🟠 F   Trips                             →  │
│         → Right • Spread • 11 personnel      │
│                                              │
│  🟣 11  11 Personnel                      →  │
│         Personnel • 5 positions              │
│         Standard 3WR 1RB 1TE package         │
└──────────────────────────────────────────────┘
```

---

### 4. **Selected Result** (Keyboard navigation)
```
┌──────────────────────────────────────────────┐
│ 🔍  trips                           ✕        │
└──────────────────────────────────────────────┘
┌──────────────────────────────────────────────┐
│  🟢 P   Trips Right 999                   →  │
│         Trips • Pass                         │
│                                              │
│ ┌────────────────────────────────────────┐  │
│ │ 🟢 P   Trips Left Slot              → │  │ ← Selected (blue bg)
│ │        Trips • Pass                    │  │
│ └────────────────────────────────────────┘  │
│                                              │
│  🟠 F   Trips                             →  │
│         ← Left • Spread • 11 personnel       │
└──────────────────────────────────────────────┘
```

---

### 5. **No Results** (Nothing found)
```
┌──────────────────────────────────────────────┐
│ 🔍  xyz                             ✕        │
└──────────────────────────────────────────────┘
┌──────────────────────────────────────────────┐
│                                              │
│              🔍                              │
│      No results found for "xyz"              │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 🎨 Result Type Visual Indicators

### Play Results 🟢
```
┌────────────────────────────────────────────┐
│  🟢 P   Spider 2 Y Banana              →   │
│         Empty • Pass                       │
└────────────────────────────────────────────┘
```
- **Icon**: "P" in green circle
- **Line 1**: Play name
- **Line 2**: Formation • Play type

---

### Formation Results 🟠
```
┌────────────────────────────────────────────┐
│  🟠 F   Trips                           →  │
│         ← Left • Spread • 11 personnel     │
│         Three receivers to one side        │
└────────────────────────────────────────────┘
```
- **Icon**: "F" in orange circle
- **Line 1**: Formation name
- **Line 2**: Direction • Category • Personnel
- **Line 3**: Description (if available)

---

### Personnel Results 🟣
```
┌────────────────────────────────────────────┐
│  🟣 11  11 Personnel                    →  │
│         Personnel • 5 positions            │
│         Standard 3WR 1RB 1TE package       │
└────────────────────────────────────────────┘
```
- **Icon**: Personnel code (11, 12, 21) in purple circle
- **Line 1**: Personnel name
- **Line 2**: Type • Position count
- **Line 3**: Description (if available)

---

### Player Results 🔵
```
┌────────────────────────────────────────────┐
│  🔵 11  John Smith                      →  │
│         QB • Active                        │
└────────────────────────────────────────────┘
```
- **Icon**: Jersey number in blue circle
- **Line 1**: Player name
- **Line 2**: Position • Status

---

## ⌨️ Keyboard Shortcuts

### Open Search
- `⌘K` (Mac) or `Ctrl+K` (Windows/Linux)
- Works from **anywhere** in the app

### Navigate Results
- `↑` Arrow Up - Previous result
- `↓` Arrow Down - Next result
- `Enter` - Select result and navigate
- `Esc` - Close search dropdown

### Clear Search
- Click `✕` button
- Or select all and delete

---

## 🎯 Context-Aware Results

### On Playbook Page
```
Search: "spread"

Results:
1. 🟢 Play: Spread Right (prioritized)
2. 🟢 Play: Spread Left Flood
3. 🟠 Formation: Spread
4. 🟣 Personnel: 11 Personnel
5. 🔵 Player: Spread Jackson (if name matches)
```

### On Roster/Settings Page
```
Search: "smith"

Results:
1. 🔵 Player: John Smith (prioritized)
2. 🔵 Player: Mike Smith
3. 🟢 Play: Smith Special (if play name matches)
```

---

## 📱 Mobile View

On mobile, the search bar becomes a button:

```
┌─────────────────────────────────────┐
│  [☰]  BoxCall          [🔍]    [👤] │
└─────────────────────────────────────┘
```

Tapping opens a full-screen search modal.

---

## 🎨 Color Scheme

| Type | Circle Color | Text Color | Use Case |
|------|-------------|-----------|----------|
| Play | Green `#10b981` | White | Active plays |
| Formation | Orange `#f59e0b` | White | Formation structures |
| Personnel | Purple `#9333ea` | White | Personnel groups |
| Player | Blue `#3b82f6` | White | Roster members |

---

## 🚀 Usage Examples

### Example 1: Find a specific play
1. Press `⌘K`
2. Type "spider"
3. See "Spider 2 Y Banana" in results
4. Press Enter → Opens playbook with play highlighted

### Example 2: Find formations for 11 personnel
1. Click search bar
2. Type "11"
3. See all formations that use 11 personnel
4. Click formation → Opens formation builder

### Example 3: Find a player
1. Press `⌘K`
2. Type player name or jersey number
3. Click player → Opens roster settings with player selected

---

## ✨ Pro Tips

1. **Minimum 2 Characters**: Type at least 2 chars to activate search
2. **Keyboard First**: Use `⌘K` for fastest access
3. **Arrow Navigation**: Use arrows instead of mouse for speed
4. **Context Matters**: Results reorder based on your current page
5. **Partial Matches**: Search works with partial words ("tri" finds "Trips")

---

## 🎊 Comparison: Before vs After

### Before
```
❌ No global search
❌ Must navigate to specific pages
❌ Separate search on each page
❌ No keyboard shortcuts
❌ Search only plays (not formations/personnel)
```

### After ✅
```
✅ Universal search from anywhere
✅ Press ⌘K for instant access
✅ Search plays, formations, personnel, players
✅ Context-aware result ordering
✅ Keyboard navigation (↑↓ Enter Esc)
✅ Visual indicators (color-coded)
✅ Smart result limiting (fast!)
```

---

**Your search is now as powerful as Linear, Notion, or Slack!** 🚀

Try it: **Press `⌘K` right now!**
