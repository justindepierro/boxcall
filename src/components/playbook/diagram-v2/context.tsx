/* eslint-disable */
import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";
import type { DiagramEditorState, DiagramEditorAction } from "./types";
import { createEmptyDocument } from "./types";

const initialState: DiagramEditorState = {
  doc: createEmptyDocument(),
  ui: { tool: "select", zoom: 1, panX: 0, panY: 0 },
  dirty: false,
};

function reducer(
  state: DiagramEditorState,
  action: DiagramEditorAction
): DiagramEditorState {
  switch (action.type) {
    case "INIT":
      return { ...state, doc: action.doc, dirty: false };
    case "SET_TOOL":
      return { ...state, ui: { ...state.ui, tool: action.tool } };
    case "SET_ACTIVE_PLAYER":
      return { ...state, ui: { ...state.ui, activePlayerId: action.id } };
    case "ADD_PLAYER":
      return {
        ...state,
        doc: {
          ...state.doc,
          players: [...state.doc.players, action.player],
          meta: { ...state.doc.meta!, updatedAt: Date.now() },
        },
        dirty: true,
      };
    case "MOVE_PLAYER":
      return {
        ...state,
        doc: {
          ...state.doc,
          players: state.doc.players.map((p) =>
            p.id === action.id ? { ...p, x: action.x, y: action.y } : p
          ),
          meta: { ...state.doc.meta!, updatedAt: Date.now() },
        },
        dirty: true,
      };
    case "ADD_ROUTE_SEGMENT":
      return {
        ...state,
        doc: {
          ...state.doc,
          routes: [
            ...state.doc.routes,
            {
              id: action.segment.id,
              playerId: action.playerId,
              segments: [action.segment],
            },
          ],
          meta: { ...state.doc.meta!, updatedAt: Date.now() },
        },
        dirty: true,
      };
    case "SET_ZOOM":
      return { ...state, ui: { ...state.ui, zoom: action.zoom } };
    case "PAN":
      return {
        ...state,
        ui: {
          ...state.ui,
          panX: state.ui.panX + action.dx,
          panY: state.ui.panY + action.dy,
        },
      };
    case "TOGGLE_FIELD_FLAG":
      return {
        ...state,
        doc: {
          ...state.doc,
          field: {
            ...state.doc.field,
            [action.flag]: !state.doc.field[action.flag],
          },
          meta: { ...state.doc.meta!, updatedAt: Date.now() },
        },
        dirty: true,
      };
    case "MARK_SAVED":
      return { ...state, dirty: false };
    default:
      return state;
  }
}

const DiagramEditorContext = createContext<{
  state: DiagramEditorState;
  dispatch: React.Dispatch<DiagramEditorAction>;
}>({ state: initialState, dispatch: () => {} });

export const DiagramEditorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <DiagramEditorContext.Provider value={{ state, dispatch }}>
      {children}
    </DiagramEditorContext.Provider>
  );
};

export const useDiagramEditor = () => useContext(DiagramEditorContext);

export const useAddPlayer = () => {
  const { dispatch } = useDiagramEditor();
  return useCallback(() => {
    dispatch({
      type: "ADD_PLAYER",
      player: {
        id: `P${Date.now().toString(36)}`,
        label: "P",
        x: 50,
        y: 60,
        color: "#2563eb",
      },
    });
  }, [dispatch]);
};
