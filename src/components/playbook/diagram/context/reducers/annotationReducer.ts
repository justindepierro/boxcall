import { pushHistory } from "./routeReducer";
// Annotation reducer cases extracted from context.tsx
import type {
  DiagramEditorState,
  DiagramEditorAction,
  DiagramDocument,
  DiagramAnnotation,
} from "../../types/types";
import { TelemetryEventTypes } from "../../../../../telemetry/events";
import { colorTokens } from "../../../../../design-system/tokens";
import { telemetry } from "../../../../../telemetry/dispatcher";

export function annotationReducer(
  state: DiagramEditorState,
  action: DiagramEditorAction
): DiagramEditorState {
  switch (action.type) {
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
      const color = state.ui.drawColor || colorTokens.gray[900];
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
              } as DiagramAnnotation)
            : ({
                id,
                type: a.type,
                points: a.points,
                color,
                width,
                arrowHead,
              } as DiagramAnnotation),
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
    // ...other annotation cases...
    default:
      return state;
  }
}

// You will need to import pushHistory from its new location when splitting utilities.
