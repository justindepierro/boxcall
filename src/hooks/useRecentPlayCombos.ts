import { useState, useCallback, useEffect } from "react";
import {
  validateFormationName,
  validatePersonnelValue,
} from "../utils/playFieldValidation";
import { warn } from "../utils/logger";

export interface PlayCombo {
  formation: string;
  formationId?: string;
  personnel?: string;
  playType?: string;
  timestamp: number;
}

const STORAGE_KEY = "bc_recent_play_combos";
const DEFAULT_LIMIT = 6;

function isValidCombo(combo: PlayCombo): boolean {
  if (!validateFormationName(combo.formation).isValid) {
    return false;
  }
  if (combo.personnel && !validatePersonnelValue(combo.personnel).isValid) {
    return false;
  }
  return true;
}

function loadCombos(): PlayCombo[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PlayCombo[];
    if (!Array.isArray(parsed)) return [];
    const sanitized = parsed
      .filter((combo) => combo && typeof combo.formation === "string")
      .map((combo) => ({
        ...combo,
        timestamp: combo.timestamp || Date.now(),
      }))
      .filter(isValidCombo)
      .sort((a, b) => b.timestamp - a.timestamp);

    if (sanitized.length !== parsed.length) {
      saveCombos(sanitized);
    }

    return sanitized;
  } catch (error) {
    warn("[useRecentPlayCombos] Failed to read localStorage:", error);
    return [];
  }
}

function saveCombos(combos: PlayCombo[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(combos));
  } catch (error) {
    warn("[useRecentPlayCombos] Failed to persist combos:", error);
  }
}

export function useRecentPlayCombos(limit: number = DEFAULT_LIMIT) {
  const [combos, setCombos] = useState<PlayCombo[]>(() => loadCombos());

  useEffect(() => {
    setCombos(loadCombos());
  }, []);

  const addCombo = useCallback(
    (combo: {
      formation: string;
      formationId?: string;
      personnel?: string;
      playType?: string;
    }) => {
      if (!combo.formation.trim()) return;

      const trimmedCombo: PlayCombo = {
        formation: combo.formation.trim(),
        formationId: combo.formationId,
        personnel: combo.personnel?.trim() || undefined,
        playType: combo.playType?.trim() || undefined,
        timestamp: Date.now(),
      };

      if (!isValidCombo(trimmedCombo)) {
        return;
      }

      setCombos((prev) => {
        const existing = prev.filter((item) => {
          const sameName =
            item.formation.toLowerCase() ===
            trimmedCombo.formation.toLowerCase();
          const samePersonnel =
            (item.personnel || "")?.toLowerCase() ===
            (trimmedCombo.personnel || "")?.toLowerCase();
          const sameType =
            (item.playType || "")?.toLowerCase() ===
            (trimmedCombo.playType || "")?.toLowerCase();
          const sameId =
            item.formationId && trimmedCombo.formationId
              ? item.formationId === trimmedCombo.formationId
              : true;
          return !(sameName && samePersonnel && sameType && sameId);
        });

        const updated = [trimmedCombo, ...existing].slice(0, limit);
        saveCombos(updated);
        return updated;
      });
    },
    [limit]
  );

  const clearCombos = useCallback(() => {
    setCombos([]);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return {
    combos,
    addCombo,
    clearCombos,
  };
}
