// Utility functions for FieldCanvas modular system

export function clientToWorld(
  evt: MouseEvent,
  svgRef: React.RefObject<SVGSVGElement>,
  panX: number,
  panY: number,
  zoom: number
): { x: number; y: number } {
  const svg = svgRef.current;
  if (!svg) return { x: 0, y: 0 };
  const rect = svg.getBoundingClientRect();
  const xView = ((evt.clientX - rect.left) / rect.width) * 1600;
  const yView = ((evt.clientY - rect.top) / rect.height) * 900;
  const xWorld = (xView - panX) / zoom;
  const yWorld = (yView - panY) / zoom;
  return { x: xWorld, y: yWorld };
}

export function snapPct(val: number, snap: boolean, snapGrid: number): number {
  if (!snap) return val;
  const g = snapGrid || 1;
  return Math.round(val / g) * g;
}

// ...other utility functions (computeAlignmentSnap, snapToAnchorPct, etc.) can be added here...
