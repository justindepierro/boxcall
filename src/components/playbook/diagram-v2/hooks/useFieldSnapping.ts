import { useCallback, useState, useEffect, useRef, useMemo } from "react";

/**
 * Alignment guides for visual feedback
 */
export interface AlignmentGuides {
  vertical?: number[]; // x positions in px
  horizontal?: number[]; // y positions in px
}

/**
 * Center snap flash state
 */
export interface CenterFlashState {
  x?: boolean; // flashing X axis
  y?: boolean; // flashing Y axis
  t0: number; // start time
}

/**
 * Guide fade state for smooth transitions
 */
interface GuideFadeState {
  guides: AlignmentGuides;
  hasCenterX?: boolean;
  hasCenterY?: boolean;
  t0: number; // start time
}

/**
 * Snap result
 */
export interface SnapResult {
  x?: number; // snapped x percentage
  y?: number; // snapped y percentage
  guides: AlignmentGuides;
}

/**
 * Anchor snap result
 */
export interface AnchorSnapResult {
  x: number;
  y: number;
  snapped: boolean;
  kind?: "player" | "annotation" | "route";
  id?: string;
}

/**
 * Player data for snapping
 */
export interface PlayerData {
  id: string;
  x: number; // percentage
  y: number; // percentage
  locked?: boolean;
}

/**
 * Annotation data for snapping
 */
export interface AnnotationData {
  id: string;
  type: string;
  points?: { x: number; y: number }[];
}

/**
 * Route data for snapping
 */
export interface RouteData {
  id: string;
  segments: { points: { x: number; y: number }[] }[];
}

/**
 * Field Snapping Hook
 *
 * Manages intelligent snapping behavior for the field canvas:
 * - Alignment snap to other players, annotations, and routes
 * - Visual alignment guides with smooth fade-in/out
 * - Center snap flash labels
 * - Grid snapping
 * - Anchor snapping for drawing tools
 *
 * @param players - Array of player objects
 * @param annotations - Array of annotation objects
 * @param routes - Array of route objects
 * @param snapEnabled - Whether snapping is enabled
 * @param snapGrid - Grid snap interval (1 = 1%)
 * @param prefersReducedMotion - Whether reduced motion is preferred
 *
 * @returns Object containing snapping functions and state
 */
