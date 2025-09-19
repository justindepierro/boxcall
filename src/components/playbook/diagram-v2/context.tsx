/* eslint-disable */
import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";
import type {
  DiagramEditorState,
  DiagramEditorAction,
  DiagramDocument,
  DiagramFieldConfig,
  DiagramPlayer,
} from "./types";
import { createEmptyDocument, computeComplexityScore } from "./types";
import { telemetry } from "../../../telemetry/dispatcher";
import { TelemetryEventTypes } from "../../../telemetry/events";
import {
  getFormationSpec,
  applyFormationIdempotent,
  type FormationId,
} from "./formations";

const HISTORY_CAP = 100;
const initialState: DiagramEditorState = {
  doc: createEmptyDocument(),
  ui: {
    tool: "select",
    routeMode: "line",
    drawMode: "line",
    shapeMode: "rectangle",
    drawColor: "#111827",
    drawWidth: 3,
    drawArrowHead: "end",
    zoom: 1,
    panX: 0,
    panY: 0,
    snap: false,
    snapGrid: 2,
    effectsSnapPulse: true,
    showGridOverlay: false,
    distributeSpacing: 5,
  },
  dirty: false,
  history: [],
  historyIndex: -1,
};

function pushHistory(state: DiagramEditorState, nextDoc: DiagramDocument) {
  const trimmed = state.history.slice(0, state.historyIndex + 1);
  let newHistory = [...trimmed, nextDoc];
  if (newHistory.length > HISTORY_CAP) {
    const before = newHistory.length;
    newHistory = newHistory.slice(newHistory.length - HISTORY_CAP);
    telemetry.enqueue({
      type: TelemetryEventTypes.PlayDiagramHistory,
      data: {
        action: "cap-trim",
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

function reducer(
  state: DiagramEditorState,
  action: DiagramEditorAction
): DiagramEditorState {
  switch (action.type) {
    case "INIT":
      return { ...state, doc: action.doc, dirty: false };
    case "SET_TOOL":
      return { ...state, ui: { ...state.ui, tool: action.tool } };
    case "SET_ROUTE_MODE":
      return { ...state, ui: { ...state.ui, routeMode: action.mode } };
    case "SET_DRAW_MODE":
      return { ...state, ui: { ...state.ui, drawMode: action.mode } };
    case "SET_DRAW_COLOR":
      return { ...state, ui: { ...state.ui, drawColor: action.color } };
    case "SET_DRAW_WIDTH":
      return { ...state, ui: { ...state.ui, drawWidth: action.width } };
    case "SET_DRAW_ARROW_HEAD":
      return { ...state, ui: { ...state.ui, drawArrowHead: action.arrowHead } };
    case "SET_SHAPE_MODE":
      return { ...state, ui: { ...state.ui, shapeMode: action.mode } };
    case "SET_ACTIVE_PLAYER":
      return { ...state, ui: { ...state.ui, activePlayerId: action.id } };
    case "SET_SELECTION":
      telemetry.enqueue({
        type: TelemetryEventTypes.PlayDiagramSelection,
        data: {
          method: "set",
          count: action.ids.length,
          multi: action.ids.length > 1,
        },
      });
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedIds: [...action.ids],
          activePlayerId: action.ids[0],
        },
      };
    case "TOGGLE_SELECT": {
      const current = new Set(state.ui.selectedIds || []);
      if (current.has(action.id)) current.delete(action.id);
      else current.add(action.id);
      const ids = Array.from(current);
      telemetry.enqueue({
        type: TelemetryEventTypes.PlayDiagramSelection,
        data: { method: "toggle", count: ids.length, multi: ids.length > 1 },
      });
      return {
        ...state,
        ui: { ...state.ui, selectedIds: ids, activePlayerId: ids[0] },
      };
    }
    case "CLEAR_SELECTION":
      telemetry.enqueue({
        type: TelemetryEventTypes.PlayDiagramSelection,
        data: { method: "clear", count: 0, multi: false },
      });
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedIds: [],
          activePlayerId: undefined,
          inlineEdit: undefined,
        },
      };
    case "MOVE_SELECTION": {
      const map = new Map(action.patches.map((p) => [p.id, p]));
      const prevPositions = new Map(
        state.doc.players.map((p) => [p.id, { x: p.x, y: p.y }])
      );
      const nextDoc: DiagramDocument = {
        ...state.doc,
        players: state.doc.players.map((p) =>
          map.has(p.id) ? { ...p, x: map.get(p.id)!.x, y: map.get(p.id)!.y } : p
        ),
        meta: { ...state.doc.meta!, updatedAt: Date.now() },
      };
      if (action.patches.length > 1) {
        // Aggregate distance moved (max of centroid shift)
        const ids = action.patches.map((p) => p.id);
        const beforeCentroid = ids.reduce(
          (acc, id) => {
            const prev = prevPositions.get(id)!;
            return { x: acc.x + prev.x, y: acc.y + prev.y };
          },
          { x: 0, y: 0 }
        );
        beforeCentroid.x /= ids.length;
        beforeCentroid.y /= ids.length;
        const afterCentroid = ids.reduce(
          (acc, id) => {
            const now = map.get(id)!;
            return { x: acc.x + now.x, y: acc.y + now.y };
          },
          { x: 0, y: 0 }
        );
        afterCentroid.x /= ids.length;
        afterCentroid.y /= ids.length;
        const dx = afterCentroid.x - beforeCentroid.x;
        const dy = afterCentroid.y - beforeCentroid.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        telemetry.enqueue({
          type: TelemetryEventTypes.PlayDiagramMoveGroup,
          data: {
            count: action.patches.length,
            mode: action.mode || "nudge",
            dist: Number(dist.toFixed(2)),
          },
        });
      }
      return {
        ...state,
        doc: nextDoc,
        dirty: true,
        ui: {
          ...state.ui,
          dragging: action.mode === "drag" ? true : state.ui.dragging,
        },
      };
    }
    case "COMMIT_MOVE": {
      // Push current doc snapshot to history (for grouped nudges / drags)
      const after = pushHistory(state, state.doc);
      return { ...after, ui: { ...after.ui, dragging: false } };
    }
    // ===== Inline label editing =====
    case "START_INLINE_EDIT": {
      const player = state.doc.players.find((p) => p.id === action.playerId);
      if (!player) return state;
      return {
        ...state,
        ui: {
          ...state.ui,
          inlineEdit: {
            playerId: action.playerId,
            draft: action.initial ?? player.label,
          },
          selectedIds: [action.playerId],
          activePlayerId: action.playerId,
        },
      };
    }
    case "UPDATE_INLINE_EDIT": {
      if (!state.ui.inlineEdit) return state;
      return {
        ...state,
        ui: {
          ...state.ui,
          inlineEdit: { ...state.ui.inlineEdit, draft: action.draft },
        },
      };
    }
    case "CANCEL_INLINE_EDIT": {
      return { ...state, ui: { ...state.ui, inlineEdit: undefined } };
    }
    case "COMMIT_INLINE_EDIT": {
      const ie = state.ui.inlineEdit;
      if (!ie) return state;
      const nextDoc: DiagramDocument = {
        ...state.doc,
        players: state.doc.players.map((p) =>
          p.id === ie.playerId ? { ...p, label: ie.draft } : p
        ),
        meta: { ...state.doc.meta!, updatedAt: Date.now() },
      };
      telemetry.enqueue({
        type: TelemetryEventTypes.PlayDiagramPlayerUpdate,
        data: { playerId: ie.playerId, fields: ["label"], inline: true },
      });
      const after = pushHistory(
        { ...state, doc: nextDoc, dirty: true },
        nextDoc
      );
      return { ...after, ui: { ...after.ui, inlineEdit: undefined } };
    }
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
        routes: state.doc.routes.filter((r) => r.id !== action.routeId),
        meta: { ...state.doc.meta!, updatedAt: Date.now() },
      };
      return pushHistory({ ...state, doc: nextDoc, dirty: true }, nextDoc);
    }
    case "UPDATE_ROUTE_POINT": {
      const routes = state.doc.routes.map((r) => {
        if (r.id !== action.routeId) return r;
        const segs = r.segments.map((s, i) => {
          if (i !== action.segIndex) return s;
          const pts = s.points.map((pt, pi) =>
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
    // ===== Annotation reducer cases =====
    case "START_ANNOTATION": {
      const nextUi = {
        ...state.ui,
        annotating: {
          type: action.drawType,
          points: action.start ? [action.start] : [],
          preview: undefined,
          fromPlayerId: action.fromPlayerId,
          freehand: action.drawType === "freehand",
        },
        tool: "draw" as const,
      };
      return { ...state, ui: nextUi };
    }
    case "PREVIEW_ANNOTATION": {
      if (!state.ui.annotating) return state;
      return {
        ...state,
        ui: {
          ...state.ui,
          annotating: { ...state.ui.annotating, preview: action.point },
        },
      };
    }
    case "ADD_ANNOTATION_POINT": {
      if (!state.ui.annotating) return state;
      const ann = state.ui.annotating;
      return {
        ...state,
        ui: {
          ...state.ui,
          annotating: {
            ...ann,
            points: [...ann.points, action.point],
            preview: undefined,
          },
        },
      };
    }
    case "ADD_FREEHAND_POINT": {
      if (!state.ui.annotating || !state.ui.annotating.freehand) return state;
      const ann = state.ui.annotating;
      return {
        ...state,
        ui: {
          ...state.ui,
          annotating: { ...ann, points: [...ann.points, action.point] },
        },
      };
    }
    case "SET_ANNOTATION_TO": {
      if (!state.ui.annotating) return state;
      return {
        ...state,
        ui: {
          ...state.ui,
          annotating: { ...state.ui.annotating, toPlayerId: action.toPlayerId },
        },
      };
    }
    case "POP_ANNOTATION_POINT": {
      if (!state.ui.annotating || !state.ui.annotating.points.length)
        return state;
      const ann = state.ui.annotating;
      return {
        ...state,
        ui: {
          ...state.ui,
          annotating: {
            ...ann,
            points: ann.points.slice(0, -1),
            preview: undefined,
          },
        },
      };
    }
    case "CANCEL_ANNOTATION":
      return { ...state, ui: { ...state.ui, annotating: undefined } };
    case "COMMIT_ANNOTATION": {
      if (!state.ui.annotating)
        return { ...state, ui: { ...state.ui, annotating: undefined } };
      const a = state.ui.annotating;
      const id = `ann_${Date.now()}`;
      const color = state.ui.drawColor || "#111827";
      const width = state.ui.drawWidth || 3;
      const arrowHead = state.ui.drawArrowHead || "end";
      const nextDoc: DiagramDocument = {
        ...state.doc,
        annotations: [
          ...(state.doc.annotations || []),
          a.type === "connector"
            ? ({
                id,
                type: "connector",
                fromPlayerId: a.fromPlayerId!,
                toPlayerId: a.toPlayerId!,
                color,
                width,
                arrowHead,
              } as any)
            : ({
                id,
                type: a.type,
                points: a.points,
                color,
                width,
                arrowHead,
              } as any),
        ],
        meta: { ...state.doc.meta!, updatedAt: Date.now() },
      };
      telemetry.enqueue({
        type: TelemetryEventTypes.PlayDiagramUpdated,
        data: {
          players: nextDoc.players.length,
          routes: nextDoc.routes.length,
          annotations: (nextDoc.annotations || []).length,
        },
      });
      const after = pushHistory(
        { ...state, doc: nextDoc, dirty: true },
        nextDoc
      );
      return { ...after, ui: { ...after.ui, annotating: undefined } };
    }
    case "SELECT_ANNOTATION":
      return { ...state, ui: { ...state.ui, selectedAnnotationId: action.id } };
    case "DELETE_ANNOTATION": {
      const nextDoc: DiagramDocument = {
        ...state.doc,
        annotations: (state.doc.annotations || []).filter(
          (ann) => ann.id !== action.id
        ),
        meta: { ...state.doc.meta!, updatedAt: Date.now() },
      };
      return pushHistory(
        {
          ...state,
          doc: nextDoc,
          dirty: true,
          ui: { ...state.ui, selectedAnnotationId: undefined },
        },
        nextDoc
      );
    }
    case "UPDATE_ANNOT_POINT": {
      const anns = (state.doc.annotations || []).map((ann) => {
        if (ann.id !== action.id) return ann as any;
        if (!("points" in ann)) return ann as any;
        const pts = [...ann.points];
        pts[action.pointIndex] = action.point;
        return { ...ann, points: pts } as any;
      });
      const nextDoc: DiagramDocument = {
        ...state.doc,
        annotations: anns as any,
        meta: { ...state.doc.meta!, updatedAt: Date.now() },
      };
      return pushHistory({ ...state, doc: nextDoc, dirty: true }, nextDoc);
    }
    case "COMMIT_ANNOT_EDIT":
      return pushHistory(state, state.doc);
    case "UPDATE_ANNOT_STYLE": {
      const anns = (state.doc.annotations || []).map((ann) =>
        ann.id === action.id
          ? ({ ...ann, ...action.patch } as any)
          : (ann as any)
      );
      const nextDoc: DiagramDocument = {
        ...state.doc,
        annotations: anns as any,
        meta: { ...state.doc.meta!, updatedAt: Date.now() },
      };
      return pushHistory({ ...state, doc: nextDoc, dirty: true }, nextDoc);
    }
    case "MOVE_ANNOTATION": {
      const anns = (state.doc.annotations || []).map((ann) => {
        if (ann.id !== action.id) return ann as any;
        if (!("points" in ann)) return ann as any;
        const dxPct = (action.dx / 1600) * 100;
        const dyPct = (action.dy / 900) * 100;
        return {
          ...ann,
          points: ann.points.map((p) => ({
            x: Math.min(100, Math.max(0, p.x + dxPct)),
            y: Math.min(100, Math.max(0, p.y + dyPct)),
          })),
        } as any;
      });
      const nextDoc: DiagramDocument = {
        ...state.doc,
        annotations: anns as any,
        meta: { ...state.doc.meta!, updatedAt: Date.now() },
      };
      return { ...state, doc: nextDoc, dirty: true };
    }
    case "DUPLICATE_ANNOTATION": {
      const src = (state.doc.annotations || []).find((a) => a.id === action.id);
      if (!src) return state;
      const id = `ann_${Date.now()}`;
      let dup: any;
      if (src.type === "connector") {
        dup = { ...src, id };
      } else if ("points" in src) {
        // offset slightly for visibility
        dup = {
          ...src,
          id,
          points: src.points.map((p) => ({
            x: Math.min(100, p.x + 1),
            y: Math.min(100, p.y + 1),
          })),
        };
      }
      const nextDoc: DiagramDocument = {
        ...state.doc,
        annotations: [...(state.doc.annotations || []), dup],
        meta: { ...state.doc.meta!, updatedAt: Date.now() },
      };
      return pushHistory(
        {
          ...state,
          doc: nextDoc,
          dirty: true,
          ui: { ...state.ui, selectedAnnotationId: id },
        },
        nextDoc
      );
    }
    // ===== Shape reducer cases =====
    case "START_SHAPE": {
      const nextUi = {
        ...state.ui,
        shaping: {
          type: action.shapeType,
          start: action.start,
          end: action.start,
        },
        tool: "shape" as const,
      };
      return { ...state, ui: nextUi };
    }
    case "PREVIEW_SHAPE": {
      if (!state.ui.shaping) return state;
      return {
        ...state,
        ui: {
          ...state.ui,
          shaping: { ...state.ui.shaping, end: action.end },
        },
      };
    }
    case "COMMIT_SHAPE": {
      if (!state.ui.shaping)
        return { ...state, ui: { ...state.ui, shaping: undefined } };
      const s = state.ui.shaping;
      const id = `shape_${Date.now()}`;
      const color = state.ui.drawColor || "#111827";

      let shape: any;
      if (s.type === "rectangle") {
        const x = Math.min(s.start.x, s.end.x);
        const y = Math.min(s.start.y, s.end.y);
        const width = Math.abs(s.end.x - s.start.x);
        const height = Math.abs(s.end.y - s.start.y);
        shape = {
          id,
          type: "rectangle",
          x,
          y,
          width,
          height,
          color,
          fill: "transparent",
        };
      } else if (s.type === "circle") {
        const centerX = (s.start.x + s.end.x) / 2;
        const centerY = (s.start.y + s.end.y) / 2;
        const radius =
          Math.sqrt(
            Math.pow(s.end.x - s.start.x, 2) + Math.pow(s.end.y - s.start.y, 2)
          ) / 2;
        shape = {
          id,
          type: "circle",
          x: centerX,
          y: centerY,
          radius,
          color,
          fill: "transparent",
        };
      } else if (s.type === "triangle") {
        const centerX = (s.start.x + s.end.x) / 2;
        const centerY = (s.start.y + s.end.y) / 2;
        const size =
          Math.sqrt(
            Math.pow(s.end.x - s.start.x, 2) + Math.pow(s.end.y - s.start.y, 2)
          ) / 2;
        shape = {
          id,
          type: "triangle",
          x: centerX,
          y: centerY,
          size,
          color,
          fill: "transparent",
        };
      }

      const nextDoc: DiagramDocument = {
        ...state.doc,
        annotations: [...(state.doc.annotations || []), shape],
        meta: { ...state.doc.meta!, updatedAt: Date.now() },
      };
      telemetry.enqueue({
        type: TelemetryEventTypes.PlayDiagramUpdated,
        data: {
          players: nextDoc.players.length,
          routes: nextDoc.routes.length,
          annotations: (nextDoc.annotations || []).length,
        },
      });
      const after = pushHistory(
        { ...state, doc: nextDoc, dirty: true },
        nextDoc
      );
      return { ...after, ui: { ...after.ui, shaping: undefined } };
    }
    case "CANCEL_SHAPE":
      return { ...state, ui: { ...state.ui, shaping: undefined } };
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
    case "SET_PENDING_DELETE":
      return {
        ...state,
        ui: { ...state.ui, pendingDeleteId: action.id },
      };
    case "SET_PENDING_BULK_DELETE":
      return {
        ...state,
        ui: { ...state.ui, pendingBulkDelete: action.pending },
      };
    case "REMOVE_PLAYERS": {
      const idSet = new Set(action.ids);
      const nextDoc: DiagramDocument = {
        ...state.doc,
        players: state.doc.players.filter((p) => !idSet.has(p.id)),
        routes: state.doc.routes.filter((r) => !idSet.has(r.playerId)),
        meta: { ...state.doc.meta!, updatedAt: Date.now() },
      };
      telemetry.enqueue({
        type: TelemetryEventTypes.PlayDiagramPlayerRemove,
        data: { playerIds: action.ids, bulk: true },
      });
      return pushHistory({ ...state, doc: nextDoc, dirty: true }, nextDoc);
    }
    case "REORDER_PLAYER": {
      const idx = state.doc.players.findIndex((p) => p.id === action.id);
      if (idx === -1) return state;
      const swapWith = action.direction === "up" ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= state.doc.players.length) return state;
      const newPlayers = [...state.doc.players];
      const tmp = newPlayers[idx];
      newPlayers[idx] = newPlayers[swapWith];
      newPlayers[swapWith] = tmp;
      const nextDoc: DiagramDocument = {
        ...state.doc,
        players: newPlayers,
        meta: { ...state.doc.meta!, updatedAt: Date.now() },
      };
      telemetry.enqueue({
        type: TelemetryEventTypes.PlayDiagramPlayerUpdate,
        data: {
          reorder: true,
          playerId: action.id,
          direction: action.direction,
        },
      });
      return pushHistory({ ...state, doc: nextDoc, dirty: true }, nextDoc);
    }
    case "MOVE_PLAYER_INDEX": {
      const from = state.doc.players.findIndex((p) => p.id === action.id);
      if (
        from === -1 ||
        action.toIndex < 0 ||
        action.toIndex >= state.doc.players.length
      )
        return state;
      if (from === action.toIndex) return state;
      const newPlayers = [...state.doc.players];
      const [item] = newPlayers.splice(from, 1);
      newPlayers.splice(action.toIndex, 0, item);
      const nextDoc: DiagramDocument = {
        ...state.doc,
        players: newPlayers,
        meta: { ...state.doc.meta!, updatedAt: Date.now() },
      };
      telemetry.enqueue({
        type: TelemetryEventTypes.PlayDiagramPlayerUpdate,
        data: { reorder: true, playerId: action.id, toIndex: action.toIndex },
      });
      return pushHistory({ ...state, doc: nextDoc, dirty: true }, nextDoc);
    }
    case "UPDATE_PLAYERS_BULK": {
      const set = new Set(action.ids);
      const nextDoc: DiagramDocument = {
        ...state.doc,
        players: state.doc.players.map((p) =>
          set.has(p.id) ? { ...p, ...action.patch } : p
        ),
        meta: { ...state.doc.meta!, updatedAt: Date.now() },
      };
      telemetry.enqueue({
        type: TelemetryEventTypes.PlayDiagramPlayerBulkEdit,
        data: { playerIds: action.ids, fields: Object.keys(action.patch) },
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
          dragging: true,
        },
      };
    case "SET_VIEWPORT": {
      return {
        ...state,
        ui: {
          ...state.ui,
          zoom: action.zoom !== undefined ? action.zoom : state.ui.zoom,
          panX: action.panX !== undefined ? action.panX : state.ui.panX,
          panY: action.panY !== undefined ? action.panY : state.ui.panY,
        },
      };
    }
    case "SET_SNAP_PULSE":
      return {
        ...state,
        ui: { ...state.ui, effectsSnapPulse: action.enabled },
      };
    case "SET_GRID_OVERLAY": {
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(
            "diagram.grid.overlay",
            action.enabled ? "1" : "0"
          );
        } catch {}
      }
      return { ...state, ui: { ...state.ui, showGridOverlay: action.enabled } };
    }
    case "SET_BALL_HASH": {
      const nextDoc: DiagramDocument = {
        ...state.doc,
        field: { ...state.doc.field, ballHash: action.hash },
        players: state.doc.players.map((p) =>
          p.role === "C"
            ? {
                ...p,
                x:
                  action.hash === "left"
                    ? 40
                    : action.hash === "right"
                      ? 60
                      : 50,
              }
            : p
        ),
        meta: { ...state.doc.meta!, updatedAt: Date.now() },
      };
      telemetry.enqueue({
        type: TelemetryEventTypes.PlayDiagramBallHash,
        data: { hash: action.hash },
      });
      return {
        ...state,
        doc: nextDoc,
        dirty: true,
      };
    }
    case "SET_FIELD_THEME": {
      const nextDoc: DiagramDocument = {
        ...state.doc,
        field: { ...state.doc.field, theme: action.theme },
        meta: { ...state.doc.meta!, updatedAt: Date.now() },
      };
      telemetry.enqueue({
        type: TelemetryEventTypes.PlayDiagramFieldTheme,
        data: { theme: action.theme },
      });
      return { ...state, doc: nextDoc, dirty: true };
    }
    case "SET_FIELD_HASH_LAYOUT": {
      const nextDoc: DiagramDocument = {
        ...state.doc,
        field: { ...state.doc.field, hashLayout: action.layout },
        meta: { ...state.doc.meta!, updatedAt: Date.now() },
      };
      telemetry.enqueue({
        type: TelemetryEventTypes.PlayDiagramFlagToggle,
        data: { flag: "hashLayout", value: action.layout },
      });
      return { ...state, doc: nextDoc, dirty: true };
    }
    case "MIRROR": {
      const computeSpread = (players: DiagramPlayer[]) => {
        if (!players.length) return { spread: 0, center: 0, min: 0, max: 0 };
        const xs = players.map((p) => p.x);
        const min = Math.min(...xs);
        const max = Math.max(...xs);
        const spread = +(max - min).toFixed(2);
        const center = +(xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(2);
        return { spread, center, min, max };
      };
      const beforeMetrics = computeSpread(state.doc.players);
      const mirroredPlayers = state.doc.players.map((p) => ({
        ...p,
        x: 100 - p.x,
      }));
      const mirroredRoutes = state.doc.routes.map((r) => ({
        ...r,
        segments: r.segments.map((s) => ({
          ...s,
          points: s.points.map((pt) => ({ x: 100 - pt.x, y: pt.y })),
        })),
      }));
      const nextDoc: DiagramDocument = {
        ...state.doc,
        players: mirroredPlayers,
        routes: mirroredRoutes,
        meta: { ...state.doc.meta!, updatedAt: Date.now() },
      };
      const afterMetrics = computeSpread(nextDoc.players);
      telemetry.enqueue({
        type: TelemetryEventTypes.PlayDiagramMirror,
        data: {
          players: nextDoc.players.length,
          routes: nextDoc.routes.length,
          before: beforeMetrics,
          after: afterMetrics,
          deltaSpread: +(afterMetrics.spread - beforeMetrics.spread).toFixed(2),
        },
      });
      return pushHistory({ ...state, doc: nextDoc, dirty: true }, nextDoc);
    }
    case "APPLY_FORMATION": {
      const formation = action.formation as FormationId;
      const centerX =
        state.doc.field.ballHash === "left"
          ? 40
          : state.doc.field.ballHash === "right"
            ? 60
            : 50;
      const lineYs = state.doc.players
        .filter((p) => ["C", "LT", "LG", "RG", "RT"].includes(p.label))
        .map((p) => p.y);
      const baseY = lineYs.length
        ? lineYs.reduce((a, b) => a + b, 0) / lineYs.length
        : state.doc.players.find((p) => p.role === "C")?.y || 50;
      const spec = getFormationSpec(formation, centerX, baseY);
      if (!spec) return state;
      const { players, removedIds, created, updated, removedDup } =
        applyFormationIdempotent(state.doc.players, state.doc.routes, spec);
      const nextRoutes = state.doc.routes.filter(
        (r) => !removedIds.includes(r.playerId)
      );
      const nextDoc: DiagramDocument = {
        ...state.doc,
        players,
        routes: nextRoutes,
        meta: { ...state.doc.meta!, updatedAt: Date.now() },
      };
      telemetry.enqueue({
        type: TelemetryEventTypes.PlayDiagramFormationApply,
        data: {
          formation,
          players: nextDoc.players.length,
          created,
          updated,
          removedDuplicates: removedDup,
        },
      });
      return pushHistory({ ...state, doc: nextDoc, dirty: true }, nextDoc);
    }
    case "SET_SNAP":
      return { ...state, ui: { ...state.ui, snap: action.enabled } };
    case "SET_SNAP_GRID":
      return { ...state, ui: { ...state.ui, snapGrid: action.size } };
    case "SET_DISTRIBUTE_SPACING":
      return {
        ...state,
        ui: { ...state.ui, distributeSpacing: action.spacing },
      };
    case "ALIGN_SELECTION": {
      const ids = state.ui.selectedIds || [];
      if (ids.length < 2) return state;
      const players = state.doc.players.filter((p) => ids.includes(p.id));
      if (!players.length) return state;
      // Compute reference from selection bounds
      const xs = players.map((p) => p.x);
      const ys = players.map((p) => p.y);
      const minX = Math.min(...xs),
        maxX = Math.max(...xs);
      const minY = Math.min(...ys),
        maxY = Math.max(...ys);
      const centerX = +(xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(2);
      const centerY = +(ys.reduce((a, b) => a + b, 0) / ys.length).toFixed(2);
      let nextPlayers = state.doc.players.map((p) => {
        if (!ids.includes(p.id)) return p;
        if (action.axis === "x") {
          const target =
            action.align === "start"
              ? minX
              : action.align === "center"
                ? centerX
                : maxX;
          return { ...p, x: Math.min(100, Math.max(0, target)) };
        } else {
          const target =
            action.align === "start"
              ? minY
              : action.align === "center"
                ? centerY
                : maxY;
          return { ...p, y: Math.min(100, Math.max(0, target)) };
        }
      });
      const nextDoc: DiagramDocument = {
        ...state.doc,
        players: nextPlayers,
        meta: { ...state.doc.meta!, updatedAt: Date.now() },
      };
      telemetry.enqueue({
        type: TelemetryEventTypes.UIAction,
        data: {
          action: "align",
          axis: action.axis,
          align: action.align,
          count: ids.length,
        },
      });
      return pushHistory({ ...state, doc: nextDoc, dirty: true }, nextDoc);
    }
    case "DISTRIBUTE_SELECTION": {
      const ids = state.ui.selectedIds || [];
      if (ids.length < 3) return state; // need at least 3 to distribute between ends
      const sel = state.doc.players.filter((p) => ids.includes(p.id));
      if (sel.length < 3) return state;
      // Sort by axis value
      const sorted = [...sel].sort((a, b) =>
        action.axis === "x" ? a.x - b.x : a.y - b.y
      );
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const span = action.axis === "x" ? last.x - first.x : last.y - first.y;
      if (span <= 0) return state;
      const step = span / (sorted.length - 1);
      const desired: Record<string, number> = {};
      sorted.forEach((p, i) => {
        desired[p.id] = (action.axis === "x" ? first.x : first.y) + step * i;
      });
      const nextPlayers = state.doc.players.map((p) => {
        if (!ids.includes(p.id)) return p;
        if (action.axis === "x")
          return {
            ...p,
            x: Math.min(100, Math.max(0, +desired[p.id].toFixed(2))),
          };
        return {
          ...p,
          y: Math.min(100, Math.max(0, +desired[p.id].toFixed(2))),
        };
      });
      const nextDoc: DiagramDocument = {
        ...state.doc,
        players: nextPlayers,
        meta: { ...state.doc.meta!, updatedAt: Date.now() },
      };
      telemetry.enqueue({
        type: TelemetryEventTypes.UIAction,
        data: { action: "distribute", axis: action.axis, count: ids.length },
      });
      return pushHistory({ ...state, doc: nextDoc, dirty: true }, nextDoc);
    }
    case "DISTRIBUTE_SELECTION_FIXED": {
      const ids = state.ui.selectedIds || [];
      if (ids.length < 2) return state; // can place at least 2
      const sel = state.doc.players.filter((p) => ids.includes(p.id));
      if (sel.length < 2) return state;
      // Sort by axis value and use the first as origin
      const axis = action.axis;
      const sorted = [...sel].sort((a, b) =>
        axis === "x" ? a.x - b.x : a.y - b.y
      );
      const origin = sorted[0];
      const spacing = Math.max(0, action.spacing);
      const desired: Record<string, number> = {
        [origin.id]: axis === "x" ? origin.x : origin.y,
      };
      for (let i = 1; i < sorted.length; i++) {
        const prevId = sorted[i - 1].id;
        const prevVal = desired[prevId];
        desired[sorted[i].id] = Math.min(100, prevVal + spacing);
      }
      const nextPlayers = state.doc.players.map((p) => {
        if (!ids.includes(p.id)) return p;
        const target = +Number(desired[p.id]).toFixed(2);
        if (axis === "x")
          return { ...p, x: Math.min(100, Math.max(0, target)) };
        return { ...p, y: Math.min(100, Math.max(0, target)) };
      });
      const nextDoc: DiagramDocument = {
        ...state.doc,
        players: nextPlayers,
        meta: { ...state.doc.meta!, updatedAt: Date.now() },
      };
      telemetry.enqueue({
        type: TelemetryEventTypes.UIAction,
        data: { action: "distribute-fixed", axis, count: ids.length, spacing },
      });
      return pushHistory({ ...state, doc: nextDoc, dirty: true }, nextDoc);
    }
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
      let nextFieldVal = !state.doc.field[action.flag];
      let nextDocField = {
        ...state.doc.field,
        [action.flag]: nextFieldVal,
      } as DiagramFieldConfig;
      let nextUi = { ...state.ui };
      // Special handling: red zone slice toggle
      if (action.flag === "showRedZone") {
        if (nextFieldVal) {
          // entering red zone mode: store previous slice
          (nextUi as any).prevSlice = {
            backYards: state.doc.field.backYards,
            forwardYards: state.doc.field.forwardYards,
            losYards: state.doc.field.losYards,
          };
          nextDocField = {
            ...nextDocField,
            backYards: 0,
            forwardYards: 25, // focus inside 25
            losYards: 25 - 5, // LOS 5 yards from goal for viewpoint
          } as DiagramFieldConfig;
        } else if (state.ui.prevSlice) {
          // restore
          nextDocField = {
            ...nextDocField,
            backYards: state.ui.prevSlice.backYards,
            forwardYards: state.ui.prevSlice.forwardYards,
            losYards: state.ui.prevSlice.losYards,
          } as DiagramFieldConfig;
          (nextUi as any).prevSlice = undefined;
        }
      }
      const toggled = {
        ...state,
        ui: nextUi,
        doc: {
          ...state.doc,
          field: nextDocField,
          meta: { ...state.doc.meta!, updatedAt: Date.now() },
        },
        dirty: true,
      };
      telemetry.enqueue({
        type: TelemetryEventTypes.PlayDiagramFlagToggle,
        data: {
          flag: action.flag,
          value: (toggled.doc.field as any)[action.flag],
        },
      });
      if (action.flag === "showRedZone") {
        telemetry.enqueue({
          type: TelemetryEventTypes.PlayDiagramRedZoneToggle,
          data: { enabled: (toggled.doc.field as any)[action.flag] },
        });
      }
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
  // Initialize persisted flags on mount (e.g., grid overlay)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const grid = window.localStorage.getItem("diagram.grid.overlay");
      if (grid === "1" || grid === "0") {
        dispatch({ type: "SET_GRID_OVERLAY", enabled: grid === "1" });
      }
    } catch {}
  }, []);
  // Local aggregation for reorder performance (drag based) to reduce event spam and provide summary stats.
  const reorderAggRef = React.useRef<{
    count: number;
    totalDur: number;
    maxDur: number;
    started: number;
    heights: number[];
  } | null>(null);
  useEffect(() => {
    // scan telemetry queue? Instead we patch dispatch sites to also push into this ref via a custom window event.
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ durMs: number; listHeight?: number }>)
        .detail;
      if (!detail) return;
      if (!reorderAggRef.current) {
        reorderAggRef.current = {
          count: 0,
          totalDur: 0,
          maxDur: 0,
          started: performance.now(),
          heights: [],
        };
      }
      reorderAggRef.current.count += 1;
      reorderAggRef.current.totalDur += detail.durMs;
      (reorderAggRef.current as any).samples = (
        (reorderAggRef.current as any).samples || []
      ).concat(detail.durMs);
      reorderAggRef.current.maxDur = Math.max(
        reorderAggRef.current.maxDur,
        detail.durMs
      );
      if (typeof detail.listHeight === "number")
        reorderAggRef.current.heights.push(detail.listHeight);
      // Emit aggregate every 10 events or 5s window
      const agg = reorderAggRef.current;
      if (agg.count >= 10 || performance.now() - agg.started > 5000) {
        const samples: number[] = (agg as any).samples || [];
        const p95 = samples.length
          ? (() => {
              const sorted = [...samples].sort((a, b) => a - b);
              const idx = Math.min(
                sorted.length - 1,
                Math.floor(sorted.length * 0.95)
              );
              return sorted[idx];
            })()
          : undefined;
        telemetry.enqueue({
          type: TelemetryEventTypes.PlayDiagramPlayerReorderStats,
          data: {
            count: agg.count,
            avgDurMs: Math.round(agg.totalDur / agg.count),
            maxDurMs: Math.round(agg.maxDur),
            p95DurMs: p95 !== undefined ? Math.round(p95) : undefined,
            windowMs: Math.round(performance.now() - agg.started),
            avgListHeight: agg.heights.length
              ? Math.round(
                  agg.heights.reduce((a: number, b: number) => a + b, 0) /
                    agg.heights.length
                )
              : undefined,
            minListHeight: agg.heights.length
              ? Math.min(...agg.heights)
              : undefined,
            maxListHeight: agg.heights.length
              ? Math.max(...agg.heights)
              : undefined,
          },
        });
        reorderAggRef.current = null;
      }
    };
    window.addEventListener("diagram:player-reorder", handler as EventListener);
    return () =>
      window.removeEventListener(
        "diagram:player-reorder",
        handler as EventListener
      );
  }, []);
  // Flush on unmount
  useEffect(() => {
    return () => {
      const agg = reorderAggRef.current as any;
      if (agg && agg.count > 0) {
        const samples: number[] = agg.samples || [];
        const p95 = samples.length
          ? (() => {
              const sorted = [...samples].sort((a, b) => a - b);
              const idx = Math.min(
                sorted.length - 1,
                Math.floor(sorted.length * 0.95)
              );
              return sorted[idx];
            })()
          : undefined;
        telemetry.enqueue({
          type: TelemetryEventTypes.PlayDiagramPlayerReorderStats,
          data: {
            count: agg.count,
            avgDurMs: Math.round(agg.totalDur / agg.count),
            maxDurMs: Math.round(agg.maxDur),
            p95DurMs: p95 !== undefined ? Math.round(p95) : undefined,
            windowMs: Math.round(performance.now() - agg.started),
            final: true,
            avgListHeight: agg.heights.length
              ? Math.round(
                  agg.heights.reduce((a: number, b: number) => a + b, 0) /
                    agg.heights.length
                )
              : undefined,
            minListHeight: agg.heights.length
              ? Math.min(...agg.heights)
              : undefined,
            maxListHeight: agg.heights.length
              ? Math.max(...agg.heights)
              : undefined,
          },
        });
      }
    };
  }, []);
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
