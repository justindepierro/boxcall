type StorageKind = "local" | "session";

type JsonReadOptions = {
  clearOnParseError?: boolean;
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getStorage(kind: StorageKind): Storage | null {
  if (!isBrowser()) return null;

  try {
    const s = kind === "local" ? window.localStorage : window.sessionStorage;
    // Accessing storage can throw in some browser privacy modes.
    if (!s) return null;
    return s;
  } catch {
    return null;
  }
}

export const storageKeys = {
  activeTeamId: "activeTeamId",

  teamCreationProgress: "team_creation_progress",

  userPreferences: "boxcall_user_preferences",

  theme: "app-theme",

  sidebarPrefs: "sidebar:prefs",

  globalSearchHistory: "bc_search_history",

  activation: {
    flags: "bc_activation_flags",
  },

  recent: {
    playCombos: "bc_recent_play_combos",
  },

  auth: {
    supabaseAuth: "boxcall-auth",
    zustandAuth: "boxcall-auth-storage",
  },

  dev: {
    devMode: "boxcall-dev-mode",
    contrastEnabled: "debugContrast",
    contrastMode: "debugContrastMode",
  },

  errors: {
    stored: "boxcall_errors",
  },

  offline: {
    executionQueue: "boxcall_offline_executions",
  },

  practice: {
    planForEvent: (eventId?: string | null) =>
      `practice_plan_${eventId || "default"}`,
  },

  plays: {
    flagsForPlay: (id: string) => `bc_play_flags_${id}`,
  },

  playbook: {
    searchHistory: "playbook_search_history",
    advancedFiltersExpanded: "bc_advanced_filters_expanded",
    activePlaybookForTeam: (teamId: string) => `bc_active_playbook_${teamId}`,
    playcardDefaultExpanded: "bc_playcard_default_expanded",
    filterPresets: "bc_playbook_filter_presets_v1",
  },

  confetti: {
    todayKey: (suffix: string, yyyyMmDd: string) =>
      `bc_confetti_${suffix}_${yyyyMmDd}`,
  },

  preferences: {
    playgridOneword: "bc_playgrid_oneword",
    playgridDirectionFormat: "bc_playgrid_direction_format",
    playgridViewManual: "bc_playgrid_view_manual",
    playgridView: "bc_playgrid_view",
    formationFieldVisibility: "bc_formation_field_visibility",
    playDetailsFieldVisibility: "bc_play_details_field_visibility",
    recentlyViewedPlays: "bc_recently_viewed_plays",
    favoritePlays: "bc_favorite_plays",
  },

  security: {
    csrfTokenDash: "csrf-token",
    csrfTokenUnderscore: "csrf_token",
    csrfExpiry: "csrf_expiry",
    lastActivity: "lastActivity",
  },

  session: {
    id: "bc_session_id",
    activeSession: "boxcall_active_session",
    returnUrl: "returnUrl",
  },
} as const;

export function getBrowserLocalStorage(): Storage | undefined {
  return getStorage("local") ?? undefined;
}

export function getBrowserSessionStorage(): Storage | undefined {
  return getStorage("session") ?? undefined;
}

export function readLocalString(key: string): string | null {
  const s = getStorage("local");
  if (!s) return null;

  try {
    return s.getItem(key);
  } catch {
    return null;
  }
}

export function writeLocalString(key: string, value: string): void {
  const s = getStorage("local");
  if (!s) return;

  try {
    s.setItem(key, value);
  } catch {
    // ignore
  }
}

export function removeLocalItem(key: string): void {
  const s = getStorage("local");
  if (!s) return;

  try {
    s.removeItem(key);
  } catch {
    // ignore
  }
}

export function readSessionString(key: string): string | null {
  const s = getStorage("session");
  if (!s) return null;

  try {
    return s.getItem(key);
  } catch {
    return null;
  }
}

export function writeSessionString(key: string, value: string): void {
  const s = getStorage("session");
  if (!s) return;

  try {
    s.setItem(key, value);
  } catch {
    // ignore
  }
}

export function removeSessionItem(key: string): void {
  const s = getStorage("session");
  if (!s) return;

  try {
    s.removeItem(key);
  } catch {
    // ignore
  }
}

export function readLocalJson<T>(
  key: string,
  options?: JsonReadOptions
): T | null {
  const raw = readLocalString(key);
  if (raw === null) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    if (options?.clearOnParseError) {
      removeLocalItem(key);
    }
    return null;
  }
}

export function writeLocalJson(key: string, value: unknown): void {
  writeLocalString(key, JSON.stringify(value));
}

export function readLocalBoolean01(key: string): boolean | null {
  const raw = readLocalString(key);
  if (raw === null) return null;
  if (raw === "1") return true;
  if (raw === "0") return false;
  return null;
}

export function writeLocalBoolean01(key: string, value: boolean): void {
  writeLocalString(key, value ? "1" : "0");
}

export function readLocalNumber(key: string): number | null {
  const raw = readLocalString(key);
  if (raw === null) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function writeLocalNumber(key: string, value: number): void {
  if (!Number.isFinite(value)) return;
  writeLocalString(key, String(value));
}
