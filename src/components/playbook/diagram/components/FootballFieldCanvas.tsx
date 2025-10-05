import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useContext } from "react";
import { DiagramEditorContext } from "../context/DiagramEditorContext";
import { colorTokens } from "../../../../design-system/tokens";

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
  const { state, dispatch: _dispatch } = useContext(DiagramEditorContext);

  const [transform, setTransform] = useState<CanvasTransform>({
    x: 0,
    y: 0,
    scale: 1,
  });

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });

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

  // Hash marks are 17.7 yards apart (8.85 yards from center to each hash)
  const HASH_MARK_SPACING = 17.7; // yards between hash marks
  const YARD_NUMBER_OFFSET = 9; // yards from sideline to top of yard numbers
  const FIELD_PADDING = 40; // pixels of padding around the field

  // Convert field coordinates to canvas coordinates
  // fieldX: 0 to FIELD_WIDTH (width of field, left to right)
  // fieldY: 0 to FIELD_HEIGHT (length of field, top to bottom)
  // @ts-expect-error - Utility function for future canvas interactions
  const _fieldToCanvas = useCallback(
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
  // @ts-expect-error - Utility function for future canvas interactions
  const _canvasToField = useCallback(
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
    (
      ctx: CanvasRenderingContext2D,
      displayWidth: number,
      displayHeight: number
    ) => {
      // Clear entire canvas with background color
      ctx.fillStyle = "#ECFDF5"; // jade-50 - very light green from design system
      ctx.fillRect(0, 0, displayWidth, displayHeight);

      // Calculate field area with padding
      const fieldWidth = displayWidth - FIELD_PADDING * 2;
      const fieldHeight = displayHeight - FIELD_PADDING * 2;
      const fieldX = FIELD_PADDING;
      const fieldY = FIELD_PADDING;

      // Fill field area with green
      ctx.fillStyle = colorTokens.emerald[50]; // Very light green background
      ctx.fillRect(fieldX, fieldY, fieldWidth, fieldHeight);

      // Calculate pixels per yard based on field size to fit field properly
      const pixelsPerYard = Math.min(
        fieldWidth / FIELD_WIDTH,
        fieldHeight / FIELD_HEIGHT
      );

      // Draw yard lines and hash marks (horizontal lines across the field)
      ctx.strokeStyle = colorTokens.emerald[200]; // Field lines
      ctx.lineWidth = 2;
      ctx.setLineDash([]);

      for (let yard = 0; yard <= FIELD_HEIGHT; yard += 1) {
        const y = fieldY + yard * pixelsPerYard;
        const isMajorYardLine = yard % 5 === 0;
        const isYardLine = yard % 1 === 0;

        if (isMajorYardLine) {
          // Major yard lines (every 5 yards) - full width
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(fieldX, y);
          ctx.lineTo(fieldX + fieldWidth, y);
          ctx.stroke();

          // Yard numbers (simple numbering from 0 to 35)
          if (yard > 0 && yard < FIELD_HEIGHT && yard % 10 === 0) {
            ctx.fillStyle = colorTokens.emerald[200]; // Yard numbers
            ctx.font = "bold 14px Arial";
            ctx.textAlign = "left";
            ctx.fillText(
              yard.toString(),
              fieldX + YARD_NUMBER_OFFSET * pixelsPerYard,
              y - 5
            ); // 9 yards from left sideline
            ctx.textAlign = "right";
            ctx.fillText(
              yard.toString(),
              fieldX + fieldWidth - YARD_NUMBER_OFFSET * pixelsPerYard,
              y - 5
            ); // 9 yards from right sideline
          }
        } else if (isYardLine) {
          // Minor yard lines (every yard) - hash marks only
          ctx.lineWidth = 1;
          const hashLength = 8; // 8 pixels for hash marks
          // Hash marks are 17.7 yards apart (8.85 yards from center to each hash)
          const hashOffsetFromCenter = HASH_MARK_SPACING / 2; // 8.85 yards from center
          const leftHashStart =
            fieldX + fieldWidth / 2 - hashOffsetFromCenter * pixelsPerYard;
          const rightHashStart =
            fieldX + fieldWidth / 2 + hashOffsetFromCenter * pixelsPerYard;

          // Left hash marks
          ctx.beginPath();
          ctx.moveTo(leftHashStart, y);
          ctx.lineTo(leftHashStart + hashLength, y);
          ctx.stroke();

          // Right hash marks
          ctx.beginPath();
          ctx.moveTo(rightHashStart - hashLength, y);
          ctx.lineTo(rightHashStart, y);
          ctx.stroke();
        }
      }

      // Draw goal lines
      ctx.strokeStyle = colorTokens.emerald[200]; // Goal lines
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(fieldX, fieldY);
      ctx.lineTo(fieldX + fieldWidth, fieldY);
      ctx.moveTo(fieldX, fieldY + fieldHeight);
      ctx.lineTo(fieldX + fieldWidth, fieldY + fieldHeight);
      ctx.stroke();
    },
    [
      FIELD_WIDTH,
      FIELD_HEIGHT,
      HASH_MARK_SPACING,
      YARD_NUMBER_OFFSET,
      FIELD_PADDING,
    ]
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

  // Render loop - only render when transform changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Get the actual canvas dimensions (set by CSS)
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    // Update display size state
    setDisplaySize({ width: displayWidth, height: displayHeight });

    // Set the canvas internal resolution to match display size for crisp rendering
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }

    // Clear the entire canvas first
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    // Save context state
    ctx.save();

    // Apply transform
    ctx.scale(transform.scale, transform.scale);
    ctx.translate(transform.x, transform.y);

    // Draw the field scaled to fit the canvas
    drawField(ctx, displayWidth, displayHeight);

    // Restore context state
    ctx.restore();
  }, [transform, drawField]);

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
      className="relative w-full h-full overflow-hidden bg-gray-900"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-default"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: "0 0",
        }}
      />

      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: "0 0",
        }}
      >
        {/* Player circles and labels */}
        {state.doc.players.map((player) => {
          // Convert percentage coordinates to field coordinates
          const fieldX = (player.x / 100) * FIELD_WIDTH;
          const fieldY = (player.y / 100) * FIELD_HEIGHT - 2; // Shift up 2 yards

          // Convert field coordinates to canvas coordinates
          const canvasX = fieldX * (displaySize.width / FIELD_WIDTH);
          const canvasY = fieldY * (displaySize.height / FIELD_HEIGHT);

          return (
            <g key={player.id}>
              {/* Player oval */}
              <ellipse
                cx={canvasX}
                cy={canvasY}
                rx="10"
                ry="8"
                fill={colorTokens.blue[300]}
                stroke={colorTokens.blue[500]}
                strokeWidth="2"
              />
              {/* Player label */}
              <text
                x={canvasX}
                y={canvasY + 4}
                textAnchor="middle"
                fontSize="12"
                fontWeight="bold"
                fill={colorTokens.blue[900]}
              >
                {player.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Zoom controls */}
      <div className="absolute top-4 right-6 flex flex-col gap-2 p-2 bg-surface-card/80 backdrop-blur-sm rounded-lg shadow-lg">
        <button
          onClick={zoomIn}
          className="w-8 h-8 bg-surface-secondary hover:bg-surface-tertiary rounded flex items-center justify-center transition-colors"
        >
          <span className="text-sm font-bold">+</span>
        </button>
        <button
          onClick={zoomOut}
          className="w-8 h-8 bg-surface-secondary hover:bg-surface-tertiary rounded flex items-center justify-center transition-colors"
        >
          <span className="text-sm font-bold">−</span>
        </button>
        <button
          onClick={resetZoom}
          className="w-8 h-8 bg-surface-secondary hover:bg-surface-tertiary rounded flex items-center justify-center text-xs transition-colors"
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
