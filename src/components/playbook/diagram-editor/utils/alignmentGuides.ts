/**
 * Alignment Guides System
 *
 * Provides Google Slides-style alignment guides with 25-point grid snapping (5x5).
 * Each player has 25 snap points at: 0%, 25%, 50%, 75%, 100% positions.
 */

export interface SnapPoint {
  x: number;
  y: number;
  type: "corner" | "edge" | "center";
  label: string;
}

export interface AlignmentGuide {
  type: "vertical" | "horizontal";
  position: number; // x for vertical, y for horizontal
  color: number; // Pixi color
  snapPoints: string[]; // IDs of players that align to this guide
}

export interface SnapResult {
  x: number;
  y: number;
  snappedX: boolean;
  snappedY: boolean;
  guides: AlignmentGuide[];
}

/**
 * Calculate the snap points for a circular player sprite
 *
 * Points layout (5x5 grid):
 * 1---2---3---4---5   (top: 0%, 25%, 50%, 75%, 100%)
 * |   |   |   |   |
 * 6---7---8---9--10   (upper-mid: 25%)
 * |   |   |   |   |
 * 11--12--13--14-15   (middle: 50%)
 * |   |   |   |   |
 * 16--17--18--19-20   (lower-mid: 75%)
 * |   |   |   |   |
 * 21--22--23--24-25   (bottom: 100%)
 */
export function calculateSnapPoints(
  x: number,
  y: number,
  radius: number
): SnapPoint[] {
  const points: SnapPoint[] = [];

  // Vertical positions: 0%, 25%, 50%, 75%, 100%
  const positions = [
    { offset: -radius, label: "top" }, // 0%
    { offset: -radius * 0.5, label: "upper" }, // 25%
    { offset: 0, label: "middle" }, // 50%
    { offset: radius * 0.5, label: "lower" }, // 75%
    { offset: radius, label: "bottom" }, // 100%
  ];

  // Horizontal positions: 0%, 25%, 50%, 75%, 100%
  const hPositions = [
    { offset: -radius, label: "left" }, // 0%
    { offset: -radius * 0.5, label: "left-mid" }, // 25%
    { offset: 0, label: "center" }, // 50%
    { offset: radius * 0.5, label: "right-mid" }, // 75%
    { offset: radius, label: "right" }, // 100%
  ];

  // Generate 5x5 grid (25 points total)
  for (const vPos of positions) {
    for (const hPos of hPositions) {
      const pointY = y + vPos.offset;
      const pointX = x + hPos.offset;

      // Determine point type
      let type: "corner" | "edge" | "center";
      if (vPos.label === "middle" && hPos.label === "center") {
        type = "center";
      } else if (
        (vPos.label === "top" || vPos.label === "bottom") &&
        (hPos.label === "left" || hPos.label === "right")
      ) {
        type = "corner";
      } else {
        type = "edge";
      }

      points.push({
        x: pointX,
        y: pointY,
        type,
        label: `${vPos.label}-${hPos.label}`,
      });
    }
  }

  return points;
}

/**
 * Find alignment guides for a dragged player
 * Checks all 25 snap points (5x5 grid) against all other players' snap points
 * Uses weighted snapping for smooth, non-sticky behavior
 */
