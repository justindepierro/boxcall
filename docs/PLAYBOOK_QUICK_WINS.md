# Playbook UX Quick Wins - Implementation Guide
**Ready to ship in < 1 week each**

## 🌟 Priority 1: Recent Plays History (2 days)

### What It Does
Shows the last 5 plays the coach viewed, making it easy to return to frequently referenced plays.

### Implementation

#### 1. Update PreferenceService to track history
```typescript
// src/services/preferenceService.ts
export interface UserPreferences {
  // ... existing preferences
  bc_recently_viewed_plays?: string[]; // Play IDs
}
```

#### 2. Create hook for tracking views
```typescript
// src/hooks/useRecentPlays.ts
import { usePreference } from './usePreferences';
import { useCallback } from 'react';

export function useRecentPlays() {
  const [recentPlayIds, setRecentPlayIds] = usePreference(
    'bc_recently_viewed_plays',
    []
  );

  const trackPlayView = useCallback((playId: string) => {
    setRecentPlayIds((prev = []) => {
      // Remove if exists, add to front, keep max 10
      const filtered = prev.filter(id => id !== playId);
      return [playId, ...filtered].slice(0, 10);
    });
  }, [setRecentPlayIds]);

  return { recentPlayIds, trackPlayView };
}
```

#### 3. Add to PlayCard onClick
```typescript
// src/components/playbook/PlayCard.tsx
import { useRecentPlays } from '../../hooks/useRecentPlays';

export const PlayCard: React.FC<PlayCardProps> = ({ play, ...props }) => {
  const { trackPlayView } = useRecentPlays();

  const handleClick = () => {
    trackPlayView(play.id);
    props.onEdit?.(play);
  };

  return <div onClick={handleClick}>...</div>;
};
```

#### 4. Create RecentPlays component
```typescript
// src/components/playbook/RecentPlays.tsx
import React from 'react';
import { useRecentPlays } from '../../hooks/useRecentPlays';
import { Icon } from '../ui/Icon/Icon';

export const RecentPlays: React.FC<{ plays: Play[] }> = ({ plays }) => {
  const { recentPlayIds } = useRecentPlays();

  const recentPlays = recentPlayIds
    .map(id => plays.find(p => p.id === id))
    .filter(Boolean)
    .slice(0, 5);

  if (recentPlays.length === 0) return null;

  return (
    <div className="flex items-center gap-2 p-2 bg-surface-secondary rounded-lg">
      <Icon name="clock" className="text-muted" size={16} />
      <span className="text-sm text-secondary">Recent:</span>
      <div className="flex gap-2 overflow-x-auto">
        {recentPlays.map(play => (
          <button
            key={play.id}
            className="px-3 py-1 text-sm bg-white rounded border hover:border-primary"
          >
            {play.play_name}
          </button>
        ))}
      </div>
    </div>
  );
};
```

#### 5. Add to PlaybookPage
```tsx
// In PlaybookPage or PlayGrid header
<RecentPlays plays={allPlays} />
```

---

## ⭐ Priority 2: Favorite/Star Plays (3 days)

### What It Does
Let coaches mark plays as favorites for quick access. Adds "Favorites" filter preset.

### Implementation

#### 1. Add to preferences
```typescript
// src/services/preferenceService.ts
export interface UserPreferences {
  bc_favorite_plays?: string[]; // Play IDs
}
```

#### 2. Create favorites hook
```typescript
// src/hooks/useFavoritePlays.ts
import { usePreference } from './usePreferences';
import { useCallback } from 'react';

export function useFavoritePlays() {
  const [favoriteIds, setFavoriteIds] = usePreference(
    'bc_favorite_plays',
    []
  );

  const toggleFavorite = useCallback((playId: string) => {
    setFavoriteIds((prev = []) => {
      if (prev.includes(playId)) {
        return prev.filter(id => id !== playId);
      }
      return [...prev, playId];
    });
  }, [setFavoriteIds]);

  const isFavorite = useCallback((playId: string) => {
    return favoriteIds.includes(playId);
  }, [favoriteIds]);

  return { favoriteIds, toggleFavorite, isFavorite };
}
```

