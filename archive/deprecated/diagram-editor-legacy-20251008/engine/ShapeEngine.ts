import { colorTokens } from "../../../../design-system/tokens";

// Shape Engine - Professional diagramming utilities

// Define our own interfaces for the shape engine
export interface DiagramElement {
  id: string;
  type: "player" | "route" | "shape" | "text";
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  data: any;
  style?: {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
  };
}

export interface Personnel {
  id: string;
  name: string;
  position: string;
  jerseyNumber: number;
  isStarter: boolean;
}

export interface Point {
  x: number;
  y: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ShapeHandle {
  id: string;
  type: "corner" | "edge" | "rotation";
  x: number;
  y: number;
  cursor: string;
}

export interface ShapeManipulation {
  isDragging: boolean;
  dragStart: Point;
  originalBounds: Bounds;
  handle?: ShapeHandle;
  rotation?: number;
}

export interface SnapTarget {
  type: "grid" | "element" | "guide";
  position: Point;
  strength: number;
  label?: string;
}

export class ShapeEngine {
  private static readonly SNAP_THRESHOLD = 8; // pixels
  private static readonly ROTATION_HANDLE_DISTANCE = 30; // pixels from shape
  private static readonly GRID_SIZE = 5; // yards

  // Enhanced coordinate conversion with zoom support
  static fieldToCanvas(
    fieldX: number,
    fieldY: number,
    zoom: number = 1,
    panX: number = 0,
    panY: number = 0
  ): Point {
    const PIXELS_PER_YARD = 10 * zoom;
    return {
      x: fieldX * PIXELS_PER_YARD + panX,
      y: fieldY * PIXELS_PER_YARD + panY,
    };
  }

  static canvasToField(
    canvasX: number,
    canvasY: number,
    zoom: number = 1,
    panX: number = 0,
    panY: number = 0
  ): Point {
    const PIXELS_PER_YARD = 10 * zoom;
    return {
      x: (canvasX - panX) / PIXELS_PER_YARD,
      y: (canvasY - panY) / PIXELS_PER_YARD,
    };
  }

  // Enhanced snapping with multiple snap targets
  static calculateSnapTargets(
    point: Point,
    elements: DiagramElement[],
    snapToGrid: boolean = true,
    zoom: number = 1
  ): SnapTarget[] {
    const targets: SnapTarget[] = [];

    // Grid snapping
    if (snapToGrid) {
      const gridSize = this.GRID_SIZE * 10 * zoom; // Convert yards to pixels with zoom
      const snappedX = Math.round(point.x / gridSize) * gridSize;
      const snappedY = Math.round(point.y / gridSize) * gridSize;

      if (
        this.distance(point, { x: snappedX, y: point.y }) <= this.SNAP_THRESHOLD
      ) {
        targets.push({
          type: "grid",
          position: { x: snappedX, y: point.y },
          strength: 1.0,
          label: "Grid X",
        });
      }

      if (
        this.distance(point, { x: point.x, y: snappedY }) <= this.SNAP_THRESHOLD
      ) {
        targets.push({
          type: "grid",
          position: { x: point.x, y: snappedY },
          strength: 1.0,
          label: "Grid Y",
        });
      }
    }

    // Element snapping (center, corners, edges)
    for (const element of elements) {
      const bounds = this.getBounds(element);
      const center = this.getCenter(bounds);

      // Center snapping
      if (this.isNearPoint(point, center)) {
        targets.push({
          type: "element",
          position: center,
          strength: 0.9,
          label: `${element.type} center`,
        });
      }

      // Corner snapping
      const corners = this.getCorners(bounds);
      for (const corner of corners) {
        if (this.isNearPoint(point, corner)) {
          targets.push({
            type: "element",
            position: corner,
            strength: 0.8,
            label: `${element.type} corner`,
          });
        }
      }

      // Edge midpoint snapping
      const edges = this.getEdgeMidpoints(bounds);
      for (const edge of edges) {
        if (this.isNearPoint(point, edge)) {
          targets.push({
            type: "element",
            position: edge,
            strength: 0.7,
            label: `${element.type} edge`,
          });
        }
      }
    }

    return targets;
  }

  // Get best snap target
  static getBestSnapTarget(
    point: Point,
    targets: SnapTarget[]
  ): SnapTarget | null {
    if (targets.length === 0) return null;

    return targets.reduce((best, current) => {
      const bestDistance = this.distance(point, best.position);
      const currentDistance = this.distance(point, current.position);

      if (currentDistance < bestDistance) {
        return current;
      } else if (
        currentDistance === bestDistance &&
        current.strength > best.strength
      ) {
        return current;
      }
      return best;
    });
  }

