// Diagram Builder v2 core types (stable schema V1)
export interface DiagramPlayer {
  id: string;
  label: string; // e.g., QB, X, Y
  role?: string; // semantic role for analytics
  side?: "O" | "D" | "ST";
  x: number; // 0..100 percent
  y: number; // 0..100 percent
  color?: string;
  locked?: boolean; // disallow move
}

export interface RoutePoint {
  x: number;
  y: number;
}
export interface RouteSegment {
  id: string;
  type: "line"; // future: 'curve','block','motion'
  points: RoutePoint[]; // first point is segment start reference
}
export interface PlayerRoute {
  id: string;
  playerId: string;
  segments: RouteSegment[];
  color?: string;
}
export interface DiagramFieldConfig {
  orientation: "vertical"; // fixed perspective: behind QB looking downfield
  backYards: number; // yards shown behind line of scrimmage (e.g., 10)
  forwardYards: number; // yards shown downfield (e.g., 30)
  showYardLines: boolean;
  showHashMarks: boolean;
  showPlayerLabels: boolean;
  showDefensePlayers: boolean; // toggle to display defensive players
  ballHash: "left" | "middle" | "right"; // positioning of ball/center
  theme?: "classic" | "mono-light" | "mono-dark"; // visual theme style
}
export interface DiagramDocumentV1 {
  version: 1;
  field: DiagramFieldConfig;
  players: DiagramPlayer[];
  routes: PlayerRoute[];
  meta?: { createdAt: number; updatedAt: number };
}
export type DiagramDocument = DiagramDocumentV1; // future union

export interface EditorToolState {
  tool: "select" | "pan" | "add-player" | "route" | "motion" | "delete";
  activePlayerId?: string;
  zoom: number; // 1 = 100%
  panX: number; // px offset
  panY: number; // px offset
  drawing?: {
    playerId: string;
    anchorPoints: RoutePoint[]; // committed anchor points (first is start)
    preview?: RoutePoint; // current hover point
  };
  snap: boolean;
  snapGrid: number; // percent units (e.g., 2 => every 2%)
}

export interface DiagramEditorState {
  doc: DiagramDocument;
  ui: EditorToolState;
  dirty: boolean;
  history: DiagramDocument[];
  historyIndex: number; // points to current doc (history[historyIndex])
}

export type DiagramEditorAction =
  | { type: "INIT"; doc: DiagramDocument }
  | { type: "SET_TOOL"; tool: EditorToolState["tool"] }
  | { type: "SET_ACTIVE_PLAYER"; id?: string }
  | { type: "ADD_PLAYER"; player: DiagramPlayer }
  | { type: "MOVE_PLAYER"; id: string; x: number; y: number }
  | { type: "ADD_ROUTE_SEGMENT"; playerId: string; segment: RouteSegment }
  | { type: "SET_ZOOM"; zoom: number }
  | { type: "PAN"; dx: number; dy: number }
  | { type: "TOGGLE_FIELD_FLAG"; flag: keyof DiagramFieldConfig }
  | { type: "SET_BALL_HASH"; hash: DiagramFieldConfig["ballHash"] }
  | { type: "SET_FIELD_THEME"; theme: NonNullable<DiagramFieldConfig['theme']> }
  | { type: "START_ROUTE"; playerId: string; start: RoutePoint }
  | { type: "PREVIEW_ROUTE"; point: RoutePoint }
  | { type: "ADD_ROUTE_POINT"; point: RoutePoint }
  | { type: "COMMIT_ROUTE" }
  | { type: "CANCEL_ROUTE" }
  | { type: "DELETE_ROUTE"; routeId: string }
  | { type: "UPDATE_PLAYER"; id: string; patch: Partial<DiagramPlayer> }
  | { type: "REMOVE_PLAYER"; id: string }
  | { type: "SET_SNAP"; enabled: boolean }
  | { type: "SET_SNAP_GRID"; size: number }
  | { type: "MIRROR" }
  | { type: "APPLY_FORMATION"; formation: string }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "MARK_SAVED" };

export const createEmptyDocument = (): DiagramDocument => ({
  version: 1,
  field: {
    orientation: "vertical",
    backYards: 10,
    forwardYards: 30,
    showYardLines: true,
    showHashMarks: true,
    showPlayerLabels: true,
    showDefensePlayers: true,
    ballHash: "middle",
  theme: "classic",
  },
  // Default offensive line template (LT LG C RG RT + QB behind center)
  players: (() => {
    const back = 10;
    const forward = 30;
    const total = back + forward; // 40
    const losY = (forward / total) * 100; // percent from top
    const qbDepthYards = 3; // typical shotgun depth baseline; adjust later
    const scalePctPerYard = 100 / total; // 2.5% per yard for 40 yard window
    const qbY = Math.min(99, losY + qbDepthYards * scalePctPerYard);
    const lineXs = [42, 46, 50, 54, 58];
    const labels = ["LT", "LG", "C", "RG", "RT"] as const;
    return [
      ...lineXs.map((x, i) => ({
        id: labels[i],
        label: labels[i],
        role:
          labels[i] === "C"
            ? "C"
            : labels[i].startsWith("L") || labels[i].startsWith("R")
              ? labels[i].slice(1)
              : undefined,
        side: "O" as const,
        x,
        y: losY,
        color: "#1e3a8a",
      })),
      {
        id: "QB",
        label: "QB",
        role: "QB",
        side: "O" as const,
        x: 50,
        y: qbY,
        color: "#047857",
      },
    ];
  })(),
  routes: [],
  meta: { createdAt: Date.now(), updatedAt: Date.now() },
});

export const computeComplexityScore = (doc: DiagramDocument): number => {
  const routeSegments = doc.routes.reduce(
    (acc, r) => acc + r.segments.length,
    0
  );
  const playersWithRoutes = new Set(doc.routes.map((r) => r.playerId)).size;
  const raw = Math.ceil((routeSegments + playersWithRoutes) / 3);
  return Math.min(5, Math.max(1, raw || 1));
};