#### 3. Add star icon to PlayCard
```tsx
// src/components/playbook/PlayCard.tsx
import { useFavoritePlays } from '../../hooks/useFavoritePlays';

export const PlayCard: React.FC<PlayCardProps> = ({ play }) => {
  const { toggleFavorite, isFavorite } = useFavoritePlays();

  return (
    <div className="relative">
      {/* Star button - top right corner */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(play.id);
        }}
        className="absolute top-2 right-2 p-1 hover:bg-surface-muted rounded"
        aria-label={isFavorite(play.id) ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Icon
          name={isFavorite(play.id) ? 'star' : 'star-outline'}
          className={isFavorite(play.id) ? 'text-yellow-500' : 'text-muted'}
          size={20}
        />
      </button>
      
      {/* Rest of PlayCard */}
    </div>
  );
};
```

#### 4. Add Favorites filter preset
```typescript
// src/components/playbook/filterPresets.ts
export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'favorites',
    name: '⭐ Favorites',
    icon: 'star',
    description: 'Your starred plays',
    filters: [], // Handled specially in PlayGrid
  },
  // ... existing presets
];
```

#### 5. Handle in PlayGrid filtering
```tsx
// src/components/playbook/PlayGrid.tsx
const { favoriteIds } = useFavoritePlays();

const filteredPlays = useMemo(() => {
  let result = allPlays;

  // Special handling for favorites preset
  if (selectedPreset === 'favorites') {
    result = result.filter(play => favoriteIds.includes(play.id));
  }

  // ... rest of filtering logic
  return result;
}, [allPlays, favoriteIds, selectedPreset, ...]);
```

---

## ⌨️ Priority 3: Enhanced Keyboard Shortcuts (2 days)

### What It Does
Power user shortcuts for navigation and actions. Adds command palette.

### Implementation

#### 1. Extend keyboard shortcuts hook
```typescript
// src/components/playbook/usePlaybookShortcuts.ts
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ShortcutHandlers {
  onSearch: () => void;
  onToggleView: () => void;
  onNewPlay: () => void;
  onCommandPalette: () => void;
}

export function usePlaybookShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K: Command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handlers.onCommandPalette();
      }

      // Cmd/Ctrl + F: Focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        handlers.onSearch();
      }

      // Cmd/Ctrl + N: New play
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        handlers.onNewPlay();
      }

      // G then L: List view
      // G then G: Grid view
      // V: Toggle view
      if (e.key === 'v' && !e.metaKey && !e.ctrlKey) {
        handlers.onToggleView();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handlers]);
}
```

#### 2. Create Command Palette component
```tsx
// src/components/playbook/CommandPalette.tsx
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Icon } from '../ui/Icon/Icon';

interface Command {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  shortcut?: string;
}

export const CommandPalette: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
}> = ({ isOpen, onClose, commands }) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-4">
        <Input
          placeholder="Type a command..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
        <div className="mt-4 space-y-1">
          {filtered.map((cmd, idx) => (
            <button
              key={cmd.id}
              onClick={() => {
                cmd.action();
                onClose();
              }}
              className={`w-full flex items-center gap-3 p-2 rounded hover:bg-surface-muted ${
                idx === selectedIndex ? 'bg-surface-muted' : ''
              }`}
            >
              <Icon name={cmd.icon} size={20} />
              <span className="flex-1 text-left">{cmd.label}</span>
              {cmd.shortcut && (
                <kbd className="px-2 py-1 text-xs bg-surface-secondary rounded">
                  {cmd.shortcut}
                </kbd>
              )}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
};
```

#### 3. Integrate in PlaybookPage
```tsx
const [showCommandPalette, setShowCommandPalette] = useState(false);

const commands = [
  { id: 'new', label: 'New Play', icon: 'plus', action: handleNewPlay, shortcut: '⌘N' },
  { id: 'search', label: 'Search', icon: 'search', action: focusSearch, shortcut: '⌘F' },
  { id: 'favorites', label: 'Show Favorites', icon: 'star', action: showFavorites },
  { id: 'grid', label: 'Grid View', icon: 'grid', action: setGridView },
  { id: 'list', label: 'List View', icon: 'list', action: setListView },
  // Add more commands...
];

usePlaybookShortcuts({
  onSearch: focusSearch,
  onToggleView: toggleView,
  onNewPlay: handleNewPlay,
  onCommandPalette: () => setShowCommandPalette(true),
});

<CommandPalette
  isOpen={showCommandPalette}
  onClose={() => setShowCommandPalette(false)}
  commands={commands}
/>
```

---

## 💡 Priority 4: Smart Empty States (1 day)

### What It Does
When search/filter returns no results, show helpful suggestions.

### Implementation

