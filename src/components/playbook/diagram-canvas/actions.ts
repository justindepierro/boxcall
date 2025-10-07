/**
 * Diagram Editor Action Types & Action Creators
 * 
 * Centralized action type constants and type-safe action creators
 * for the diagram editor state management system.
 * 
 * Extracted from monolithic context.tsx to improve maintainability.
 */

// ============================================================================
// Action Type Constants
// ============================================================================

export const ActionTypes = {
  // Document & State Management
  INIT: "INIT" as const,
  MARK_SAVED: "MARK_SAVED" as const,
  
  // Tool Selection
  SET_TOOL: "SET_TOOL" as const,
  SET_ROUTE_MODE: "SET_ROUTE_MODE" as const,
  SET_DRAW_MODE: "SET_DRAW_MODE" as const,
  SET_DRAW_COLOR: "SET_DRAW_COLOR" as const,
  SET_DRAW_WIDTH: "SET_DRAW_WIDTH" as const,
  SET_DRAW_ARROW_HEAD: "SET_DRAW_ARROW_HEAD" as const,
  
  // Selection Management
  SET_SELECTION: "SET_SELECTION" as const,
  TOGGLE_SELECT: "TOGGLE_SELECT" as const,
  CLEAR_SELECTION: "CLEAR_SELECTION" as const,
  SET_ACTIVE_PLAYER: "SET_ACTIVE_PLAYER" as const,
  
  // Player Actions
  ADD_PLAYER: "ADD_PLAYER" as const,
  UPDATE_PLAYER: "UPDATE_PLAYER" as const,
  UPDATE_PLAYERS_BULK: "UPDATE_PLAYERS_BULK" as const,
  REMOVE_PLAYER: "REMOVE_PLAYER" as const,
  REMOVE_PLAYERS: "REMOVE_PLAYERS" as const,
  MOVE_PLAYER: "MOVE_PLAYER" as const,
  MOVE_PLAYER_INDEX: "MOVE_PLAYER_INDEX" as const,
  REORDER_PLAYER: "REORDER_PLAYER" as const,
  SET_PENDING_DELETE: "SET_PENDING_DELETE" as const,
  SET_PENDING_BULK_DELETE: "SET_PENDING_BULK_DELETE" as const,
  
  // Movement & Positioning
  MOVE_SELECTION: "MOVE_SELECTION" as const,
  COMMIT_MOVE: "COMMIT_MOVE" as const,
  
  // Inline Editing
  START_INLINE_EDIT: "START_INLINE_EDIT" as const,
  UPDATE_INLINE_EDIT: "UPDATE_INLINE_EDIT" as const,
  CANCEL_INLINE_EDIT: "CANCEL_INLINE_EDIT" as const,
  COMMIT_INLINE_EDIT: "COMMIT_INLINE_EDIT" as const,
  
  // Route Actions
  START_ROUTE: "START_ROUTE" as const,
  PREVIEW_ROUTE: "PREVIEW_ROUTE" as const,
  ADD_ROUTE_POINT: "ADD_ROUTE_POINT" as const,
  ADD_ROUTE_SEGMENT: "ADD_ROUTE_SEGMENT" as const,
  POP_ROUTE_POINT: "POP_ROUTE_POINT" as const,
  CANCEL_ROUTE: "CANCEL_ROUTE" as const,
  COMMIT_ROUTE: "COMMIT_ROUTE" as const,
  DELETE_ROUTE: "DELETE_ROUTE" as const,
  UPDATE_ROUTE_POINT: "UPDATE_ROUTE_POINT" as const,
  COMMIT_ROUTE_EDIT: "COMMIT_ROUTE_EDIT" as const,
  
  // Annotation Actions
  START_ANNOTATION: "START_ANNOTATION" as const,
  PREVIEW_ANNOTATION: "PREVIEW_ANNOTATION" as const,
  ADD_ANNOTATION_POINT: "ADD_ANNOTATION_POINT" as const,
  ADD_FREEHAND_POINT: "ADD_FREEHAND_POINT" as const,
  SET_ANNOTATION_TO: "SET_ANNOTATION_TO" as const,
  POP_ANNOTATION_POINT: "POP_ANNOTATION_POINT" as const,
  CANCEL_ANNOTATION: "CANCEL_ANNOTATION" as const,
  COMMIT_ANNOTATION: "COMMIT_ANNOTATION" as const,
  SELECT_ANNOTATION: "SELECT_ANNOTATION" as const,
  DELETE_ANNOTATION: "DELETE_ANNOTATION" as const,
  UPDATE_ANNOT_POINT: "UPDATE_ANNOT_POINT" as const,
  COMMIT_ANNOT_EDIT: "COMMIT_ANNOT_EDIT" as const,
  UPDATE_ANNOT_STYLE: "UPDATE_ANNOT_STYLE" as const,
  MOVE_ANNOTATION: "MOVE_ANNOTATION" as const,
  DUPLICATE_ANNOTATION: "DUPLICATE_ANNOTATION" as const,
  
  // Viewport & View
  SET_ZOOM: "SET_ZOOM" as const,
  PAN: "PAN" as const,
  SET_VIEWPORT: "SET_VIEWPORT" as const,
  SET_GRID_OVERLAY: "SET_GRID_OVERLAY" as const,
  
  // Field Configuration
  SET_BALL_HASH: "SET_BALL_HASH" as const,
  SET_FIELD_THEME: "SET_FIELD_THEME" as const,
  SET_FIELD_HASH_LAYOUT: "SET_FIELD_HASH_LAYOUT" as const,
  TOGGLE_FIELD_FLAG: "TOGGLE_FIELD_FLAG" as const,
  
  // Snapping & Alignment
  SET_SNAP: "SET_SNAP" as const,
  SET_SNAP_GRID: "SET_SNAP_GRID" as const,
  SET_SNAP_PULSE: "SET_SNAP_PULSE" as const,
  SET_DISTRIBUTE_SPACING: "SET_DISTRIBUTE_SPACING" as const,
  ALIGN_SELECTION: "ALIGN_SELECTION" as const,
  DISTRIBUTE_SELECTION: "DISTRIBUTE_SELECTION" as const,
  DISTRIBUTE_SELECTION_FIXED: "DISTRIBUTE_SELECTION_FIXED" as const,
  
  // Formation
  APPLY_FORMATION: "APPLY_FORMATION" as const,
  MIRROR: "MIRROR" as const,
  
  // History
  UNDO: "UNDO" as const,
  REDO: "REDO" as const,
} as const;

