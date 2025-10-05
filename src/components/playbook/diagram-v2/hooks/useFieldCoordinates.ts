/**
 * Field coordinate conversion utilities
 * 
 * Handles conversion between:
 * - Percentage coordinates (0-100%, used in data model)
 * - Absolute pixel coordinates (0-1600x, 0-900y, SVG viewBox)
 * - Client coordinates (screen pixels, accounting for pan/zoom)
 */

import { useCallback } from "react";
import type { RefObject } from "react";

interface CoordinateHook {
  pctToAbs: (xPct: number, yPct: number) => { x: number; y: number };
  absToPct: (x: number, y: number) => { x: number; y: number };
  clientToWorld: (evt: { clientX: number; clientY: number }) => {
    x: number;
    y: number;
  };
}

interface UseFieldCoordinatesProps {
  svgRef: RefObject<SVGSVGElement>;
  panX: number;
  panY: number;
  zoom: number;
}

/**
 * Hook for field coordinate conversions
 * 
 * @param svgRef - Reference to the SVG element
 * @param panX - Current pan X offset
 * @param panY - Current pan Y offset
 * @param zoom - Current zoom level
 * @returns Coordinate conversion functions
 */
export function useFieldCoordinates({
  svgRef,
  panX,
  panY,
  zoom,
}: UseFieldCoordinatesProps): CoordinateHook {
  /**
   * Convert percentage coordinates to absolute pixel coordinates
   * Field dimensions: 1600x900 pixels
   */
  const pctToAbs = useCallback(
    (xPct: number, yPct: number) => {
      return {
        x: (xPct / 100) * 1600,
        y: (yPct / 100) * 900,
      };
    },
    []
  );

  /**
   * Convert absolute pixel coordinates to percentage coordinates
   */
  const absToPct = useCallback((x: number, y: number) => {
    return {
      x: (x / 1600) * 100,
      y: (y / 900) * 100,
    };
  }, []);

  /**
   * Map client mouse event to SVG world coordinates (0..1600 x 0..900)
   * Accounts for pan/zoom transforms
   */
  const clientToWorld = useCallback(
    (evt: { clientX: number; clientY: number }) => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };

      const rect = svg.getBoundingClientRect();

      // Position within the SVG's viewBox space
      const xView = ((evt.clientX - rect.left) / rect.width) * 1600;
      const yView = ((evt.clientY - rect.top) / rect.height) * 900;

      // Invert the inner group transform translate(pan) scale(zoom)
      const xWorld = (xView - panX) / zoom;
      const yWorld = (yView - panY) / zoom;

      return { x: xWorld, y: yWorld };
    },
    [svgRef, panX, panY, zoom]
  );

  return {
    pctToAbs,
    absToPct,
    clientToWorld,
  };
}
