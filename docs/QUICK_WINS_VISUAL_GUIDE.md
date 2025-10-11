# Quick Wins Visual Guide

## 🎯 Feature Showcase

### 1. ⭐ Favorite Plays

**List View:**
```
┌─────────────────────────────────────────────────────────┐
│  I Form Right Dive                                  ⭐ ⌄ │
│  Run | I-Form | 85% confidence                          │
│  📊 15x called | ✅ 80% success                          │
└─────────────────────────────────────────────────────────┘
```

**Tile View:**
```
┌──────────────────┐
│  ⭐            📈│
│                 │
│       🏈        │
│                 │
│     85%         │
└──────────────────┘
     Run Play
```

**Key Features:**
- Yellow star = favorited
- Gray star = not favorited
- Click to toggle
- Syncs across devices

---

### 2. 📚 Recent Plays

```
┌─────────────────────────────────────────────────────────────────┐
│ 🕐 Recent:  [Screen Pass]  [Dive]  [Sweep]  [Play Action]      │
└─────────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Shows last 5 viewed plays
- Horizontal scroll if needed
- Click to jump to play
- Auto-updates as you browse

---

### 3. ⌨️ Command Palette (Cmd+K)

```
┌────────────────────────────────────────────┐
│  Command Palette                           │
│  ┌──────────────────────────────────────┐  │
│  │ Type a command...                    │  │
│  └──────────────────────────────────────┘  │
│                                            │
│  🔍 Search                          ⌘F    │
│  ➕ New Play                        ⌘N    │
│  ⭐ Show Favorites                   F     │
│  📊 Grid View                        V     │
│  📝 List View                        V     │
│  🔥 Most Used Plays                        │
│                                            │
│  ↑↓ Navigate  ↵ Select  Esc Close         │
└────────────────────────────────────────────┘
```

**Keyboard Shortcuts:**
- `Cmd/Ctrl + K` - Open palette
- `Cmd/Ctrl + F` - Focus search
- `Cmd/Ctrl + N` - New play
- `V` - Toggle view mode
- `F` - Show favorites

---

### 4. 💡 Smart Empty State

**No Results Found:**
```
┌──────────────────────────────────────────────────────┐
│                      🔍                              │
│                                                      │
│              No plays found                          │
│        No plays match "xyz123"                       │
│                                                      │
│           Try searching for:                         │
│  [Try "screen"] [Try "shotgun"] [Try "pass"]        │
│                                                      │
│         [Clear Filters]  [Create New Play]          │
└──────────────────────────────────────────────────────┘
```

---

### 5. 📊 Usage Stats Badges

```
┌─────────────────────────────────────────────────────────┐
│  Mesh Concept                                       ⭐ ⌄ │
│  Pass | Trips | 90% confidence                          │
│  📈 23x called | ✅ 87% success                          │
└─────────────────────────────────────────────────────────┘
```

**Badge Colors:**
- 🟢 Green: ≥70% success (bg-success-50)
- 🟡 Yellow: 50-69% success (bg-warning-50)
- 🔴 Red: <50% success (bg-error-50)

---

### 6. 🔥 Filter Presets

**Filter Bar:**
```
┌────────────────────────────────────────────────────────┐
│  [All Plays] [⭐ Favorites] [🔥 Most Used]             │
│  [Run Only] [Pass Only] [RPO] [Red Zone]              │
└────────────────────────────────────────────────────────┘
```

**New Presets:**
- ⭐ Favorites - Shows only starred plays
- 🔥 Most Used - Sorted by times_called (descending)

---

## 🎨 Design Tokens Used

### Colors:
```css
/* Favorites */
text-warning-500     /* Star icon filled */
text-muted           /* Star icon unfilled */

/* Usage Badges */
bg-info-50           /* Times called background */
text-info-700        /* Times called text */

bg-success-50        /* High success rate */
text-success-700

bg-warning-50        /* Medium success rate */
text-warning-700

bg-error-50          /* Low success rate */
text-error-700

