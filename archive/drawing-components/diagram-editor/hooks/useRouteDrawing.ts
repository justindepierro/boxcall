/**
 * useRouteDrawing - Hook for interactive route drawing
 *
 * Handles:
 * - Click player to start route
 * - Click to add waypoints
 * - Double-click to finish route
 * - Rubber band cursor preview
 * - ESC to cancel
 */

import { useEffect, useCallback, useRef } from "react";
import type { ProfessionalPixiEngine } from "../core/ProfessionalPixiEngine";
import { useDiagramStore } from "../stores/diagramStore";
import type { PlayerSprite } from "../sprites/PlayerSprite";

interface UseRouteDrawingOptions {
  app: ProfessionalPixiEngine | null;
  routesLayer?: any;
  playersLayer?: any;
  isEnabled?: boolean;
  routeType?: "primary" | "hot" | "check";
}

/**
 * Calculate route distance from waypoints
 */
function calculateRouteDistance(
  waypoints: Array<{ x: number; y: number }>
): number {
  let distance = 0;
  for (let i = 1; i < waypoints.length; i++) {
    const dx = waypoints[i].x - waypoints[i - 1].x;
    const dy = waypoints[i].y - waypoints[i - 1].y;
    distance += Math.sqrt(dx * dx + dy * dy);
  }
  return Math.round(distance * 10) / 10; // Round to 1 decimal
}

/**
 * Generate unique route ID
 */
function generateRouteId(): string {
  return `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function useRouteDrawing(options: UseRouteDrawingOptions) {
  const { app, routesLayer, playersLayer, isEnabled, routeType } = options;

  const { addRoute } = useDiagramStore();

  // Track current drawing state
  const drawingStateRef = useRef<{
    routeId: string | null;
    playerId: string | null;
    startedAt: number;
  } | null>(null);

  // Track last click time for double-click detection
  const lastClickTimeRef = useRef(0);
  const DOUBLE_CLICK_THRESHOLD = 300; // milliseconds

  /**
   * Handle pointer move for rubber band preview
   */
  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!app || !routesLayer || !isEnabled) return;
      if (!routesLayer.getIsDrawing()) return;

      // Get world coordinates
      const worldCoords = app.screenToWorld(event.clientX, event.clientY);

      // Update cursor preview
      routesLayer.updateDrawingCursor(worldCoords.x, worldCoords.y);
    },
    [app, routesLayer, isEnabled]
  );

  /**
   * Handle click to add waypoint or start route
   */
  const handleClick = useCallback(
    (event: PointerEvent) => {
      if (!app || !routesLayer || !playersLayer || !isEnabled) return;

      const now = Date.now();
      const isDoubleClick =
        now - lastClickTimeRef.current < DOUBLE_CLICK_THRESHOLD;
      lastClickTimeRef.current = now;

      // Get world coordinates
      const worldCoords = app.screenToWorld(event.clientX, event.clientY);

      // Check if double-click to finish route
      if (isDoubleClick && routesLayer.getIsDrawing()) {
        const result = routesLayer.finishDrawingRoute();
        if (result) {
          // Calculate distance
          const distance = calculateRouteDistance(result.waypoints);

          // Create route object
          const route = {
            id: result.routeId,
            playerId: drawingStateRef.current?.playerId || "",
            type: routeType || "primary",
            waypoints: result.waypoints,
            distance,
          };

          // Add to store
          addRoute(route);

          console.log("✅ Route completed:", route);
        }

        // Reset drawing state
        drawingStateRef.current = null;
        return;
      }

      // If not currently drawing, check if clicking on a player to start
      if (!routesLayer.getIsDrawing()) {
        // Check if click is on a player
        const clickedPlayer = playersLayer
          .getAllPlayers()
          .find((sprite: PlayerSprite) => {
            const player = sprite.getPlayer();
            const dx = player.x - worldCoords.x;
            const dy = player.y - worldCoords.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < 2; // Within 2 yards
          });

        if (clickedPlayer) {
          const player = clickedPlayer.getPlayer();
          const routeId = generateRouteId();

          // Start drawing route from player position
          routesLayer.startDrawingRoute(player.id, player.x, player.y, routeId);

          drawingStateRef.current = {
            routeId,
            playerId: player.id,
            startedAt: now,
          };

          console.log("🎨 Started drawing route from player:", player.id);
        } else {
          console.log("⚠️  Click on a player to start drawing a route");
        }
        return;
      }

      // Add waypoint to current route
      routesLayer.addWaypoint(worldCoords.x, worldCoords.y);
      console.log("📍 Added waypoint:", worldCoords);
    },
    [app, routesLayer, playersLayer, isEnabled, routeType, addRoute]
  );

  /**
   * Handle ESC key to cancel drawing
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!routesLayer || !isEnabled) return;

      if (event.key === "Escape" && routesLayer.getIsDrawing()) {
        routesLayer.cancelDrawingRoute();
        drawingStateRef.current = null;
        console.log("❌ Route drawing cancelled");
      }
    },
    [routesLayer, isEnabled]
  );

  /**
   * Setup event listeners when enabled
   */
  useEffect(() => {
    if (!isEnabled || !app) return;

    const canvas = app.app.canvas;

    // Add event listeners
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerdown", handleClick);
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerdown", handleClick);
      window.removeEventListener("keydown", handleKeyDown);

      // Cancel any drawing in progress
      if (routesLayer?.getIsDrawing()) {
        routesLayer.cancelDrawingRoute();
        drawingStateRef.current = null;
      }
    };
  }, [
    isEnabled,
    app,
    handlePointerMove,
    handleClick,
    handleKeyDown,
    routesLayer,
  ]);

  return {
    isDrawing: routesLayer?.getIsDrawing() ?? false,
    currentRouteId: drawingStateRef.current?.routeId ?? null,
  };
}
