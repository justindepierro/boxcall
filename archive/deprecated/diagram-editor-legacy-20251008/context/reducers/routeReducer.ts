import type {
  DiagramEditorState,
  DiagramDocument,
  DiagramEditorAction,
  PlayerRoute,
  RouteSegment,
  RoutePoint,
} from "../../types/types";
import { TelemetryEventTypes } from "../../../../../telemetry/events";
import { telemetry } from "../../../../../telemetry/dispatcher";

// Utility function for history management
export const HISTORY_CAP = 100;
export function pushHistory(
  state: DiagramEditorState,
  nextDoc: DiagramDocument
) {
  const trimmed = state.history.slice(0, state.historyIndex + 1);
  let newHistory = [...trimmed, nextDoc];
  if (newHistory.length > HISTORY_CAP) {
    const before = newHistory.length;
    newHistory = newHistory.slice(newHistory.length - HISTORY_CAP);
    telemetry.enqueue({
      type: TelemetryEventTypes.PlayDiagramHistory,
      data: {
        dropped: before - newHistory.length,
        length: newHistory.length,
        cap: HISTORY_CAP,
      },
    });
  }
  return {
    ...state,
    history: newHistory,
    historyIndex: newHistory.length - 1,
  };
}

export function routeReducer(
  state: DiagramEditorState,
  action: DiagramEditorAction
): DiagramEditorState {
  switch (action.type) {
    case "SET_ROUTE_MODE":
      return { ...state, ui: { ...state.ui, routeMode: action.mode } };
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
    case "POP_ROUTE_POINT":
      if (!state.ui.drawing) return state;
      if (state.ui.drawing.anchorPoints.length === 0) return state;
      return {
        ...state,
        ui: {
          ...state.ui,
          drawing: {
            ...state.ui.drawing,
            anchorPoints: state.ui.drawing.anchorPoints.slice(0, -1),
            preview: undefined,
          },
        },
      };
    case "CANCEL_ROUTE":
      return { ...state, ui: { ...state.ui, drawing: undefined } };
    case "COMMIT_ROUTE": {
      if (!state.ui.drawing || state.ui.drawing.anchorPoints.length < 2)
        return { ...state, ui: { ...state.ui, drawing: undefined } };
      const isCurve = state.ui.routeMode === "curve";
      const segType: "line" | "curve" = isCurve ? "curve" : "line";
      const seg = {
        id: `seg_${Date.now()}`,
        type: segType,
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
          type: seg.type,
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
        routes: state.doc.routes.filter(
          (r: PlayerRoute) => r.id !== action.routeId
        ),
        meta: { ...state.doc.meta!, updatedAt: Date.now() },
      };
      return pushHistory({ ...state, doc: nextDoc, dirty: true }, nextDoc);
    }
    case "UPDATE_ROUTE_POINT": {
      const routes = state.doc.routes.map((r: PlayerRoute) => {
        if (r.id !== action.routeId) return r;
        const segs = r.segments.map((s: RouteSegment, i: number) => {
          if (i !== action.segIndex) return s;
          const pts = s.points.map((pt: RoutePoint, pi: number) =>
            pi === action.pointIndex ? action.point : pt
          );
          return { ...s, points: pts };
        });
        return { ...r, segments: segs };
      });
      const nextDoc: DiagramDocument = {
        ...state.doc,
        routes,
        meta: { ...state.doc.meta!, updatedAt: Date.now() },
      };
      return pushHistory({ ...state, doc: nextDoc, dirty: true }, nextDoc);
    }
    case "COMMIT_ROUTE_EDIT":
      return pushHistory(state, state.doc);
    default:
      return state;
  }
}
