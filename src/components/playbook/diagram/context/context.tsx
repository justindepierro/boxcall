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
export function reducer(
  state: DiagramEditorState,
  action: DiagramEditorAction
): DiagramEditorState {
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
  return state;
}
