import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useContext } from "react";
import { DiagramEditorContext } from "../context/DiagramEditorContext";

interface Point {
  x: number;
  y: number;
}

interface CanvasTransform {
  x: number;
  y: number;
  scale: number;
}

export const FootballFieldCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { state, dispatch } = useContext(DiagramEditorContext);

  const [transform, setTransform] = useState<CanvasTransform>({
    x: 0,
    y: 0,
    scale: 1,
  });

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // NFL Field dimensions for playbook view (looking down the field)
  const FIELD_WIDTH = 53.3; // 100 feet width (standard field width)
  const FIELD_HEIGHT = 35; // 35 yards of field length (typical playbook view)
  const PIXELS_PER_YARD = 15; // 15 pixels per yard for better visibility

  const CANVAS_WIDTH = FIELD_WIDTH * PIXELS_PER_YARD;
  const CANVAS_HEIGHT = FIELD_HEIGHT * PIXELS_PER_YARD;

  // Convert field coordinates to canvas coordinates
  // fieldX: 0 to FIELD_WIDTH (width of field, left to right)
  // fieldY: 0 to FIELD_HEIGHT (length of field, top to bottom)
  const fieldToCanvas = useCallback(
    (fieldX: number, fieldY: number): Point => {
      return {
        x: fieldX * PIXELS_PER_YARD,
        y: fieldY * PIXELS_PER_YARD,
      };
    },
    [PIXELS_PER_YARD]
  );

  // Convert canvas coordinates to field coordinates
  // canvasX: 0 to CANVAS_WIDTH -> fieldX: 0 to FIELD_WIDTH
  // canvasY: 0 to CANVAS_HEIGHT -> fieldY: 0 to FIELD_HEIGHT
  const canvasToField = useCallback(
    (canvasX: number, canvasY: number): Point => {
      return {
        x: canvasX / PIXELS_PER_YARD,
        y: canvasY / PIXELS_PER_YARD,
      };
    },
    [PIXELS_PER_YARD]
  );

  // Draw the football field (vertical orientation - looking down the field)
  const drawField = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      // Clear canvas
      ctx.fillStyle = "#2d5a27"; // Field green
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw end zones (small zones at top and bottom)
      ctx.fillStyle = "#c41e3a"; // Team color
      const END_ZONE_DEPTH = 3; // 3 yards for end zones
      ctx.fillRect(0, 0, CANVAS_WIDTH, END_ZONE_DEPTH * PIXELS_PER_YARD); // Top end zone
      ctx.fillRect(
        0,
        CANVAS_HEIGHT - END_ZONE_DEPTH * PIXELS_PER_YARD,
        CANVAS_WIDTH,
        END_ZONE_DEPTH * PIXELS_PER_YARD
      ); // Bottom end zone

      // Draw yard lines (horizontal lines across the field)
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.setLineDash([]);

      for (let yard = 0; yard <= FIELD_HEIGHT; yard += 5) {
        const y = yard * PIXELS_PER_YARD;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();

        // Yard numbers (only show major yard lines)
        if (yard > 0 && yard < FIELD_HEIGHT && yard % 10 === 0) {
          ctx.fillStyle = "#ffffff";
          ctx.font = "16px Arial";
          ctx.textAlign = "right";
          ctx.fillText(yard.toString(), CANVAS_WIDTH - 10, y - 5);
        }
      }

      // Draw hash marks (vertical lines at sidelines and middle)
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;

      // Sideline hashes (every 5 yards)
      for (let yard = 5; yard < FIELD_HEIGHT; yard += 5) {
        const y = yard * PIXELS_PER_YARD;
        // Left sideline hash
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(2 * PIXELS_PER_YARD, y);
        ctx.stroke();

        // Right sideline hash
        ctx.beginPath();
        ctx.moveTo(CANVAS_WIDTH - 2 * PIXELS_PER_YARD, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }

      // Draw goal lines
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, END_ZONE_DEPTH * PIXELS_PER_YARD);
      ctx.lineTo(CANVAS_WIDTH, END_ZONE_DEPTH * PIXELS_PER_YARD);
      ctx.moveTo(0, CANVAS_HEIGHT - END_ZONE_DEPTH * PIXELS_PER_YARD);
      ctx.lineTo(
        CANVAS_WIDTH,
        CANVAS_HEIGHT - END_ZONE_DEPTH * PIXELS_PER_YARD
      );
      ctx.stroke();
    },
    [CANVAS_WIDTH, CANVAS_HEIGHT, FIELD_HEIGHT, PIXELS_PER_YARD]
  );

  // Zoom level functions
  const zoomLevels = useMemo(() => [1, 2, 5, 10], []);

  const zoomIn = useCallback(() => {
    const currentIndex =
      zoomLevels.indexOf(transform.scale) !== -1
        ? zoomLevels.indexOf(transform.scale)
        : 0;
    const newIndex = Math.min(zoomLevels.length - 1, currentIndex + 1);
    setTransform((prev) => ({ ...prev, scale: zoomLevels[newIndex] }));
  }, [transform.scale]);

  const zoomOut = useCallback(() => {
    const currentIndex =
      zoomLevels.indexOf(transform.scale) !== -1
        ? zoomLevels.indexOf(transform.scale)
        : 0;
    const newIndex = Math.max(0, currentIndex - 1);
    setTransform((prev) => ({ ...prev, scale: zoomLevels[newIndex] }));
  }, [transform.scale]);

  const resetZoom = useCallback(() => {
    setTransform((prev) => ({ ...prev, scale: 1 }));
  }, []);

  // Handle wheel events for zoom (discrete levels: 1x, 2x, 5x, 10x)
  const handleWheel = useCallback(
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

  // Render loop - only render when transform changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear the entire canvas first
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Save context state
    ctx.save();

    // Apply transform
    ctx.scale(transform.scale, transform.scale);
    ctx.translate(transform.x, transform.y);

    // Draw the field
    drawField(ctx);

    // Restore context state
    ctx.restore();
  }, [transform, drawField, CANVAS_WIDTH, CANVAS_HEIGHT]);

  // Update transform to center the canvas when scale changes
  useEffect(() => {
    if (containerSize.width > 0 && containerSize.height > 0) {
      const scaledWidth = CANVAS_WIDTH * transform.scale;
      const scaledHeight = CANVAS_HEIGHT * transform.scale;

      const centerX = (containerSize.width - scaledWidth) / 2;
      const centerY = (containerSize.height - scaledHeight) / 2;

      setTransform((prev) => ({
        ...prev,
        x: centerX,
        y: centerY,
      }));
    }
  }, [transform.scale, containerSize, CANVAS_WIDTH, CANVAS_HEIGHT]);

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
      className="relative w-full h-full overflow-hidden bg-gray-900"
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="absolute inset-0 cursor-default"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: "0 0",
        }}
      />

      <svg
        ref={svgRef}
        className="absolute inset-0 pointer-events-none"
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: "0 0",
        }}
      >
        {/* SVG overlay for crisp vector elements */}
      </svg>

      {/* Zoom controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={zoomIn}
          className="w-8 h-8 bg-surface-card rounded border border-border hover:bg-surface-secondary flex items-center justify-center"
        >
          <span className="text-sm font-bold">+</span>
        </button>
        <button
          onClick={zoomOut}
          className="w-8 h-8 bg-surface-card rounded border border-border hover:bg-surface-secondary flex items-center justify-center"
        >
          <span className="text-sm font-bold">−</span>
        </button>
        <button
          onClick={resetZoom}
          className="w-8 h-8 bg-surface-card rounded border border-border hover:bg-surface-secondary flex items-center justify-center text-xs"
        >
          1:1
        </button>
      </div>

      {/* Coordinates display */}
      <div className="absolute bottom-4 left-4 bg-surface-card px-3 py-2 rounded border border-border text-sm">
        Zoom: {transform.scale}x | X: {Math.round(transform.x)}, Y:{" "}
        {Math.round(transform.y)}
      </div>
    </div>
  );
};