  // Apply snap to point
  static applySnap(_point: Point, snapTarget: SnapTarget): Point {
    return snapTarget.position;
  }

  // Get shape handles for manipulation
  static getShapeHandles(bounds: Bounds, rotation: number = 0): ShapeHandle[] {
    const handles: ShapeHandle[] = [];
    const corners = this.getCorners(bounds);

    // Corner handles for resizing
    corners.forEach((corner, index) => {
      const cursors = ["nw-resize", "ne-resize", "se-resize", "sw-resize"];
      handles.push({
        id: `corner-${index}`,
        type: "corner",
        x: corner.x,
        y: corner.y,
        cursor: cursors[index],
      });
    });

    // Edge handles for resizing (optional, can be added later)
    const edges = this.getEdgeMidpoints(bounds);
    edges.forEach((edge, index) => {
      const cursors = ["n-resize", "e-resize", "s-resize", "w-resize"];
      handles.push({
        id: `edge-${index}`,
        type: "edge",
        x: edge.x,
        y: edge.y,
        cursor: cursors[index],
      });
    });

    // Rotation handle
    const center = this.getCenter(bounds);
    const rotationHandle = this.getRotationHandle(center, rotation);
    handles.push({
      id: "rotation",
      type: "rotation",
      x: rotationHandle.x,
      y: rotationHandle.y,
      cursor: "alias",
    });

    return handles;
  }

  // Get rotation handle position
  static getRotationHandle(center: Point, rotation: number = 0): Point {
    const angle = (rotation * Math.PI) / 180;
    return {
      x:
        center.x +
        Math.cos(angle - Math.PI / 2) * this.ROTATION_HANDLE_DISTANCE,
      y:
        center.y +
        Math.sin(angle - Math.PI / 2) * this.ROTATION_HANDLE_DISTANCE,
    };
  }

  // Get corners of bounds
  static getCorners(bounds: Bounds): Point[] {
    return [
      { x: bounds.x, y: bounds.y }, // top-left
      { x: bounds.x + bounds.width, y: bounds.y }, // top-right
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height }, // bottom-right
      { x: bounds.x, y: bounds.y + bounds.height }, // bottom-left
    ];
  }

