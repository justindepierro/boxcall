import { useRef, useCallback, useState, useEffect } from "react";
import type { RefObject } from "react";

/**
 * Drag threshold in pixels before a drag is considered started
 * Prevents accidental drags from clicks
 */
const DRAG_THRESHOLD_PX = 5;

/**
 * Player drag state
 */
interface PlayerDragState {
  id: string; // primary dragged player id
  startX: number; // world coords
  startY: number; // world coords
  startClientX: number; // client px for threshold
  startClientY: number; // client px for threshold
  hasStarted: boolean; // surpassed threshold
  moved: boolean; // actual movement occurred
  originals: { id: string; xAbs: number; yAbs: number }[]; // group snapshot
}

/**
 * Annotation drag state
 */
interface AnnotationDragState {
  id: string;
  startX: number; // world coords
  startY: number; // world coords
}

/**
 * Selection box drag state (marquee selection)
 */
interface SelectionDragState {
  startX: number; // world coords
  startY: number; // world coords
  startClientX: number; // client px for threshold
  startClientY: number; // client px for threshold
  hasMoved: boolean; // surpassed threshold
}

/**
 * Selection box dimensions
 */
export interface SelectionBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Field Drag & Drop Hook
 *
 * Manages all drag interactions on the field canvas:
 * - Player dragging (single and group)
 * - Annotation dragging
 * - Marquee selection box
 * - Drag threshold detection
 * - Click suppression after drag
 *
 * @param svgRef - Reference to the SVG canvas element
 * @param clientToWorld - Function to convert client coords to world coords
 * @param onPlayerDragStart - Callback when player drag starts
 * @param onPlayerDragMove - Callback when player is being dragged
 * @param onPlayerDragEnd - Callback when player drag ends
 * @param onAnnotationDragStart - Callback when annotation drag starts
 * @param onAnnotationDragMove - Callback when annotation is being dragged
 * @param onAnnotationDragEnd - Callback when annotation drag ends
 * @param onSelectionDragStart - Callback when selection box drag starts
 * @param onSelectionDragMove - Callback when selection box is being dragged
 * @param onSelectionDragEnd - Callback when selection box drag ends
 *
 * @returns Object containing drag state and handlers
 */
