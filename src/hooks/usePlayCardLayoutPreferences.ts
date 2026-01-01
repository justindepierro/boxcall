import { useCallback, useEffect, useRef, useState } from "react";
import { readLocalJson, writeLocalJson } from "../utils/storage";

import {
  PreferenceService,
  type UserPreferences,
} from "../services/preferenceService";
import { getCurrentUserId } from "../lib/auth-helpers";

// Inline type (originally from localPlayCardLayout)
export interface PlayCardLayoutPreferences {
  showImage: boolean;
  showFormation: boolean;
  showPersonnel: boolean;
  showTags: boolean;
  showNotes: boolean;
  cardSize: "small" | "medium" | "large";
}

// Inline helpers (originally from localPlayCardLayout)
function getPlayCardLayoutPreferences(playId: string): Partial<PlayCardLayoutPreferences> | null {
  const key = `bc_play_card_layout_${playId}`;
  return readLocalJson<PlayCardLayoutPreferences>(key) ?? null;
}

function patchPlayCardLayoutPreferences(
  playId: string,
  patch: Partial<PlayCardLayoutPreferences>
): Partial<PlayCardLayoutPreferences> {
  try {
    const key = `bc_play_card_layout_${playId}`;
    const existing = getPlayCardLayoutPreferences(playId) || {};
    const merged = { ...existing, ...patch };
    writeLocalJson(key, merged);
    return merged;
  } catch {
    return patch;
  }
}

type StoredLayoutPatch = Partial<PlayCardLayoutPreferences>;

type UsePlayCardLayoutPreferencesResult = {
  layout: PlayCardLayoutPreferences;
  patchLayout: (patch: StoredLayoutPatch) => void;
};

function layoutEqual(
  a: PlayCardLayoutPreferences,
  b: PlayCardLayoutPreferences
): boolean {
  return (
    a.showImage === b.showImage &&
    a.showFormation === b.showFormation &&
    a.showPersonnel === b.showPersonnel &&
    a.showTags === b.showTags &&
    a.showNotes === b.showNotes &&
    a.cardSize === b.cardSize
  );
}

function mergeWithDefaults(
  defaults: PlayCardLayoutPreferences,
  partial: Partial<PlayCardLayoutPreferences> | null
): PlayCardLayoutPreferences {
  return {
    showImage: partial?.showImage ?? defaults.showImage,
    showFormation: partial?.showFormation ?? defaults.showFormation,
    showPersonnel: partial?.showPersonnel ?? defaults.showPersonnel,
    showTags: partial?.showTags ?? defaults.showTags,
    showNotes: partial?.showNotes ?? defaults.showNotes,
    cardSize: partial?.cardSize ?? defaults.cardSize,
  };
}

/**
 * Per-play layout preferences (field order + visibility) with:
 * - instant localStorage persistence
 * - background server sync to profiles.settings when authenticated
 */
export function usePlayCardLayoutPreferences(
  playId: string,
  defaults: PlayCardLayoutPreferences,
  debounceMs: number = 500
): UsePlayCardLayoutPreferencesResult {
  const serverKey = `bc_play_card_layout_${playId}` as keyof UserPreferences;

  const [layout, setLayout] = useState<PlayCardLayoutPreferences>(() => {
    const local = getPlayCardLayoutPreferences(playId);
    return mergeWithDefaults(defaults, local);
  });

  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isMountedRef = useRef(true);

  // Keep in sync if playId changes.
  useEffect(() => {
    const local = getPlayCardLayoutPreferences(playId);
    const next = mergeWithDefaults(defaults, local);
    setLayout((prev) => (layoutEqual(prev, next) ? prev : next));
  }, [playId, defaults]);

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  // Server -> local sync (background)
  useEffect(() => {
    let cancelled = false;

    async function syncFromServer() {
      const userId = getCurrentUserId();
      if (!userId) return;

      const serverValue = await PreferenceService.getPreference(serverKey);
      if (cancelled || !isMountedRef.current) return;

      // We accept only objects; patch helper will sanitize.
      if (
        !serverValue ||
        typeof serverValue !== "object" ||
        Array.isArray(serverValue)
      ) {
        return;
      }

      const patched = patchPlayCardLayoutPreferences(
        playId,
        serverValue as any
      );
      const next = mergeWithDefaults(defaults, patched);
      setLayout((prev) => (layoutEqual(prev, next) ? prev : next));
    }

    syncFromServer();

    return () => {
      cancelled = true;
    };
  }, [playId, serverKey, defaults]);

  const patchLayout = useCallback(
    (patch: StoredLayoutPatch) => {
      // Local update immediately
      const mergedLocal = patchPlayCardLayoutPreferences(playId, patch);
      const next = mergeWithDefaults(defaults, mergedLocal);
      setLayout((prev) => (layoutEqual(prev, next) ? prev : next));

      // Debounced server save (best-effort)
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const userId = getCurrentUserId();
          if (!userId || !isMountedRef.current) return;
          await PreferenceService.savePreference(serverKey, next as any);
        } catch {
          // Keep local state; server sync can retry on next change.
        }
      }, debounceMs);
    },
    [playId, defaults, debounceMs, serverKey]
  );

  return { layout, patchLayout };
}
