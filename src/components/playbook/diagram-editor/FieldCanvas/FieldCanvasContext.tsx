import { FieldCanvasContext } from "./FieldCanvasContextInstance";
import React, { useReducer, useRef, useState } from "react";
import { colorTokens } from "../../../../design-system/tokens";
// Only types and provider are exported from this file. Context instance is imported from FieldCanvasContextInstance.ts

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
const initialState: FieldCanvasState = {
  ui: {
    tool: "pan",
    panX: 0,
    panY: 0,
    zoom: 1,
    drawMode: "curve",
    snap: true,
    snapGrid: 1,
    selection: [],
  },
  doc: {
    players: [],
    routes: [],
    annotations: [],
    field: { theme: "classic" },
    shapes: [
      {
        type: "rect",
        x: 100,
        y: 100,
        width: 120,
        height: 80,
        color: colorTokens.blue[100],
      },
      {
        type: "circle",
        x: 300,
        y: 200,
        width: 60,
        height: 60,
        color: colorTokens.amber[400],
      },
    ],
    lines: [
      { x1: 150, y1: 140, x2: 360, y2: 230, color: colorTokens.blue[600] },
    ],
  },
};

type FieldCanvasAction =
  | { type: "SET_SELECTION"; ids: string[] }
  | { type: "SET_TOOL"; tool: string }
  | { type: "SET_SHAPES"; shapes: ShapeType[] }
  | { type: "SET_LINES"; lines: LineType[] }
  | { type: string; [key: string]: unknown };

export type { FieldCanvasAction };

function reducer(
  state: FieldCanvasState,
  action: FieldCanvasAction
): FieldCanvasState {
  switch (action.type) {
    case "SET_SELECTION":
      if (Array.isArray((action as { ids?: unknown }).ids)) {
        return {
          ...state,
          ui: { ...state.ui, selection: (action as { ids: string[] }).ids },
        };
      }
      return state;
    case "SET_TOOL":
      if (typeof (action as { tool?: unknown }).tool === "string") {
        return {
          ...state,
          ui: { ...state.ui, tool: (action as { tool: string }).tool },
        };
      }
      return state;
    case "SET_SHAPES":
      if (Array.isArray((action as { shapes?: unknown }).shapes)) {
        return {
          ...state,
          doc: {
            ...state.doc,
            shapes: (action as { shapes: ShapeType[] }).shapes,
          },
        };
      }
      return state;
    case "SET_LINES":
      if (Array.isArray((action as { lines?: unknown }).lines)) {
        return {
          ...state,
          doc: { ...state.doc, lines: (action as { lines: LineType[] }).lines },
        };
      }
      return state;
    // ...other actions...
    default:
      return state;
  }
}

type SelectionBoxType = { x: number; y: number; w: number; h: number } | null;
type SnapVizType = { x: number; y: number; show: boolean };
type SnapPulseType = { id: number; x: number; y: number; t0: number };
type AlignGuidesType = { vertical?: number[]; horizontal?: number[] } | null;
type GuideFadeType = {
  guides: { vertical?: number[]; horizontal?: number[] };
  hasCenterX?: boolean;
  hasCenterY?: boolean;
  t0: number;
} | null;
type CenterFlashType = { x?: boolean; y?: boolean; t0: number } | null;

export type FieldCanvasContextType = {
  state: FieldCanvasState;
  dispatch: React.Dispatch<FieldCanvasAction>;
  dragRef: React.RefObject<unknown>;
  panRef: React.RefObject<unknown>;
  annotDragRef: React.RefObject<unknown>;
  selectionDragRef: React.RefObject<unknown>;
  nudgeBatchRef: React.RefObject<{
    events: number;
    playersMoved: number;
    timer: number | null;
  }>;
  selectionBox: SelectionBoxType;
  setSelectionBox: React.Dispatch<React.SetStateAction<SelectionBoxType>>;
  hoverAnnId: string | undefined;
  setHoverAnnId: React.Dispatch<React.SetStateAction<string | undefined>>;
  snapViz: SnapVizType;
  setSnapViz: React.Dispatch<React.SetStateAction<SnapVizType>>;
  snapPulses: SnapPulseType[];
  setSnapPulses: React.Dispatch<React.SetStateAction<SnapPulseType[]>>;
  alignGuides: AlignGuidesType;
  setAlignGuides: React.Dispatch<React.SetStateAction<AlignGuidesType>>;
  guideLiveOpacity: number;
  setGuideLiveOpacity: React.Dispatch<React.SetStateAction<number>>;
  lastGuidesRef: React.RefObject<{
    guides: { vertical?: number[]; horizontal?: number[] };
    hasCenterX?: boolean;
    hasCenterY?: boolean;
  } | null>;
  guideFade: GuideFadeType;
  setGuideFade: React.Dispatch<React.SetStateAction<GuideFadeType>>;
  centerFlash: CenterFlashType;
  setCenterFlash: React.Dispatch<React.SetStateAction<CenterFlashType>>;
};

// Context and default values are now provided by FieldCanvasContextValues.ts and FieldCanvasContextInstance.ts

export function FieldCanvasProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const dragRef = useRef(null);
  const panRef = useRef(null);
  const annotDragRef = useRef(null);
  const selectionDragRef = useRef(null);
  const nudgeBatchRef = useRef({ events: 0, playersMoved: 0, timer: null });
  const [selectionBox, setSelectionBox] = useState<SelectionBoxType>(null);
  const [hoverAnnId, setHoverAnnId] = useState<string | undefined>(undefined);
  const [snapViz, setSnapViz] = useState({ x: 0, y: 0, show: false });
  const [snapPulses, setSnapPulses] = useState<SnapPulseType[]>([]);
  const [alignGuides, setAlignGuides] = useState<AlignGuidesType>(null);
  const [guideLiveOpacity, setGuideLiveOpacity] = useState(0);
  const lastGuidesRef = useRef<{
    guides: { vertical?: number[]; horizontal?: number[] };
    hasCenterX?: boolean;
    hasCenterY?: boolean;
  } | null>(null);
  const [guideFade, setGuideFade] = useState<GuideFadeType>(null);
  const [centerFlash, setCenterFlash] = useState<CenterFlashType>(null);
  const value: FieldCanvasContextType = {
    state,
    dispatch,
    dragRef,
    panRef,
    annotDragRef,
    selectionDragRef,
    nudgeBatchRef,
    selectionBox,
    setSelectionBox,
    hoverAnnId,
    setHoverAnnId,
    snapViz,
    setSnapViz,
    snapPulses,
    setSnapPulses,
    alignGuides,
    setAlignGuides,
    guideLiveOpacity,
    setGuideLiveOpacity,
    lastGuidesRef,
    guideFade,
    setGuideFade,
    centerFlash,
    setCenterFlash,
  };
  return (
    <FieldCanvasContext.Provider value={value}>
      {children}
    </FieldCanvasContext.Provider>
  );
}
