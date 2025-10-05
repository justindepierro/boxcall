import { createContext } from "react";
import type { DiagramEditorState, DiagramEditorAction } from "../types/types";
import { createEmptyDocument } from "../types/types";
import { colorTokens } from "../../../../design-system/tokens";

const initialState: DiagramEditorState = {
  doc: createEmptyDocument(),
  ui: {
    tool: "select",
    routeMode: undefined,
    drawMode: undefined,
    drawColor: "#000000",
    drawWidth: 2,
    drawArrowHead: "none",
    zoom: 1,
    panX: 0,
    panY: 0,
    snap: true,
    snapGrid: 2,
  },
  dirty: false,
  history: [],
  historyIndex: -1,
};

export const DiagramEditorContext = createContext<{
  state: DiagramEditorState;
  dispatch: React.Dispatch<DiagramEditorAction>;
}>({ state: initialState, dispatch: () => {} });
export { initialState };