export function useFieldSnapping({
  players,
  annotations,
  routes,
  snapEnabled,
  snapGrid = 1,
  prefersReducedMotion = false,
}: {
  players: PlayerData[];
  annotations: AnnotationData[];
  routes: RouteData[];
  snapEnabled: boolean;
  snapGrid?: number;
  prefersReducedMotion?: boolean;
}) {
  // Alignment guide state
  const [alignGuides, setAlignGuides] = useState<AlignmentGuides | null>(null);
  const [guideLiveOpacity, setGuideLiveOpacity] = useState<number>(0);
  const lastGuidesRef = useRef<{
    guides: AlignmentGuides;
    hasCenterX?: boolean;
    hasCenterY?: boolean;
  } | null>(null);
  const [guideFade, setGuideFade] = useState<GuideFadeState | null>(null);

  // Center snap flash state
  const [centerFlash, setCenterFlash] = useState<CenterFlashState | null>(null);

  /**
   * Snap percentage value to grid
   */
  const snapPct = useCallback(
    (val: number) => {
      if (!snapEnabled) return val;
      return Math.round(val / snapGrid) * snapGrid;
    },
    [snapEnabled, snapGrid]
  );

  /**
   * Compute alignment snap for a world position
   * Considers players, annotations, routes, and canvas center
   */
  const computeAlignmentSnap = useCallback(
    (
      xWorld: number,
      yWorld: number,
      movingIds: string[]
    ): SnapResult => {
      if (!snapEnabled) {
        return { guides: {} };
      }

      const threshPx = 8; // snap threshold in px
      let bestX: { pct: number; px: number; d: number } | undefined;
      let bestY: { pct: number; px: number; d: number } | undefined;
      const vGuides: number[] = [];
      const hGuides: number[] = [];

      // 1) Players (exclude moving)
      const others = players.filter((p) => !movingIds.includes(p.id));
      for (const p of others) {
        const cx = (p.x / 100) * 1600;
        const cy = (p.y / 100) * 900;
        // approximate visual bounds for players (ellipse 52x36)
        const halfW = 26;
        const halfH = 18;
        const edgesX = [cx - halfW, cx, cx + halfW];
        const edgesY = [cy - halfH, cy, cy + halfH];

        for (const ex of edgesX) {
          const dx = Math.abs(ex - xWorld);
          if (dx <= threshPx && (!bestX || dx < bestX.d)) {
            const pct = (ex / 1600) * 100;
            bestX = { pct, px: ex, d: dx };
          }
        }

        for (const ey of edgesY) {
          const dy = Math.abs(ey - yWorld);
          if (dy <= threshPx && (!bestY || dy < bestY.d)) {
            const pct = (ey / 900) * 100;
            bestY = { pct, px: ey, d: dy };
          }
        }
      }

      // 2) Annotation points (all points for non-connector)
      for (const a of annotations) {
        if (a.type === "connector") continue;
        if (!("points" in a) || !a.points) continue;

        let minXPx = Infinity,
          maxXPx = -Infinity,
          minYPx = Infinity,
          maxYPx = -Infinity;

        for (const pt of a.points) {
          const px = (pt.x / 100) * 1600;
          const py = (pt.y / 100) * 900;
          minXPx = Math.min(minXPx, px);
          maxXPx = Math.max(maxXPx, px);
          minYPx = Math.min(minYPx, py);
          maxYPx = Math.max(maxYPx, py);

          const dx = Math.abs(px - xWorld);
          const dy = Math.abs(py - yWorld);
          if (dx <= threshPx && (!bestX || dx < bestX.d))
            bestX = { pct: pt.x, px, d: dx };
          if (dy <= threshPx && (!bestY || dy < bestY.d))
            bestY = { pct: pt.y, px: py, d: dy };
        }

        const cx = (minXPx + maxXPx) / 2;
        const cy = (minYPx + maxYPx) / 2;
        const candidateXs = [minXPx, cx, maxXPx];
        const candidateYs = [minYPx, cy, maxYPx];

        for (const ex of candidateXs) {
          const dx = Math.abs(ex - xWorld);
          if (dx <= threshPx && (!bestX || dx < bestX.d))
            bestX = { pct: (ex / 1600) * 100, px: ex, d: dx };
        }

        for (const ey of candidateYs) {
          const dy = Math.abs(ey - yWorld);
          if (dy <= threshPx && (!bestY || dy < bestY.d))
            bestY = { pct: (ey / 900) * 100, px: ey, d: dy };
        }
      }

      // 3) Route points
      for (const r of routes) {
        for (const s of r.segments) {
          let minXPx = Infinity,
            maxXPx = -Infinity,
            minYPx = Infinity,
            maxYPx = -Infinity;

          for (const pt of s.points) {
            const px = (pt.x / 100) * 1600;
            const py = (pt.y / 100) * 900;
            minXPx = Math.min(minXPx, px);
            maxXPx = Math.max(maxXPx, px);
            minYPx = Math.min(minYPx, py);
            maxYPx = Math.max(maxYPx, py);

            const dx = Math.abs(px - xWorld);
            const dy = Math.abs(py - yWorld);
            if (dx <= threshPx && (!bestX || dx < bestX.d))
              bestX = { pct: pt.x, px, d: dx };
            if (dy <= threshPx && (!bestY || dy < bestY.d))
              bestY = { pct: pt.y, px: py, d: dy };
          }

          const cx = (minXPx + maxXPx) / 2;
          const cy = (minYPx + maxYPx) / 2;
          const candidateXs = [minXPx, cx, maxXPx];
          const candidateYs = [minYPx, cy, maxYPx];

          for (const ex of candidateXs) {
            const dx = Math.abs(ex - xWorld);
            if (dx <= threshPx && (!bestX || dx < bestX.d))
              bestX = { pct: (ex / 1600) * 100, px: ex, d: dx };
          }

          for (const ey of candidateYs) {
            const dy = Math.abs(ey - yWorld);
            if (dy <= threshPx && (!bestY || dy < bestY.d))
              bestY = { pct: (ey / 900) * 100, px: ey, d: dy };
          }
        }
      }

      // 4) Canvas center guides
      const centerX = 800;
      const centerY = 450;
      const dxc = Math.abs(centerX - xWorld);
      const dyc = Math.abs(centerY - yWorld);
      if (dxc <= threshPx && (!bestX || dxc < bestX.d))
        bestX = { pct: 50, px: centerX, d: dxc };
      if (dyc <= threshPx && (!bestY || dyc < bestY.d))
        bestY = { pct: 50, px: centerY, d: dyc };

      if (bestX) vGuides.push(bestX.px);
      if (bestY) hGuides.push(bestY.px);

      return {
        x: bestX ? bestX.pct : undefined,
        y: bestY ? bestY.pct : undefined,
        guides: {
          vertical: vGuides.length ? vGuides : undefined,
          horizontal: hGuides.length ? hGuides : undefined,
        },
      };
    },
    [snapEnabled, players, annotations, routes]
  );

  /**
   * Smart snapping to player/annotation/route anchors for drawing
   */
  const snapToAnchor = useCallback(
    (xWorld: number, yWorld: number): AnchorSnapResult => {
      const threshold = 18; // ~18px
      let bestDist = Infinity;
      let best: {
        x: number;
        y: number;
        kind: "player" | "annotation" | "route";
        id: string;
      } | null = null;

      // Players
      for (const p of players) {
        const ax = (p.x / 100) * 1600;
        const ay = (p.y / 100) * 900;
        const dx = ax - xWorld;
        const dy = ay - yWorld;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < threshold && d < bestDist) {
          bestDist = d;
          best = { x: p.x, y: p.y, kind: "player", id: p.id };
        }
      }

      // Annotation endpoints (first/last point)
      for (const a of annotations) {
        if (a.type === "connector") continue;
        if (!("points" in a) || !a.points) continue;

        const candidates = [a.points[0], a.points[a.points.length - 1]].filter(
          Boolean
        );
        for (const pt of candidates) {
          const ax = (pt.x / 100) * 1600;
          const ay = (pt.y / 100) * 900;
          const dx = ax - xWorld;
          const dy = ay - yWorld;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < threshold && d < bestDist) {
            bestDist = d;
            best = { x: pt.x, y: pt.y, kind: "annotation", id: a.id };
          }
        }
      }

      // Route points
      for (const r of routes) {
        for (const seg of r.segments) {
          for (const pt of seg.points) {
            const ax = (pt.x / 100) * 1600;
            const ay = (pt.y / 100) * 900;
            const dx = ax - xWorld;
            const dy = ay - yWorld;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < threshold && d < bestDist) {
              bestDist = d;
              best = { x: pt.x, y: pt.y, kind: "route", id: r.id };
            }
          }
        }
      }

      if (best) {
        return {
          x: best.x,
          y: best.y,
          snapped: true,
          kind: best.kind,
          id: best.id,
        };
      }

      return {
        x: snapPct((xWorld / 1600) * 100),
        y: snapPct((yWorld / 900) * 100),
        snapped: false,
      };
    },
    [players, annotations, routes, snapPct]
  );

  /**
   * Update alignment guides with smooth fade-in
   */
  const updateAlignmentGuides = useCallback(
    (guides: AlignmentGuides | null, hasCenterX?: boolean, hasCenterY?: boolean) => {
      const hasGuides = !!(guides && (guides.vertical || guides.horizontal));
      setAlignGuides(hasGuides ? guides : null);

      if (hasGuides && guides) {
        lastGuidesRef.current = { guides, hasCenterX, hasCenterY };
        // Smooth fade-in
        setGuideLiveOpacity((op) => (op < 0.8 ? 0.8 : op));
      }
    },
    []
  );

  /**
   * Trigger center snap flash
   */
  const triggerCenterFlash = useCallback((x?: boolean, y?: boolean) => {
    if (!prefersReducedMotion && (x || y)) {
      setCenterFlash({
        x,
        y,
        t0: performance.now(),
      });
    }
  }, [prefersReducedMotion]);

  /**
   * Clear alignment guides and begin fade-out
   */
  const clearAlignmentGuides = useCallback(() => {
    setAlignGuides(null);
    if (lastGuidesRef.current) {
      setGuideFade({
        guides: lastGuidesRef.current.guides,
        hasCenterX: lastGuidesRef.current.hasCenterX,
        hasCenterY: lastGuidesRef.current.hasCenterY,
        t0: performance.now(),
      });
      // Reset live opacity for next appearance
      setGuideLiveOpacity(0);
    }
  }, []);

  // Drive fade-out lifecycle for guides (out over ~250ms)
  const [, setGuideFadeTick] = useState(0);
  useEffect(() => {
    if (!guideFade) return;
    let raf = 0;
    const tick = () => {
      const elapsed = performance.now() - guideFade.t0;
      if (elapsed > 260) {
        setGuideFade(null);
        return;
      }
      setGuideFadeTick(elapsed);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [guideFade]);

  // Expire center snap flash after ~800ms
  const [, setCenterFlashTick] = useState(0);
  useEffect(() => {
    if (!centerFlash) return;
    let raf = 0;
    const tick = () => {
      const elapsed = performance.now() - centerFlash.t0;
      if (elapsed > 800) {
        setCenterFlash(null);
        return;
      }
      setCenterFlashTick(elapsed);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [centerFlash]);

  // Guide fade opacity calculation
  const guideFadeOpacity = useMemo(() => {
    if (!guideFade) return 0;
    const elapsed = performance.now() - guideFade.t0;
    return Math.max(0, 0.8 - (elapsed / 260) * 0.8);
  }, [guideFade]);

  return {
    // Functions
    snapPct,
    computeAlignmentSnap,
    snapToAnchor,
    updateAlignmentGuides,
    clearAlignmentGuides,
    triggerCenterFlash,

    // State
    alignGuides,
    guideLiveOpacity,
    guideFade,
    guideFadeOpacity,
    centerFlash,
  };
}
