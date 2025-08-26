// FieldCanvasContextValues.ts
import type { FieldCanvasContextType } from "./FieldCanvasContext";

export type { FieldCanvasContextType };

export const defaultContext: FieldCanvasContextType = {
  state:
    undefined as unknown as import("./FieldCanvasContext").FieldCanvasState,
  dispatch: (() => {}) as React.Dispatch<
    import("./FieldCanvasContext").FieldCanvasAction
  >,
  dragRef: { current: null } as React.RefObject<unknown>,
  panRef: { current: null } as React.RefObject<unknown>,
  annotDragRef: { current: null } as React.RefObject<unknown>,
  selectionDragRef: { current: null } as React.RefObject<unknown>,
  nudgeBatchRef: {
    current: { events: 0, playersMoved: 0, timer: null },
  } as React.RefObject<{
    events: number;
    playersMoved: number;
    timer: number | null;
  }>,
  selectionBox: null,
  setSelectionBox: (() => {}) as React.Dispatch<
    React.SetStateAction<null | { x: number; y: number; w: number; h: number }>
  >,
  hoverAnnId: undefined,
  setHoverAnnId: () => {},
  snapViz: { x: 0, y: 0, show: false },
  setSnapViz: () => {},
  snapPulses: [],
  setSnapPulses: () => {},
  alignGuides: null,
  setAlignGuides: () => {},
  guideLiveOpacity: 0,
  setGuideLiveOpacity: () => {},
  lastGuidesRef: { current: null },
  guideFade: null,
  setGuideFade: () => {},
  centerFlash: null,
  setCenterFlash: () => {},
};