export function useFieldDragDrop({
  svgRef: _svgRef,
  clientToWorld,
  onPlayerDragStart,
  onPlayerDragMove,
  onPlayerDragEnd,
  onAnnotationDragStart,
  onAnnotationDragMove,
  onAnnotationDragEnd,
  onSelectionDragStart,
  onSelectionDragMove,
  onSelectionDragEnd,
}: {
  svgRef: RefObject<SVGSVGElement>;
  clientToWorld: (e: { clientX: number; clientY: number }) => {
    x: number;
    y: number;
  };
  onPlayerDragStart?: (state: PlayerDragState) => void;
  onPlayerDragMove?: (state: PlayerDragState, delta: { dx: number; dy: number }) => void;
  onPlayerDragEnd?: (state: PlayerDragState | null) => void;
  onAnnotationDragStart?: (state: AnnotationDragState) => void;
  onAnnotationDragMove?: (state: AnnotationDragState, delta: { dx: number; dy: number }) => void;
  onAnnotationDragEnd?: (state: AnnotationDragState | null) => void;
  onSelectionDragStart?: () => void;
  onSelectionDragMove?: (box: SelectionBox) => void;
  onSelectionDragEnd?: (box: SelectionBox | null, hasMoved: boolean) => void;
}) {
  // Drag state refs
  const dragRef = useRef<PlayerDragState | null>(null);
  const annotDragRef = useRef<AnnotationDragState | null>(null);
  const selectionDragRef = useRef<SelectionDragState | null>(null);

  // Click suppression (prevent click events after drag)
  const suppressClickRef = useRef(false);

  // Selection box state
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);

  /**
   * Start player drag
   * Captures initial state and group snapshot
   */
  const startPlayerDrag = useCallback(
    (
      id: string,
      e: React.MouseEvent,
      originals: { id: string; xAbs: number; yAbs: number }[]
    ) => {
      if (!originals.length) return; // nothing draggable (all locked)

      const start = clientToWorld(e);
      const state: PlayerDragState = {
        id,
        startX: start.x,
        startY: start.y,
        startClientX: e.clientX,
        startClientY: e.clientY,
        hasStarted: false,
        moved: false,
        originals,
      };
      dragRef.current = state;
      onPlayerDragStart?.(state);
    },
    [clientToWorld, onPlayerDragStart]
  );

  /**
   * Start annotation drag
   */
  const startAnnotationDrag = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const start = clientToWorld(e);
      const state: AnnotationDragState = {
        id,
        startX: start.x,
        startY: start.y,
      };
      annotDragRef.current = state;
      onAnnotationDragStart?.(state);
    },
    [clientToWorld, onAnnotationDragStart]
  );

  /**
   * Start selection box drag (marquee)
   */
  const startSelectionDrag = useCallback(
    (e: React.MouseEvent) => {
      const start = clientToWorld(e);
      selectionDragRef.current = {
        startX: start.x,
        startY: start.y,
        startClientX: e.clientX,
        startClientY: e.clientY,
        hasMoved: false,
      };
      onSelectionDragStart?.();
    },
    [clientToWorld, onSelectionDragStart]
  );

  /**
   * Handle mouse move for all drag types
   */
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      // Annotation drag
      if (annotDragRef.current) {
        const now = clientToWorld(e);
        const dx = now.x - annotDragRef.current.startX;
        const dy = now.y - annotDragRef.current.startY;
        if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
          onAnnotationDragMove?.(annotDragRef.current, { dx, dy });
          annotDragRef.current.startX = now.x;
          annotDragRef.current.startY = now.y;
        }
        return;
      }

      // Selection box drag (marquee)
      if (selectionDragRef.current) {
        const s = selectionDragRef.current;

        // Don't create marquee until threshold is exceeded
        if (!s.hasMoved) {
          const dxPx = e.clientX - s.startClientX;
          const dyPx = e.clientY - s.startClientY;
          if (Math.hypot(dxPx, dyPx) < DRAG_THRESHOLD_PX) {
            return;
          }
          // Begin marquee - movement is intentional
          s.hasMoved = true;
          setSelectionBox({ x: s.startX, y: s.startY, w: 0, h: 0 });
          suppressClickRef.current = true;
        }

        const curr = clientToWorld(e);
        const sx = s.startX;
        const sy = s.startY;
        const x1 = Math.min(sx, curr.x);
        const y1 = Math.min(sy, curr.y);
        const x2 = Math.max(sx, curr.x);
        const y2 = Math.max(sy, curr.y);

        const box: SelectionBox = { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
        setSelectionBox(box);
        onSelectionDragMove?.(box);
        return;
      }

      // Player drag
      if (!dragRef.current) return;

      // Gate player/group drag until threshold is exceeded
      if (!dragRef.current.hasStarted) {
        const dxPx = e.clientX - dragRef.current.startClientX;
        const dyPx = e.clientY - dragRef.current.startClientY;
        if (Math.hypot(dxPx, dyPx) < DRAG_THRESHOLD_PX) {
          return; // don't move yet
        }
        dragRef.current.hasStarted = true;
        suppressClickRef.current = true;
      }

      const now = clientToWorld(e);
      const dx = now.x - dragRef.current.startX;
      const dy = now.y - dragRef.current.startY;

      if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
        dragRef.current.moved = true;
        onPlayerDragMove?.(dragRef.current, { dx, dy });
      }
    },
    [clientToWorld, onAnnotationDragMove, onSelectionDragMove, onPlayerDragMove]
  );

  /**
   * Handle mouse up for all drag types
   */
  const handleMouseUp = useCallback(() => {
    // Annotation drag end
    if (annotDragRef.current) {
      const state = annotDragRef.current;
      annotDragRef.current = null;
      onAnnotationDragEnd?.(state);
      return;
    }

    // Selection box drag end
    if (selectionDragRef.current) {
      const s = selectionDragRef.current;
      onSelectionDragEnd?.(selectionBox, s.hasMoved);
      selectionDragRef.current = null;
      setSelectionBox(null);
      
      // Allow clicks again after this mouseup completes
      setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
      return;
    }

    // Player drag end
    if (dragRef.current) {
      const state = dragRef.current;
      onPlayerDragEnd?.(state);
      dragRef.current = null;

      // Allow clicks again after this mouseup completes
      setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
  }, [selectionBox, onAnnotationDragEnd, onSelectionDragEnd, onPlayerDragEnd]);

  // Register global mouse event listeners
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  /**
   * Check if click should be suppressed (after drag)
   */
  const shouldSuppressClick = useCallback(() => {
    return suppressClickRef.current;
  }, []);

  /**
   * Check if currently dragging anything
   */
  const isDragging = dragRef.current !== null || 
                     annotDragRef.current !== null || 
                     selectionDragRef.current !== null;

  /**
   * Check if currently dragging players
   */
  const isDraggingPlayers = dragRef.current !== null;

  /**
   * Check if currently dragging annotation
   */
  const isDraggingAnnotation = annotDragRef.current !== null;

  /**
   * Check if currently dragging selection box
   */
  const isDraggingSelection = selectionDragRef.current !== null;

  return {
    // State
    dragRef,
    annotDragRef,
    selectionDragRef,
    selectionBox,
    isDragging,
    isDraggingPlayers,
    isDraggingAnnotation,
    isDraggingSelection,

    // Actions
    startPlayerDrag,
    startAnnotationDrag,
    startSelectionDrag,
    shouldSuppressClick,
  };
}
