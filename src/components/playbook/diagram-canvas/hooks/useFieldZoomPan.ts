import { useRef, useEffect, useCallback } from "react";
import type { RefObject } from "react";

/**
 * Field Zoom & Pan Hook
 *
 * Manages viewport transformations for the field canvas:
 * - Focal wheel zoom (Ctrl/Cmd + wheel) centered on cursor
 * - Click-and-drag panning with the pan tool
 * - Coordinate space conversions
 * - Viewport state management
 *
 * @param svgRef - Reference to the SVG canvas element
 * @param zoom - Current zoom level (0.25-4.0)
 * @param panX - Current pan X offset in SVG units
 * @param panY - Current pan Y offset in SVG units
 * @param onViewportChange - Callback to update viewport state
 *
 * @returns Object containing pan handlers and state
 */
export function useFieldZoomPan({
  svgRef,
  zoom,
  panX,
  panY,
  onViewportChange,
}: {
  svgRef: RefObject<SVGSVGElement | null>;
  zoom: number;
  panX: number;
  panY: number;
  onViewportChange: (viewport: {
    zoom?: number;
    panX?: number;
    panY?: number;
  }) => void;
}) {
  // Pan tracking state
  const panRef = useRef<{
    startX: number;
    startY: number;
    panX: number;
    panY: number;
  } | null>(null);

  // Clamp helper for zoom range
  const clamp = useCallback(
    (v: number, min: number, max: number) => Math.max(min, Math.min(max, v)),
    []
  );

  /**
   * Focal wheel zoom handler
   * Zooms centered on cursor position (world coords stay under cursor)
   * Supports Ctrl/Cmd + wheel and trackpad pinch gestures
   */
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;

    const handler = (e: WheelEvent) => {
      // Allow trackpad pinch-zoom (which sets ctrlKey on mac) and Ctrl+wheel
      if (!e.ctrlKey) return;
      e.preventDefault();

      const rect = el.getBoundingClientRect();
      const xView = ((e.clientX - rect.left) / rect.width) * 1600;
      const yView = ((e.clientY - rect.top) / rect.height) * 900;

      // Convert view coords to world under current transform
      const worldX = (xView - panX) / zoom;
      const worldY = (yView - panY) / zoom;

      // Zoom step factor
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      const targetZoom = clamp(zoom * factor, 0.25, 4);

      // Compute new pan so that world point stays under cursor
      const newPanX = xView - worldX * targetZoom;
      const newPanY = yView - worldY * targetZoom;

      onViewportChange({
        zoom: targetZoom,
        panX: newPanX,
        panY: newPanY,
      });
    };

    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [svgRef, zoom, panX, panY, onViewportChange, clamp]);

  /**
   * Start panning interaction
   * Records initial mouse position and viewport state
   */
  const handlePanStart = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return; // left-button only
      panRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        panX,
        panY,
      };
    },
    [panX, panY]
  );

  /**
   * Handle pan movement
   * Converts pixel delta to SVG world units and updates viewport
   */
  const handlePanMove = useCallback(
    (e: MouseEvent) => {
      if (!panRef.current) return;

      const svg = svgRef.current;
      const rect = svg?.getBoundingClientRect();
      if (!rect) return;

      const dxPx = e.clientX - panRef.current.startX;
      const dyPx = e.clientY - panRef.current.startY;

      // Convert pixel delta to SVG world (viewBox) units
      const dx = (dxPx / rect.width) * 1600;
      const dy = (dyPx / rect.height) * 900;

      onViewportChange({
        panX: panRef.current.panX + dx,
        panY: panRef.current.panY + dy,
      });

      // Update reference for incremental panning
      panRef.current.startX = e.clientX;
      panRef.current.startY = e.clientY;
    },
    [svgRef, onViewportChange]
  );

  /**
   * End panning interaction
   * Clears pan state
   */
  const handlePanEnd = useCallback(() => {
    panRef.current = null;
  }, []);

  /**
   * Check if currently panning
   */
  const isPanning = panRef.current !== null;

  // Auto-cleanup pan state on mouseup
  useEffect(() => {
    window.addEventListener("mouseup", handlePanEnd);
    return () => window.removeEventListener("mouseup", handlePanEnd);
  }, [handlePanEnd]);

  return {
    panRef,
    isPanning,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
  };
}
