/* eslint-disable */
import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";
import type {
  DiagramEditorState,
  DiagramEditorAction,
  DiagramDocument,
} from "./types";
import { createEmptyDocument, computeComplexityScore } from "./types";
import { telemetry } from "../../../telemetry/dispatcher";
import { TelemetryEventTypes } from "../../../telemetry/events";

const HISTORY_CAP = 100;
const initialState: DiagramEditorState = {
  doc: createEmptyDocument(),
  ui: { tool: "select", zoom: 1, panX: 0, panY: 0, snap: false, snapGrid: 2 },
  dirty: false,
  history: [],
  historyIndex: -1,
};

function pushHistory(state: DiagramEditorState, nextDoc: DiagramDocument) {
  const trimmed = state.history.slice(0, state.historyIndex + 1);
  let newHistory = [...trimmed, nextDoc];
  if (newHistory.length > HISTORY_CAP) {
    newHistory = newHistory.slice(newHistory.length - HISTORY_CAP);
  }
  return {
    ...state,
    history: newHistory,
    historyIndex: newHistory.length - 1,
  };
}

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
    case "START_ROUTE":
      return {
        ...state,
        ui: {
          ...state.ui,
          drawing: { playerId: action.playerId, anchorPoints: [action.start] },
          tool: "route",
        },
      };
    case "PREVIEW_ROUTE":
      if (!state.ui.drawing) return state;
      return {
        ...state,
        ui: {
          ...state.ui,
          drawing: { ...state.ui.drawing, preview: action.point },
        },
      };
    case "ADD_ROUTE_POINT":
      if (!state.ui.drawing) return state;
      return {
        ...state,
        ui: {
          ...state.ui,
          drawing: {
            ...state.ui.drawing,
            anchorPoints: [...state.ui.drawing.anchorPoints, action.point],
            preview: undefined,
          },
        },
      };
    case "CANCEL_ROUTE":
      return { ...state, ui: { ...state.ui, drawing: undefined } };
    case "COMMIT_ROUTE": {
      if (!state.ui.drawing || state.ui.drawing.anchorPoints.length < 2)
        return { ...state, ui: { ...state.ui, drawing: undefined } };
      const seg = {
        id: `seg_${Date.now()}`,
        type: "line" as const,
        points: state.ui.drawing.anchorPoints,
      };
      const nextDoc: DiagramDocument = {
        ...state.doc,
        routes: [
          ...state.doc.routes,
          {
            id: `r_${Date.now()}`,
            playerId: state.ui.drawing.playerId,
            segments: [seg],
          },
        ],
        meta: { ...state.doc.meta!, updatedAt: Date.now() },
      };
      telemetry.enqueue({
        type: TelemetryEventTypes.PlayDiagramRouteAdd,
        data: {
          playerId: state.ui.drawing.playerId,
          length: seg.points.length,
        },
      });
      const after = pushHistory(
        { ...state, doc: nextDoc, dirty: true },
        nextDoc
      );
      return { ...after, ui: { ...after.ui, drawing: undefined } };
    }
    case "DELETE_ROUTE": {
      const nextDoc: DiagramDocument = {
        ...state.doc,
        routes: state.doc.routes.filter((r) => r.id !== action.routeId),
        meta: { ...state.doc.meta!, updatedAt: Date.now() },
      };
      return pushHistory({ ...state, doc: nextDoc, dirty: true }, nextDoc);
    }
    case "UPDATE_PLAYER": {
      const nextDoc: DiagramDocument = {
        ...state.doc,
        players: state.doc.players.map((p) =>
          p.id === action.id ? { ...p, ...action.patch } : p
        ),
        meta: { ...state.doc.meta!, updatedAt: Date.now() },
      };
      telemetry.enqueue({
        type: TelemetryEventTypes.PlayDiagramPlayerUpdate,
        data: { playerId: action.id, fields: Object.keys(action.patch) },
      });
      return pushHistory({ ...state, doc: nextDoc, dirty: true }, nextDoc);
    }
    case "REMOVE_PLAYER": {
      const nextDoc: DiagramDocument = {
        ...state.doc,
        players: state.doc.players.filter((p) => p.id !== action.id),
        routes: state.doc.routes.filter((r) => r.playerId !== action.id),
        meta: { ...state.doc.meta!, updatedAt: Date.now() },
      };
      telemetry.enqueue({
        type: TelemetryEventTypes.PlayDiagramPlayerRemove,
        data: { playerId: action.id },
      });
      return pushHistory({ ...state, doc: nextDoc, dirty: true }, nextDoc);
    }
    case "ADD_PLAYER": {
      const nextDoc: DiagramDocument = {
        ...state.doc,
        players: [...state.doc.players, action.player],
        meta: { ...state.doc.meta!, updatedAt: Date.now() },
      };
      telemetry.enqueue({
        type: TelemetryEventTypes.PlayDiagramPlayerAdd,
        data: { count: nextDoc.players.length },
      });
      return pushHistory({ ...state, doc: nextDoc, dirty: true }, nextDoc);
    }
    case "MOVE_PLAYER": {
      const nextDoc: DiagramDocument = {
        ...state.doc,
        players: state.doc.players.map((p) =>
          p.id === action.id ? { ...p, x: action.x, y: action.y } : p
        ),
        meta: { ...state.doc.meta!, updatedAt: Date.now() },
      };
      return { ...state, doc: nextDoc, dirty: true };
    }
    case "ADD_ROUTE_SEGMENT": {
      const nextDoc: DiagramDocument = {
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
      };
      telemetry.enqueue({
        type: TelemetryEventTypes.PlayDiagramRouteAdd,
        data: { playerId: action.playerId, segments: nextDoc.routes.length },
      });
      // also emit periodic aggregate update
      telemetry.enqueue({
        type: TelemetryEventTypes.PlayDiagramUpdated,
        data: {
          players: nextDoc.players.length,
          routes: nextDoc.routes.length,
          complexity: computeComplexityScore(nextDoc),
        },
      });
      return pushHistory({ ...state, doc: nextDoc, dirty: true }, nextDoc);
    }
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
    case "SET_SNAP":
      return { ...state, ui: { ...state.ui, snap: action.enabled } };
    case "SET_SNAP_GRID":
      return { ...state, ui: { ...state.ui, snapGrid: action.size } };
    case "UNDO": {
      if (state.historyIndex <= 0) return state;
      const idx = state.historyIndex - 1;
      const newState = {
        ...state,
        doc: state.history[idx],
        historyIndex: idx,
        dirty: true,
      };
      telemetry.enqueue({
        type: TelemetryEventTypes.PlayDiagramHistory,
        data: { action: "undo", index: idx, length: state.history.length },
      });
      return newState;
    }
    case "REDO": {
      if (state.historyIndex >= state.history.length - 1) return state;
      const idx = state.historyIndex + 1;
      const newState = {
        ...state,
        doc: state.history[idx],
        historyIndex: idx,
        dirty: true,
      };
      telemetry.enqueue({
        type: TelemetryEventTypes.PlayDiagramHistory,
        data: { action: "redo", index: idx, length: state.history.length },
      });
      return newState;
    }
    case "TOGGLE_FIELD_FLAG":
      const toggled = {
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
      telemetry.enqueue({
        type: TelemetryEventTypes.PlayDiagramFlagToggle,
        data: { flag: action.flag, value: (toggled.doc.field as any)[action.flag] },
      });
      return toggled;
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
