import { createContext } from "react";
import type { DiagramEditorState, DiagramEditorAction } from "../types/types";

const initialState: DiagramEditorState = {
  // TODO: Fill with actual initial state
  doc: {} as DiagramEditorState["doc"],
  ui: {} as DiagramEditorState["ui"],
  dirty: false,
  history: [],
  historyIndex: -1,
};

export const DiagramEditorContext = createContext<{
  state: DiagramEditorState;
  dispatch: React.Dispatch<DiagramEditorAction>;
}>({ state: initialState, dispatch: () => {} });
export { initialState };
