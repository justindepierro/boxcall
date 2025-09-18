// FieldCanvasContext.types.ts

// Define initial state shape
export type ShapeType = {
  type: "rect" | "circle";
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
};
export type LineType = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
};
export type PlayerType = {
  id: string;
  x: number;
  y: number;
  name?: string;
};
export type RouteSegmentType = {
  id: string;
  type: "curve" | "line";
  points: { x: number; y: number }[];
};
export type RouteType = {
  id: string;
  segments: RouteSegmentType[];
};
export type AnnotationType = {
  id: string;
  type: "connector" | "note";
  from?: { x: number; y: number };
  to?: { x: number; y: number };
  points?: { x: number; y: number }[];
  color?: string;
  width?: number;
};
export type FieldType = {
  theme: string;
};
export type FieldCanvasState = {
  ui: {
    tool: string;
    panX: number;
    panY: number;
    zoom: number;
    drawMode: string;
    snap: boolean;
    snapGrid: number;
    selection: string[];
  };
  doc: {
    players: PlayerType[];
    routes: RouteType[];
    annotations: AnnotationType[];
    field: FieldType;
    shapes?: ShapeType[];
    lines?: LineType[];
  };
};

// Define action types
export type FieldCanvasAction =
  | { type: "SET_TOOL"; tool: string }
  | { type: "SET_DRAW_MODE"; mode: string }
  | { type: "TOGGLE_SNAP" }
  | { type: "SET_ZOOM"; zoom: number }
  | { type: "PAN"; dx: number; dy: number }
  | { type: "ADD_PLAYER"; player: PlayerType }
  | { type: "UPDATE_PLAYER"; id: string; updates: Partial<PlayerType> }
  | { type: "REMOVE_PLAYER"; id: string }
  | { type: "ADD_ROUTE"; route: RouteType }
  | { type: "UPDATE_ROUTE"; id: string; updates: Partial<RouteType> }
  | { type: "REMOVE_ROUTE"; id: string }
  | { type: "ADD_ANNOTATION"; annotation: AnnotationType }
  | {
      type: "UPDATE_ANNOTATION";
      id: string;
      updates: Partial<AnnotationType>;
    }
  | { type: "REMOVE_ANNOTATION"; id: string }
  | { type: "SET_SELECTION"; selection: string[] }
  | { type: "CLEAR_SELECTION" }
  | { type: "SET_FIELD_THEME"; theme: string }
  | { type: "LOAD_DOCUMENT"; doc: FieldCanvasState["doc"] }
  | { type: "SET_SHAPES"; shapes: ShapeType[] }
  | { type: "SET_LINES"; lines: LineType[] };

// Define context type
export type SelectionBoxType = {
  x: number;
  y: number;
  w: number;
  h: number;
} | null;
export type SnapVizType = { x: number; y: number; show: boolean };
export type SnapPulseType = { id: number; x: number; y: number; t0: number };
export type AlignGuidesType = {
  vertical?: number[];
  horizontal?: number[];
} | null;
export type GuideFadeType = {
  guides: { vertical?: number[]; horizontal?: number[] };
  hasCenterX?: boolean;
  hasCenterY?: boolean;
  t0: number;
} | null;
export type CenterFlashType = { x?: boolean; y?: boolean; t0: number } | null;

export type FieldCanvasContextType = {
  state: FieldCanvasState;
  dispatch: React.Dispatch<FieldCanvasAction>;
  dragRef: React.RefObject<HTMLDivElement | null>;
  panRef: React.RefObject<HTMLDivElement | null>;
  annotDragRef: React.RefObject<HTMLDivElement | null>;
  selectionDragRef: React.RefObject<HTMLDivElement | null>;
  nudgeBatchRef: React.RefObject<{
    events: number;
    playersMoved: number;
    timer: number | null;
  }>;
  selectionBox: SelectionBoxType;
  setSelectionBox: React.Dispatch<React.SetStateAction<SelectionBoxType>>;
  hoverAnnId: string | undefined;
  setHoverAnnId: (id: string | undefined) => void;
  snapViz: SnapVizType;
  setSnapViz: (viz: SnapVizType) => void;
  snapPulses: SnapPulseType[];
  setSnapPulses: (pulses: SnapPulseType[]) => void;
  alignGuides: AlignGuidesType;
  setAlignGuides: (guides: AlignGuidesType) => void;
  guideLiveOpacity: number;
  setGuideLiveOpacity: (opacity: number) => void;
  lastGuidesRef: React.RefObject<AlignGuidesType>;
  guideFade: GuideFadeType;
  setGuideFade: (fade: GuideFadeType) => void;
  centerFlash: CenterFlashType;
  setCenterFlash: (flash: CenterFlashType) => void;
};
