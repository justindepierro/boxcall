/**
 * Formation Diagram Helpers - Minimal Stub
 *
 * This is a temporary stub for the archived formationDiagramHelpers.
 * The formation system has been simplified and these utilities are no longer needed.
 */

export type DiagramTemplatePlayer = {
  id: string;
  position?: { x: number; y: number };
  label?: string;
  number?: number;
  role?: string;
};

export type DiagramTemplate = {
  version: number;
  players: DiagramTemplatePlayer[];
  routes?: unknown[];
  fieldType?: string;
};

export function importFormationAsTemplate(data: unknown): DiagramTemplate {
  const formation = data as {
    player_positions?: Array<
      Partial<DiagramTemplatePlayer> & { id?: string; position?: unknown }
    >;
  };

  const players: DiagramTemplatePlayer[] = Array.isArray(
    formation?.player_positions
  )
    ? formation.player_positions
        .map((p, index) => {
          const pos = p?.position as { x?: number; y?: number } | undefined;
          const x = typeof pos?.x === "number" ? pos.x : undefined;
          const y = typeof pos?.y === "number" ? pos.y : undefined;
          return {
            id: typeof p?.id === "string" ? p.id : `p_${index}`,
            position: x !== undefined && y !== undefined ? { x, y } : undefined,
            label: typeof p?.label === "string" ? p.label : undefined,
            number: typeof p?.number === "number" ? p.number : undefined,
            role: typeof p?.role === "string" ? p.role : undefined,
          };
        })
        .filter((p) => typeof p.id === "string")
    : [];

  return {
    version: 1,
    players,
    routes: [],
    fieldType: "offense",
  };
}

export function validateFormationData(_data: any) {
  return { valid: true, errors: [] as string[] };
}

export function normalizeFormationPositions(_positions: any[]) {
  return _positions;
}
