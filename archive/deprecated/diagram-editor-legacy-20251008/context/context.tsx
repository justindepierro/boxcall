import { annotationReducer } from "./reducers/annotationReducer";
import { selectionReducer } from "./reducers/selectionReducer";
import { routeReducer } from "./reducers/routeReducer";
import type {
  DiagramEditorState,
  DiagramEditorAction,
  DiagramFieldConfig,
} from "../types/types";
// Removed unused imports
import { telemetry } from "../../../../telemetry/dispatcher";
import { TelemetryEventTypes } from "../../../../telemetry/events";

const HISTORY_CAP = 100;

function pushHistory(state: DiagramEditorState, nextDoc: typeof state.doc) {
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

export function reducer(
  state: DiagramEditorState,
  action: DiagramEditorAction
): DiagramEditorState {
  if (action.type === "INIT") {
    const doc = {
      ...action.doc,
      meta: action.doc.meta ?? {
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    };
    return {
      doc,
      ui: {
        ...state.ui,
        tool: "select",
        routeMode: undefined,
        drawMode: undefined,
      },
      dirty: false,
      history: [doc],
      historyIndex: 0,
    };
  }
  if (
    [
      "START_ANNOTATION",
      "PREVIEW_ANNOTATION",
      "ADD_ANNOTATION_POINT",
      "ADD_FREEHAND_POINT",
      "SET_ANNOTATION_TO",
      "POP_ANNOTATION_POINT",
      "CANCEL_ANNOTATION",
      "COMMIT_ANNOTATION",
      "SELECT_ANNOTATION",
      "DELETE_ANNOTATION",
      "UPDATE_ANNOT_POINT",
      "COMMIT_ANNOT_EDIT",
      "UPDATE_ANNOT_STYLE",
      "MOVE_ANNOTATION",
      "DUPLICATE_ANNOTATION",
    ].includes(action.type)
  ) {
    return annotationReducer(state, action);
  }
  if (
    [
      "SET_SELECTION",
      "TOGGLE_SELECT",
      "CLEAR_SELECTION",
      "MOVE_SELECTION",
      "COMMIT_MOVE",
    ].includes(action.type)
  ) {
    return selectionReducer(state, action);
  }
  if (
    [
      "SET_ROUTE_MODE",
      "START_ROUTE",
      "PREVIEW_ROUTE",
      "ADD_ROUTE_POINT",
      "POP_ROUTE_POINT",
      "CANCEL_ROUTE",
      "COMMIT_ROUTE",
      "DELETE_ROUTE",
      "UPDATE_ROUTE_POINT",
      "COMMIT_ROUTE_EDIT",
    ].includes(action.type)
  ) {
    return routeReducer(state, action);
  }
  // Handle remaining actions directly
  if (action.type === "SET_TOOL") {
    return { ...state, ui: { ...state.ui, tool: action.tool } };
  }
  if (action.type === "SET_ROUTE_MODE") {
    return { ...state, ui: { ...state.ui, routeMode: action.mode } };
  }
  if (action.type === "SET_DRAW_MODE") {
    return { ...state, ui: { ...state.ui, drawMode: action.mode } };
  }
  if (action.type === "SET_DRAW_COLOR") {
    return { ...state, ui: { ...state.ui, drawColor: action.color } };
  }
  if (action.type === "SET_DRAW_WIDTH") {
    return { ...state, ui: { ...state.ui, drawWidth: action.width } };
  }
  if (action.type === "SET_DRAW_ARROW_HEAD") {
    return { ...state, ui: { ...state.ui, drawArrowHead: action.arrowHead } };
  }
  if (action.type === "SET_PLAYER_SHAPE") {
    return { ...state, ui: { ...state.ui, playerShape: action.shape } };
  }
  if (action.type === "REDO") {
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
  if (action.type === "UNDO") {
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
  if (action.type === "TOGGLE_FIELD_FLAG") {
    const nextFieldVal = !state.doc.field[action.flag];
    let nextDocField: DiagramFieldConfig = {
      ...state.doc.field,
      [action.flag]: nextFieldVal,
    };
    const nextUi: typeof state.ui & {
      prevSlice?: {
        backYards: number;
        forwardYards: number;
        losYards?: number;
      };
    } = { ...state.ui };
    // Special handling: red zone slice toggle
    if (action.flag === "showRedZone") {
      if (nextFieldVal) {
        // entering red zone mode: store previous slice
        nextUi.prevSlice = {
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
          losYards: state.ui.prevSlice.losYards ?? 0,
        } as DiagramFieldConfig;
        nextUi.prevSlice = undefined;
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
        value: toggled.doc.field[action.flag],
      },
    });
    if (action.flag === "showRedZone") {
      telemetry.enqueue({
        type: TelemetryEventTypes.PlayDiagramRedZoneToggle,
        data: { enabled: toggled.doc.field[action.flag] },
      });
    }
    return toggled;
  }
  if (action.type === "MARK_SAVED") {
    return { ...state, dirty: false };
  }
  if (action.type === "SET_FIELD_SLICE") {
    const nextDoc = {
      ...state.doc,
      field: {
        ...state.doc.field,
        ...action.slice,
      },
      meta: { ...state.doc.meta!, updatedAt: Date.now() },
    };
    return pushHistory({ ...state, doc: nextDoc, dirty: true }, nextDoc);
  }
  if (action.type === "ADD_PLAYER") {
    const nextDoc = {
      ...state.doc,
      players: [...state.doc.players, action.player],
      meta: { ...state.doc.meta!, updatedAt: Date.now() },
    };
    return pushHistory({ ...state, doc: nextDoc, dirty: true }, nextDoc);
  }
  if (action.type === "UPDATE_PLAYER") {
    const nextDoc = {
      ...state.doc,
      players: state.doc.players.map((player) =>
        player.id === action.id ? { ...player, ...action.patch } : player
      ),
      meta: { ...state.doc.meta!, updatedAt: Date.now() },
    };
    return pushHistory({ ...state, doc: nextDoc, dirty: true }, nextDoc);
  }
  if (action.type === "REMOVE_PLAYER") {
    const nextDoc = {
      ...state.doc,
      players: state.doc.players.filter((player) => player.id !== action.id),
      meta: { ...state.doc.meta!, updatedAt: Date.now() },
    };
    return pushHistory({ ...state, doc: nextDoc, dirty: true }, nextDoc);
  }
  return state;
}