```tsx
// src/components/playbook/PlayGridEmptyState.tsx
export const PlayGridEmptyState: React.FC<{
  hasFilters: boolean;
  searchQuery: string;
  onClearFilters: () => void;
  onSuggestedSearch?: (query: string) => void;
  allPlaysCount: number;
}> = ({ hasFilters, searchQuery, onClearFilters, onSuggestedSearch, allPlaysCount }) => {
  const suggestions = [
    { label: 'Try "screen"', query: 'screen' },
    { label: 'Try "shotgun"', query: 'shotgun' },
    { label: 'Try "pass"', query: 'pass' },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Icon name="search-x" size={48} className="text-muted mb-4" />
      
      <h3 className="text-lg font-semibold mb-2">
        No plays found
      </h3>
      
      <p className="text-secondary mb-6 text-center">
        {searchQuery
          ? `No plays match "${searchQuery}"`
          : 'No plays match your current filters'
        }
      </p>

      {/* Suggestions */}
      <div className="space-y-3 w-full max-w-md">
        {hasFilters && (
          <Button onClick={onClearFilters} variant="outline" fullWidth>
            <Icon name="x" size={16} />
            Clear all filters
          </Button>
        )}

        {onSuggestedSearch && (
          <div className="space-y-2">
            <p className="text-sm text-muted text-center">Try searching for:</p>
            <div className="flex gap-2 justify-center flex-wrap">
              {suggestions.map(({ label, query }) => (
                <button
                  key={query}
                  onClick={() => onSuggestedSearch(query)}
                  className="px-3 py-1 text-sm bg-surface-secondary hover:bg-surface-muted rounded"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <p className="text-sm text-muted text-center mb-3">
            You have {allPlaysCount} total plays
          </p>
          <Button variant="primary" fullWidth>
            <Icon name="plus" size={16} />
            Create your first play
          </Button>
        </div>
      </div>
    </div>
  );
};
```

---

## 📊 Priority 5: Usage Stats Badge (2 days)

### What It Does
Shows how many times a play has been called, making frequently-used plays visible.

### Implementation

#### 1. Add to PlayCard header
```tsx
// src/components/playbook/PlayCard.tsx
export const PlayCard: React.FC<PlayCardProps> = ({ play }) => {
  return (
    <div className="play-card">
      <div className="flex items-center gap-2">
        <h3>{play.play_name}</h3>
        
        {/* Usage badge */}
        {play.times_called > 0 && (
          <Badge variant="info" size="sm">
            <Icon name="trending-up" size={12} />
            {play.times_called}x
          </Badge>
        )}

        {/* Success rate */}
        {play.times_called > 0 && (
          <Badge 
            variant={getSuccessVariant(play.times_successful / play.times_called)}
            size="sm"
          >
            {Math.round((play.times_successful / play.times_called) * 100)}% success
          </Badge>
        )}
      </div>
    </div>
  );
};

function getSuccessVariant(rate: number): BadgeVariant {
  if (rate >= 0.7) return 'success';
  if (rate >= 0.5) return 'warning';
  return 'danger';
}
```

#### 2. Add "Most Used" filter preset
```typescript
// src/components/playbook/filterPresets.ts
{
  id: 'most-used',
  name: '🔥 Most Used',
  icon: 'trending-up',
  description: 'Your most-called plays',
  filters: [],
  sort: (plays) => plays.sort((a, b) => b.times_called - a.times_called),
}
```

---

## 🚀 Deployment Checklist

For each quick win:

- [ ] Implement feature
- [ ] Add TypeScript types
- [ ] Test on mobile (touch targets)
- [ ] Test with empty data
- [ ] Add telemetry tracking
- [ ] Update Storybook story
- [ ] Add to keyboard shortcuts guide
- [ ] Write brief user documentation
- [ ] Ship to staging
- [ ] Get coach feedback
- [ ] Ship to production

---

## 📈 Success Metrics

Track these for each feature:

1. **Usage Rate**: % of coaches who use the feature
2. **Time Saved**: Measure before/after workflow time
3. **Satisfaction**: NPS or in-app rating
4. **Error Rate**: Any bugs/crashes
5. **Abandonment**: Do users complete the action?

---

## 💬 User Testing Script

"Hi Coach! We added a new feature called [FEATURE NAME]. 

Can you try to [TASK]? 

Think aloud as you go - what are you thinking?

[Observe and take notes]

On a scale of 1-10, how useful is this?

What would make it better?"

---

**Last Updated:** October 11, 2025
