// Local saved filter presets (Phase 1)
// Stored in localStorage under a single key; simple shape now, can migrate later.

export interface PlaybookFilterPreset {
  id: string; // uuid or timestamp
  name: string;
  createdAt: number;
  filters: {
    searchQuery?: string;
    formation?: string;
    playType?: string;
    category?: string;
    subcategory?: string;
  };
}

const LS_KEY = "bc_playbook_filter_presets_v1";

function loadRaw(): PlaybookFilterPreset[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as PlaybookFilterPreset[];
  } catch {
    /* ignore */
  }
  return [];
}

function saveRaw(presets: PlaybookFilterPreset[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(presets));
  } catch {
    /* ignore */
  }
}

export function listPresets(): PlaybookFilterPreset[] {
  return loadRaw().sort((a, b) => b.createdAt - a.createdAt);
}

export function createPreset(
  preset: Omit<PlaybookFilterPreset, "id" | "createdAt">
): PlaybookFilterPreset {
  const full: PlaybookFilterPreset = {
    ...preset,
    id: Date.now().toString(),
    createdAt: Date.now(),
  };
  const all = loadRaw();
  all.push(full);
  saveRaw(all);
  return full;
}

export function deletePreset(id: string) {
  const remaining = loadRaw().filter((p) => p.id !== id);
  saveRaw(remaining);
}

export function getPreset(id: string): PlaybookFilterPreset | undefined {
  return loadRaw().find((p) => p.id === id);
}

export function applyPreset(preset: PlaybookFilterPreset) {
  return preset.filters;
}
