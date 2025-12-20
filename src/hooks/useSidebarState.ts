import { useCallback, useEffect, useMemo, useState } from "react";
import { readLocalJson, storageKeys, writeLocalJson } from "../utils/storage";

export type SidebarMode = "rail" | "expanded";

type Persisted = {
  mode: SidebarMode;
  expanded: string[]; // ids of expanded groups
  favorites: string[];
};

const read = (): Persisted => {
  try {
    const parsed = readLocalJson<Partial<Persisted>>(storageKeys.sidebarPrefs);
    if (!parsed) return { mode: "expanded", expanded: [], favorites: [] };
    return {
      mode: parsed.mode ?? "expanded",
      expanded: parsed.expanded ?? [],
      favorites: parsed.favorites ?? [],
    };
  } catch {
    return { mode: "expanded", expanded: [], favorites: [] };
  }
};

const write = (data: Persisted) => {
  try {
    writeLocalJson(storageKeys.sidebarPrefs, data);
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
    setMode((m) => (m === "rail" ? "expanded" : "rail"));
  }, []);

  const isExpanded = useCallback((id: string) => expanded.has(id), [expanded]);
  const expand = useCallback((id: string) => {
    setExpanded((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);
  const collapse = useCallback((id: string) => {
    setExpanded((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);
  const toggleExpanded = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.has(id),
    [favorites]
  );
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
      expand,
      collapse,
      toggleExpanded,
      favorites,
      isFavorite,
      toggleFavorite,
    }),
    [
      mode,
      toggleMode,
      expanded,
      isExpanded,
      expand,
      collapse,
      toggleExpanded,
      favorites,
      isFavorite,
      toggleFavorite,
    ]
  );
}
