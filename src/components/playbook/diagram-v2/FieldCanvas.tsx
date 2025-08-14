import React, { useRef, useEffect, useCallback, useState } from "react";
import { useDiagramEditor } from "./context";
import type { DiagramAnnotation, DiagramAnnotationConnector } from "./types";
import { telemetry } from "../../../telemetry/dispatcher";
import { TelemetryEventTypes } from "../../../telemetry/events";

// Simple SVG field canvas with zoom/pan transforms (placeholder)
export const FieldCanvas: React.FC<{
  className?: string;
  onPlayerMouseDown?: (id: string, e: React.MouseEvent) => void;
}> = ({ className, onPlayerMouseDown }) => {
  const { state, dispatch } = useDiagramEditor();
  const { doc } = state;
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  const dragRef = useRef<{
    id: string; // primary dragged id
    startX: number;
    startY: number;
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
    startX: number;
    startY: number;
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
  const [snapViz, setSnapViz] = useState<{ x: number; y: number; show: boolean }>({ x: 0, y: 0, show: false });
  const [alignGuides, setAlignGuides] = useState<
    | null
    | {
        vertical?: number[]; // x positions in px
        horizontal?: number[]; // y positions in px
      }
  >(null);

  const pctToAbs = (xPct: number, yPct: number) => ({
    x: (xPct / 100) * 1600,
    y: (yPct / 100) * 900,
  });
  const absToPct = (x: number, y: number) => ({
    x: (x / 1600) * 100,
    y: (y / 900) * 100,
  });

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
    // Prevent canvas-level mousedown from clearing selection
    e.stopPropagation();
    const player = doc.players.find((p) => p.id === id);
    if (!player) return;
    // Connector tool: click player to set from/to endpoints
    if (state.ui.tool === "draw" && state.ui.drawMode === "connector") {
      if (!state.ui.annotating) {
        dispatch({ type: "START_ANNOTATION", drawType: "connector", fromPlayerId: id });
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
    }
    // Build group snapshot (selected players) for potential group drag, excluding locked players
    const selected = nextSelectedIds.length ? nextSelectedIds : [id];
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
  (xWorld: number, yWorld: number, movingIds: string[]): { x?: number; y?: number; guides: { vertical?: number[]; horizontal?: number[] } } => {
      const others = doc.players.filter((p) => !movingIds.includes(p.id));
      const threshPx = 8; // snap threshold in px
      let bestX: { pct: number; px: number; d: number } | undefined;
      let bestY: { pct: number; px: number; d: number } | undefined;
      const vGuides: number[] = [];
      const hGuides: number[] = [];
      for (const p of others) {
        const xCandidates = [p.x, p.x]; // center only (players have no width); keep structure for future bounds
        const yCandidates = [p.y, p.y];
        for (const xp of xCandidates) {
          const px = (xp / 100) * 1600;
          const d = Math.abs(px - xWorld);
          if (d <= threshPx && (!bestX || d < bestX.d)) {
            bestX = { pct: xp, px, d };
          }
        }
        for (const yp of yCandidates) {
          const py = (yp / 100) * 900;
          const d = Math.abs(py - yWorld);
          if (d <= threshPx && (!bestY || d < bestY.d)) {
            bestY = { pct: yp, px: py, d };
          }
        }
      }
      if (bestX) vGuides.push(bestX.px);
      if (bestY) hGuides.push(bestY.px);
      return {
        x: bestX ? bestX.pct : undefined,
        y: bestY ? bestY.pct : undefined,
        guides: { vertical: vGuides.length ? vGuides : undefined, horizontal: hGuides.length ? hGuides : undefined },
      };
    },
  [doc.players]
  );

  // Smart snapping to player anchors when drawing
  const snapToAnchorPct = useCallback(
    (xWorld: number, yWorld: number) => {
      // threshold in viewBox px
      const threshold = 18; // ~18px
      let bestDist = Infinity;
      let best: { x: number; y: number; kind: "player" | "annotation" | "route"; id: string } | null = null;
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
        const candidates = [a.points[0], a.points[a.points.length - 1]].filter(Boolean);
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
      if (best) return { x: best.x, y: best.y, snapped: true as const, kind: best.kind, id: best.id };
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
          dispatch({ type: "MOVE_ANNOTATION", id: annotDragRef.current.id, dx, dy });
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
        return;
      }
      if (selectionDragRef.current) {
        const curr = clientToWorld(e);
        const sx = selectionDragRef.current.startX;
        const sy = selectionDragRef.current.startY;
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
      const dx = now.x - dragRef.current.startX;
      const dy = now.y - dragRef.current.startY;
      if (Math.abs(dx) > 0 || Math.abs(dy) > 0) dragRef.current.moved = true;
      const patches: { id: string; x: number; y: number }[] = [];
      const { originals } = dragRef.current;
      // Compute group alignment snap using primary dragged id position
      const primary = originals.find((o) => o.id === dragRef.current!.id) || originals[0];
      const candidateX = primary.xAbs + dx;
      const candidateY = primary.yAbs + dy;
      const { x: ax, y: ay, guides } = state.ui.snap
        ? computeAlignmentSnap(candidateX, candidateY, originals.map((o) => o.id))
        : { x: undefined, y: undefined, guides: {} };
      setAlignGuides(state.ui.snap && guides && (guides.vertical || guides.horizontal) ? guides : null);
      originals.forEach((o) => {
        let nx = o.xAbs + dx;
        let ny = o.yAbs + dy;
        // If the primary snapped along an axis, apply same delta correction to all in group
  if (state.ui.snap && ax !== undefined) {
          const primaryPctX = absToPct(primary.xAbs + dx, 0).x;
          const corr = (ax - primaryPctX) / 100 * 1600;
          nx = o.xAbs + dx + corr;
        }
  if (state.ui.snap && ay !== undefined) {
          const primaryPctY = absToPct(0, primary.yAbs + dy).y;
          const corr = (ay - primaryPctY) / 100 * 900;
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
      dispatch({ type: "COMMIT_ANNOT_EDIT", id: state.ui.selectedAnnotationId! });
    }
    if (selectionDragRef.current && selectionBox) {
      const { x, y, w, h } = selectionBox;
      const ids: string[] = [];
      doc.players.forEach((p) => {
        const abs = pctToAbs(p.x, p.y);
        if (abs.x >= x && abs.x <= x + w && abs.y >= y && abs.y <= y + h)
          ids.push(p.id);
      });
      if (ids.length) dispatch({ type: "SET_SELECTION", ids });
    }
    selectionDragRef.current = null;
    setSelectionBox(null);
    if (dragRef.current?.moved) {
      // commit history snapshot once per drag interaction
      dispatch({ type: "COMMIT_MOVE" });
    }
    dragRef.current = null;
  setAlignGuides(null);
    // If in freehand draw mode, commit on mouse up
    if (state.ui.tool === "draw" && state.ui.annotating?.freehand) {
      dispatch({ type: "COMMIT_ANNOTATION" });
    }
  }, [doc.players, selectionBox, dispatch, state.ui.tool, state.ui.annotating, state.ui.selectedAnnotationId]);

  const handleCanvasMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (state.ui.tool === "pan") {
      panRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        panX: state.ui.panX,
        panY: state.ui.panY,
      };
    } else if (state.ui.tool === "select") {
      const start = clientToWorld(e);
      selectionDragRef.current = { startX: start.x, startY: start.y };
      setSelectionBox({ x: start.x, y: start.y, w: 0, h: 0 });
      dispatch({ type: "CLEAR_SELECTION" });
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
        dispatch({ type: "START_ANNOTATION", drawType: state.ui.drawMode || "line", start: { x, y } });
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
  const { x, y, snapped } = snap as { x: number; y: number; snapped: boolean };
    if (snapped) {
      setSnapViz({ x: (x / 100) * 1600, y: (y / 100) * 900, show: true });
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
        if ((e.nativeEvent as MouseEvent).shiftKey && state.ui.annotating.points.length) {
          const last = state.ui.annotating.points[state.ui.annotating.points.length - 1];
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
      if (e.key === "Escape" && state.ui.drawing) {
        dispatch({ type: "CANCEL_ROUTE" });
      }
      if (e.key === "Escape" && state.ui.annotating) {
        dispatch({ type: "CANCEL_ANNOTATION" });
      }
      if (e.key === "Enter" && state.ui.drawing) {
        // Commit current preview as final point if present
        if (state.ui.drawing.preview) {
          dispatch({ type: "ADD_ROUTE_POINT", point: state.ui.drawing.preview });
        }
        dispatch({ type: "COMMIT_ROUTE" });
        e.preventDefault();
      }
      if (e.key === "Enter" && state.ui.annotating) {
        if (state.ui.annotating.preview) {
          dispatch({ type: "ADD_ANNOTATION_POINT", point: state.ui.annotating.preview });
        }
        dispatch({ type: "COMMIT_ANNOTATION" });
        e.preventDefault();
      }
      if ((e.key === "Backspace" || e.key === "Delete") && state.ui.drawing) {
        dispatch({ type: "POP_ROUTE_POINT" });
        e.preventDefault();
      }
      if ((e.key === "Backspace" || e.key === "Delete") && state.ui.annotating) {
        dispatch({ type: "POP_ANNOTATION_POINT" });
        e.preventDefault();
      }
      // Duplicate selected annotation
      if ((e.key.toLowerCase() === "d" && (e.metaKey || e.ctrlKey)) || (e.key.toLowerCase() === "d" && !state.ui.annotating && !state.ui.drawing && state.ui.selectedAnnotationId)) {
        if (state.ui.selectedAnnotationId) {
          dispatch({ type: "DUPLICATE_ANNOTATION", id: state.ui.selectedAnnotationId });
          e.preventDefault();
        }
      }
      if ((e.key === "Backspace" || e.key === "Delete") && !state.ui.annotating && !state.ui.drawing && state.ui.selectedAnnotationId) {
        dispatch({ type: "DELETE_ANNOTATION", id: state.ui.selectedAnnotationId });
        e.preventDefault();
      }
      // Undo / Redo
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "z") {
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
        const delta = e.shiftKey ? 2 : 0.5;
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
    };
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [
    dispatch,
    state.ui.drawing,
  state.ui.annotating,
    state.ui.selectedIds,
  state.ui.selectedAnnotationId,
    doc.players,
    scheduleCommitMove,
  ]);

  return (
  <div className={className}>
      <svg
        ref={svgRef}
        viewBox="0 0 1600 900"
    className={`w-full h-full rounded-md shadow-inner select-none ${state.ui.tool === "pan" ? "cursor-grab" : state.ui.tool === "draw" ? "cursor-crosshair" : "cursor-default"}`}
        role="img"
        aria-label="Diagram field"
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMoveCanvas}
        onMouseDown={handleCanvasMouseDown}
      >
        <g
          transform={`translate(${state.ui.panX} ${state.ui.panY}) scale(${state.ui.zoom})`}
        >
          {/* Field background */}
          {(() => {
            const theme = doc.field.theme || "classic";
            if (theme === "classic")
              return (
                <rect
                  x={0}
                  y={0}
                  width={1600}
                  height={900}
                  fill="#1e7a44"
                  fillOpacity={0.55}
                />
              );
            if (theme === "mono-light")
              return (
                <rect x={0} y={0} width={1600} height={900} fill="#f4f5f6" />
              );
            if (theme === "mono-dark")
              return (
                <rect x={0} y={0} width={1600} height={900} fill="#1d1f20" />
              );
          })()}
          {/* LOS */}
          {(() => {
            const losYards = doc.field.losYards ?? 20;
            const y = (losYards / doc.field.forwardYards) * 900;
            return (
              <rect
                x={0}
                y={y - 3}
                width={1600}
                height={6}
                fill="#064e3b"
                opacity={0.95}
                rx={2}
              />
            );
          })()}
          {/* Red Zone Highlight (top 20 yards of visible slice) */}
          {doc.field.showRedZone && doc.field.forwardYards >= 20 && (
            <rect
              x={0}
              y={0}
              width={1600}
              height={(20 / doc.field.forwardYards) * 900}
              fill="#ef4444"
              opacity={0.08}
            />
          )}
          {/* Yard Lines */}
          {doc.field.showYardLines &&
            Array.from({ length: doc.field.forwardYards / 5 + 1 }).map(
              (_, i) => (
                <line
                  key={i}
                  x1={0}
                  x2={1600}
                  y1={i * (900 / (doc.field.forwardYards / 5))}
                  y2={i * (900 / (doc.field.forwardYards / 5))}
                  stroke="#065f46"
                  strokeWidth={i % 2 === 0 ? 3 : 1}
                  opacity={0.6}
                />
              )
            )}
          {/* Hashes */}
          {doc.field.showHashMarks &&
            (() => {
              const layout = doc.field.hashLayout || "highschool";
              const FT = 160;
              const PXPF = 1600 / FT;
              const hashDistances: Record<string, [number, number]> = {
                highschool: [53 + 4 / 12, FT - (53 + 4 / 12)],
                college: [60, FT - 60],
                nfl: [70 + 9 / 12, FT - (70 + 9 / 12)],
              };
              const [lFt, rFt] = hashDistances[layout];
              const lX = lFt * PXPF;
              const rX = rFt * PXPF;
              const mid = 800;
              const theme = doc.field.theme || "classic";
              const hashColor =
                theme === "mono-dark"
                  ? "#374151"
                  : theme === "mono-light"
                    ? "#9ca3af"
                    : "#064e3b";
              const midColor = theme === "classic" ? "#065f46" : hashColor;
              const marks: React.ReactNode[] = [];
              const w = 10;
              const h = 3;
              const sideOffsetFt = 3;
              const sideCenterX = sideOffsetFt * PXPF;
              const sideRightCenterX = 1600 - sideCenterX;
              for (let yrd = 0; yrd <= doc.field.forwardYards; yrd++) {
                const y = (yrd / doc.field.forwardYards) * 900;
                marks.push(
                  <g key={yrd}>
                    <rect
                      x={lX - w / 2}
                      y={y - h / 2}
                      width={w}
                      height={h}
                      fill={hashColor}
                      opacity={0.55}
                    />
                    <rect
                      x={rX - w / 2}
                      y={y - h / 2}
                      width={w}
                      height={h}
                      fill={hashColor}
                      opacity={0.55}
                    />
                    {doc.field.ballHash === "middle" && (
                      <rect
                        x={mid - 3}
                        y={y - h / 2}
                        width={6}
                        height={h}
                        fill={midColor}
                        opacity={0.35}
                      />
                    )}
                    <rect
                      x={sideCenterX - w / 2}
                      y={y - h / 2}
                      width={w}
                      height={h}
                      fill={hashColor}
                      opacity={0.45}
                    />
                    <rect
                      x={sideRightCenterX - w / 2}
                      y={y - h / 2}
                      width={w}
                      height={h}
                      fill={hashColor}
                      opacity={0.45}
                    />
                  </g>
                );
              }
              return marks;
            })()}
          {/* Yard Numbers */}
          {Array.from({ length: doc.field.forwardYards / 5 + 1 }).map(
            (_, i) => {
              const y = i * (900 / (doc.field.forwardYards / 5));
              if (i === 0) return null;
              const yardValue = i * 5;
              if (yardValue === 50) return null;
              const theme = doc.field.theme || "classic";
              const baseColor =
                theme === "classic"
                  ? "#ecfdf5"
                  : theme === "mono-light"
                    ? "#444"
                    : "#e5e7eb";
              const opacity = theme === "classic" ? 0.24 : 0.32;
              const feetFromSideline = 9 * 3;
              const leftX = feetFromSideline * 10;
              const rightX = 1600 - leftX;
              const numberY = y + 26;
              const digits = String(yardValue).split("");
              const halfSpacing = 24;
              return (
                <g key={i} opacity={opacity}>
                  <g
                    transform={`translate(${leftX},${numberY}) rotate(90)`}
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    {digits.map((d, di) => (
                      <text
                        key={di}
                        fontSize={50}
                        fontWeight={700}
                        fill={baseColor}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        x={di === 0 ? -halfSpacing : halfSpacing}
                      >
                        {d}
                      </text>
                    ))}
                  </g>
                  <g
                    transform={`translate(${rightX},${numberY}) rotate(-90)`}
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    {digits.map((d, di) => (
                      <text
                        key={di}
                        fontSize={50}
                        fontWeight={700}
                        fill={baseColor}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        x={di === 0 ? -halfSpacing : halfSpacing}
                      >
                        {d}
                      </text>
                    ))}
                  </g>
                </g>
              );
            }
          )}
          {/* Players */}
          {doc.players
            .filter((p) => doc.field.showDefensePlayers || p.side !== "D")
            .map((p) => {
              const isCenter = p.label === "C" || p.role === "C";
              const theme = doc.field.theme || "classic";
              const defaultOutline =
                theme === "mono-light" ? "#1f2937" : "#ffffff";
              const strokeColor = p.outlineColor || defaultOutline;
        const selected = (state.ui.selectedIds || []).includes(p.id);
        const locked = !!p.locked;
              return (
                <g
                  key={p.id}
                  transform={`translate(${(p.x / 100) * 1600},${(p.y / 100) * 900})`}
          className={locked ? "cursor-not-allowed opacity-70" : "cursor-pointer"}
                  onMouseDown={(e) => {
                    onPlayerMouseDown?.(p.id, e);
                    handleMouseDownPlayer(e, p.id);
                  }}
                >
                  {isCenter ? (
                    <rect
                      x={-24}
                      y={-16}
                      width={48}
                      height={32}
                      rx={4}
                      ry={4}
                      fill={p.color || "#1e3a8a"}
                      stroke={selected ? "#fbbf24" : strokeColor}
                      strokeWidth={selected ? 4 : 2}
                    />
                  ) : (
                    <ellipse
                      rx={26}
                      ry={18}
                      fill={p.color || (p.side === "D" ? "#b91c1c" : "#1e3a8a")}
                      stroke={selected ? "#fbbf24" : strokeColor}
                      strokeWidth={selected ? 4 : 2}
                    />
                  )}{" "}
                  {doc.field.showPlayerLabels && (
                    <text
                      x={0}
                      y={4}
                      fontSize={18}
                      fontWeight={700}
                      fill={theme === "mono-light" ? "#111827" : "#ffffff"}
                      textAnchor="middle"
                      style={{ pointerEvents: "none", userSelect: "none" }}
                    >
                      {p.label}
                    </text>
                  )}
                </g>
              );
            })}
          {/* Existing routes */}
          {doc.routes.map((r) => (
            <g key={r.id}>
              {r.segments.map((s, si) => {
                const pts = s.points.map((p) => ({ x: (p.x / 100) * 1600, y: (p.y / 100) * 900 }));
                if (s.type === "curve" && pts.length >= 3) {
                  // Quadratic curve: M start Q control end
                  const d = `M ${pts[0].x},${pts[0].y} Q ${pts[1].x},${pts[1].y} ${pts[2].x},${pts[2].y}`;
                  return (
                    <g key={s.id}>
                      <path
                        d={d}
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth={6}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
            {pts.map((p, pi) => (
                        <circle
                          key={pi}
                          cx={p.x}
                          cy={p.y}
              r={pi === 1 ? 8 : 9}
                          fill={pi === 1 ? "#34d399" : "#fbbf24"}
                          stroke="#1f2937"
                          strokeWidth={2}
                          className="cursor-move"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            const start = clientToWorld(e);
                            const startPt = { x: p.x, y: p.y };
                            const move = (me: MouseEvent) => {
                              const now = clientToWorld(me);
                              const dx = now.x - start.x;
                              const dy = now.y - start.y;
                              const nx = Math.min(100, Math.max(0, snapPct(((startPt.x + dx) / 1600) * 100)));
                              const ny = Math.min(100, Math.max(0, snapPct(((startPt.y + dy) / 900) * 100)));
                              dispatch({ type: "UPDATE_ROUTE_POINT", routeId: r.id, segIndex: si, pointIndex: pi, point: { x: nx, y: ny } });
                            };
                            const up = () => {
                              window.removeEventListener("mousemove", move);
                              window.removeEventListener("mouseup", up);
                              dispatch({ type: "COMMIT_ROUTE_EDIT" });
                            };
                            window.addEventListener("mousemove", move);
                            window.addEventListener("mouseup", up);
                          }}
                        />
                      ))}
                    </g>
                  );
                }
                // default line polyline
                return (
                  <g key={s.id}>
                    <polyline
                      points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth={6}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
          {pts.map((p, pi) => (
                      <circle
                        key={pi}
                        cx={p.x}
                        cy={p.y}
            r={9}
                        fill="#fbbf24"
                        stroke="#1f2937"
                        strokeWidth={2}
                        className="cursor-move"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          const start = clientToWorld(e);
                          const startPt = { x: p.x, y: p.y };
                          const move = (me: MouseEvent) => {
                            const now = clientToWorld(me);
                            const dx = now.x - start.x;
                            const dy = now.y - start.y;
                            const nx = Math.min(100, Math.max(0, snapPct(((startPt.x + dx) / 1600) * 100)));
                            const ny = Math.min(100, Math.max(0, snapPct(((startPt.y + dy) / 900) * 100)));
                            dispatch({ type: "UPDATE_ROUTE_POINT", routeId: r.id, segIndex: si, pointIndex: pi, point: { x: nx, y: ny } });
                          };
                          const up = () => {
                            window.removeEventListener("mousemove", move);
                            window.removeEventListener("mouseup", up);
                            dispatch({ type: "COMMIT_ROUTE_EDIT" });
                          };
                          window.addEventListener("mousemove", move);
                          window.addEventListener("mouseup", up);
                        }}
                      />
                    ))}
                  </g>
                );
              })}
            </g>
          ))}
          {/* Annotations */}
          {(doc.annotations || []).map((a: DiagramAnnotation) => {
            const color = a.color || "#111827";
            const width = a.width || 3;
            const isSelected = state.ui.selectedAnnotationId === a.id;
            const isHover = hoverAnnId === a.id;
            const highlightStroke = isSelected || isHover ? (isSelected ? "#3b82f6" : "#22d3ee") : undefined;
            const commonEvents = {
              onMouseEnter: (e: React.MouseEvent) => {
                e.stopPropagation();
                setHoverAnnId(a.id);
              },
              onMouseLeave: (e: React.MouseEvent) => {
                e.stopPropagation();
                setHoverAnnId((curr) => (curr === a.id ? undefined : curr));
              },
            } as const;
            if (a.type === "connector") {
              const conn = a as DiagramAnnotationConnector;
              const from = doc.players.find((p) => p.id === conn.fromPlayerId);
              const to = doc.players.find((p) => p.id === conn.toPlayerId);
              if (!from || !to) return null;
              const x1 = (from.x / 100) * 1600,
                y1 = (from.y / 100) * 900,
                x2 = (to.x / 100) * 1600,
                y2 = (to.y / 100) * 900;
              return (
                <g
                  key={a.id}
                  className="cursor-move"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    dispatch({ type: "SELECT_ANNOTATION", id: a.id });
                    const start = clientToWorld(e);
                    annotDragRef.current = { id: a.id, startX: start.x, startY: start.y };
                  }}
                  {...commonEvents}
                >
                  {highlightStroke && (
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={highlightStroke} strokeWidth={width + 8} opacity={0.25} strokeLinecap="round" />
                  )}
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} />
                  {(() => {
                    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
                    const ux = (x2 - x1) / len;
                    const uy = (y2 - y1) / len;
                    const size = 10;
                    const px = x2 - ux * size;
                    const py = y2 - uy * size;
                    const leftX = px + (-uy) * (size * 0.6);
                    const leftY = py + (ux) * (size * 0.6);
                    const rightX = px - (-uy) * (size * 0.6);
                    const rightY = py - (ux) * (size * 0.6);
                    const ah = a.arrowHead ?? "end";
                    const heads: React.ReactElement[] = [];
                    if (ah === "end" || ah === "both") {
                      heads.push(<polygon key="end" points={`${x2},${y2} ${leftX},${leftY} ${rightX},${rightY}`} fill={color} />);
                    }
                    if (ah === "start" || ah === "both") {
                      const sx = x1, sy = y1;
                      const px2 = sx + ux * size;
                      const py2 = sy + uy * size;
                      const l2x = px2 + (uy) * (size * 0.6);
                      const l2y = py2 + (-ux) * (size * 0.6);
                      const r2x = px2 - (uy) * (size * 0.6);
                      const r2y = py2 - (-ux) * (size * 0.6);
                      heads.push(<polygon key="start" points={`${sx},${sy} ${l2x},${l2y} ${r2x},${r2y}`} fill={color} />);
                    }
                    return heads;
                  })()}
                </g>
              );
            }
            // line-like annotations
            const pts = "points" in a ? a.points : [];
            const abs = pts.map((p) => `${(p.x / 100) * 1600},${(p.y / 100) * 900}`).join(" ");
            if (a.type === "curve" && pts.length >= 3) {
              const [s, c, e] = pts;
              const d = `M ${(s.x / 100) * 1600},${(s.y / 100) * 900} Q ${(c.x / 100) * 1600},${(c.y / 100) * 900} ${(e.x / 100) * 1600},${(e.y / 100) * 900}`;
              return (
                <g
                  key={a.id}
                  className="cursor-move"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    dispatch({ type: "SELECT_ANNOTATION", id: a.id });
                    const start = clientToWorld(e);
                    annotDragRef.current = { id: a.id, startX: start.x, startY: start.y };
                  }}
                  {...commonEvents}
                >
                  {highlightStroke && (
                    <path d={d} fill="none" stroke={highlightStroke} strokeWidth={width + 8} opacity={0.25} strokeLinecap="round" strokeLinejoin="round" />
                  )}
                  <path d={d} fill="none" stroke={color} strokeWidth={width} />
                </g>
              );
            }
            return (
              <g
                key={a.id}
                className="cursor-move"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  dispatch({ type: "SELECT_ANNOTATION", id: a.id });
                  const start = clientToWorld(e);
                  annotDragRef.current = { id: a.id, startX: start.x, startY: start.y };
                }}
                {...commonEvents}
              >
                {highlightStroke && (
                  <polyline points={abs} fill="none" stroke={highlightStroke} strokeWidth={width + 8} opacity={0.25} strokeLinecap="round" strokeLinejoin="round" />
                )}
                <polyline points={abs} fill="none" stroke={color} strokeWidth={width} strokeDasharray={a.type === "dashed" ? "8 6" : a.type === "dotted" ? "2 6" : undefined} />
                {a.type === "arrow" && pts.length >= 2 && (() => {
                  const p2 = pts[pts.length - 1];
                  const p1 = pts[pts.length - 2];
                  const x2 = (p2.x / 100) * 1600, y2 = (p2.y / 100) * 900;
                  const x1 = (p1.x / 100) * 1600, y1 = (p1.y / 100) * 900;
                  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
                  const ux = (x2 - x1) / len;
                  const uy = (y2 - y1) / len;
                  const size = 10;
                  const px = x2 - ux * size;
                  const py = y2 - uy * size;
                  const leftX = px + (-uy) * (size * 0.6);
                  const leftY = py + (ux) * (size * 0.6);
                  const rightX = px - (-uy) * (size * 0.6);
                  const rightY = py - (ux) * (size * 0.6);
                  const ah = a.arrowHead ?? "end";
                  const out: React.ReactElement[] = [];
                  if (ah === "end" || ah === "both") out.push(<polygon key="end" points={`${x2},${y2} ${leftX},${leftY} ${rightX},${rightY}`} fill={color} />);
                  if (ah === "start" || ah === "both") {
                    const sx = x1, sy = y1;
                    const px2 = sx + ux * size;
                    const py2 = sy + uy * size;
                    const l2x = px2 + (uy) * (size * 0.6);
                    const l2y = py2 + (-ux) * (size * 0.6);
                    const r2x = px2 - (uy) * (size * 0.6);
                    const r2y = py2 - (-ux) * (size * 0.6);
                    out.push(<polygon key="start" points={`${sx},${sy} ${l2x},${l2y} ${r2x},${r2y}`} fill={color} />);
                  }
                  return out;
                })()}
              </g>
            );
          })}
          {/* Snap indicator */}
          {snapViz.show && (
            <g pointerEvents="none">
              <circle cx={snapViz.x} cy={snapViz.y} r={8} fill="none" stroke="#22d3ee" strokeWidth={2} opacity={0.8} />
              <circle cx={snapViz.x} cy={snapViz.y} r={3} fill="#22d3ee" opacity={0.9} />
            </g>
          )}
          {/* Alignment guides */}
          {alignGuides && (
            <g pointerEvents="none" opacity={0.6}>
              {alignGuides.vertical?.map((x, i) => (
                <line key={`vg${i}`} x1={x} x2={x} y1={0} y2={900} stroke="#22c55e" strokeWidth={2} strokeDasharray="6 4" />
              ))}
              {alignGuides.horizontal?.map((y, i) => (
                <line key={`hg${i}`} x1={0} x2={1600} y1={y} y2={y} stroke="#22c55e" strokeWidth={2} strokeDasharray="6 4" />
              ))}
            </g>
          )}
          {/* Annotation selection handles */}
          {state.ui.selectedAnnotationId && (() => {
            const ann = (doc.annotations || []).find((x) => x.id === state.ui.selectedAnnotationId);
            if (!ann) return null;
            const pts = "points" in ann ? ann.points : [];
            // Compute popover position near first point (or midpoint for connectors)
            let popX = 20, popY = 20;
            if (ann.type === "connector") {
              const conn = ann as DiagramAnnotationConnector;
              const from = doc.players.find((p) => p.id === conn.fromPlayerId);
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
            const popW = 260, popH = 64, pad = 8;
            const dockX = Math.max(pad, Math.min(1600 - popW - pad, popX + 12));
            const dockY = Math.max(pad, Math.min(900 - popH - pad, popY - 10));
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
                          const nx = Math.min(100, Math.max(0, snapPct(((startPct.x / 100) * 1600 + dx) / 1600 * 100)));
                          const ny = Math.min(100, Math.max(0, snapPct(((startPct.y / 100) * 900 + dy) / 900 * 100)));
                          dispatch({ type: "UPDATE_ANNOT_POINT", id: ann.id, pointIndex: i, point: { x: nx, y: ny } });
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
                    <div className="inline-flex items-center gap-2 panel-cupertino px-2.5 py-1.5">
                      <input
                        type="color"
                        aria-label="Annotation color"
      value={("color" in ann && ann.color) ? ann.color! : (state.ui.drawColor || "#111827")}
                        onChange={(e) => dispatch({ type: "UPDATE_ANNOT_STYLE", id: ann.id, patch: { color: e.target.value } })}
                        className="w-9 h-9 p-0 border border-slate-300 rounded"
                        title="Color"
                      />
                      <input
                        type="range"
                        aria-label="Annotation width"
                        min={1}
                        max={10}
                        step={1}
      value={("width" in ann && ann.width) ? ann.width! : (state.ui.drawWidth || 3)}
                        onChange={(e) => dispatch({ type: "UPDATE_ANNOT_STYLE", id: ann.id, patch: { width: Number(e.target.value) } })}
                        className="w-24"
                        title="Width"
                      />
                      <select
                        aria-label="Arrowhead"
                        value={("arrowHead" in ann && ann.arrowHead) ? ann.arrowHead! : (state.ui.drawArrowHead || "end")}
                        onChange={(e) => dispatch({ type: "UPDATE_ANNOT_STYLE", id: ann.id, patch: { arrowHead: e.target.value as "none" | "start" | "end" | "both" } })}
                        className="text-[12px] border border-slate-300 rounded px-2 py-1"
                        title="Arrowhead"
                      >
                        <option value="none">None</option>
                        <option value="end">End</option>
                        <option value="start">Start</option>
                        <option value="both">Both</option>
                      </select>
                      <span className="text-[12px] w-7 text-right">{("width" in ann && ann.width) ? ann.width : (state.ui.drawWidth || 3)}px</span>
                      <span className="mx-1 w-px h-5 bg-slate-200" />
                      <span
                        role="button"
                        className="text-red-600 text-xs px-2 py-1 border border-red-200 rounded hover:bg-red-50 cursor-pointer select-none"
                        onClick={(e) => { e.stopPropagation(); dispatch({ type: "DELETE_ANNOTATION", id: ann.id }); }}
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
          {state.ui.drawing && (
            state.ui.routeMode === "curve" && state.ui.drawing.anchorPoints.length >= 2 ? (
              // For curve preview: need 3 points (start, control, end). Use preview as end while last anchor is control.
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
                  <path
                    d={d}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth={6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="8 6"
                  />
                );
              })()
            ) : (
              <polyline
                points={[
                  ...state.ui.drawing.anchorPoints,
                  ...(state.ui.drawing.preview ? [state.ui.drawing.preview] : []),
                ]
                  .map((p) => `${(p.x / 100) * 1600},${(p.y / 100) * 900}`)
                  .join(" ")}
                fill="none"
                stroke="#fbbf24"
                strokeWidth={6}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="8 6"
              />
            )
          )}
          {/* Annotation preview */}
          {state.ui.annotating && (() => {
            const a = state.ui.annotating;
            const pts = [...a.points, ...(a.preview ? [a.preview] : [])];
            if (a.type === "connector") {
              const from = a.fromPlayerId ? doc.players.find((p) => p.id === a.fromPlayerId) : null;
              const end = a.toPlayerId ? doc.players.find((p) => p.id === a.toPlayerId) : null;
              if (!from) return null;
              const x1 = (from.x / 100) * 1600, y1 = (from.y / 100) * 900;
              const x2 = end ? (end.x / 100) * 1600 : ((a.preview || a.points[a.points.length - 1] || { x: from.x, y: from.y }).x / 100) * 1600;
              const y2 = end ? (end.y / 100) * 900 : ((a.preview || a.points[a.points.length - 1] || { x: from.x, y: from.y }).y / 100) * 900;
              return (
                <g>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#111827" strokeWidth={3} strokeDasharray="6 4" />
                  <circle cx={x1} cy={y1} r={5} fill="#111827" />
                </g>
              );
            }
            if (a.type === "curve" && pts.length >= 2) {
              const s = pts[0];
              const c = pts[pts.length - 1];
              const e = a.preview || c;
              const d = `M ${(s.x / 100) * 1600},${(s.y / 100) * 900} Q ${(c.x / 100) * 1600},${(c.y / 100) * 900} ${(e.x / 100) * 1600},${(e.y / 100) * 900}`;
              return <path d={d} fill="none" stroke="#111827" strokeWidth={3} strokeDasharray="6 4" />;
            }
            return (
              <polyline
                points={pts.map((p) => `${(p.x / 100) * 1600},${(p.y / 100) * 900}`).join(" ")}
                fill="none"
                stroke="#111827"
                strokeWidth={3}
                strokeDasharray="6 4"
              />
            );
          })()}
          {selectionBox && (
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
          )}
        </g>
      </svg>
    </div>
  );
};
