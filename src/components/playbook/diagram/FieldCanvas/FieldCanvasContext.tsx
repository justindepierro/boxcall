import React, { useReducer, useRef, useState } from "react";
import { FieldCanvasContext } from "./FieldCanvasContextInstance";
import type {
  FieldCanvasState,
  FieldCanvasAction,
  ShapeType,
  LineType,
  PlayerType,
  RouteSegmentType,
  RouteType,
  AnnotationType,
  FieldType,
  SnapVizType,
  SnapPulseType,
  AlignGuidesType,
  GuideFadeType,
  CenterFlashType,
  SelectionBoxType,
  FieldCanvasContextType,
} from "./FieldCanvasContext.types";

// Re-export types for convenience
export type {
  ShapeType,
  LineType,
  PlayerType,
  RouteSegmentType,
  RouteType,
  AnnotationType,
  FieldType,
  FieldCanvasState,
  FieldCanvasAction,
  SelectionBoxType,
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
        color: "#e0e7ff",
      },
      {
        type: "circle",
        x: 300,
        y: 200,
        width: 60,
        height: 60,
        color: "#fbbf24",
      },
    ],
    lines: [{ x1: 150, y1: 140, x2: 360, y2: 230, color: "#2563eb" }],
  },
};

function reducer(
  state: FieldCanvasState,
  action: FieldCanvasAction
): FieldCanvasState {
  switch (action.type) {
    case "SET_SELECTION":
      return {
        ...state,
        ui: { ...state.ui, selection: action.selection },
      };
    case "SET_TOOL":
      return {
        ...state,
        ui: { ...state.ui, tool: action.tool },
      };
    case "SET_SHAPES":
      return {
        ...state,
        doc: {
          ...state.doc,
          shapes: action.shapes,
        },
      };
    case "SET_LINES":
      return {
        ...state,
        doc: { ...state.doc, lines: action.lines },
      };
    // ...other actions...
    default:
      return state;
  }
}

const FieldCanvasProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const dragRef = useRef<HTMLDivElement>(null);
  const panRef = useRef<HTMLDivElement>(null);
  const annotDragRef = useRef<HTMLDivElement>(null);
  const selectionDragRef = useRef<HTMLDivElement>(null);
  const nudgeBatchRef = useRef({ events: 0, playersMoved: 0, timer: null });
  const [selectionBox, setSelectionBox] = useState<SelectionBoxType>(null);
  const [hoverAnnId, setHoverAnnId] = useState<string | undefined>(undefined);
  const [snapViz, setSnapViz] = useState<SnapVizType>({
    x: 0,
    y: 0,
    show: false,
  });
  const [snapPulses, setSnapPulses] = useState<SnapPulseType[]>([]);
  const [alignGuides, setAlignGuides] = useState<AlignGuidesType>(null);
  const [guideLiveOpacity, setGuideLiveOpacity] = useState(0);
  const lastGuidesRef = useRef<AlignGuidesType>(null);
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
};

export { FieldCanvasProvider, FieldCanvasContext };
