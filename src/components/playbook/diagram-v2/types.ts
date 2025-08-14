// Diagram Builder v2 core types (stable schema V1)
export interface DiagramPlayer {
  id: string;
  label: string; // e.g., QB, X, Y
  role?: string; // semantic role for analytics
  side?: "O" | "D" | "ST";
  x: number; // 0..100 percent
  y: number; // 0..100 percent
  color?: string;
  outlineColor?: string; // stroke / outline color
  locked?: boolean; // disallow move
  assignment?: string; // freeform assignment/notes
}

export interface RoutePoint {
  x: number;
  y: number;
}
export interface RouteSegment {
  id: string;
  type: "line" | "curve"; // 'curve' uses quadratic segments with [start, control, end]
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
  losYards?: number; // yard marker within forward slice to render LOS (e.g., 20)
  showYardLines: boolean;
  showHashMarks: boolean;
  showPlayerLabels: boolean;
  showDefensePlayers: boolean; // toggle to display defensive players
  showRedZone?: boolean; // highlight red zone (top 20 yards of slice)
  ballHash: "left" | "middle" | "right"; // positioning of ball/center
  theme?: "classic" | "mono-light" | "mono-dark"; // visual theme style
  hashLayout?: "highschool" | "college" | "nfl"; // governs hash spacing
}
export interface DiagramDocumentV1 {
  version: 1;
  field: DiagramFieldConfig;
  players: DiagramPlayer[];
  routes: PlayerRoute[];
  // Optional generic annotations (lines/arrows/freehand/connectors)
  annotations?: DiagramAnnotation[];
  meta?: { createdAt: number; updatedAt: number };
}
export type DiagramDocument = DiagramDocumentV1; // future union

