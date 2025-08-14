// Formation library for Diagram Builder v2
// Provides a small set of offensive formations with idempotent application support.

import type { DiagramPlayer } from "./types";

export type FormationId =
  | "trips-right"
  | "trips-left"
  | "doubles"
  | "empty"
  | "bunch-right";

export const FORMATION_OPTIONS: { id: FormationId; label: string }[] = [
  { id: "trips-right", label: "Trips Right" },
  { id: "trips-left", label: "Trips Left" },
  { id: "doubles", label: "Doubles (2x2)" },
  { id: "empty", label: "Empty (3x2)" },
  { id: "bunch-right", label: "Bunch Right" },
];

export type FormationSpec = Record<
  string,
  { x: number; y: number; role: string; color: string }
>;

function baseColors() {
  return {
    ol: "#1e3a8a", // blue
    qb: "#047857", // green
    rb: "#92400e", // brown
    wrA: "#2563eb",
    wrB: "#1e3a8a",
  } as const;
}

export function getFormationSpec(
  id: FormationId,
  centerX: number,
  baseY: number
): FormationSpec | null {
  const c = baseColors();
  const OL = {
    LT: { x: centerX - 6, y: baseY, role: "OL", color: c.ol },
    LG: { x: centerX - 3, y: baseY, role: "OL", color: c.ol },
    C: { x: centerX, y: baseY, role: "C", color: c.ol },
    RG: { x: centerX + 3, y: baseY, role: "OL", color: c.ol },
    RT: { x: centerX + 6, y: baseY, role: "OL", color: c.ol },
  } satisfies FormationSpec;
  const QB = {
    QB: { x: centerX, y: Math.min(99, baseY + 1.25), role: "QB", color: c.qb },
  } as FormationSpec;
  const RB = {
    RB: { x: centerX, y: Math.min(99, baseY + 4), role: "RB", color: c.rb },
  } as FormationSpec;

  if (id === "trips-right") {
    return {
      ...OL,
      ...QB,
      ...RB,
      X: { x: centerX - 25, y: baseY + 1, role: "WR", color: c.wrA },
      Y: { x: centerX + 12, y: baseY + 1, role: "WR", color: c.wrB },
      Z: { x: centerX + 18, y: baseY + 1, role: "WR", color: c.wrB },
    };
  }
  if (id === "trips-left") {
    return {
      ...OL,
      ...QB,
      ...RB,
      Z: { x: centerX + 25, y: baseY + 1, role: "WR", color: c.wrA },
      Y: { x: centerX - 12, y: baseY + 1, role: "WR", color: c.wrB },
      X: { x: centerX - 18, y: baseY + 1, role: "WR", color: c.wrB },
    };
  }
  if (id === "doubles") {
    return {
      ...OL,
      ...QB,
      ...RB,
      X: { x: centerX - 25, y: baseY + 1, role: "WR", color: c.wrA },
      Y: { x: centerX - 12, y: baseY + 1, role: "WR", color: c.wrB },
      Z: { x: centerX + 25, y: baseY + 1, role: "WR", color: c.wrA },
      H: { x: centerX + 12, y: baseY + 1, role: "WR", color: c.wrB },
    };
  }
  if (id === "empty") {
    return {
      ...OL,
      ...QB,
      X: { x: centerX - 28, y: baseY + 1, role: "WR", color: c.wrA },
      Y: { x: centerX - 14, y: baseY + 1, role: "WR", color: c.wrB },
      Z: { x: centerX + 28, y: baseY + 1, role: "WR", color: c.wrA },
      H: { x: centerX + 14, y: baseY + 1, role: "WR", color: c.wrB },
      RB: { x: centerX, y: baseY + 1, role: "WR", color: c.wrB }, // RB flexed
    };
  }
  if (id === "bunch-right") {
    return {
      ...OL,
      ...QB,
      ...RB,
      X: { x: centerX - 25, y: baseY + 1, role: "WR", color: c.wrA },
      Y: { x: centerX + 8, y: baseY + 1, role: "WR", color: c.wrB },
      Z: { x: centerX + 11, y: baseY + 3, role: "WR", color: c.wrB },
      H: { x: centerX + 14, y: baseY + 1.5, role: "WR", color: c.wrB },
    };
  }
  return null;
}

export function applyFormationIdempotent(
  players: DiagramPlayer[],
  routes: { playerId: string }[],
  spec: FormationSpec
): {
  players: DiagramPlayer[];
  removedIds: string[];
  created: number;
  updated: number;
  removedDup: number;
} {
  const specLabels = new Set(Object.keys(spec));
  const byLabel: Record<string, DiagramPlayer[]> = {};
  players.forEach((p) => {
    if (specLabels.has(p.label)) {
      (byLabel[p.label] ||= []).push(p);
    }
  });
  const out: DiagramPlayer[] = [];
  let created = 0,
    updated = 0,
    removedDup = 0;
  const nonSpec = players.filter((p) => !specLabels.has(p.label));
  Object.entries(spec).forEach(([label, cfg]) => {
    const existingGroup = byLabel[label] || [];
    let canonical =
      existingGroup.find((p) => p.id === label) || existingGroup[0];
    if (canonical) {
      if (
        canonical.x !== cfg.x ||
        canonical.y !== cfg.y ||
        canonical.role !== cfg.role
      ) {
        canonical = { ...canonical, x: cfg.x, y: cfg.y, role: cfg.role };
        updated++;
      }
      out.push(canonical);
    } else {
      out.push({
        id: label,
        label,
        role: cfg.role,
        side: "O",
        x: cfg.x,
        y: cfg.y,
        color: cfg.color,
      });
      created++;
    }
    if (existingGroup.length > 1) {
      const canonicalId = out[out.length - 1].id;
      const dupes = existingGroup.filter((p) => p.id !== canonicalId);
      dupes.forEach((d) => {
        const hasRoute = routes.some((r) => r.playerId === d.id);
        if (!hasRoute) {
          removedDup++;
        } else {
          out.push(d);
        }
      });
    }
  });
  out.push(...nonSpec);
  const uniqueIds = new Set<string>();
  const finalPlayers: DiagramPlayer[] = [];
  for (const p of out) {
    if (uniqueIds.has(p.id)) continue;
    uniqueIds.add(p.id);
    finalPlayers.push(p);
  }
  const removedIds: string[] = [];
  players.forEach((p) => {
    if (!finalPlayers.some((fp) => fp.id === p.id)) {
      const hasRoute = routes.some((r) => r.playerId === p.id);
      if (!hasRoute) removedIds.push(p.id);
    }
  });
  return { players: finalPlayers, removedIds, created, updated, removedDup };
}
