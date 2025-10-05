import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
  useMemo,
} from "react";
import { useDiagramEditor } from "./context";
import { Button } from "../../ui/Button/Button";
import type { DiagramAnnotation, DiagramAnnotationConnector } from "./types";
import { telemetry } from "../../../telemetry/dispatcher";
import { TelemetryEventTypes } from "../../../telemetry/events";

// Extracted hooks
import { useFieldCoordinates } from "./hooks/useFieldCoordinates";
import { useFieldZoomPan } from "./hooks/useFieldZoomPan";
import { useFieldDragDrop } from "./hooks/useFieldDragDrop";
import { useFieldSnapping } from "./hooks/useFieldSnapping";
import { useFieldKeyboard } from "./hooks/useFieldKeyboard";

// Extracted components
import { FieldGrid } from "./components/FieldGrid";
import { FieldPlayers } from "./components/FieldPlayers";
import { FieldRoutes } from "./components/FieldRoutes";
import { FieldAnnotations } from "./components/FieldAnnotations";
import { FieldGuides } from "./components/FieldGuides";
import { FieldMinimap } from "./components/FieldMinimap";

// Simple SVG field canvas with zoom/pan transforms (placeholder)
export const FieldCanvas: React.FC<{
  className?: string;
  onPlayerMouseDown?: (id: string, e: React.MouseEvent) => void;
}> = ({ className, onPlayerMouseDown }) => {
  // Ephemeral attach/snap preview while dragging a route point
  const [attachPreview, setAttachPreview] = React.useState<
    | { x1: number; y1: number; x2: number; y2: number; targetId?: string }
    | undefined
  >(undefined);
  const { state, dispatch } = useDiagramEditor();
  const { doc } = state;
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Clamp helper for zoom range
  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));
  // Focal wheel zoom (Ctrl/Cmd + wheel) centered on cursor; also prevent default pinch zoom
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      // allow trackpad pinch-zoom (which sets ctrlKey on mac) and Ctrl+wheel
      if (!e.ctrlKey) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const xView = ((e.clientX - rect.left) / rect.width) * 1600;
      const yView = ((e.clientY - rect.top) / rect.height) * 900;
      // Convert view coords to world under current transform
      const worldX = (xView - state.ui.panX) / state.ui.zoom;
      const worldY = (yView - state.ui.panY) / state.ui.zoom;
      // Zoom step factor
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      const targetZoom = clamp(state.ui.zoom * factor, 0.25, 4);
      // Compute new pan so that world point stays under cursor
      const newPanX = xView - worldX * targetZoom;
      const newPanY = yView - worldY * targetZoom;
      dispatch({
        type: "SET_VIEWPORT",
        zoom: targetZoom,
        panX: newPanX,
        panY: newPanY,
      });
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [dispatch, state.ui.panX, state.ui.panY, state.ui.zoom]);

  // Minimum pixels (client) before a drag is considered started
  const DRAG_THRESHOLD_PX = 5;

  const dragRef = useRef<{
    id: string; // primary dragged id
    startX: number; // world coords
    startY: number; // world coords
    startClientX: number; // client px
    startClientY: number; // client px
    hasStarted: boolean; // surpassed threshold
    moved: boolean;
    // For group drag: snapshot of original positions in absolute px
    originals: { id: string; xAbs: number; yAbs: number }[];
  } | null>(null);
  const panRef = useRef<{
    startX: number;
    startY: number;
    panX: number;
    panY: number;
  } | null>(null);
  const annotDragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
  } | null>(null);
  const selectionDragRef = useRef<{
    startX: number; // world coords
    startY: number; // world coords
    startClientX: number; // client px
    startClientY: number; // client px
    hasMoved: boolean;
  } | null>(null);
  const nudgeBatchRef = useRef<{
    events: number;
    playersMoved: number;
    timer: number | null;
  }>({
    events: 0,
    playersMoved: 0,
    timer: null,
  });
  const [selectionBox, setSelectionBox] = useState<null | {
    x: number;
    y: number;
    w: number;
    h: number;
  }>(null);
  const [hoverAnnId, setHoverAnnId] = useState<string | undefined>(undefined);
  const [snapViz, setSnapViz] = useState<{
    x: number;
    y: number;
    show: boolean;
  }>({ x: 0, y: 0, show: false });
  // Snap pulse visuals: store recent pulses with start time
  const [snapPulses, setSnapPulses] = useState<
    { id: number; x: number; y: number; t0: number }[]
  >([]);
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const showSelectionPulse = !prefersReducedMotion; // respect reduced motion
  const [alignGuides, setAlignGuides] = useState<null | {
    vertical?: number[]; // x positions in px
    horizontal?: number[]; // y positions in px
  }>(null);
  // Smooth guide visuals: live opacity for fade-in, and a brief fade-out trail when guides turn off
  const [guideLiveOpacity, setGuideLiveOpacity] = useState<number>(0);
  const lastGuidesRef = useRef<{
    guides: { vertical?: number[]; horizontal?: number[] };
    hasCenterX?: boolean;
    hasCenterY?: boolean;
  } | null>(null);
  const [guideFade, setGuideFade] = useState<{
    guides: { vertical?: number[]; horizontal?: number[] };
    hasCenterX?: boolean;
    hasCenterY?: boolean;
    t0: number;
  } | null>(null);
  // Center snap flash label state
  const [centerFlash, setCenterFlash] = useState<{
    x?: boolean;
    y?: boolean;
    t0: number;
  } | null>(null);
  // Live count of players within marquee selection (updates while dragging)
  const marqueeCount = useMemo(() => {
    if (!selectionBox) return 0;
    const { x, y, w, h } = selectionBox;
    let count = 0;
    for (const p of doc.players) {
      const abs = pctToAbs(p.x, p.y);
      if (abs.x >= x && abs.x <= x + w && abs.y >= y && abs.y <= y + h) {
        count++;
      }
    }
    return count;
  }, [selectionBox, doc.players]);
  // Suppress canvas click after a drag/pan to avoid unintended add-point/clear-selection
  const suppressClickRef = useRef(false);
  // Spacebar-hold-to-pan state
  const spaceHeldRef = useRef(false);
  const prevToolRef = useRef<null | typeof state.ui.tool>(null);

  // ============================================================================
  // EXTRACTED HOOKS - All field interaction logic externalized
  // ============================================================================

  // Coordinate conversion utilities
  const coordinates = useFieldCoordinates({
    svgRef,
    panX: state.ui.panX,
    panY: state.ui.panY,
    zoom: state.ui.zoom,
  });

  // Note: Keeping legacy inline functions temporarily for backwards compatibility
  // TODO: Remove after all usages are migrated to coordinates.pctToAbs, etc.

  // ============================================================================
  // LEGACY INLINE FUNCTIONS (to be removed after full refactoring)
  // ============================================================================

  function pctToAbs(xPct: number, yPct: number) {
    return {
      x: (xPct / 100) * 1600,
      y: (yPct / 100) * 900,
    };
  }
  function absToPct(x: number, y: number) {
    return {
      x: (x / 1600) * 100,
      y: (y / 900) * 100,
    };
  }

  // Map client mouse event to SVG world coordinates (0..1600 x 0..900), accounting for pan/zoom
  const clientToWorld = useCallback(
    (evt: { clientX: number; clientY: number }) => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      // Position within the SVG's viewBox space
      const xView = ((evt.clientX - rect.left) / rect.width) * 1600;
      const yView = ((evt.clientY - rect.top) / rect.height) * 900;
      // Invert the inner group transform translate(pan) scale(zoom)
      const xWorld = (xView - state.ui.panX) / state.ui.zoom;
      const yWorld = (yView - state.ui.panY) / state.ui.zoom;
      return { x: xWorld, y: yWorld };
    },
    [state.ui.panX, state.ui.panY, state.ui.zoom]
  );

  const handleMouseDownPlayer = (e: React.MouseEvent, id: string) => {
    if (e.button !== 0) return; // left-button only
    const player = doc.players.find((p) => p.id === id);
    if (!player) return;
    // In draw (non-connector) and pan/add-player tools, don't intercept; let canvas handle
    if (
      (state.ui.tool === "draw" && state.ui.drawMode !== "connector") ||
      state.ui.tool === "pan" ||
      state.ui.tool === "add-player"
    ) {
      return; // allow event to bubble to canvas
    }
    // From here on, we will handle and stop propagation
    e.stopPropagation();
    e.preventDefault();
    // Connector tool: click player to set from/to endpoints
    if (state.ui.tool === "draw" && state.ui.drawMode === "connector") {
      if (!state.ui.annotating) {
        dispatch({
          type: "START_ANNOTATION",
          drawType: "connector",
          fromPlayerId: id,
        });
      } else if (!state.ui.annotating.toPlayerId) {
        dispatch({ type: "SET_ANNOTATION_TO", toPlayerId: id });
        dispatch({ type: "COMMIT_ANNOTATION" });
      }
      return;
    }
    // Compute what the selection will be after this click so drag can start immediately
    const prev = new Set(state.ui.selectedIds || []);
    let nextSelectedIds: string[] = [];
    if (e.detail === 2) {
      // Double-click: select all players on same side (offense vs defense) for quick bulk moves
      nextSelectedIds = doc.players
        .filter((p) => (player.side || "O") === (p.side || "O"))
        .map((p) => p.id);
      dispatch({ type: "SET_SELECTION", ids: nextSelectedIds });
    } else if (e.metaKey || e.shiftKey) {
      if (prev.has(id)) prev.delete(id);
      else prev.add(id);
      nextSelectedIds = Array.from(prev);
      dispatch({ type: "TOGGLE_SELECT", id });
    } else {
      nextSelectedIds = [id];
      dispatch({ type: "SET_SELECTION", ids: nextSelectedIds });
    }
    if (state.ui.tool === "route" && !state.ui.drawing) {
      dispatch({
        type: "START_ROUTE",
        playerId: id,
        start: { x: player.x, y: player.y },
      });
      return; // don't start player drag in route tool
    }
    // Build group snapshot target list (may be replaced if Alt-duplicate below)
    let selected = nextSelectedIds.length ? nextSelectedIds : [id];

    // Alt key: duplicate selection, then drag duplicates (IDs regenerated)
    if (e.altKey) {
      const uniqueTs = Date.now();
      const clones: {
        id: string;
        label: string;
        x: number;
        y: number;
        color?: string;
        outlineColor?: string;
        side?: "O" | "D" | "ST";
        role?: string;
        locked?: boolean;
      }[] = [];
      const mapOldToNew = new Map<string, string>();
      selected.forEach((pid, i) => {
        const src = doc.players.find((p) => p.id === pid);
        if (!src) return;
        const newId = `p_${uniqueTs}_${i}`;
        mapOldToNew.set(pid, newId);
        clones.push({
          id: newId,
          label: src.label,
          role: src.role,
          side: src.side,
          x: src.x,
          y: src.y,
          color: src.color,
          outlineColor: src.outlineColor,
          locked: src.locked,
        });
      });
      // Add clones to document
      clones.forEach((c) => dispatch({ type: "ADD_PLAYER", player: c }));
      // Switch selection to clones
      const newIds = clones.map((c) => c.id);
      if (newIds.length) {
        dispatch({ type: "SET_SELECTION", ids: newIds });
        selected = newIds;
        // If the clicked id is part of selection, remap primary to its clone
        if (mapOldToNew.has(id)) {
          id = mapOldToNew.get(id)!;
        }
      }
    }

    // Build group snapshot (selected players) for potential group drag, excluding locked players
    const originals = selected
      .map((pid) => doc.players.find((p) => p.id === pid))
      .filter((p): p is NonNullable<typeof p> => !!p)
      .filter((p) => !p.locked)
      .map((p) => {
        const abs = pctToAbs(p.x, p.y);
        return { id: p.id, xAbs: abs.x, yAbs: abs.y };
      });
    if (!originals.length) return; // nothing draggable (all locked)
    const start = clientToWorld(e);
    dragRef.current = {
      id,
      startX: start.x,
      startY: start.y,
      startClientX: e.clientX,
      startClientY: e.clientY,
      hasStarted: false,
      moved: false,
      originals,
    };
  };

  const snapPct = useCallback(
    (val: number) => {
      if (!state.ui.snap) return val;
      const g = state.ui.snapGrid || 1;
      return Math.round(val / g) * g;
    },
    [state.ui.snap, state.ui.snapGrid]
  );

  // Alignment guide computation for players: edges and centers from other players
  const computeAlignmentSnap = useCallback(
    (
      xWorld: number,
      yWorld: number,
      movingIds: string[]
    ): {
      x?: number;
      y?: number;
      guides: { vertical?: number[]; horizontal?: number[] };
    } => {
      const threshPx = 8; // snap threshold in px
      let bestX: { pct: number; px: number; d: number } | undefined;
      let bestY: { pct: number; px: number; d: number } | undefined;
      const vGuides: number[] = [];
      const hGuides: number[] = [];

      // 1) Players (exclude moving)
      const others = doc.players.filter((p) => !movingIds.includes(p.id));
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
            // convert guide x px to target pct for center alignment by default
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
      for (const a of doc.annotations || []) {
        if (a.type === "connector") continue;
        if (!("points" in a)) continue;
        // consider all points and the bounding box edges
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
      for (const r of doc.routes) {
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
    [doc.players, doc.annotations, doc.routes]
  );

  // Smart snapping to player anchors when drawing
  const snapToAnchorPct = useCallback(
    (xWorld: number, yWorld: number) => {
      // threshold in viewBox px
      const threshold = 18; // ~18px
      let bestDist = Infinity;
      let best: {
        x: number;
        y: number;
        kind: "player" | "annotation" | "route";
        id: string;
      } | null = null;
      // Players
      for (const p of doc.players) {
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
      for (const a of doc.annotations || []) {
        if (a.type === "connector") continue; // endpoints are players and already covered
        if (!("points" in a)) continue;
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
      for (const r of doc.routes) {
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
      if (best)
        return {
          x: best.x,
          y: best.y,
          snapped: true as const,
          kind: best.kind,
          id: best.id,
        };
      return {
        x: snapPct((xWorld / 1600) * 100),
        y: snapPct((yWorld / 900) * 100),
        snapped: false as const,
      };
    },
    [doc.players, doc.annotations, doc.routes, snapPct]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (annotDragRef.current) {
        const now = clientToWorld(e);
        const dx = now.x - annotDragRef.current.startX;
        const dy = now.y - annotDragRef.current.startY;
        if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
          dispatch({
            type: "MOVE_ANNOTATION",
            id: annotDragRef.current.id,
            dx,
            dy,
          });
          annotDragRef.current.startX = now.x;
          annotDragRef.current.startY = now.y;
        }
        return;
      }
      if (panRef.current) {
        // Convert pixel delta to SVG world (viewBox) units
        const svg = svgRef.current;
        const rect = svg?.getBoundingClientRect();
        const dxPx = e.clientX - panRef.current.startX;
        const dyPx = e.clientY - panRef.current.startY;
        const dx = rect ? (dxPx / rect.width) * 1600 : dxPx;
        const dy = rect ? (dyPx / rect.height) * 900 : dyPx;
        dispatch({ type: "PAN", dx, dy });
        panRef.current.startX = e.clientX; // incremental
        panRef.current.startY = e.clientY;
        suppressClickRef.current = true;
        return;
      }
      if (selectionDragRef.current) {
        // Don't create a marquee until threshold is exceeded
        const s = selectionDragRef.current;
        if (!s.hasMoved) {
          const dxPx = e.clientX - s.startClientX;
          const dyPx = e.clientY - s.startClientY;
          if (Math.hypot(dxPx, dyPx) < DRAG_THRESHOLD_PX) {
            return;
          }
          // Begin marquee and clear selection only once movement is intentional
          s.hasMoved = true;
          setSelectionBox({ x: s.startX, y: s.startY, w: 0, h: 0 });
          dispatch({ type: "CLEAR_SELECTION" });
          suppressClickRef.current = true;
        }
        const curr = clientToWorld(e);
        const sx = s.startX;
        const sy = s.startY;
        const x1 = Math.min(sx, curr.x);
        const y1 = Math.min(sy, curr.y);
        const x2 = Math.max(sx, curr.x);
        const y2 = Math.max(sy, curr.y);
        setSelectionBox({ x: x1, y: y1, w: x2 - x1, h: y2 - y1 });
        return;
      }
      if (!dragRef.current) return;
      // Compute delta in world coordinates
      const now = clientToWorld(e);
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
      const dx = now.x - dragRef.current.startX;
      const dy = now.y - dragRef.current.startY;
      if (Math.abs(dx) > 0 || Math.abs(dy) > 0) dragRef.current.moved = true;
      const patches: { id: string; x: number; y: number }[] = [];
      const { originals } = dragRef.current;
      // Compute group alignment snap using primary dragged id position
      const primary =
        originals.find((o) => o.id === dragRef.current!.id) || originals[0];
      const candidateX = primary.xAbs + dx;
      const candidateY = primary.yAbs + dy;
      const {
        x: ax,
        y: ay,
        guides,
      } = state.ui.snap
        ? computeAlignmentSnap(
            candidateX,
            candidateY,
            originals.map((o) => o.id)
          )
        : { x: undefined, y: undefined, guides: {} };
      const hasGuides = !!(
        state.ui.snap &&
        guides &&
        (guides.vertical || guides.horizontal)
      );
      const hasCenterX = !!(guides.vertical || [])?.some(
        (x) => Math.abs(x - 800) < 0.5
      );
      const hasCenterY = !!(guides.horizontal || [])?.some(
        (y) => Math.abs(y - 450) < 0.5
      );
      setAlignGuides(hasGuides ? guides : null);
      if (hasGuides) {
        lastGuidesRef.current = { guides, hasCenterX, hasCenterY };
        // Smooth fade-in
        setGuideLiveOpacity((op) => (op < 0.8 ? 0.8 : op));
      }
      // Center snap label flash when snapping to center axes
      if ((ax === 50 && hasCenterX) || (ay === 50 && hasCenterY)) {
        setCenterFlash({
          x: ax === 50 && hasCenterX,
          y: ay === 50 && hasCenterY,
          t0: performance.now(),
        });
      }
      originals.forEach((o) => {
        let nx = o.xAbs + dx;
        let ny = o.yAbs + dy;
        // If the primary snapped along an axis, apply same delta correction to all in group
        if (state.ui.snap && ax !== undefined) {
          const primaryPctX = absToPct(primary.xAbs + dx, 0).x;
          const corr = ((ax - primaryPctX) / 100) * 1600;
          nx = o.xAbs + dx + corr;
        }
        if (state.ui.snap && ay !== undefined) {
          const primaryPctY = absToPct(0, primary.yAbs + dy).y;
          const corr = ((ay - primaryPctY) / 100) * 900;
          ny = o.yAbs + dy + corr;
        }
        const pct = absToPct(nx, ny);
        patches.push({
          id: o.id,
          x: Math.min(100, Math.max(0, snapPct(pct.x))),
          y: Math.min(100, Math.max(0, snapPct(pct.y))),
        });
      });
      if (patches.length) {
        dispatch({ type: "MOVE_SELECTION", patches, mode: "drag" });
      }
    },
    [dispatch, snapPct, clientToWorld, computeAlignmentSnap, state.ui.snap]
  );

  const handleMouseUp = useCallback(() => {
    if (annotDragRef.current) {
      annotDragRef.current = null;
      dispatch({
        type: "COMMIT_ANNOT_EDIT",
        id: state.ui.selectedAnnotationId!,
      });
    }
    if (selectionDragRef.current) {
      const s = selectionDragRef.current;
      if (selectionBox && s.hasMoved) {
        const { x, y, w, h } = selectionBox;
        const ids: string[] = [];
        doc.players.forEach((p) => {
          const abs = pctToAbs(p.x, p.y);
          if (abs.x >= x && abs.x <= x + w && abs.y >= y && abs.y <= y + h)
            ids.push(p.id);
        });
        if (ids.length) dispatch({ type: "SET_SELECTION", ids });
      } else {
        // Clicked empty canvas without dragging: clear selection in select tool
        if (state.ui.tool === "select") {
          dispatch({ type: "CLEAR_SELECTION" });
        }
      }
      selectionDragRef.current = null;
      setSelectionBox(null);
    }
    if (dragRef.current?.moved) {
      // commit history snapshot once per drag interaction
      dispatch({ type: "COMMIT_MOVE" });
    }
    dragRef.current = null;
    // Begin fade-out for alignment guides if any were active
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
    // Allow clicks again after this mouseup completes
    setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
    // If in freehand draw mode, commit on mouse up
    if (state.ui.tool === "draw" && state.ui.annotating?.freehand) {
      dispatch({ type: "COMMIT_ANNOTATION" });
    }
  }, [
    doc.players,
    selectionBox,
    dispatch,
    state.ui.tool,
    state.ui.annotating,
    state.ui.selectedAnnotationId,
  ]);

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

  const handleCanvasMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return; // left-button only
    if (state.ui.tool === "pan") {
      panRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        panX: state.ui.panX,
        panY: state.ui.panY,
      };
    } else if (state.ui.tool === "select") {
      const start = clientToWorld(e);
      selectionDragRef.current = {
        startX: start.x,
        startY: start.y,
        startClientX: e.clientX,
        startClientY: e.clientY,
        hasMoved: false,
      };
      // Don't clear selection yet; wait to see if this becomes a marquee drag.
    }
  };
  const endPan = () => {
    panRef.current = null;
  };
  useEffect(() => {
    window.addEventListener("mouseup", endPan);
    return () => window.removeEventListener("mouseup", endPan);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (suppressClickRef.current) return; // ignore click after drag/pan
    const world = clientToWorld(e);
    const snap = snapToAnchorPct(world.x, world.y);
    const { x, y } = snap;
    // Route tool behavior
    if (state.ui.tool === "route") {
      if (!state.ui.drawing) return;
      if (e.detail >= 2) {
        dispatch({ type: "ADD_ROUTE_POINT", point: { x, y } });
        dispatch({ type: "COMMIT_ROUTE" });
      } else {
        dispatch({ type: "ADD_ROUTE_POINT", point: { x, y } });
      }
      return;
    }
    // Draw tool behavior (line/arrow/freehand)
    if (state.ui.tool === "draw") {
      if (!state.ui.annotating) {
        dispatch({
          type: "START_ANNOTATION",
          drawType: state.ui.drawMode || "line",
          start: { x, y },
        });
        return;
      }
      if (state.ui.annotating.freehand) return; // freehand commits on mouseup
      if (e.detail >= 2) {
        dispatch({ type: "ADD_ANNOTATION_POINT", point: { x, y } });
        dispatch({ type: "COMMIT_ANNOTATION" });
      } else {
        dispatch({ type: "ADD_ANNOTATION_POINT", point: { x, y } });
      }
    }
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent<SVGSVGElement>) => {
    const world = clientToWorld(e);
    const snap = snapToAnchorPct(world.x, world.y);
    const { x, y, snapped } = snap as {
      x: number;
      y: number;
      snapped: boolean;
    };
    if (snapped) {
      const sx = (x / 100) * 1600;
      const sy = (y / 100) * 900;
      setSnapViz({ x: sx, y: sy, show: true });
      // Record a pulse when crossing into snapped state
      if (state.ui.effectsSnapPulse && !prefersReducedMotion) {
        setSnapPulses((arr) => [
          ...arr,
          {
            id: Date.now() + Math.random(),
            x: sx,
            y: sy,
            t0: performance.now(),
          },
        ]);
      }
    } else if (snapViz.show) {
      setSnapViz({ x: 0, y: 0, show: false });
    }
    if (state.ui.tool === "route" && state.ui.drawing) {
      dispatch({ type: "PREVIEW_ROUTE", point: { x, y } });
      return;
    }
    if (state.ui.tool === "draw") {
      if (!state.ui.annotating) return;
      if (state.ui.annotating.freehand) {
        dispatch({ type: "ADD_FREEHAND_POINT", point: { x, y } });
      } else {
        // Shift-constrain angles to 0/45/90 degrees for precision
        if (
          (e.nativeEvent as MouseEvent).shiftKey &&
          state.ui.annotating.points.length
        ) {
          const last =
            state.ui.annotating.points[state.ui.annotating.points.length - 1];
          const lx = (last.x / 100) * 1600;
          const ly = (last.y / 100) * 900;
          const dx = (x / 100) * 1600 - lx;
          const dy = (y / 100) * 900 - ly;
          const angle = Math.atan2(dy, dx);
          const snapped = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
          const len = Math.hypot(dx, dy);
          const nx = lx + Math.cos(snapped) * len;
          const ny = ly + Math.sin(snapped) * len;
          const pt = { x: (nx / 1600) * 100, y: (ny / 900) * 100 };
          dispatch({ type: "PREVIEW_ANNOTATION", point: pt });
        } else {
          dispatch({ type: "PREVIEW_ANNOTATION", point: { x, y } });
        }
      }
    }
  };

  // Cleanup expired snap pulses (300ms lifetime)
  useEffect(() => {
    if (!snapPulses.length) return;
    const raf = requestAnimationFrame(() => {
      const now = performance.now();
      setSnapPulses((arr) => arr.filter((p) => now - p.t0 < 300));
    });
    return () => cancelAnimationFrame(raf);
  }, [snapPulses]);

  // Debounce commit after keyboard nudges
  const commitMoveTimer = useRef<number | null>(null);
  const scheduleCommitMove = useCallback(() => {
    if (commitMoveTimer.current) window.clearTimeout(commitMoveTimer.current);
    commitMoveTimer.current = window.setTimeout(() => {
      dispatch({ type: "COMMIT_MOVE" });
      commitMoveTimer.current = null;
    }, 300);
  }, [dispatch]);

  // Keyboard shortcuts + arrow key nudging
  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      // Quick tool shortcuts (avoid when typing in inputs/textareas)
      const ae = document.activeElement as HTMLElement | null;
      const tag = (ae?.tagName || "").toLowerCase();
      const typing =
        tag === "input" || tag === "textarea" || ae?.isContentEditable;
      if (!typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const k = e.key.toLowerCase();
        if (k === "v") {
          dispatch({ type: "SET_TOOL", tool: "select" });
          e.preventDefault();
        } else if (k === "p") {
          dispatch({ type: "SET_TOOL", tool: "add-player" });
          e.preventDefault();
        } else if (k === "r") {
          dispatch({ type: "SET_TOOL", tool: "route" });
          e.preventDefault();
        } else if (k === "m") {
          dispatch({ type: "SET_TOOL", tool: "pan" });
          e.preventDefault();
        }
        // Grid overlay toggle (G)
        if (k === "g") {
          dispatch({
            type: "SET_GRID_OVERLAY",
            enabled: !state.ui.showGridOverlay,
          });
          e.preventDefault();
        }
      }
      // Zoom shortcuts: Cmd/Ctrl + '+' or '-' (and '=' for '+')
      const meta = e.metaKey || e.ctrlKey;
      if (meta && (e.key === "+" || e.key === "=")) {
        const rect = svgRef.current?.getBoundingClientRect();
        const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
        const cy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
        const xView = rect ? ((cx - rect.left) / rect.width) * 1600 : 800;
        const yView = rect ? ((cy - rect.top) / rect.height) * 900 : 450;
        const worldX = (xView - state.ui.panX) / state.ui.zoom;
        const worldY = (yView - state.ui.panY) / state.ui.zoom;
        const targetZoom = clamp(state.ui.zoom * 1.1, 0.25, 4);
        const newPanX = xView - worldX * targetZoom;
        const newPanY = yView - worldY * targetZoom;
        dispatch({
          type: "SET_VIEWPORT",
          zoom: targetZoom,
          panX: newPanX,
          panY: newPanY,
        });
        e.preventDefault();
      }
      if (meta && e.key === "-") {
        const rect = svgRef.current?.getBoundingClientRect();
        const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
        const cy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
        const xView = rect ? ((cx - rect.left) / rect.width) * 1600 : 800;
        const yView = rect ? ((cy - rect.top) / rect.height) * 900 : 450;
        const worldX = (xView - state.ui.panX) / state.ui.zoom;
        const worldY = (yView - state.ui.panY) / state.ui.zoom;
        const targetZoom = clamp(state.ui.zoom / 1.1, 0.25, 4);
        const newPanX = xView - worldX * targetZoom;
        const newPanY = yView - worldY * targetZoom;
        dispatch({
          type: "SET_VIEWPORT",
          zoom: targetZoom,
          panX: newPanX,
          panY: newPanY,
        });
        e.preventDefault();
      }
      if (e.key === "Escape" && state.ui.drawing) {
        dispatch({ type: "CANCEL_ROUTE" });
      }
      if (e.key === "Escape" && state.ui.annotating) {
        dispatch({ type: "CANCEL_ANNOTATION" });
      }
      // Spacebar: temporary pan tool (hold-to-pan)
      const isSpace = e.code === "Space" || e.key === " ";
      if (isSpace) {
        // ignore when typing in inputs/textareas/contentEditable
        const ae = document.activeElement as HTMLElement | null;
        const tag = (ae?.tagName || "").toLowerCase();
        const typing =
          tag === "input" || tag === "textarea" || ae?.isContentEditable;
        if (!typing && !spaceHeldRef.current) {
          spaceHeldRef.current = true;
          if (state.ui.tool !== "pan") {
            prevToolRef.current = state.ui.tool;
            dispatch({ type: "SET_TOOL", tool: "pan" });
          } else {
            // Already in pan; don't override explicit user choice
            prevToolRef.current = null;
          }
          e.preventDefault();
        }
      }
      if (e.key === "Enter" && state.ui.drawing) {
        // Commit current preview as final point if present
        if (state.ui.drawing.preview) {
          dispatch({
            type: "ADD_ROUTE_POINT",
            point: state.ui.drawing.preview,
          });
        }
        dispatch({ type: "COMMIT_ROUTE" });
        e.preventDefault();
      }
      if (e.key === "Enter" && state.ui.annotating) {
        if (state.ui.annotating.preview) {
          dispatch({
            type: "ADD_ANNOTATION_POINT",
            point: state.ui.annotating.preview,
          });
        }
        dispatch({ type: "COMMIT_ANNOTATION" });
        e.preventDefault();
      }
      if ((e.key === "Backspace" || e.key === "Delete") && state.ui.drawing) {
        dispatch({ type: "POP_ROUTE_POINT" });
        e.preventDefault();
      }
      if (
        (e.key === "Backspace" || e.key === "Delete") &&
        state.ui.annotating
      ) {
        dispatch({ type: "POP_ANNOTATION_POINT" });
        e.preventDefault();
      }
      // Duplicate selected annotation
      if (
        (e.key.toLowerCase() === "d" && (e.metaKey || e.ctrlKey)) ||
        (e.key.toLowerCase() === "d" &&
          !state.ui.annotating &&
          !state.ui.drawing &&
          state.ui.selectedAnnotationId)
      ) {
        if (state.ui.selectedAnnotationId) {
          dispatch({
            type: "DUPLICATE_ANNOTATION",
            id: state.ui.selectedAnnotationId,
          });
          e.preventDefault();
        }
      }
      if (
        (e.key === "Backspace" || e.key === "Delete") &&
        !state.ui.annotating &&
        !state.ui.drawing &&
        state.ui.selectedAnnotationId
      ) {
        dispatch({
          type: "DELETE_ANNOTATION",
          id: state.ui.selectedAnnotationId,
        });
        e.preventDefault();
      }
      // Undo / Redo
      const meta2 = e.metaKey || e.ctrlKey;
      if (meta2 && e.key.toLowerCase() === "z") {
        if (e.shiftKey) dispatch({ type: "REDO" });
        else dispatch({ type: "UNDO" });
        e.preventDefault();
      }
      const selected = state.ui.selectedIds || [];
      if (
        selected.length &&
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
      ) {
        e.preventDefault();
        // Nudge step granularity: Alt = 0.1%, Shift = 2%, default = 0.5%
        const delta = e.altKey ? 0.1 : e.shiftKey ? 2 : 0.5;
        const patches: { id: string; x: number; y: number }[] = [];
        selected.forEach((id) => {
          const p = doc.players.find((pl) => pl.id === id);
          if (!p) return;
          let nx = p.x;
          let ny = p.y;
          if (e.key === "ArrowUp") ny = Math.max(0, p.y - delta);
          if (e.key === "ArrowDown") ny = Math.min(100, p.y + delta);
          if (e.key === "ArrowLeft") nx = Math.max(0, p.x - delta);
          if (e.key === "ArrowRight") nx = Math.min(100, p.x + delta);
          patches.push({ id, x: nx, y: ny });
        });
        if (patches.length) {
          dispatch({ type: "MOVE_SELECTION", patches });
          scheduleCommitMove();
          // Nudge telemetry (sample individual events at ~1/5 rate)
          if (Math.random() < 0.2) {
            telemetry.enqueue({
              type: TelemetryEventTypes.PlayDiagramNudge,
              data: {
                count: selected.length,
                dx: patches[0] ? patches[0].x : 0,
                dy: patches[0] ? patches[0].y : 0,
                step: delta,
                modifier: e.altKey ? "alt" : e.shiftKey ? "shift" : "base",
              },
            });
          }
          // Aggregate into batch buffer
          nudgeBatchRef.current.events++;
          nudgeBatchRef.current.playersMoved = Math.max(
            nudgeBatchRef.current.playersMoved,
            selected.length
          );
          if (!nudgeBatchRef.current.timer) {
            nudgeBatchRef.current.timer = window.setTimeout(() => {
              telemetry.enqueue({
                type: TelemetryEventTypes.PlayDiagramNudgeBatch,
                data: {
                  events: nudgeBatchRef.current.events,
                  maxPlayers: nudgeBatchRef.current.playersMoved,
                },
              });
              nudgeBatchRef.current = {
                events: 0,
                playersMoved: 0,
                timer: null,
              };
            }, 1500);
          }
        }
      }

      // Alignment shortcuts (Meta+Alt + arrows/letters). Hold Shift for fixed-spacing distribute.
      const metaKey = e.metaKey || e.ctrlKey;
      const alt = e.altKey;
      if ((state.ui.selectedIds || []).length >= 1 && metaKey && alt) {
        if (e.key === "ArrowLeft") {
          dispatch({ type: "ALIGN_SELECTION", axis: "x", align: "start" });
          e.preventDefault();
        } else if (e.key === "ArrowRight") {
          dispatch({ type: "ALIGN_SELECTION", axis: "x", align: "end" });
          e.preventDefault();
        } else if (e.key === "ArrowUp") {
          dispatch({ type: "ALIGN_SELECTION", axis: "y", align: "start" });
          e.preventDefault();
        } else if (e.key === "ArrowDown") {
          dispatch({ type: "ALIGN_SELECTION", axis: "y", align: "end" });
          e.preventDefault();
        } else if (e.key.toLowerCase() === "c") {
          dispatch({ type: "ALIGN_SELECTION", axis: "x", align: "center" });
          e.preventDefault();
        } else if (e.key.toLowerCase() === "m") {
          dispatch({ type: "ALIGN_SELECTION", axis: "y", align: "center" });
          e.preventDefault();
        } else if (e.key.toLowerCase() === "h") {
          if (e.shiftKey) {
            dispatch({
              type: "DISTRIBUTE_SELECTION_FIXED",
              axis: "x",
              spacing: state.ui.distributeSpacing ?? 5,
            });
          } else {
            dispatch({ type: "DISTRIBUTE_SELECTION", axis: "x" });
          }
          e.preventDefault();
        } else if (e.key.toLowerCase() === "v") {
          if (e.shiftKey) {
            dispatch({
              type: "DISTRIBUTE_SELECTION_FIXED",
              axis: "y",
              spacing: state.ui.distributeSpacing ?? 5,
            });
          } else {
            dispatch({ type: "DISTRIBUTE_SELECTION", axis: "y" });
          }
          e.preventDefault();
        }
      }

      // Quick style cycles: J cycles stroke width, K cycles arrowhead
      if (e.key.toLowerCase() === "j") {
        const widths = [1, 2, 3, 4, 6, 8];
        const selectedAnnId = state.ui.selectedAnnotationId;
        let currentWidth = state.ui.drawWidth || 3;
        if (selectedAnnId) {
          const ann = (doc.annotations || []).find(
            (a) => a.id === selectedAnnId
          );
          if (ann && typeof (ann as { width?: number }).width === "number") {
            currentWidth = (ann as { width?: number }).width || currentWidth;
          }
        }
        const idx = widths.indexOf(currentWidth);
        const next = widths[(idx >= 0 ? idx + 1 : 0) % widths.length];
        if (selectedAnnId) {
          dispatch({
            type: "UPDATE_ANNOT_STYLE",
            id: selectedAnnId,
            patch: { width: next },
          });
        } else {
          dispatch({ type: "SET_DRAW_WIDTH", width: next });
        }
        e.preventDefault();
      }
      if (e.key.toLowerCase() === "k") {
        const order: Array<"none" | "start" | "end" | "both"> = [
          "none",
          "start",
          "end",
          "both",
        ];
        const selectedAnnId = state.ui.selectedAnnotationId;
        let current: "none" | "start" | "end" | "both" =
          state.ui.drawArrowHead || "end";
        if (selectedAnnId) {
          const ann = (doc.annotations || []).find(
            (a) => a.id === selectedAnnId
          );
          const ah = (
            ann as { arrowHead?: "none" | "start" | "end" | "both" } | undefined
          )?.arrowHead;
          if (ah) current = ah;
        }
        const ni = (order.indexOf(current) + 1) % order.length;
        const next = order[ni];
        if (selectedAnnId) {
          dispatch({
            type: "UPDATE_ANNOT_STYLE",
            id: selectedAnnId,
            patch: { arrowHead: next },
          });
        } else {
          dispatch({ type: "SET_DRAW_ARROW_HEAD", arrowHead: next });
        }
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", keyHandler);
    const keyUp = (e: KeyboardEvent) => {
      const isSpace = e.code === "Space" || e.key === " ";
      if (isSpace && spaceHeldRef.current) {
        spaceHeldRef.current = false;
        // Restore only if we switched due to space
        if (prevToolRef.current && state.ui.tool === "pan") {
          dispatch({ type: "SET_TOOL", tool: prevToolRef.current });
        }
        prevToolRef.current = null;
        e.preventDefault();
      }
    };
    window.addEventListener("keyup", keyUp);
    return () => {
      window.removeEventListener("keydown", keyHandler);
      window.removeEventListener("keyup", keyUp);
    };
  }, [
    dispatch,
    state.ui.drawing,
    state.ui.annotating,
    state.ui.selectedIds,
    state.ui.selectedAnnotationId,
    doc.players,
    doc.annotations,
    scheduleCommitMove,
    state.ui.distributeSpacing,
    state.ui.tool,
    state.ui.panX,
    state.ui.panY,
    state.ui.zoom,
    state.ui.showGridOverlay,
    state.ui.drawWidth,
    state.ui.drawArrowHead,
  ]);

  // Minimap drag tracking
  const miniDragRef = useRef<{
    dragging: boolean;
  }>({ dragging: false });

  // Convert a minimap client click/drag into a viewport pan
  const moveViewportFromMinimap = useCallback(
    (container: HTMLDivElement, clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      const xMini = clientX - rect.left;
      const yMini = clientY - rect.top;
      // Minimap size (in px). Keep in sync with rendered size below.
      const MINI_W = 160;
      const scale = MINI_W / 1600; // 0.1
      // Convert to world coords
      const xWorld = xMini / scale;
      const yWorld = yMini / scale;
      const widthWorld = 1600 / state.ui.zoom;
      const heightWorld = 900 / state.ui.zoom;
      // Center viewport around the pointer
      let xTL = xWorld - widthWorld / 2;
      let yTL = yWorld - heightWorld / 2;
      // Clamp to world bounds
      xTL = Math.max(0, Math.min(1600 - widthWorld, xTL));
      yTL = Math.max(0, Math.min(900 - heightWorld, yTL));
      // Convert desired top-left back to pan in view space
      const panX = -xTL * state.ui.zoom;
      const panY = -yTL * state.ui.zoom;
      dispatch({ type: "SET_VIEWPORT", panX, panY });
    },
    [dispatch, state.ui.zoom]
  );

  return (
    <div className={`${className ?? ""} relative`}>
      <svg
        ref={svgRef}
        viewBox="0 0 1600 900"
        className={`w-full h-full rounded-md shadow-inner select-none`}
        style={{
          // Context-specific cursor states
          cursor: (() => {
            // Pan: grab/grabbing while mouse is down
            if (state.ui.tool === "pan") {
              return panRef.current ? "grabbing" : "grab";
            }
            // Draw tool: precision
            if (state.ui.tool === "draw") return "crosshair";
            // Route tool: custom pen cursor (theme-aware), fallback crosshair
            if (state.ui.tool === "route") {
              const theme = doc.field.theme || "classic";
              const stroke = theme === "mono-light" ? "#111827" : "#f9fafb";
              const svg = `<?xml version='1.0' encoding='UTF-8'?>\n<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'>\n  <g fill='none' stroke='${stroke}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>\n    <path d='M4 28l6-2 16-16a3 3 0 0 0-4.24-4.24L5.76 21.76z'/>\n    <path d='M18 6l8 8'/>\n    <path d='M4 28l2-6'/>\n  </g>\n</svg>`;
              const data = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}") 4 28, crosshair`;
              return data;
            }
            return "default";
          })(),
        }}
        role="img"
        aria-label="Diagram field"
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMoveCanvas}
        onMouseDown={handleCanvasMouseDown}
      >
        <g
          transform={`translate(${state.ui.panX} ${state.ui.panY}) scale(${state.ui.zoom})`}
        >
          {/* ==================== FIELD GRID ==================== */}
          <FieldGrid
            field={doc.field}
            showGridOverlay={state.ui.showGridOverlay}
            snapGrid={state.ui.snapGrid}
          />

          {/* ==================== PLAYERS ==================== */}
          <FieldPlayers
            players={doc.players}
            selectedIds={state.ui.selectedIds || []}
            theme={doc.field.theme || "classic"}
            showPlayerLabels={doc.field.showPlayerLabels ?? true}
            showDefensePlayers={doc.field.showDefensePlayers ?? true}
            showSelectionPulse={showSelectionPulse}
            onPlayerMouseDown={(id, e) => {
              handleMouseDownPlayer(e, id);
            }}
            onPlayerDoubleClick={(id) => {
              dispatch({ type: "START_INLINE_EDIT", playerId: id });
            }}
            onPlayerLockToggle={(id) => {
              dispatch({
                type: "UPDATE_PLAYER",
                id,
                patch: {
                  locked: !doc.players.find((p) => p.id === id)?.locked,
                },
              });
            }}
          />

          {/* ==================== ROUTES ==================== */}
          <FieldRoutes
            routes={doc.routes}
            attachPreview={attachPreview}
            onRoutePointMouseDown={(routeId, segIndex, pointIndex, e) => {
              e.stopPropagation();
              const route = doc.routes.find((r) => r.id === routeId);
              if (!route) return;
              const seg = route.segments[segIndex];
              if (!seg) return;
              const pt = seg.points[pointIndex];
              if (!pt) return;

              // Convert to absolute coordinates
              const absX = (pt.x / 100) * 1600;
              const absY = (pt.y / 100) * 900;
              const start = clientToWorld(e);
              const startPt = { x: absX, y: absY };
              const isEndpoint =
                pointIndex === 0 || pointIndex === seg.points.length - 1;

              const move = (me: MouseEvent) => {
                const now = clientToWorld(me);
                const dx = now.x - start.x;
                const dy = now.y - start.y;
                const nx = Math.min(
                  100,
                  Math.max(0, snapPct(((startPt.x + dx) / 1600) * 100))
                );
                const ny = Math.min(
                  100,
                  Math.max(0, snapPct(((startPt.y + dy) / 900) * 100))
                );

                // Update route point
                dispatch({
                  type: "UPDATE_ROUTE_POINT",
                  routeId,
                  segIndex,
                  pointIndex,
                  point: { x: nx, y: ny },
                });

                // Attach preview for endpoints
                if (isEndpoint) {
                  const cx = (nx / 100) * 1600;
                  const cy = (ny / 100) * 900;
                  let best:
                    | { id: string; x: number; y: number; d: number }
                    | undefined;
                  for (const pl of doc.players) {
                    const px = (pl.x / 100) * 1600;
                    const py = (pl.y / 100) * 900;
                    const d = Math.hypot(px - cx, py - cy);
                    if (!best || d < best.d)
                      best = { id: pl.id, x: px, y: py, d };
                  }
                  const thresh = 24;
                  if (best && best.d <= thresh) {
                    setAttachPreview({
                      x1: cx,
                      y1: cy,
                      x2: best.x,
                      y2: best.y,
                      targetId: best.id,
                    });
                  } else {
                    setAttachPreview(undefined);
                  }
                }
              };

              const up = () => {
                window.removeEventListener("mousemove", move);
                window.removeEventListener("mouseup", up);
                setAttachPreview(undefined);
                dispatch({ type: "COMMIT_ROUTE_EDIT" });
              };

              window.addEventListener("mousemove", move);
              window.addEventListener("mouseup", up);
            }}
          />
          {/* Annotations */}
          <FieldAnnotations
            annotations={doc.annotations || []}
            players={doc.players.map((p) => ({
              id: p.id,
              x: (p.x / 100) * 1600,
              y: (p.y / 100) * 900,
            }))}
            selectedAnnotationId={state.ui.selectedAnnotationId}
            hoverAnnotationId={hoverAnnId}
            showSelectionPulse={showSelectionPulse}
            onAnnotationMouseDown={(id, e) => {
              e.stopPropagation();
              dispatch({ type: "SELECT_ANNOTATION", id });
              const start = clientToWorld(e);
              annotDragRef.current = {
                id,
                startX: start.x,
                startY: start.y,
              };
            }}
            onAnnotationMouseEnter={(id, e) => {
              e.stopPropagation();
              setHoverAnnId(id);
            }}
            onAnnotationMouseLeave={(id, e) => {
              e.stopPropagation();
              setHoverAnnId((curr) => (curr === id ? undefined : curr));
            }}
          />
          {/* Player edit popover (single selection) */}
          {(() => {
            const sel = state.ui.selectedIds || [];
            if (sel.length !== 1) return null;
            const player = doc.players.find((p) => p.id === sel[0]);
            if (!player) return null;
            if (
              state.ui.inlineEdit &&
              state.ui.inlineEdit.playerId === player.id
            )
              return null;
            const px = (player.x / 100) * 1600;
            const py = (player.y / 100) * 900;
            const popW = 280;
            const popH = 72;
            const pad = 8;
            const dockX = Math.max(pad, Math.min(1600 - popW - pad, px + 12));
            const dockY = Math.max(pad, Math.min(900 - popH - pad, py - 10));
            return (
              <foreignObject x={dockX} y={dockY} width={popW} height={popH}>
                <div
                  className="pointer-events-auto"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="inline-flex items-center gap-spacing-xs panel-cupertino px-spacing-xs py-spacing-xs">
                    <input
                      type="text"
                      aria-label="Player label"
                      value={player.label}
                      onChange={(e) =>
                        dispatch({
                          type: "UPDATE_PLAYER",
                          id: player.id,
                          patch: { label: e.target.value },
                        })
                      }
                      className="w-20 text-[12px] border border-border-light rounded px-spacing-xs py-spacing-xs"
                      title="Label"
                    />
                    <input
                      type="color"
                      aria-label="Player color"
                      value={player.color || "#1e3a8a"}
                      onChange={(e) =>
                        dispatch({
                          type: "UPDATE_PLAYER",
                          id: player.id,
                          patch: { color: e.target.value },
                        })
                      }
                      className="w-9 h-9 p-0 border border-border-light rounded"
                      title="Color"
                    />
                    <span className="mx-spacing-xs w-px h-5 bg-border-light" />
                    <span
                      role="button"
                      className="text-text-error text-xs px-spacing-xs py-spacing-xs border border-text-error rounded hover:bg-surface-error cursor-pointer select-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch({ type: "REMOVE_PLAYER", id: player.id });
                      }}
                      title="Delete player"
                    >
                      Delete
                    </span>
                  </div>
                </div>
              </foreignObject>
            );
          })()}
          {/* Inline label editor */}
          {state.ui.inlineEdit &&
            (() => {
              const ie = state.ui.inlineEdit!;
              const player = doc.players.find((pp) => pp.id === ie.playerId);
              if (!player) return null;
              const px = (player.x / 100) * 1600;
              const py = (player.y / 100) * 900;
              const w = 100;
              const h = 30;
              return (
                <foreignObject
                  x={px - w / 2}
                  y={py - h / 2}
                  width={w}
                  height={h}
                >
                  <div
                    className="pointer-events-auto"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      aria-label="Edit player label"
                      autoFocus
                      value={ie.draft}
                      onFocus={(e) => e.currentTarget.select()}
                      onChange={(e) =>
                        dispatch({
                          type: "UPDATE_INLINE_EDIT",
                          draft: e.target.value,
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          dispatch({ type: "COMMIT_INLINE_EDIT" });
                        } else if (e.key === "Escape") {
                          dispatch({ type: "CANCEL_INLINE_EDIT" });
                        }
                      }}
                      onBlur={() => dispatch({ type: "COMMIT_INLINE_EDIT" })}
                      className="w-full h-full text-center text-[14px] font-semibold border border-subtle rounded surface-card shadow-sm"
                    />
                  </div>
                </foreignObject>
              );
            })()}
          {/* Snap indicator */}
          {snapViz.show && (
            <g pointerEvents="none">
              <circle
                cx={snapViz.x}
                cy={snapViz.y}
                r={8}
                fill="none"
                stroke="#22d3ee"
                strokeWidth={2}
                opacity={0.8}
              />
              <circle
                cx={snapViz.x}
                cy={snapViz.y}
                r={3}
                fill="#22d3ee"
                opacity={0.9}
              />
            </g>
          )}
          {/* Snap pulse animation (micro-bump halo) */}
          {state.ui.effectsSnapPulse &&
            !prefersReducedMotion &&
            snapPulses.length > 0 && (
              <g pointerEvents="none">
                {snapPulses.map((p) => {
                  const prog = Math.min(1, (performance.now() - p.t0) / 300);
                  const r = 6 + prog * 14; // expand 6 -> 20
                  const op = 0.35 * (1 - prog);
                  return (
                    <circle
                      key={p.id}
                      cx={p.x}
                      cy={p.y}
                      r={r}
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth={2}
                      opacity={op}
                    />
                  );
                })}
              </g>
            )}
          {/* Alignment guides and center snap flash */}
          <FieldGuides
            alignGuides={alignGuides || undefined}
            guideLiveOpacity={guideLiveOpacity}
            guideFade={guideFade || undefined}
            centerFlash={centerFlash || undefined}
          />
          {/* Annotation selection handles */}
          {state.ui.selectedAnnotationId &&
            (() => {
              const ann = (doc.annotations || []).find(
                (x) => x.id === state.ui.selectedAnnotationId
              );
              if (!ann) return null;
              const pts = "points" in ann ? ann.points : [];
              // Compute popover position near first point (or midpoint for connectors)
              let popX = 20,
                popY = 20;
              if (ann.type === "connector") {
                const conn = ann as DiagramAnnotationConnector;
                const from = doc.players.find(
                  (p) => p.id === conn.fromPlayerId
                );
                const to = doc.players.find((p) => p.id === conn.toPlayerId);
                if (from && to) {
                  popX = ((from.x + to.x) / 2 / 100) * 1600;
                  popY = ((from.y + to.y) / 2 / 100) * 900;
                }
              } else if (pts.length) {
                popX = (pts[0].x / 100) * 1600;
                popY = (pts[0].y / 100) * 900;
              }
              // Auto-dock popover within viewBox bounds
              const popW = 260,
                popH = 64,
                pad = 8;
              const dockX = Math.max(
                pad,
                Math.min(1600 - popW - pad, popX + 12)
              );
              const dockY = Math.max(
                pad,
                Math.min(900 - popH - pad, popY - 10)
              );
              return (
                <g>
                  {pts.map((p, i) => {
                    const cx = (p.x / 100) * 1600,
                      cy = (p.y / 100) * 900;
                    return (
                      <rect
                        key={i}
                        x={cx - 6}
                        y={cy - 6}
                        width={12}
                        height={12}
                        rx={2}
                        ry={2}
                        fill="#fff"
                        stroke="#2563eb"
                        strokeWidth={2}
                        className="cursor-move"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          const start = clientToWorld(e);
                          const startPct = { x: p.x, y: p.y };
                          const move = (me: MouseEvent) => {
                            const now = clientToWorld(me);
                            const dx = now.x - start.x;
                            const dy = now.y - start.y;
                            const nx = Math.min(
                              100,
                              Math.max(
                                0,
                                snapPct(
                                  (((startPct.x / 100) * 1600 + dx) / 1600) *
                                    100
                                )
                              )
                            );
                            const ny = Math.min(
                              100,
                              Math.max(
                                0,
                                snapPct(
                                  (((startPct.y / 100) * 900 + dy) / 900) * 100
                                )
                              )
                            );
                            dispatch({
                              type: "UPDATE_ANNOT_POINT",
                              id: ann.id,
                              pointIndex: i,
                              point: { x: nx, y: ny },
                            });
                          };
                          const up = () => {
                            window.removeEventListener("mousemove", move);
                            window.removeEventListener("mouseup", up);
                            dispatch({ type: "COMMIT_ANNOT_EDIT", id: ann.id });
                          };
                          window.addEventListener("mousemove", move);
                          window.addEventListener("mouseup", up);
                        }}
                      />
                    );
                  })}
                  {/* Floating popover for style/delete */}
                  <foreignObject x={dockX} y={dockY} width={260} height={64}>
                    <div className="pointer-events-auto">
                      <div className="inline-flex items-center gap-spacing-xs panel-cupertino px-spacing-xs py-spacing-xs">
                        <input
                          type="color"
                          aria-label="Annotation color"
                          value={
                            "color" in ann && ann.color
                              ? ann.color!
                              : state.ui.drawColor || "#111827"
                          }
                          onChange={(e) =>
                            dispatch({
                              type: "UPDATE_ANNOT_STYLE",
                              id: ann.id,
                              patch: { color: e.target.value },
                            })
                          }
                          className="w-9 h-9 p-0 border border-border-light rounded"
                          title="Color"
                        />
                        <input
                          type="range"
                          aria-label="Annotation width"
                          min={1}
                          max={10}
                          step={1}
                          value={
                            "width" in ann && ann.width
                              ? ann.width!
                              : state.ui.drawWidth || 3
                          }
                          onChange={(e) =>
                            dispatch({
                              type: "UPDATE_ANNOT_STYLE",
                              id: ann.id,
                              patch: { width: Number(e.target.value) },
                            })
                          }
                          className="w-24"
                          title="Width"
                        />
                        <select
                          aria-label="Arrowhead"
                          value={
                            "arrowHead" in ann && ann.arrowHead
                              ? ann.arrowHead!
                              : state.ui.drawArrowHead || "end"
                          }
                          onChange={(e) =>
                            dispatch({
                              type: "UPDATE_ANNOT_STYLE",
                              id: ann.id,
                              patch: {
                                arrowHead: e.target.value as
                                  | "none"
                                  | "start"
                                  | "end"
                                  | "both",
                              },
                            })
                          }
                          className="text-[12px] border border-border-light rounded px-spacing-xs py-spacing-xs"
                          title="Arrowhead"
                        >
                          <option value="none">None</option>
                          <option value="end">End</option>
                          <option value="start">Start</option>
                          <option value="both">Both</option>
                        </select>
                        <span className="text-[12px] w-7 text-right">
                          {"width" in ann && ann.width
                            ? ann.width
                            : state.ui.drawWidth || 3}
                          px
                        </span>
                        <span className="mx-spacing-xs w-px h-5 bg-border-light" />
                        <span
                          role="button"
                          className="text-text-error text-xs px-spacing-xs py-spacing-xs border border-text-error rounded hover:bg-surface-error cursor-pointer select-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch({ type: "DELETE_ANNOTATION", id: ann.id });
                          }}
                          title="Delete"
                        >
                          Delete
                        </span>
                      </div>
                    </div>
                  </foreignObject>
                </g>
              );
            })()}
          {/* Route drawing preview */}
          {state.ui.drawing &&
            (state.ui.routeMode === "curve" &&
            state.ui.drawing.anchorPoints.length >= 2
              ? // For curve preview: need 3 points (start, control, end). Use preview as end while last anchor is control.
                (() => {
                  const anchors = state.ui.drawing.anchorPoints;
                  const start = anchors[0];
                  const control = anchors[anchors.length - 1];
                  const end = state.ui.drawing.preview || control;
                  const sx = (start.x / 100) * 1600,
                    sy = (start.y / 100) * 900,
                    cx = (control.x / 100) * 1600,
                    cy = (control.y / 100) * 900,
                    ex = (end.x / 100) * 1600,
                    ey = (end.y / 100) * 900;
                  const d = `M ${sx},${sy} Q ${cx},${cy} ${ex},${ey}`;
                  return (
                    <g>
                      <path
                        d={d}
                        fill="none"
                        stroke="#fbbf24"
                        strokeWidth={6}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="8 6"
                      />
                      {(() => {
                        // Attach preview when near a player with current end point
                        const endPt = end;
                        const ex2 = (endPt.x / 100) * 1600;
                        const ey2 = (endPt.y / 100) * 900;
                        let best:
                          | { x: number; y: number; d: number }
                          | undefined;
                        for (const pl of doc.players) {
                          const px = (pl.x / 100) * 1600;
                          const py = (pl.y / 100) * 900;
                          const d = Math.hypot(px - ex2, py - ey2);
                          if (!best || d < best.d) best = { x: px, y: py, d };
                        }
                        if (best && best.d <= 24) {
                          return (
                            <g pointerEvents="none">
                              <line
                                x1={ex2}
                                y1={ey2}
                                x2={best.x}
                                y2={best.y}
                                stroke="#f59e0b"
                                strokeWidth={3}
                                strokeDasharray="2 6"
                                opacity={0.9}
                              />
                              <circle
                                cx={best.x}
                                cy={best.y}
                                r={8}
                                fill="none"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                strokeDasharray="2 6"
                                opacity={0.9}
                              />
                            </g>
                          );
                        }
                        return null;
                      })()}
                    </g>
                  );
                })()
              : (() => {
                  const points = [
                    ...state.ui.drawing.anchorPoints,
                    ...(state.ui.drawing.preview
                      ? [state.ui.drawing.preview]
                      : []),
                  ];
                  const poly = points
                    .map((p) => `${(p.x / 100) * 1600},${(p.y / 100) * 900}`)
                    .join(" ");
                  const endPt = points[points.length - 1];
                  const ex2 = endPt ? (endPt.x / 100) * 1600 : undefined;
                  const ey2 = endPt ? (endPt.y / 100) * 900 : undefined;
                  let attach: { x: number; y: number; d: number } | undefined;
                  if (ex2 !== undefined && ey2 !== undefined) {
                    for (const pl of doc.players) {
                      const px = (pl.x / 100) * 1600;
                      const py = (pl.y / 100) * 900;
                      const d = Math.hypot(px - ex2, py - ey2);
                      if (!attach || d < attach.d) attach = { x: px, y: py, d };
                    }
                  }
                  return (
                    <g>
                      <polyline
                        points={poly}
                        fill="none"
                        stroke="#fbbf24"
                        strokeWidth={6}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="8 6"
                      />
                      {attach &&
                        attach.d <= 24 &&
                        ex2 !== undefined &&
                        ey2 !== undefined && (
                          <g pointerEvents="none">
                            <line
                              x1={ex2}
                              y1={ey2}
                              x2={attach.x}
                              y2={attach.y}
                              stroke="#f59e0b"
                              strokeWidth={3}
                              strokeDasharray="2 6"
                              opacity={0.9}
                            />
                            <circle
                              cx={attach.x}
                              cy={attach.y}
                              r={8}
                              fill="none"
                              stroke="#f59e0b"
                              strokeWidth={2}
                              strokeDasharray="2 6"
                              opacity={0.9}
                            />
                          </g>
                        )}
                    </g>
                  );
                })())}
          {/* Contextual HUD for align/distribute (shows when selecting >=3 players) */}
          {(() => {
            const ids = state.ui.selectedIds || [];
            if (ids.length < 3) return null;
            const sel = doc.players.filter((p) => ids.includes(p.id));
            if (!sel.length) return null;
            const xs = sel.map((p) => (p.x / 100) * 1600);
            const ys = sel.map((p) => (p.y / 100) * 900);
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minY = Math.min(...ys);
            const boxW = maxX - minX;
            const hudW = 280;
            const hudH = 34;
            const pad = 8;
            const dockX = Math.max(
              pad,
              Math.min(1600 - hudW - pad, minX + boxW / 2 - hudW / 2)
            );
            const dockY = Math.max(pad, minY - hudH - 10);
            const btn = (
              label: string,
              title: string,
              onClick: () => void,
              key: string
            ) => (
              <Button
                key={key}
                size="xs"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onClick();
                }}
                title={title}
              >
                {label}
              </Button>
            );
            return (
              <foreignObject x={dockX} y={dockY} width={hudW} height={hudH}>
                <div
                  className="pointer-events-auto"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="panel-cupertino inline-flex items-center gap-spacing-xs px-spacing-xs py-spacing-xs">
                    {/* Align X */}
                    {btn(
                      "L",
                      "Align left edges",
                      () =>
                        dispatch({
                          type: "ALIGN_SELECTION",
                          axis: "x",
                          align: "start",
                        }),
                      "ax-l"
                    )}
                    {btn(
                      "C",
                      "Align vertical centers",
                      () =>
                        dispatch({
                          type: "ALIGN_SELECTION",
                          axis: "x",
                          align: "center",
                        }),
                      "ax-c"
                    )}
                    {btn(
                      "R",
                      "Align right edges",
                      () =>
                        dispatch({
                          type: "ALIGN_SELECTION",
                          axis: "x",
                          align: "end",
                        }),
                      "ax-r"
                    )}
                    <span className="w-px h-4 bg-border-light mx-spacing-xs" />
                    {/* Align Y */}
                    {btn(
                      "T",
                      "Align top edges",
                      () =>
                        dispatch({
                          type: "ALIGN_SELECTION",
                          axis: "y",
                          align: "start",
                        }),
                      "ay-t"
                    )}
                    {btn(
                      "M",
                      "Align horizontal middles",
                      () =>
                        dispatch({
                          type: "ALIGN_SELECTION",
                          axis: "y",
                          align: "center",
                        }),
                      "ay-m"
                    )}
                    {btn(
                      "B",
                      "Align bottom edges",
                      () =>
                        dispatch({
                          type: "ALIGN_SELECTION",
                          axis: "y",
                          align: "end",
                        }),
                      "ay-b"
                    )}
                    <span className="w-px h-4 bg-border-light mx-spacing-xs" />
                    {/* Distribute */}
                    {btn(
                      "H",
                      "Distribute horizontally",
                      () =>
                        dispatch({ type: "DISTRIBUTE_SELECTION", axis: "x" }),
                      "d-h"
                    )}
                    {btn(
                      "V",
                      "Distribute vertically",
                      () =>
                        dispatch({ type: "DISTRIBUTE_SELECTION", axis: "y" }),
                      "d-v"
                    )}
                  </div>
                </div>
              </foreignObject>
            );
          })()}
          {/* Attach/Snap dotted preview while dragging an existing route endpoint */}
          {attachPreview && (
            <g pointerEvents="none">
              <line
                x1={attachPreview.x1}
                y1={attachPreview.y1}
                x2={attachPreview.x2}
                y2={attachPreview.y2}
                stroke="#f59e0b"
                strokeWidth={3}
                strokeDasharray="2 6"
                opacity={0.9}
              />
              <circle
                cx={attachPreview.x2}
                cy={attachPreview.y2}
                r={8}
                fill="none"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="2 6"
                opacity={0.9}
              />
            </g>
          )}
          {/* Annotation preview */}
          {state.ui.annotating &&
            (() => {
              const a = state.ui.annotating;
              const pts = [...a.points, ...(a.preview ? [a.preview] : [])];
              if (a.type === "connector") {
                const from = a.fromPlayerId
                  ? doc.players.find((p) => p.id === a.fromPlayerId)
                  : null;
                const end = a.toPlayerId
                  ? doc.players.find((p) => p.id === a.toPlayerId)
                  : null;
                if (!from) return null;
                const x1 = (from.x / 100) * 1600,
                  y1 = (from.y / 100) * 900;
                const x2 = end
                  ? (end.x / 100) * 1600
                  : ((
                      a.preview ||
                      a.points[a.points.length - 1] || { x: from.x, y: from.y }
                    ).x /
                      100) *
                    1600;
                const y2 = end
                  ? (end.y / 100) * 900
                  : ((
                      a.preview ||
                      a.points[a.points.length - 1] || { x: from.x, y: from.y }
                    ).y /
                      100) *
                    900;
                return (
                  <g>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#111827"
                      strokeWidth={3}
                      strokeDasharray="6 4"
                    />
                    <circle cx={x1} cy={y1} r={5} fill="#111827" />
                  </g>
                );
              }
              if (a.type === "curve" && pts.length >= 2) {
                const s = pts[0];
                const c = pts[pts.length - 1];
                const e = a.preview || c;
                const d = `M ${(s.x / 100) * 1600},${(s.y / 100) * 900} Q ${(c.x / 100) * 1600},${(c.y / 100) * 900} ${(e.x / 100) * 1600},${(e.y / 100) * 900}`;
                return (
                  <path
                    d={d}
                    fill="none"
                    stroke="#111827"
                    strokeWidth={3}
                    strokeDasharray="6 4"
                  />
                );
              }
              return (
                <polyline
                  points={pts
                    .map((p) => `${(p.x / 100) * 1600},${(p.y / 100) * 900}`)
                    .join(" ")}
                  fill="none"
                  stroke="#111827"
                  strokeWidth={3}
                  strokeDasharray="6 4"
                />
              );
            })()}
          {selectionBox && (
            <g>
              <rect
                x={selectionBox.x}
                y={selectionBox.y}
                width={selectionBox.w}
                height={selectionBox.h}
                fill="rgba(250,204,21,0.15)"
                stroke="#fbbf24"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
              {/* Count badge at top-right of marquee */}
              <g
                transform={`translate(${selectionBox.x + selectionBox.w}, ${selectionBox.y})`}
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {/* offset to avoid overlapping the border */}
                <g transform="translate(6, -10)">
                  <rect
                    x={-22}
                    y={-14}
                    width={44}
                    height={22}
                    rx={11}
                    ry={11}
                    fill="#111827"
                    opacity={0.9}
                  />
                  <text
                    x={0}
                    y={-3}
                    fontSize={12}
                    fontWeight={700}
                    fill="#fbbf24"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {marqueeCount}
                  </text>
                </g>
              </g>
            </g>
          )}
        </g>
      </svg>
      {/* Minimap Navigator (bottom-right) */}
      <FieldMinimap
        panX={state.ui.panX}
        panY={state.ui.panY}
        zoom={state.ui.zoom}
        theme={doc.field.theme}
        onMinimapDrag={moveViewportFromMinimap}
      />
    </div>
  );
};
