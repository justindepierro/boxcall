import { useCallback, useEffect, useMemo, useState } from 'react';

export type SidebarMode = 'rail' | 'expanded';

const STORAGE_KEY = 'sidebar:prefs';

type Persisted = {
  mode: SidebarMode;
  expanded: string[]; // ids of expanded groups
  favorites: string[];
};

const read = (): Persisted => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { mode: 'expanded', expanded: [], favorites: [] };
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return {
      mode: parsed.mode ?? 'expanded',
      expanded: parsed.expanded ?? [],
      favorites: parsed.favorites ?? [],
    };
  } catch {
    return { mode: 'expanded', expanded: [], favorites: [] };
  }
};

const write = (data: Persisted) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
};

export function useSidebarState() {
  const [mode, setMode] = useState<SidebarMode>(() => read().mode);
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(read().expanded)
  );
  const [favorites, setFavorites] = useState<Set<string>>(
    () => new Set(read().favorites)
  );

  // persist on change
  useEffect(() => {
    write({ mode, expanded: [...expanded], favorites: [...favorites] });
  }, [mode, expanded, favorites]);

  const toggleMode = useCallback(() => {
    setMode((m) => (m === 'rail' ? 'expanded' : 'rail'));
  }, []);

  const isExpanded = useCallback((id: string) => expanded.has(id), [expanded]);
  const toggleExpanded = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => favorites.has(id), [favorites]);
  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return useMemo(
    () => ({
      mode,
      setMode,
      toggleMode,
      expanded,
      isExpanded,
      toggleExpanded,
      favorites,
      isFavorite,
      toggleFavorite,
    }),
    [mode, toggleMode, expanded, isExpanded, toggleExpanded, favorites, isFavorite, toggleFavorite]
  );
}
