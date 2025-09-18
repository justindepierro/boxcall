// FieldCanvasContextValues.ts
import type {
  FieldCanvasContextType,
  FieldCanvasState,
  FieldCanvasAction,
} from "./FieldCanvasContext.types";

export type { FieldCanvasContextType };

export const defaultContext: FieldCanvasContextType = {
  state: undefined as unknown as FieldCanvasState,
  dispatch: (() => {}) as React.Dispatch<FieldCanvasAction>,
  dragRef: { current: null } as unknown as React.RefObject<HTMLDivElement>,
  panRef: { current: null } as unknown as React.RefObject<HTMLDivElement>,
  annotDragRef: { current: null } as unknown as React.RefObject<HTMLDivElement>,
  selectionDragRef: {
    current: null,
  } as unknown as React.RefObject<HTMLDivElement>,
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
