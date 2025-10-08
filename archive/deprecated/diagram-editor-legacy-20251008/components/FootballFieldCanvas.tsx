import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useContext } from "react";
import { DiagramEditorContext } from "../context/DiagramEditorContext";
import { WebGLFootballRenderer } from "./WebGLFootballRenderer";
import type {
  WebGLPlayer,
  ViewportBounds,
  WebGLRoutePoint,
} from "./WebGLFootballRenderer";

interface CanvasTransform {
  x: number;
  y: number;
  scale: number;
}

export const FootballFieldCanvas: React.FC = React.memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { state } = useContext(DiagramEditorContext);

  // WebGL renderer instance
  const webglRendererRef = useRef<WebGLFootballRenderer | null>(null);

  const [transform, setTransform] = useState<CanvasTransform>({
    x: 0,
    y: 0,
    scale: 1,
  });

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // NFL Field dimensions for playbook view (looking down the field)
  const FIELD_WIDTH = 53.333; // 53.333 yards (standard NFL field width)
  const FIELD_HEIGHT = 35; // 35 yards of field length (typical playbook view)

  // Canvas will be sized to fill the container, field will scale to fit
  const CANVAS_WIDTH = 800; // Base canvas width for drawing
  const CANVAS_HEIGHT = 525; // Base canvas height for drawing
  const PIXELS_PER_YARD = Math.min(
    CANVAS_WIDTH / FIELD_WIDTH,
    CANVAS_HEIGHT / FIELD_HEIGHT
  );

  // Initialize WebGL renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const config = {
        width: containerSize.width || 800,
        height: containerSize.height || 525,
        pixelsPerYard: PIXELS_PER_YARD,
        backgroundColor: [0.95, 0.97, 0.93, 1] as [
          number,
          number,
          number,
          number,
        ], // Light green
        lineColor: [0.51, 0.83, 0.61, 1] as [number, number, number, number], // Emerald 200
        hashColor: [0.51, 0.83, 0.61, 1] as [number, number, number, number], // Emerald 200
      };

      webglRendererRef.current = new WebGLFootballRenderer(canvas, config);
    } catch (error) {
      console.warn("WebGL not supported, falling back to Canvas 2D:", error);
      // Fallback to Canvas 2D would go here
    }

    return () => {
      if (webglRendererRef.current) {
        webglRendererRef.current.destroy();
        webglRendererRef.current = null;
      }
    };
  }, [containerSize.width, containerSize.height, PIXELS_PER_YARD]);

  // Zoom level functions
  const zoomLevels = useMemo(() => [1, 2, 5, 10], []);

  const zoomIn = useCallback(() => {
    const currentIndex =
      zoomLevels.indexOf(transform.scale) !== -1
        ? zoomLevels.indexOf(transform.scale)
        : 0;
    const newIndex = Math.min(zoomLevels.length - 1, currentIndex + 1);
    setTransform((prev) => ({ ...prev, scale: zoomLevels[newIndex] }));
  }, [transform.scale, zoomLevels]);

  const zoomOut = useCallback(() => {
    const currentIndex =
      zoomLevels.indexOf(transform.scale) !== -1
        ? zoomLevels.indexOf(transform.scale)
        : 0;
    const newIndex = Math.max(0, currentIndex - 1);
    setTransform((prev) => ({ ...prev, scale: zoomLevels[newIndex] }));
  }, [transform.scale, zoomLevels]);

  const resetZoom = useCallback(() => {
    setTransform((prev) => ({ ...prev, scale: 1 }));
  }, []);

  // Handle wheel events for zoom (discrete levels: 1x, 2x, 5x, 10x)
  // @ts-expect-error - Utility function for future wheel zoom interactions
  const _handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const currentIndex =
        zoomLevels.indexOf(transform.scale) !== -1
          ? zoomLevels.indexOf(transform.scale)
          : 0;

      let newIndex;
      if (e.deltaY > 0) {
        // Zoom out
        newIndex = Math.max(0, currentIndex - 1);
      } else {
        // Zoom in
        newIndex = Math.min(zoomLevels.length - 1, currentIndex + 1);
      }

      setTransform((prev) => ({
        ...prev,
        scale: zoomLevels[newIndex],
      }));
    },
    [transform.scale, zoomLevels]
  );

  // Utility function to convert hex color to RGB array
  const hexToRgb = useCallback(
    (hex: string): [number, number, number, number] => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [
            parseInt(result[1], 16) / 255,
            parseInt(result[2], 16) / 255,
            parseInt(result[3], 16) / 255,
            1.0,
          ]
        : [0.26, 0.51, 0.96, 1.0]; // Default blue
    },
    []
  );

  // Calculate viewport bounds in field coordinates (yards)
  const getViewportBounds = useCallback((): ViewportBounds => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return {
        left: 0,
        top: 0,
        right: FIELD_WIDTH,
        bottom: FIELD_HEIGHT,
        width: FIELD_WIDTH,
        height: FIELD_HEIGHT,
      };
    }

    // Convert canvas viewport to field coordinates
    const canvasLeft = -transform.x / transform.scale;
    const canvasTop = -transform.y / transform.scale;
    const canvasRight =
      canvasLeft + canvas.width / transform.scale / PIXELS_PER_YARD;
    const canvasBottom =
      canvasTop + canvas.height / transform.scale / PIXELS_PER_YARD;

    return {
      left: Math.max(0, canvasLeft),
      top: Math.max(0, canvasTop),
      right: Math.min(FIELD_WIDTH, canvasRight),
      bottom: Math.min(FIELD_HEIGHT, canvasBottom),
      width: canvasRight - canvasLeft,
      height: canvasBottom - canvasTop,
    };
  }, [transform, FIELD_WIDTH, FIELD_HEIGHT, PIXELS_PER_YARD]);

  // Render loop using WebGL with virtual scrolling
  useEffect(() => {
    if (!canvasRef.current || !webglRendererRef.current) return;

    const canvas = canvasRef.current;
    const renderer = webglRendererRef.current;

    // Set canvas size
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    canvas.width = displayWidth;
    canvas.height = displayHeight;

    // Resize renderer if needed
    renderer.resize(displayWidth, displayHeight);

    // Calculate viewport bounds for virtual scrolling
    const viewportBounds = getViewportBounds();

    // Clear and render field (only visible portion)
    renderer.clear();
    renderer.renderField(
      [transform.x, transform.y],
      transform.scale,
      FIELD_WIDTH,
      FIELD_HEIGHT,
      viewportBounds
    );

    // Filter and render only visible players
    const visiblePlayers = state.doc.players.filter((player) => {
      // Check if player is within viewport bounds (with some padding for labels)
      const padding = 2; // yards of padding
      return (
        player.x >= viewportBounds.left - padding &&
        player.x <= viewportBounds.right + padding &&
        player.y >= viewportBounds.top - padding &&
        player.y <= viewportBounds.bottom + padding
      );
    });

    // Convert visible players to WebGL format and render
    const webglPlayers: WebGLPlayer[] = visiblePlayers.map((player) => ({
      id: player.id,
      x: (player.x / 100) * FIELD_WIDTH * PIXELS_PER_YARD, // Convert % to yards to pixels
      y: (player.y / 100) * FIELD_HEIGHT * PIXELS_PER_YARD, // Convert % to yards to pixels
      color: hexToRgb(player.color || "#3B82F6"), // Default blue if no color
      label: player.label,
      selected: false, // TODO: Add selection state
    }));

    renderer.renderPlayers(
      webglPlayers,
      [transform.x, transform.y],
      transform.scale
    );

    // Render routes if any
    const visibleRoutes = state.doc.routes.filter((route) => {
      // Check if any segment of the route is within viewport bounds
      return route.segments.some((segment) =>
        segment.points.some(
          (point) =>
            (point.x / 100) * FIELD_WIDTH >= viewportBounds.left - 2 &&
            (point.x / 100) * FIELD_WIDTH <= viewportBounds.right + 2 &&
            (point.y / 100) * FIELD_HEIGHT >= viewportBounds.top - 2 &&
            (point.y / 100) * FIELD_HEIGHT <= viewportBounds.bottom + 2
        )
      );
    });

    if (visibleRoutes.length > 0) {
      const webglRoutes: WebGLRoutePoint[][] = visibleRoutes.map((route) => {
        const routePoints: WebGLRoutePoint[] = [];
        route.segments.forEach((segment) => {
          segment.points.forEach((point) => {
            routePoints.push({
              x: (point.x / 100) * FIELD_WIDTH * PIXELS_PER_YARD, // Convert % to yards to pixels
              y: (point.y / 100) * FIELD_HEIGHT * PIXELS_PER_YARD, // Convert % to yards to pixels
              color: hexToRgb(route.color || "#3B82F6"),
              width: 2, // Default route width
            });
          });
        });
        return routePoints;
      });

      renderer.renderRoutes(
        webglRoutes,
        [transform.x, transform.y],
        transform.scale,
        viewportBounds
      );
    }

    // Render annotations if any
    const visibleAnnotations = (state.doc.annotations || []).filter(
      (annotation) => {
        // Check if annotation points are within viewport bounds
        if ("points" in annotation) {
          return annotation.points.some(
            (point) =>
              (point.x / 100) * FIELD_WIDTH >= viewportBounds.left - 2 &&
              (point.x / 100) * FIELD_WIDTH <= viewportBounds.right + 2 &&
              (point.y / 100) * FIELD_HEIGHT >= viewportBounds.top - 2 &&
              (point.y / 100) * FIELD_HEIGHT <= viewportBounds.bottom + 2
          );
        }
        return false; // Connectors don't have points, skip for now
      }
    );

    if (visibleAnnotations.length > 0) {
      const webglAnnotations: WebGLRoutePoint[][] = visibleAnnotations
        .map((annotation) => {
          if ("points" in annotation) {
            return annotation.points.map((point) => ({
              x: (point.x / 100) * FIELD_WIDTH * PIXELS_PER_YARD, // Convert % to yards to pixels
              y: (point.y / 100) * FIELD_HEIGHT * PIXELS_PER_YARD, // Convert % to yards to pixels
              color: hexToRgb(annotation.color || "#3B82F6"),
              width: annotation.width || 2,
            }));
          }
          return [];
        })
        .filter((route) => route.length > 0);

      renderer.renderAnnotations(
        webglAnnotations,
        [transform.x, transform.y],
        transform.scale,
        viewportBounds
      );
    }
  }, [
    transform,
    state.doc.players,
    state.doc.routes,
    state.doc.annotations,
    FIELD_WIDTH,
    FIELD_HEIGHT,
    PIXELS_PER_YARD,
    hexToRgb,
    getViewportBounds,
  ]);

  // Update transform to fit the field within the container
  useEffect(() => {
    if (containerSize.width > 0 && containerSize.height > 0) {
      // The field will be drawn to fill the container, so no transform needed for positioning
      // Just ensure we're at the origin with scale 1
      setTransform((prev) => ({
        ...prev,
        x: 0,
        y: 0,
        scale: 1,
      }));
    }
  }, [containerSize]);

  // Get container dimensions
  useEffect(() => {
    const updateContainerSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateContainerSize();
    window.addEventListener("resize", updateContainerSize);

    return () => window.removeEventListener("resize", updateContainerSize);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-surface-dark pointer-events-none"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-default pointer-events-none"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: "0 0",
        }}
      />

      {/* Zoom controls */}
      <div className="absolute top-4 right-6 flex flex-col gap-2 p-2 bg-surface-card/80 backdrop-blur-sm rounded-lg shadow-lg pointer-events-auto">
        <button
          onClick={zoomIn}
          className="w-8 h-8 bg-surface-secondary hover:bg-surface-tertiary rounded-lg flex items-center justify-center transition-colors"
        >
          <span className="text-sm font-bold">+</span>
        </button>
        <button
          onClick={zoomOut}
          className="w-8 h-8 bg-surface-secondary hover:bg-surface-tertiary rounded-lg flex items-center justify-center transition-colors"
        >
          <span className="text-sm font-bold">−</span>
        </button>
        <button
          onClick={resetZoom}
          className="w-8 h-8 bg-surface-secondary hover:bg-surface-tertiary rounded-lg flex items-center justify-center text-xs transition-colors"
        >
          1:1
        </button>
      </div>

      {/* Coordinates display */}
      <div className="absolute bottom-4 left-4 bg-surface-card px-3 py-2 rounded-lg border border-border text-sm pointer-events-auto">
        Zoom: {transform.scale}x | X: {Math.round(transform.x)}, Y:{" "}
        {Math.round(transform.y)}
      </div>
    </div>
  );
});