/* Buttons/UI */
bg-surface-secondary /* Recent plays background */
border-subtle        /* Border color */
hover:border-brand-primary /* Hover state */
```

### Spacing:
```css
gap-2      /* Small gaps (8px) */
gap-3      /* Medium gaps (12px) */
p-2        /* Small padding (8px) */
p-3        /* Medium padding (12px) */
rounded-lg /* Large border radius */
```

---

## 🚀 User Flows

### Flow 1: Favorite a Play
```
1. Browse playbook
2. See play you like
3. Click ⭐ star icon
4. Star turns yellow
5. Play added to favorites
6. Click "⭐ Favorites" filter
7. See only favorited plays
```

### Flow 2: Use Recent Plays
```
1. View play A
2. View play B  
3. View play C
4. Look at "Recent" bar
5. See [C] [B] [A]
6. Click [A] to return
7. Instant navigation
```

### Flow 3: Command Palette
```
1. Press Cmd+K
2. Palette opens
3. Type "fav"
4. "Show Favorites" highlighted
5. Press Enter
6. Favorites filter applied
7. See starred plays
```

### Flow 4: Find Most Used Plays
```
1. Click "🔥 Most Used"
2. Plays sorted by times_called
3. Top plays are go-to plays
4. See usage stats badges
5. Identify successful plays
```

---

## 📱 Mobile Considerations

### Touch Targets:
- ⭐ Star button: 44x44px minimum (iOS guideline)
- Recent play chips: 48px height (Material Design)
- Command palette items: 56px height

### Gestures:
- Tap star to favorite
- Swipe recent plays horizontally
- Long-press for context menu (future)

### Responsive Breakpoints:
```css
/* Mobile */
@media (max-width: 640px) {
  Recent plays: Single row, horizontal scroll
  Filter presets: Wrap to multiple rows
  Usage badges: Show only on expand
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  Recent plays: Show 5 items
  Badges: Always visible
}

/* Desktop */
@media (min-width: 1025px) {
  Recent plays: Show all 5
  Command palette: Cmd+K
  Badges: Always visible
}
```

---

## 🧪 Testing Scenarios

### Test Case 1: Favorite Persistence
```
✅ Favorite play A
✅ Reload page
✅ Play A still favorited
✅ Favorite syncs across tabs
```

### Test Case 2: Recent Plays Ordering
```
✅ View plays: A, B, C, D, E
✅ Recent shows: E, D, C, B, A
✅ View A again
✅ Recent shows: A, E, D, C, B
```

### Test Case 3: Empty States
```
✅ Search for "xyz123"
✅ See suggestions
✅ Click suggestion
✅ Search updates
✅ Results appear
```

### Test Case 4: Usage Stats
```
✅ Play with 0 calls: No badges
✅ Play with 10 calls, 8 success: Green badge "80%"
✅ Play with 20 calls, 12 success: Yellow badge "60%"
✅ Play with 5 calls, 2 success: Red badge "40%"
```

---

## 💻 Code Examples

### Using Favorites in a Component:
```tsx
import { useFavoritePlays } from '@/hooks/useFavoritePlays';

function MyComponent() {
  const { favoriteIds, toggleFavorite, isFavorite } = useFavoritePlays();
  
  return (
    <button onClick={() => toggleFavorite(playId)}>
      <Icon 
        name="star" 
        className={isFavorite(playId) ? "text-warning-500" : "text-muted"}
      />
    </button>
  );
}
```

### Using Recent Plays:
```tsx
import { useRecentPlays } from '@/hooks/useRecentPlays';
import { RecentPlays } from '@/components/playbook/RecentPlays';

function PlaybookPage() {
  const { trackPlayView } = useRecentPlays();
  
  const handlePlayClick = (play) => {
    trackPlayView(play.id);
    navigate(`/playbook/${play.id}`);
  };
  
  return (
    <>
      <RecentPlays 
        plays={allPlays} 
        onPlayClick={handlePlayClick} 
      />
      {/* ... */}
    </>
  );
}
```

### Setting Up Command Palette:
```tsx
import { CommandPalette, Command } from '@/components/playbook/CommandPalette';
import { usePlaybookShortcuts } from '@/hooks/usePlaybookShortcuts';

function Playbook() {
  const [showPalette, setShowPalette] = useState(false);
  
  const commands: Command[] = [
    {
      id: 'new',
      label: 'New Play',
      icon: 'plus',
      action: () => setShowAddModal(true),
      shortcut: '⌘N',
    },
    {
      id: 'favorites',
      label: 'Show Favorites',
      icon: 'star',
      action: () => setFilter('favorites'),
      shortcut: 'F',
      keywords: ['starred', 'bookmarks'],
    },
    // ... more commands
  ];
  
  usePlaybookShortcuts({
    onCommandPalette: () => setShowPalette(true),
    onSearch: () => searchRef.current?.focus(),
    onNewPlay: () => setShowAddModal(true),
    onFavorites: () => setFilter('favorites'),
    onToggleView: () => setView(v => v === 'list' ? 'grid' : 'list'),
  });
  
  return (
    <>
      <CommandPalette
        isOpen={showPalette}
        onClose={() => setShowPalette(false)}
        commands={commands}
      />
      {/* ... */}
    </>
  );
}
```

---

## 📚 Documentation Links

- [Full Implementation Summary](./QUICK_WINS_IMPLEMENTATION_SUMMARY.md)
- [Original Quick Wins Plan](./PLAYBOOK_QUICK_WINS.md)
- [Playbook UX Roadmap](./PLAYBOOK_UX_ROADMAP.md)
- [Feature Comparison](./PLAYBOOK_FEATURE_COMPARISON.md)

---

**Last Updated:** October 11, 2025  
**Status:** ✅ Ready for Integration Testing
