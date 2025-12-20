// Local saved filter presets (Phase 1)
// Stored in localStorage under a single key; simple shape now, can migrate later.

import { readLocalJson, storageKeys, writeLocalJson } from "./storage";

export interface PlaybookFilterPreset {
  id: string; // uuid or timestamp
  name: string;
  createdAt: number;
  updatedAt: number;
  filters: {
    searchQuery?: string;
    formation?: string;
    playType?: string;
    category?: string;
    subcategory?: string;
  };
}

function loadRaw(): PlaybookFilterPreset[] {
  try {
    const parsed = readLocalJson<unknown>(storageKeys.playbook.filterPresets, {
      clearOnParseError: true,
    });
    if (Array.isArray(parsed)) return parsed as PlaybookFilterPreset[];
  } catch {
    /* ignore */
  }
  return [];
}

function saveRaw(presets: PlaybookFilterPreset[]) {
  try {
    writeLocalJson(storageKeys.playbook.filterPresets, presets);
  } catch {
    /* ignore */
  }
}

export function listPresets(): PlaybookFilterPreset[] {
  return loadRaw().sort(
    (a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt)
  );
}

export function createPreset(preset: {
  name: string;
  filters: PlaybookFilterPreset["filters"];
}): PlaybookFilterPreset {
  const now = Date.now();
  const full: PlaybookFilterPreset = {
    name: preset.name,
    filters: { ...preset.filters },
    id: crypto?.randomUUID?.() || Date.now().toString(),
    createdAt: now,
    updatedAt: now,
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

export function updatePreset(
  id: string,
  patch: Partial<{ name: string; filters: PlaybookFilterPreset["filters"] }>
): PlaybookFilterPreset | undefined {
  const all = loadRaw();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  const prev = all[idx];
  const next: PlaybookFilterPreset = {
    ...prev,
    name: patch.name !== undefined ? patch.name : prev.name,
    filters: patch.filters
      ? { ...prev.filters, ...patch.filters }
      : prev.filters,
    updatedAt: Date.now(),
  };
  all[idx] = next;
  saveRaw(all);
  return next;
}

export function exportPresets(): string {
  return JSON.stringify(loadRaw());
}

export function importPresets(json: string): number {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return 0;
    const existing = loadRaw();
    const map = new Map(existing.map((p) => [p.id, p]));
    for (const p of parsed) {
      if (p && typeof p === "object" && p.id) {
        map.set(p.id, p as PlaybookFilterPreset);
      }
    }
    saveRaw(Array.from(map.values()));
    return parsed.length;
  } catch {
    return 0;
  }
}