export interface EditorToolState {
  tool: "select" | "pan" | "add-player" | "route" | "draw" | "motion" | "delete";
  routeMode?: "line" | "curve"; // how new route segments should be created
  drawMode?: "line" | "arrow" | "freehand" | "connector" | "curve" | "dashed" | "dotted"; // drawing subtype
  drawColor?: string;
  drawWidth?: number;
  drawArrowHead?: "none" | "start" | "end" | "both";
  activePlayerId?: string; // deprecated single selection for backwards compat
  selectedIds?: string[]; // multi-selection
  selectedAnnotationId?: string; // single annotation selection for editing
  zoom: number; // 1 = 100%
  panX: number; // px offset
  panY: number; // px offset
  dragging?: boolean; // true while user is dragging (pan/selection/player)
  drawing?: {
    playerId: string;
    anchorPoints: RoutePoint[]; // committed anchor points (first is start)
    preview?: RoutePoint; // current hover point
  };
  // Annotation in-progress (line/arrow/freehand/connector)
  annotating?: {
    type: NonNullable<EditorToolState["drawMode"]>;
    points: RoutePoint[]; // committed points
    preview?: RoutePoint; // hover point when applicable
    // For connectors
    fromPlayerId?: string;
    toPlayerId?: string;
    freehand?: boolean; // capture continuous points
  };
  snap: boolean;
  snapGrid: number; // percent units (e.g., 2 => every 2%)
  prevSlice?: { backYards: number; forwardYards: number; losYards?: number }; // remember previous slice when entering red zone mode
  pendingDeleteId?: string; // player id awaiting delete confirmation
  pendingBulkDelete?: boolean; // awaiting confirmation for multi-delete
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
  | { type: "SET_ROUTE_MODE"; mode: NonNullable<EditorToolState["routeMode"]> }
  | { type: "SET_DRAW_MODE"; mode: NonNullable<EditorToolState["drawMode"]> }
  | { type: "SET_DRAW_COLOR"; color: string }
  | { type: "SET_DRAW_WIDTH"; width: number }
  | { type: "SET_DRAW_ARROW_HEAD"; arrowHead: NonNullable<EditorToolState["drawArrowHead"]> }
  | { type: "UPDATE_ANNOT_STYLE"; id: string; patch: { color?: string; width?: number; arrowHead?: "none" | "start" | "end" | "both" } }
  | { type: "SET_ACTIVE_PLAYER"; id?: string }
  | { type: "SET_SELECTION"; ids: string[] }
  | { type: "TOGGLE_SELECT"; id: string }
  | { type: "CLEAR_SELECTION" }
  | {
      type: "MOVE_SELECTION";
      patches: { id: string; x: number; y: number }[];
      mode?: "nudge" | "drag"; // interaction modality (keyboard nudge vs mouse drag)
    }
  | { type: "COMMIT_MOVE" }
  | { type: "ADD_PLAYER"; player: DiagramPlayer }
  | { type: "MOVE_PLAYER"; id: string; x: number; y: number }
  | { type: "ADD_ROUTE_SEGMENT"; playerId: string; segment: RouteSegment }
  | { type: "SET_ZOOM"; zoom: number }
  | { type: "PAN"; dx: number; dy: number }
  | { type: "TOGGLE_FIELD_FLAG"; flag: keyof DiagramFieldConfig }
  | { type: "SET_BALL_HASH"; hash: DiagramFieldConfig["ballHash"] }
  | { type: "SET_FIELD_THEME"; theme: NonNullable<DiagramFieldConfig["theme"]> }
  | {
      type: "SET_FIELD_HASH_LAYOUT";
      layout: NonNullable<DiagramFieldConfig["hashLayout"]>;
    }
  | { type: "START_ROUTE"; playerId: string; start: RoutePoint }
  | { type: "PREVIEW_ROUTE"; point: RoutePoint }
  | { type: "ADD_ROUTE_POINT"; point: RoutePoint }
  | { type: "COMMIT_ROUTE" }
  | { type: "CANCEL_ROUTE" }
  | { type: "POP_ROUTE_POINT" }
  | { type: "UPDATE_ROUTE_POINT"; routeId: string; segIndex: number; pointIndex: number; point: RoutePoint }
  | { type: "COMMIT_ROUTE_EDIT" }
  | { type: "DELETE_ROUTE"; routeId: string }
  // Annotation actions
  | { type: "START_ANNOTATION"; drawType: NonNullable<EditorToolState["drawMode"]>; start?: RoutePoint; fromPlayerId?: string }
  | { type: "PREVIEW_ANNOTATION"; point: RoutePoint }
  | { type: "ADD_ANNOTATION_POINT"; point: RoutePoint }
  | { type: "ADD_FREEHAND_POINT"; point: RoutePoint }
  | { type: "SET_ANNOTATION_TO"; toPlayerId: string }
  | { type: "COMMIT_ANNOTATION" }
  | { type: "CANCEL_ANNOTATION" }
  | { type: "POP_ANNOTATION_POINT" }
  | { type: "SELECT_ANNOTATION"; id?: string }
  | { type: "DELETE_ANNOTATION"; id: string }
  | { type: "UPDATE_ANNOT_POINT"; id: string; pointIndex: number; point: RoutePoint }
  | { type: "COMMIT_ANNOT_EDIT"; id: string }
  | { type: "MOVE_ANNOTATION"; id: string; dx: number; dy: number }
  | { type: "DUPLICATE_ANNOTATION"; id: string }
  | { type: "UPDATE_PLAYER"; id: string; patch: Partial<DiagramPlayer> }
  | { type: "REMOVE_PLAYER"; id: string }
  | { type: "REORDER_PLAYER"; id: string; direction: "up" | "down" }
  | { type: "MOVE_PLAYER_INDEX"; id: string; toIndex: number }
  | { type: "REMOVE_PLAYERS"; ids: string[] }
  | { type: "SET_PENDING_BULK_DELETE"; pending: boolean }
  | { type: "SET_PENDING_DELETE"; id?: string }
  | {
      type: "UPDATE_PLAYERS_BULK";
      ids: string[];
      patch: Partial<DiagramPlayer>;
    }
  | { type: "SET_SNAP"; enabled: boolean }
  | { type: "SET_SNAP_GRID"; size: number }
  // Alignment and distribution of selected players
  | { type: "ALIGN_SELECTION"; axis: "x" | "y"; align: "start" | "center" | "end" }
  | { type: "DISTRIBUTE_SELECTION"; axis: "x" | "y" }
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
    losYards: 20,
    showYardLines: true,
    showHashMarks: true,
    showPlayerLabels: true,
    showDefensePlayers: true,
    showRedZone: false,
    ballHash: "middle",
    theme: "classic",
    hashLayout: "highschool",
  },
  // Default 11 personnel 2x2 formation (LT LG C RG RT, QB shallow, RB deeper, X/Z outside, Y/H slots)
  players: (() => {
    const back = 10;
    const forward = 30;
    const total = back + forward; // 40
    const losY = (forward / total) * 100; // percent from top (baseline reference)
    const qbDepthYards = 0.5; // much closer per request
    const scalePctPerYard = 100 / total; // 2.5% per yard for 40 yard window
    const qbY = Math.min(99, losY + qbDepthYards * scalePctPerYard);
    const lineXs = [42, 46, 50, 54, 58];
    const labels = ["LT", "LG", "C", "RG", "RT"] as const;
    const players = [
      ...lineXs.map((x, i) => ({
        id: labels[i],
        label: labels[i],
        role: labels[i] === "C" ? "C" : labels[i].slice(1),
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
      // Running Back 4 yards behind QB
      {
        id: "RB",
        label: "RB",
        role: "RB",
        side: "O" as const,
        x: 50,
        y: Math.min(99, qbY + 4 * scalePctPerYard),
        color: "#92400e",
      },
      // Outside Receivers X (left) and Z (right)
      {
        id: "X",
        label: "X",
        role: "WR",
        side: "O" as const,
        x: 25,
        y: losY + 2 * scalePctPerYard,
        color: "#2563eb",
      },
      {
        id: "Z",
        label: "Z",
        role: "WR",
        side: "O" as const,
        x: 75,
        y: losY + 2 * scalePctPerYard,
        color: "#2563eb",
      },
      // Slot Receivers Y (left slot) and H (right slot)
      {
        id: "Y",
        label: "Y",
        role: "WR",
        side: "O" as const,
        x: 38,
        y: losY + 1 * scalePctPerYard,
        color: "#1e3a8a",
      },
      {
        id: "H",
        label: "H",
        role: "WR",
        side: "O" as const,
        x: 62,
        y: losY + 1 * scalePctPerYard,
        color: "#1e3a8a",
      },
    ];
    return players;
  })(),
  routes: [],
  annotations: [],
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

// ===== Annotations =====
export type AnnotationType = "line" | "arrow" | "freehand" | "connector" | "dashed" | "dotted" | "curve";
export interface DiagramAnnotationBase {
  id: string;
  type: AnnotationType;
  color?: string;
  width?: number; // stroke width
  arrowHead?: "none" | "start" | "end" | "both";
}
export interface DiagramAnnotationLine extends DiagramAnnotationBase {
  type: "line" | "dashed" | "dotted";
  points: RoutePoint[]; // polyline
}
export interface DiagramAnnotationArrow extends DiagramAnnotationBase {
  type: "arrow";
  points: RoutePoint[]; // start -> end (polyline allowed)
}
export interface DiagramAnnotationCurve extends DiagramAnnotationBase {
  type: "curve";
  points: RoutePoint[]; // quadratic [start, control, end]
}
export interface DiagramAnnotationFreehand extends DiagramAnnotationBase {
  type: "freehand";
  points: RoutePoint[]; // many points captured while dragging
}
export interface DiagramAnnotationConnector extends DiagramAnnotationBase {
  type: "connector";
  fromPlayerId: string;
  toPlayerId: string;
}
export type DiagramAnnotation =
  | DiagramAnnotationLine
  | DiagramAnnotationArrow
  | DiagramAnnotationCurve
  | DiagramAnnotationFreehand
  | DiagramAnnotationConnector;
