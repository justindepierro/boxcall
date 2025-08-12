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
  orientation: "horizontal" | "vertical";
  showYardLines: boolean;
  showHashMarks: boolean;
  showPlayerLabels: boolean;
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
  tool: "select" | "pan" | "add-player" | "route" | "delete";
  activePlayerId?: string;
  zoom: number; // 1 = 100%
  panX: number; // px offset
  panY: number; // px offset
}

export interface DiagramEditorState {
  doc: DiagramDocument;
  ui: EditorToolState;
  dirty: boolean;
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
  | { type: "MARK_SAVED" };

export const createEmptyDocument = (): DiagramDocument => ({
  version: 1,
  field: {
    orientation: "horizontal",
    showYardLines: true,
    showHashMarks: true,
    showPlayerLabels: true,
  },
  players: [],
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