export function findAlignmentGuides(
  draggedPlayerId: string,
  draggedX: number,
  draggedY: number,
  draggedRadius: number,
  otherPlayers: Array<{ id: string; x: number; y: number; radius: number }>,
  snapThreshold: number = 0.05 // yards - very small for minimal stickiness
): SnapResult {
  const guides: AlignmentGuide[] = [];
  let snappedX = draggedX;
  let snappedY = draggedY;
  let closestXDiff = Infinity;
  let closestYDiff = Infinity;
  let closestXAlign = draggedX;
  let closestYAlign = draggedY;

  // Calculate snap points for dragged player
  const draggedPoints = calculateSnapPoints(draggedX, draggedY, draggedRadius);

  // Track which coordinates have alignments
  const verticalAlignments = new Map<number, string[]>(); // x -> player IDs
  const horizontalAlignments = new Map<number, string[]>(); // y -> player IDs

  // Check each other player
  for (const other of otherPlayers) {
    if (other.id === draggedPlayerId) continue;

    const otherPoints = calculateSnapPoints(other.x, other.y, other.radius);

    // Check each dragged point against each other point
    for (const dragPoint of draggedPoints) {
      for (const otherPoint of otherPoints) {
        // Check vertical alignment (same X)
        const xDiff = Math.abs(dragPoint.x - otherPoint.x);
        if (xDiff < snapThreshold && xDiff < closestXDiff) {
          closestXDiff = xDiff;
          closestXAlign = otherPoint.x;
          const offset = closestXAlign - dragPoint.x;
          snappedX = draggedX + offset;

          if (!verticalAlignments.has(closestXAlign)) {
            verticalAlignments.set(closestXAlign, []);
          }
          if (!verticalAlignments.get(closestXAlign)!.includes(other.id)) {
            verticalAlignments.get(closestXAlign)!.push(other.id);
          }
        }

        // Check horizontal alignment (same Y)
        const yDiff = Math.abs(dragPoint.y - otherPoint.y);
        if (yDiff < snapThreshold && yDiff < closestYDiff) {
          closestYDiff = yDiff;
          closestYAlign = otherPoint.y;
          const offset = closestYAlign - dragPoint.y;
          snappedY = draggedY + offset;

          if (!horizontalAlignments.has(closestYAlign)) {
            horizontalAlignments.set(closestYAlign, []);
          }
          if (!horizontalAlignments.get(closestYAlign)!.includes(other.id)) {
            horizontalAlignments.get(closestYAlign)!.push(other.id);
          }
        }
      }
    }
  }

  // Create guide objects for vertical alignments
  verticalAlignments.forEach((playerIds, x) => {
    guides.push({
      type: "vertical",
      position: x,
      color: 0xff00ff, // Magenta
      snapPoints: playerIds,
    });
  });

  // Create guide objects for horizontal alignments
  horizontalAlignments.forEach((playerIds, y) => {
    guides.push({
      type: "horizontal",
      position: y,
      color: 0xff00ff, // Magenta
      snapPoints: playerIds,
    });
  });

  // EQUAL SPACING DETECTION
  // Check if dragged player creates equal spacing with other players
  const equalSpacingGuides = detectEqualSpacingGuides(
    { id: draggedPlayerId, x: snappedX, y: snappedY, radius: draggedRadius },
    otherPlayers,
    0.5 // 0.5 yard threshold for equal spacing detection
  );
  guides.push(...equalSpacingGuides);

  return {
    x: snappedX,
    y: snappedY,
    snappedX: closestXDiff < snapThreshold,
    snappedY: closestYDiff < snapThreshold,
    guides,
  };
}

/**
 * Detect equal spacing patterns and create visual guides
 * Shows when a dragged player creates equal spacing with 2+ other players
 */
