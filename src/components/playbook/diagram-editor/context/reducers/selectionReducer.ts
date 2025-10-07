// Selection reducer cases extracted from context.tsx
import type {
  DiagramEditorState,
  DiagramEditorAction,
} from "../../types/types";
import { TelemetryEventTypes } from "../../../../../telemetry/events";
import { telemetry } from "../../../../../telemetry/dispatcher";

export function selectionReducer(
  state: DiagramEditorState,
  action: DiagramEditorAction
): DiagramEditorState {
  switch (action.type) {
    case "SET_SELECTION": {
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
    }
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
        ui: {
          ...state.ui,
          selectedIds: ids,
          activePlayerId: ids[0],
        },
      };
    }
    case "CLEAR_SELECTION": {
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
    }
    default:
      return state;
  }
}