  // Get edge midpoints
  static getEdgeMidpoints(bounds: Bounds): Point[] {
    return [
      { x: bounds.x + bounds.width / 2, y: bounds.y }, // top
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 }, // right
      { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height }, // bottom
      { x: bounds.x, y: bounds.y + bounds.height / 2 }, // left
    ];
  }

  // Check if point is over a handle
  static getHandleAtPoint(
    point: Point,
    handles: ShapeHandle[],
    threshold: number = 8
  ): ShapeHandle | null {
    for (const handle of handles) {
      if (this.distance(point, { x: handle.x, y: handle.y }) <= threshold) {
        return handle;
      }
    }
    return null;
  }

  // Calculate new bounds after handle manipulation
  static calculateResizeBounds(
    originalBounds: Bounds,
    handle: ShapeHandle,
    dragPoint: Point,
    _maintainAspectRatio: boolean = false
  ): Bounds {
    const bounds = { ...originalBounds };

    switch (handle.type) {
      case "corner": {
        const cornerIndex = parseInt(handle.id.split("-")[1]);
        switch (cornerIndex) {
          case 0: // top-left
            bounds.x = dragPoint.x;
            bounds.y = dragPoint.y;
            bounds.width =
              originalBounds.x + originalBounds.width - dragPoint.x;
            bounds.height =
              originalBounds.y + originalBounds.height - dragPoint.y;
            break;
          case 1: // top-right
            bounds.y = dragPoint.y;
            bounds.width = dragPoint.x - originalBounds.x;
            bounds.height =
              originalBounds.y + originalBounds.height - dragPoint.y;
            break;
          case 2: // bottom-right
            bounds.width = dragPoint.x - originalBounds.x;
            bounds.height = dragPoint.y - originalBounds.y;
            break;
          case 3: // bottom-left
            bounds.x = dragPoint.x;
            bounds.width =
              originalBounds.x + originalBounds.width - dragPoint.x;
            bounds.height = dragPoint.y - originalBounds.y;
            break;
        }
        break;
      }

      case "edge": {
        const edgeIndex = parseInt(handle.id.split("-")[1]);
        switch (edgeIndex) {
          case 0: // top
            bounds.y = dragPoint.y;
            bounds.height =
              originalBounds.y + originalBounds.height - dragPoint.y;
            break;
          case 1: // right
            bounds.width = dragPoint.x - originalBounds.x;
            break;
          case 2: // bottom
            bounds.height = dragPoint.y - originalBounds.y;
            break;
          case 3: // left
            bounds.x = dragPoint.x;
            bounds.width =
              originalBounds.x + originalBounds.width - dragPoint.x;
            break;
        }
        break;
      }
    }

    // Ensure minimum size
    bounds.width = Math.max(bounds.width, 10);
    bounds.height = Math.max(bounds.height, 10);

    return bounds;
  }

  // Calculate rotation from handle drag
  static calculateRotation(center: Point, dragPoint: Point): number {
    const deltaX = dragPoint.x - center.x;
    const deltaY = dragPoint.y - center.y;
    return (Math.atan2(deltaY, deltaX) * 180) / Math.PI + 90; // +90 to align with top
  }

  // Create enhanced shape elements with more options
  static createShapeElement(
    type: "rectangle" | "circle" | "arrow" | "line" | "zone",
    bounds: Bounds,
    options: {
      fill?: string;
      stroke?: string;
      strokeWidth?: number;
      rotation?: number;
      locked?: boolean;
    } = {}
  ): DiagramElement {
    const baseStyle = {
      fill: options.fill || colorTokens.emerald[500],
      stroke: options.stroke || colorTokens.emerald[600],
      strokeWidth: options.strokeWidth || 2,
    };

    return {
      id: `shape-${type}-${Date.now()}`,
      type: "shape",
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      rotation: options.rotation || 0,
      data: {
        shapeType: type,
        locked: options.locked || false,
      },
      style: baseStyle,
    };
  }

  // Create player with enhanced data
  static createPlayerElement(
    personnel: Personnel,
    position: Point,
    options: {
      size?: number;
      color?: string;
      label?: string;
    } = {}
  ): DiagramElement {
    const size = options.size || 20;

    return {
      id: `player-${personnel.id}-${Date.now()}`,
      type: "player",
      x: position.x - size / 2,
      y: position.y - size / 2,
      width: size,
      height: size,
      data: {
        personnel,
        jerseyNumber: personnel.jerseyNumber,
        position: personnel.position,
        label: options.label || personnel.jerseyNumber.toString(),
      },
      style: {
        fill: options.color || colorTokens.blue[500],
        stroke: colorTokens.blue[900],
        strokeWidth: 2,
      },
    };
  }

  // Enhanced route creation with multiple segments
  static createRouteElement(
    segments: Array<{ start: Point; end: Point; type?: "line" | "curve" }>,
    options: {
      color?: string;
      width?: number;
      arrowHead?: boolean;
    } = {}
  ): DiagramElement {
    const bounds = this.calculateRouteBounds(segments);

    return {
      id: `route-${Date.now()}`,
      type: "route",
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      data: {
        segments,
        color: options.color || colorTokens.red[500],
        width: options.width || 3,
        arrowHead: options.arrowHead || false,
      },
      style: {
        stroke: options.color || colorTokens.red[500],
        strokeWidth: options.width || 3,
      },
    };
  }

  // Calculate bounds for route segments
  static calculateRouteBounds(
    segments: Array<{ start: Point; end: Point }>
  ): Bounds {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    segments.forEach((segment) => {
      minX = Math.min(minX, segment.start.x, segment.end.x);
      minY = Math.min(minY, segment.start.y, segment.end.y);
      maxX = Math.max(maxX, segment.start.x, segment.end.x);
      maxY = Math.max(maxY, segment.start.y, segment.end.y);
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  // Utility functions (keeping existing ones)
  static distance(p1: Point, p2: Point): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  static isNearPoint(
    point: Point,
    target: Point,
    threshold: number = this.SNAP_THRESHOLD
  ): boolean {
    return this.distance(point, target) <= threshold;
  }

  static getBounds(element: DiagramElement): Bounds {
    return {
      x: element.x,
      y: element.y,
      width: element.width || 0,
      height: element.height || 0,
    };
  }

  static isPointInBounds(point: Point, bounds: Bounds): boolean {
    return (
      point.x >= bounds.x &&
      point.x <= bounds.x + bounds.width &&
      point.y >= bounds.y &&
      point.y <= bounds.y + bounds.height
    );
  }

  static getCenter(bounds: Bounds): Point {
    return {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2,
    };
  }
}
