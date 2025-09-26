import React, { useState, useCallback, useRef } from "react";
import { useDiagramEditor } from "../context/useDiagramEditor";
import { ShapeEngine } from "../engine/ShapeEngine";
import type {
  Point,
  Bounds,
  ShapeHandle,
  SnapTarget,
} from "../engine/ShapeEngine";

interface ShapeManipulatorProps {
  children: React.ReactNode;
  zoom: number;
  panX: number;
  panY: number;
  snapToGrid: boolean;
}

export const ShapeManipulator: React.FC<ShapeManipulatorProps> = ({
  children,
  zoom,
  panX,
  panY,
  snapToGrid,
}) => {
  const { state, dispatch } = useDiagramEditor();
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 });
  const [originalPositions, setOriginalPositions] = useState<
    Map<string, Point>
  >(new Map());
  const [activeHandle, setActiveHandle] = useState<ShapeHandle | null>(null);
  const [snapTarget, setSnapTarget] = useState<SnapTarget | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);

  // Handle mouse down on canvas
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const canvasPoint = {
        x: (e.clientX - rect.left - panX) / zoom,
        y: (e.clientY - rect.top - panY) / zoom,
      };

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
          color: "#047857",
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
        // Multi-select with shift/ctrl
        if (e.shiftKey || e.ctrlKey) {
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
    ]
  );

  // Handle mouse move
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const canvasPoint = {
        x: (e.clientX - rect.left - panX) / zoom,
        y: (e.clientY - rect.top - panY) / zoom,
      };

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
            const rotation = ShapeEngine.calculateRotation(center, canvasPoint);
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
            style: { fill: player.color || "#3b82f6" },
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
      panX,
      panY,
      state.ui.tool,
      state.ui.annotating,
      dispatch,
    ]
  );

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    // Handle drawing completion
    if (state.ui.tool === "draw" && state.ui.annotating) {
      // For freehand, we might want to commit on mouse up
      // For other tools, commit on click or after multiple points
      if (state.ui.annotating.type === "freehand") {
        dispatch({ type: "COMMIT_ANNOTATION" });
      }
      // For other drawing types, we might need additional logic
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
  }, [
    isDragging,
    snapTarget,
    selectedElements,
    originalPositions,
    dispatch,
    state.ui.tool,
    state.ui.annotating,
  ]);

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
            stroke="#007acc"
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
              fill={handle.type === "rotation" ? "#007acc" : "#ffffff"}
              stroke="#007acc"
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
          fill="#ff6b35"
          opacity={0.8}
        />
        <text
          x={snapTarget.position.x + 10}
          y={snapTarget.position.y - 5}
          fill="#ff6b35"
          fontSize="12"
          fontWeight="bold"
        >
          {snapTarget.label}
        </text>
      </g>
    );
  };

  return (
    <div
      className="relative w-full h-full"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {children}

      {/* SVG Overlay for handles and indicators */}
      <svg
        ref={svgRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {renderSelectionHandles()}
        {renderSnapIndicator()}
      </svg>
    </div>
  );
};
