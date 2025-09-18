export type PlayFlagCategory = "positions" | "players" | "flags";

export interface PlayFlags {
  positions: string[];
  players: string[];
  flags: string[];
}

const KEY = (id: string) => `bc_play_flags_${id}`;

export function getPlayFlags(id: string): PlayFlags {
  try {
    const raw = localStorage.getItem(KEY(id));
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PlayFlags>;
      return {
        positions: Array.isArray(parsed.positions) ? parsed.positions : [],
        players: Array.isArray(parsed.players) ? parsed.players : [],
        flags: Array.isArray(parsed.flags) ? parsed.flags : [],
      };
    }
  } catch {
    /* ignore */
  }
  return { positions: [], players: [], flags: [] };
}

export function setPlayFlags(id: string, data: PlayFlags): void {
  try {
    localStorage.setItem(KEY(id), JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function addFlag(
  id: string,
  category: PlayFlagCategory,
  value: string
): PlayFlags {
  const cur = getPlayFlags(id);
  const v = value.trim();
  if (!v) return cur;
  const next: PlayFlags = {
    positions: cur.positions,
    players: cur.players,
    flags: cur.flags,
  };
  if (!next[category].includes(v)) next[category] = [...next[category], v];
  setPlayFlags(id, next);
  return next;
}

export function removeFlag(
  id: string,
  category: PlayFlagCategory,
  value: string
): PlayFlags {
  const cur = getPlayFlags(id);
  const next: PlayFlags = {
    positions: cur.positions,
    players: cur.players,
    flags: cur.flags,
  };
  next[category] = next[category].filter((x) => x !== value);
  setPlayFlags(id, next);
  return next;
}

export const POSITION_OPTIONS = [
  "QB",
  "RB",
  "WR",
  "TE",
  "OL",
  "DL",
  "LB",
  "CB",
  "S",
  "K",
  "P",
];
