import { useCallback, useEffect, useRef, useState } from "react";

import {
  getPlayCardLayoutPreferences,
  patchPlayCardLayoutPreferences,
  type PlayCardLayoutPreferences,
} from "../utils/localPlayCardLayout";
import {
  PreferenceService,
  type UserPreferences,
} from "../services/preferenceService";
import { getCurrentUserId } from "../lib/auth-helpers";

type StoredLayoutPatch = Partial<PlayCardLayoutPreferences>;

type UsePlayCardLayoutPreferencesResult = {
  layout: PlayCardLayoutPreferences;
  patchLayout: (patch: StoredLayoutPatch) => void;
};

function arrayEqual(a: string[], b: string[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function recordEqual(
  a: Record<string, boolean>,
  b: Record<string, boolean>
): boolean {
  if (a === b) return true;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

function layoutEqual(
  a: PlayCardLayoutPreferences,
  b: PlayCardLayoutPreferences
): boolean {
  return (
    arrayEqual(a.formationFieldOrder, b.formationFieldOrder) &&
    recordEqual(a.formationFieldVisibility, b.formationFieldVisibility) &&
    arrayEqual(a.playDetailsFieldOrder, b.playDetailsFieldOrder) &&
    recordEqual(a.playDetailsFieldVisibility, b.playDetailsFieldVisibility)
  );
}

function mergeWithDefaults(
  defaults: PlayCardLayoutPreferences,
  partial: Partial<PlayCardLayoutPreferences> | null
): PlayCardLayoutPreferences {
  return {
    formationFieldOrder:
      partial?.formationFieldOrder ?? defaults.formationFieldOrder,
    formationFieldVisibility:
      partial?.formationFieldVisibility ?? defaults.formationFieldVisibility,
    playDetailsFieldOrder:
      partial?.playDetailsFieldOrder ?? defaults.playDetailsFieldOrder,
    playDetailsFieldVisibility:
      partial?.playDetailsFieldVisibility ??
      defaults.playDetailsFieldVisibility,
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