// ============================================================================
// Action Type Utility
// ============================================================================

export type ActionType = typeof ActionTypes[keyof typeof ActionTypes];

// ============================================================================
// Action Groups (for documentation and organization)
// ============================================================================

export const ActionGroups = {
  DOCUMENT: [ActionTypes.INIT, ActionTypes.MARK_SAVED],
  TOOLS: [
    ActionTypes.SET_TOOL,
    ActionTypes.SET_ROUTE_MODE,
    ActionTypes.SET_DRAW_MODE,
    ActionTypes.SET_DRAW_COLOR,
    ActionTypes.SET_DRAW_WIDTH,
    ActionTypes.SET_DRAW_ARROW_HEAD,
  ],
  SELECTION: [
    ActionTypes.SET_SELECTION,
    ActionTypes.TOGGLE_SELECT,
    ActionTypes.CLEAR_SELECTION,
    ActionTypes.SET_ACTIVE_PLAYER,
  ],
  PLAYERS: [
    ActionTypes.ADD_PLAYER,
    ActionTypes.UPDATE_PLAYER,
    ActionTypes.UPDATE_PLAYERS_BULK,
    ActionTypes.REMOVE_PLAYER,
    ActionTypes.REMOVE_PLAYERS,
    ActionTypes.MOVE_PLAYER,
    ActionTypes.MOVE_PLAYER_INDEX,
    ActionTypes.REORDER_PLAYER,
    ActionTypes.SET_PENDING_DELETE,
    ActionTypes.SET_PENDING_BULK_DELETE,
  ],
  MOVEMENT: [ActionTypes.MOVE_SELECTION, ActionTypes.COMMIT_MOVE],
  INLINE_EDIT: [
    ActionTypes.START_INLINE_EDIT,
    ActionTypes.UPDATE_INLINE_EDIT,
    ActionTypes.CANCEL_INLINE_EDIT,
    ActionTypes.COMMIT_INLINE_EDIT,
  ],
  ROUTES: [
    ActionTypes.START_ROUTE,
    ActionTypes.PREVIEW_ROUTE,
    ActionTypes.ADD_ROUTE_POINT,
    ActionTypes.ADD_ROUTE_SEGMENT,
    ActionTypes.POP_ROUTE_POINT,
    ActionTypes.CANCEL_ROUTE,
    ActionTypes.COMMIT_ROUTE,
    ActionTypes.DELETE_ROUTE,
    ActionTypes.UPDATE_ROUTE_POINT,
    ActionTypes.COMMIT_ROUTE_EDIT,
  ],
  ANNOTATIONS: [
    ActionTypes.START_ANNOTATION,
    ActionTypes.PREVIEW_ANNOTATION,
    ActionTypes.ADD_ANNOTATION_POINT,
    ActionTypes.ADD_FREEHAND_POINT,
    ActionTypes.SET_ANNOTATION_TO,
    ActionTypes.POP_ANNOTATION_POINT,
    ActionTypes.CANCEL_ANNOTATION,
    ActionTypes.COMMIT_ANNOTATION,
    ActionTypes.SELECT_ANNOTATION,
    ActionTypes.DELETE_ANNOTATION,
    ActionTypes.UPDATE_ANNOT_POINT,
    ActionTypes.COMMIT_ANNOT_EDIT,
    ActionTypes.UPDATE_ANNOT_STYLE,
    ActionTypes.MOVE_ANNOTATION,
    ActionTypes.DUPLICATE_ANNOTATION,
  ],
  VIEWPORT: [
    ActionTypes.SET_ZOOM,
    ActionTypes.PAN,
    ActionTypes.SET_VIEWPORT,
    ActionTypes.SET_GRID_OVERLAY,
  ],
  FIELD: [
    ActionTypes.SET_BALL_HASH,
    ActionTypes.SET_FIELD_THEME,
    ActionTypes.SET_FIELD_HASH_LAYOUT,
    ActionTypes.TOGGLE_FIELD_FLAG,
  ],
  ALIGNMENT: [
    ActionTypes.SET_SNAP,
    ActionTypes.SET_SNAP_GRID,
    ActionTypes.SET_SNAP_PULSE,
    ActionTypes.SET_DISTRIBUTE_SPACING,
    ActionTypes.ALIGN_SELECTION,
    ActionTypes.DISTRIBUTE_SELECTION,
    ActionTypes.DISTRIBUTE_SELECTION_FIXED,
  ],
  FORMATION: [ActionTypes.APPLY_FORMATION, ActionTypes.MIRROR],
  HISTORY: [ActionTypes.UNDO, ActionTypes.REDO],
} as const;

// ============================================================================
// Statistics
// ============================================================================

export const ActionStats = {
  TOTAL_ACTIONS: Object.keys(ActionTypes).length,
  GROUPS: Object.keys(ActionGroups).length,
  LARGEST_GROUP: "ANNOTATIONS" as const,
  LARGEST_GROUP_SIZE: ActionGroups.ANNOTATIONS.length,
} as const;
