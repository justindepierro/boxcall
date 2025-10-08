import React, { useState, useCallback, useRef } from "react";
import { useDiagramEditor } from "../context/useDiagramEditor";
import { ShapeEngine } from "../engine/ShapeEngine";
import type {
  Point,
  Bounds,
  ShapeHandle,
  SnapTarget,
} from "../engine/ShapeEngine";
import type { Shape } from "../types/types";
import { colorTokens } from "../../../../design-system/tokens";

interface ShapeManipulatorProps {
  children: React.ReactNode;
  zoom: number;
  panX: number;
  panY: number;
  snapToGrid: boolean;
  fieldWidth: number;
  fieldHeight: number;
  pixelsPerYard: number;
}

export const ShapeManipulator: React.FC<ShapeManipulatorProps> = React.memo(
  ({
    children,
    zoom,
    panX,
    panY,
    snapToGrid,
    fieldWidth,
    fieldHeight,
    pixelsPerYard,
  }) => {
    const { state, dispatch } = useDiagramEditor();
    const [selectedElements, setSelectedElements] = useState<string[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawingStartPoint, setDrawingStartPoint] = useState<Point | null>(
      null
    );
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 });
    const [originalPositions, setOriginalPositions] = useState<
      Map<string, Point>
    >(new Map());
    const [activeHandle, setActiveHandle] = useState<ShapeHandle | null>(null);
    const [snapTarget, setSnapTarget] = useState<SnapTarget | null>(null);

    // Touch gesture state
    const [touches, setTouches] = useState<Map<number, Point>>(new Map());
    const [gestureStartDistance, setGestureStartDistance] = useState<number>(0);
    const [gestureStartZoom, setGestureStartZoom] = useState<number>(1);
    const [gestureStartPan, setGestureStartPan] = useState<Point>({
      x: 0,
      y: 0,
    });
    const [cursorPosition, setCursorPosition] = useState<Point | null>(null);

    const svgRef = useRef<SVGSVGElement>(null);

    const handlePointerDown = useCallback(
      (e: React.PointerEvent) => {
        e.preventDefault();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

        // Convert client coordinates to canvas pixel coordinates
        const canvasX = e.clientX - rect.left;
        const canvasY = e.clientY - rect.top;

        // Convert canvas pixels to field yards
        const fieldYardsX = canvasX / pixelsPerYard;
        const fieldYardsY = canvasY / pixelsPerYard;

        // Convert field yards to percentage coordinates (0-100)
        const percentX = (fieldYardsX / fieldWidth) * 100;
        const percentY = (fieldYardsY / fieldHeight) * 100;

        const canvasPoint = {
          x: Math.max(0, Math.min(100, percentX)), // Clamp to 0-100
          y: Math.max(0, Math.min(100, percentY)), // Clamp to 0-100
        };

        // Handle multi-touch gestures
        if (touches.size > 0 || e.pointerType === "touch") {
          const newTouches = new Map(touches);
          newTouches.set(e.pointerId, { x: e.clientX, y: e.clientY });
          setTouches(newTouches);

          // Start pinch gesture if we have 2 touches
          if (newTouches.size === 2) {
            const touchPoints = Array.from(newTouches.values());
            const distance = Math.sqrt(
              Math.pow(touchPoints[1].x - touchPoints[0].x, 2) +
                Math.pow(touchPoints[1].y - touchPoints[0].y, 2)
            );
            setGestureStartDistance(distance);
            setGestureStartZoom(zoom);
            setGestureStartPan({ x: panX, y: panY });
            return;
          }
        }

        // Handle drawing tool interactions
        if (state.ui.tool === "draw") {
          if (state.ui.annotating) {
            // Continue drawing - add point
            if (state.ui.annotating.freehand) {
              dispatch({ type: "ADD_FREEHAND_POINT", point: canvasPoint });
            } else {
              dispatch({ type: "ADD_ANNOTATION_POINT", point: canvasPoint });
            }
          } else {
            // Start new drawing
            const drawType = state.ui.drawMode || "line";
            dispatch({
              type: "START_ANNOTATION",
              drawType,
              start: canvasPoint,
            });
          }
          return;
        }

        // Handle add player tool
        if (state.ui.tool === "add-player") {
          const newPlayer = {
            id: `player_${Date.now()}`,
            label: "P",
            role: "Player",
            side: "O" as const,
            x: canvasPoint.x,
            y: canvasPoint.y,
            color: colorTokens.emerald[700],
          };
          dispatch({ type: "ADD_PLAYER", player: newPlayer });
          return;
        }

        // Handle selection/manipulation interactions (existing logic)
        // Check if clicking on a handle first
        if (selectedElements.length === 1) {
          const element = state.doc.players.find(
            (p) => p.id === selectedElements[0]
          );
          if (element) {
            const bounds: Bounds = {
              x: element.x,
              y: element.y,
              width: 20, // Default player size
              height: 20,
            };
            const handles = ShapeEngine.getShapeHandles(
              bounds,
              element.locked ? 0 : 0
            );
            const handle = ShapeEngine.getHandleAtPoint(canvasPoint, handles);
            if (handle) {
              setActiveHandle(handle);
              setDragStart(canvasPoint);
              setIsDragging(true);
              return;
            }
          }
        }

        // Check if clicking on an element
        const clickedElement = state.doc.players.find((player) => {
          const bounds: Bounds = {
            x: player.x,
            y: player.y,
            width: 20,
            height: 20,
          };
          return ShapeEngine.isPointInBounds(canvasPoint, bounds);
        });

        if (clickedElement) {
          // Multi-select with shift/ctrl (or two-finger touch)
          if (e.shiftKey || e.ctrlKey || touches.size > 1) {
            setSelectedElements((prev) =>
              prev.includes(clickedElement.id)
                ? prev.filter((id) => id !== clickedElement.id)
                : [...prev, clickedElement.id]
            );
          } else {
            setSelectedElements([clickedElement.id]);
          }

          // Start dragging
          setIsDragging(true);
          setDragStart(canvasPoint);
          setOriginalPositions(
            new Map(
              selectedElements.map((id) => {
                const player = state.doc.players.find((p) => p.id === id);
                return player
                  ? [id, { x: player.x, y: player.y }]
                  : [id, { x: 0, y: 0 }];
              })
            )
          );
        } else {
          // Clear selection
          setSelectedElements([]);
        }
      },
      [
        state.doc.players,
        selectedElements,
        zoom,
        panX,
        panY,
        state.ui.tool,
        state.ui.annotating,
        state.ui.drawMode,
        dispatch,
        touches,
        fieldWidth,
        fieldHeight,
        pixelsPerYard,
      ]
    );

    const handlePointerMove = useCallback(
      (e: React.PointerEvent) => {
        e.preventDefault();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

        // Convert client coordinates to canvas pixel coordinates
        const canvasX = e.clientX - rect.left;
        const canvasY = e.clientY - rect.top;

        // Convert canvas pixels to field yards
        const fieldYardsX = canvasX / pixelsPerYard;
        const fieldYardsY = canvasY / pixelsPerYard;

        // Convert field yards to percentage coordinates (0-100)
        const percentX = (fieldYardsX / fieldWidth) * 100;
        const percentY = (fieldYardsY / fieldHeight) * 100;

        const canvasPoint = {
          x: Math.max(0, Math.min(100, percentX)), // Clamp to 0-100
          y: Math.max(0, Math.min(100, percentY)), // Clamp to 0-100
        };

        // Update cursor position for preview rendering
        setCursorPosition(canvasPoint);

        if (isDrawing && drawingStartPoint) {
          // Drawing logic will be handled in handlePointerUp for simplicity
          return;
        }

        // Handle multi-touch gestures
        if (touches.size >= 2) {
          const newTouches = new Map(touches);
          if (newTouches.has(e.pointerId)) {
            newTouches.set(e.pointerId, { x: e.clientX, y: e.clientY });
            setTouches(newTouches);

            const touchPoints = Array.from(newTouches.values());
            if (touchPoints.length >= 2) {
              // Calculate pinch-to-zoom
              const distance = Math.sqrt(
                Math.pow(touchPoints[1].x - touchPoints[0].x, 2) +
                  Math.pow(touchPoints[1].y - touchPoints[0].y, 2)
              );
              const scale = distance / gestureStartDistance;
              const newZoom = Math.max(
                0.1,
                Math.min(5, gestureStartZoom * scale)
              );

              // Calculate pan from gesture center
              const centerX = (touchPoints[0].x + touchPoints[1].x) / 2;
              const centerY = (touchPoints[0].y + touchPoints[1].y) / 2;
              const newPanX = centerX - (centerX - gestureStartPan.x) * scale;
              const newPanY = centerY - (centerY - gestureStartPan.y) * scale;

              // For now, just log the gesture - zoom/pan actions need to be implemented
              console.log("Pinch gesture:", { newZoom, newPanX, newPanY });
            }
          }
          return;
        }

        // Handle drawing preview
        if (state.ui.tool === "draw" && state.ui.annotating) {
          dispatch({ type: "PREVIEW_ANNOTATION", point: canvasPoint });
          return;
        }

        if (!isDragging) return;

        if (activeHandle && selectedElements.length === 1) {
          // Handle manipulation
          const element = state.doc.players.find(
            (p) => p.id === selectedElements[0]
          );
          if (element) {
            const bounds: Bounds = {
              x: element.x,
              y: element.y,
              width: 20,
              height: 20,
            };

            if (activeHandle.type === "rotation") {
              const center = ShapeEngine.getCenter(bounds);
              const rotation = ShapeEngine.calculateRotation(
                center,
                canvasPoint
              );
              // Update element rotation (would need to add rotation to player type)
              console.log("Rotation:", rotation);
            } else {
              // Resize
              const newBounds = ShapeEngine.calculateResizeBounds(
                bounds,
                activeHandle,
                canvasPoint
              );
              // Update element bounds
              console.log("New bounds:", newBounds);
            }
          }
        } else {
          // Element dragging with snapping
          const deltaX = canvasPoint.x - dragStart.x;
          const deltaY = canvasPoint.y - dragStart.y;

          // Calculate snap targets for all selected elements
          const allElements = state.doc.players
            .filter((p) => !selectedElements.includes(p.id))
            .map((player) => ({
              id: player.id,
              type: "player" as const,
              x: player.x,
              y: player.y,
              width: 20,
              height: 20,
              data: { personnel: player },
              style: { fill: player.color || colorTokens.blue[500] },
            }));

          let bestSnapTarget: SnapTarget | null = null;
          let bestDistance = Infinity;

          selectedElements.forEach((elementId) => {
            const originalPos = originalPositions.get(elementId);
            if (originalPos) {
              const newPos = {
                x: originalPos.x + deltaX,
                y: originalPos.y + deltaY,
              };
              const snapTargets = ShapeEngine.calculateSnapTargets(
                newPos,
                allElements.filter((el) => el.id !== elementId),
                snapToGrid,
                zoom
              );

              snapTargets.forEach((target) => {
                const distance = ShapeEngine.distance(newPos, target.position);
                if (distance < bestDistance) {
                  bestDistance = distance;
                  bestSnapTarget = target;
                }
              });
            }
          });

          setSnapTarget(bestSnapTarget);
        }
      },
      [
        isDragging,
        activeHandle,
        selectedElements,
        dragStart,
        originalPositions,
        state.doc.players,
        snapToGrid,
        zoom,
        state.ui.tool,
        state.ui.annotating,
        dispatch,
        touches,
        gestureStartDistance,
        gestureStartZoom,
        gestureStartPan,
        fieldWidth,
        fieldHeight,
        drawingStartPoint,
        isDrawing,
        pixelsPerYard,
      ]
    );

    const handlePointerUp = useCallback(
      (e: React.PointerEvent) => {
        if (isDrawing && drawingStartPoint) {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const canvasX = e.clientX - rect.left;
          const canvasY = e.clientY - rect.top;
          const fieldYardsX = canvasX / pixelsPerYard;
          const fieldYardsY = canvasY / pixelsPerYard;
          const percentX = (fieldYardsX / fieldWidth) * 100;
          const percentY = (fieldYardsY / fieldHeight) * 100;
          const endPoint = {
            x: Math.max(0, Math.min(100, percentX)),
            y: Math.max(0, Math.min(100, percentY)),
          };

          const newShape: Shape = {
            id: `shape-${Date.now()}`,
            type: state.ui.drawMode as
              | "line"
              | "arrow"
              | "freehand"
              | "zone"
              | "curve",
            points: [drawingStartPoint, endPoint],
            color: state.ui.drawColor || "#000000",
            width: state.ui.drawWidth || 2,
          };

          dispatch({ type: "ADD_SHAPE", shape: newShape });

          setIsDrawing(false);
          setDrawingStartPoint(null);
        }

        // Handle multi-touch gesture end
        const newTouches = new Map(touches);
        newTouches.delete(e.pointerId);
        setTouches(newTouches);

        // Reset gesture state when no touches remain
        if (newTouches.size === 0) {
          setGestureStartDistance(0);
          setGestureStartZoom(1);
          setGestureStartPan({ x: 0, y: 0 });
        }

        // Handle drawing completion
        if (state.ui.tool === "draw" && state.ui.annotating) {
          const annotating = state.ui.annotating;

          // Commit based on drawing type and points collected
          if (annotating.type === "freehand") {
            // Freehand commits on pointer up
            dispatch({ type: "COMMIT_ANNOTATION" });
          } else if (
            annotating.type === "line" ||
            annotating.type === "arrow"
          ) {
            // Line and arrow need exactly 2 points
            if (annotating.points.length >= 2) {
              dispatch({ type: "COMMIT_ANNOTATION" });
            }
          } else if (annotating.type === "curve") {
            // Curve needs at least 3 points (start, control, end)
            if (annotating.points.length >= 3) {
              dispatch({ type: "COMMIT_ANNOTATION" });
            }
          } else if (annotating.type === "zone") {
            // Zone needs at least 3 points to form a shape
            if (annotating.points.length >= 3) {
              dispatch({ type: "COMMIT_ANNOTATION" });
            }
          }
          return;
        }

        if (isDragging && snapTarget) {
          // Apply snap to selected elements
          selectedElements.forEach((elementId) => {
            const originalPos = originalPositions.get(elementId);
            if (originalPos) {
              // Update element position
              dispatch({
                type: "MOVE_PLAYER",
                id: elementId,
                x: snapTarget.position.x,
                y: snapTarget.position.y,
              });
            }
          });
        }

        setIsDragging(false);
        setActiveHandle(null);
        setSnapTarget(null);
      },
      [
        isDrawing,
        drawingStartPoint,
        touches,
        snapTarget,
        selectedElements,
        originalPositions,
        dispatch,
        state.ui.tool,
        state.ui.annotating,
        fieldHeight,
        fieldWidth,
        isDragging,
        pixelsPerYard,
        state.ui.drawColor,
        state.ui.drawMode,
        state.ui.drawWidth,
      ]
    );

    // Render selection handles
    const renderSelectionHandles = () => {
      if (selectedElements.length === 0) return null;

      return selectedElements.map((elementId) => {
        const element = state.doc.players.find((p) => p.id === elementId);
        if (!element) return null;

        const bounds: Bounds = {
          x: element.x,
          y: element.y,
          width: 20,
          height: 20,
        };

        const handles = ShapeEngine.getShapeHandles(bounds);

        return (
          <g key={`handles-${elementId}`}>
            {/* Selection outline */}
            <rect
              x={bounds.x - 2}
              y={bounds.y - 2}
              width={bounds.width + 4}
              height={bounds.height + 4}
              fill="none"
              stroke={colorTokens.blue[500]}
              strokeWidth={1}
              strokeDasharray="5,5"
            />

            {/* Handles */}
            {handles.map((handle) => (
              <circle
                key={handle.id}
                cx={handle.x}
                cy={handle.y}
                r={handle.type === "rotation" ? 6 : 4}
                fill={
                  handle.type === "rotation" ? colorTokens.blue[500] : "#ffffff"
                }
                stroke={colorTokens.blue[500]}
                strokeWidth={2}
                style={{ cursor: handle.cursor }}
              />
            ))}
          </g>
        );
      });
    };

    // Render snap target indicator
    const renderSnapIndicator = () => {
      if (!snapTarget) return null;

      return (
        <g>
          <circle
            cx={snapTarget.position.x}
            cy={snapTarget.position.y}
            r={6}
            fill={colorTokens.amber[500]}
            opacity={0.8}
          />
          <text
            x={snapTarget.position.x + 10}
            y={snapTarget.position.y - 5}
            fill={colorTokens.amber[500]}
            fontSize="12"
            fontWeight="bold"
          >
            {snapTarget.label}
          </text>
        </g>
      );
    };

    // Render shape preview at cursor when add-player tool is active
    const renderShapePreview = () => {
      if (state.ui.tool !== "add-player" || !cursorPosition || isDragging) {
        return null;
      }

      const playerShape = state.ui.playerShape || "oval";
      // Realistic player size: 2 yards diameter on a 53.333 yard field
      // Convert to pixels
      const playerDiameterYards = 2;
      const sizeInPixels = playerDiameterYards * pixelsPerYard;
      
      // Convert percentage coordinates to pixel coordinates
      const xPixels = (cursorPosition.x / 100) * fieldWidth * pixelsPerYard;
      const yPixels = (cursorPosition.y / 100) * fieldHeight * pixelsPerYard;
      
      const color = state.ui.drawColor || "#6366F1"; // brand-primary fallback

      switch (playerShape) {
        case "oval":
          return (
            <ellipse
              cx={xPixels}
              cy={yPixels}
              rx={sizeInPixels / 2}
              ry={sizeInPixels / 2}
              fill={color}
              opacity={0.6}
              stroke="#334155"
              strokeWidth={2}
            />
          );
        case "rectangle":
          return (
            <rect
              x={xPixels - sizeInPixels / 2}
              y={yPixels - sizeInPixels / 2}
              width={sizeInPixels}
              height={sizeInPixels}
              fill={color}
              opacity={0.6}
              stroke="#334155"
              strokeWidth={2}
            />
          );
        case "triangle": {
          const h = sizeInPixels * 0.866; // height for equilateral triangle
          const w = sizeInPixels / 2;
          return (
            <polygon
              points={`${xPixels},${yPixels - h/2} ${xPixels - w},${yPixels + h/2} ${xPixels + w},${yPixels + h/2}`}
              fill={color}
              opacity={0.6}
              stroke="#334155"
              strokeWidth={2}
            />
          );
        }
        default:
          return null;
      }
    };

    // Get cursor style based on current tool
    const getCursorStyle = () => {
      switch (state.ui.tool) {
        case "select":
          return "default";
        case "pan":
          return isDragging ? "grabbing" : "grab";
        case "add-player":
          return "none"; // We'll show custom preview
        case "draw":
          return "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"black\" stroke-width=\"2\"><path d=\"M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z\"/></svg>') 0 16, crosshair";
        case "route":
          return "crosshair";
        default:
          return "default";
      }
    };

    return (
      <div
        className="relative w-full h-full"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ 
          touchAction: "none",
          cursor: getCursorStyle(),
        }}
      >
        {children}

        {/* SVG Overlay for handles and indicators - NO TRANSFORM so coordinates match canvas */}
        <svg
          ref={svgRef}
          className="absolute inset-0 pointer-events-none"
          width={fieldWidth * pixelsPerYard}
          height={fieldHeight * pixelsPerYard}
          viewBox={`0 0 ${fieldWidth * pixelsPerYard} ${fieldHeight * pixelsPerYard}`}
          style={{
            width: '100%',
            height: '100%',
          }}
        >
          {renderSelectionHandles()}
          {renderSnapIndicator()}
          {renderShapePreview()}
        </svg>
      </div>
    );
  }
);