function detectEqualSpacingGuides(
  draggedPlayer: { id: string; x: number; y: number; radius: number },
  otherPlayers: Array<{ id: string; x: number; y: number; radius: number }>,
  threshold: number = 0.5
): AlignmentGuide[] {
  const guides: AlignmentGuide[] = [];

  // HORIZONTAL EQUAL SPACING (players in a horizontal line with equal X gaps)
  // Find players on roughly the same Y level (within 2 yards)
  const horizontalRow = otherPlayers.filter(
    (p) => Math.abs(p.y - draggedPlayer.y) < 2.0
  );

  if (horizontalRow.length >= 2) {
    // Include dragged player in the analysis
    const allHorizontal = [...horizontalRow, draggedPlayer].sort(
      (a, b) => a.x - b.x
    );

    // Calculate spacing between consecutive players
    const spacings: number[] = [];
    for (let i = 1; i < allHorizontal.length; i++) {
      spacings.push(allHorizontal[i].x - allHorizontal[i - 1].x);
    }

    // Check if spacings are equal (within threshold)
    if (spacings.length >= 2) {
      const avgSpacing =
        spacings.reduce((sum, s) => sum + s, 0) / spacings.length;
      const allEqual = spacings.every(
        (s) => Math.abs(s - avgSpacing) <= threshold
      );

      if (allEqual) {
        // Draw spacing indicators between each pair
        for (let i = 1; i < allHorizontal.length; i++) {
          const leftPlayer = allHorizontal[i - 1];
          const rightPlayer = allHorizontal[i];
          const midY = (leftPlayer.y + rightPlayer.y) / 2;

          // Create a horizontal guide at the midpoint to show equal spacing
          guides.push({
            type: "horizontal",
            position: midY,
            color: 0x00ff00, // Green for equal spacing
            snapPoints: [leftPlayer.id, rightPlayer.id],
          });
        }
      }
    }
  }

  // VERTICAL EQUAL SPACING (players in a vertical line with equal Y gaps)
  // Find players on roughly the same X level (within 2 yards)
  const verticalColumn = otherPlayers.filter(
    (p) => Math.abs(p.x - draggedPlayer.x) < 2.0
  );

  if (verticalColumn.length >= 2) {
    // Include dragged player in the analysis
    const allVertical = [...verticalColumn, draggedPlayer].sort(
      (a, b) => a.y - b.y
    );

    // Calculate spacing between consecutive players
    const spacings: number[] = [];
    for (let i = 1; i < allVertical.length; i++) {
      spacings.push(allVertical[i].y - allVertical[i - 1].y);
    }

    // Check if spacings are equal (within threshold)
    if (spacings.length >= 2) {
      const avgSpacing =
        spacings.reduce((sum, s) => sum + s, 0) / spacings.length;
      const allEqual = spacings.every(
        (s) => Math.abs(s - avgSpacing) <= threshold
      );

      if (allEqual) {
        // Draw spacing indicators between each pair
        for (let i = 1; i < allVertical.length; i++) {
          const topPlayer = allVertical[i - 1];
          const bottomPlayer = allVertical[i];
          const midX = (topPlayer.x + bottomPlayer.x) / 2;

          // Create a vertical guide at the midpoint to show equal spacing
          guides.push({
            type: "vertical",
            position: midX,
            color: 0x00ff00, // Green for equal spacing
            snapPoints: [topPlayer.id, bottomPlayer.id],
          });
        }
      }
    }
  }

  return guides;
}
/**
 * Detect equal spacing between 3 or more players (for distribution guides)
 * Returns spacing guides if players are evenly distributed
 */
export function detectEqualSpacing(
  players: Array<{ id: string; x: number; y: number }>,
  threshold: number = 0.3 // yards tolerance
): AlignmentGuide[] {
  const guides: AlignmentGuide[] = [];

  if (players.length < 3) return guides;

  // Check horizontal spacing (sort by X)
  const sortedByX = [...players].sort((a, b) => a.x - b.x);
  if (
    isEquallySpaced(
      sortedByX.map((p) => p.x),
      threshold
    )
  ) {
    // Add vertical guides at each player's X position
    sortedByX.forEach((p) => {
      guides.push({
        type: "vertical",
        position: p.x,
        color: 0xff00ff,
        snapPoints: [p.id],
      });
    });
  }

  // Check vertical spacing (sort by Y)
  const sortedByY = [...players].sort((a, b) => a.y - b.y);
  if (
    isEquallySpaced(
      sortedByY.map((p) => p.y),
      threshold
    )
  ) {
    // Add horizontal guides at each player's Y position
    sortedByY.forEach((p) => {
      guides.push({
        type: "horizontal",
        position: p.y,
        color: 0xff00ff,
        snapPoints: [p.id],
      });
    });
  }

  return guides;
}

/**
 * Check if a series of numbers are equally spaced
 */
function isEquallySpaced(values: number[], threshold: number): boolean {
  if (values.length < 3) return false;

  const gaps: number[] = [];
  for (let i = 1; i < values.length; i++) {
    gaps.push(values[i] - values[i - 1]);
  }

  const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;

  // Check if all gaps are within threshold of average
  return gaps.every((gap) => Math.abs(gap - avgGap) < threshold);
}
