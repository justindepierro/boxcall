/**
 * useWaypointEditing Hook
 *
 * Manages waypoint editing interaction:
 * - Click waypoint to start drag
 * - Drag to reposition waypoint
 * - Release to commit changes
 * - Right-click to delete waypoint
 */

import { useEffect, useRef } from "react";
import type { ProfessionalPixiEngine } from "../core/ProfessionalPixiEngine";
import { useDiagramStore } from "../stores/diagramStore";

interface UseWaypointEditingOptions {
  app: ProfessionalPixiEngine | null;
  isEnabled?: boolean;
}

export interface UseWaypointEditingResult {
  isEditing: boolean;
  editingRouteId: string | null;
  editingWaypointIndex: number | null;
}

export function useWaypointEditing({
  app,
  isEnabled,
}: UseWaypointEditingOptions): UseWaypointEditingResult {
  const isEditingRef = useRef(false);
  const editingRouteIdRef = useRef<string | null>(null);
  const editingWaypointIndexRef = useRef<number | null>(null);

  // The stub useDiagramStore returns an object with routes and updateRoute
  const { routes, updateRoute } = useDiagramStore();
  const routesLayer = app?.routesLayer;

  useEffect(() => {
    if (!isEnabled || !app || !routesLayer) {
      return;
    }

  const canvas = app?.app?.canvas;

    /**
     * Handle pointer down - Start waypoint drag
     */
  const handlePointerDown = (e: PointerEvent) => {
      if (!routesLayer || e.button !== 0) return; // Only left click

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check if clicked on a waypoint
  const waypoint = routesLayer.findWaypointAt(x, y, routes as any[]);
      if (waypoint) {
        isEditingRef.current = true;
        editingRouteIdRef.current = waypoint.routeId;
        editingWaypointIndexRef.current = waypoint.waypointIndex;

        routesLayer.startEditingWaypoint(
          waypoint.routeId,
          waypoint.waypointIndex
        );

        // Prevent default to avoid canvas drag
        e.preventDefault();
        e.stopPropagation();
      }
    };

    /**
     * Handle pointer move - Update waypoint position
     */
    const handlePointerMove = (e: PointerEvent) => {
      if (!isEditingRef.current || !routesLayer) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Update waypoint position in layer (temporary visual update)
  const updatedRoute = routesLayer.updateWaypointPosition(x, y, routes as any[]);

      if (updatedRoute) {
        // Optimistically update the route in the layer for smooth dragging
        routesLayer.updateRoute(updatedRoute);
      }
    };

    /**
     * Handle pointer up - Commit waypoint changes
     */
    const handlePointerUp = () => {
      if (!isEditingRef.current || !routesLayer) return;

      const editState = routesLayer.finishEditingWaypoint();

      if (editState) {
        // Find the current route from the routes array
  const currentRoute = (routes as any[]).find((r: any) => r.id === editState.routeId);

        if (currentRoute) {
          // Update the route in the store with new waypoints
          updateRoute(editState.routeId, {
            waypoints: currentRoute.waypoints,
            distance: currentRoute.distance,
          });
        }
      }

      // Reset editing state
      isEditingRef.current = false;
      editingRouteIdRef.current = null;
      editingWaypointIndexRef.current = null;
    };

    /**
     * Handle context menu - Delete waypoint
     */
    const handleContextMenu = (e: MouseEvent) => {
      if (!routesLayer) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check if right-clicked on a waypoint
      const waypoint = routesLayer.findWaypointAt(x, y, routes);
      if (waypoint) {
  const route = (routes as any[]).find((r: any) => r.id === waypoint.routeId);
        if (!route) return;

        // Don't allow deleting if only 2 waypoints left (minimum for a route)
        if (route.waypoints.length <= 2) {
          console.warn("Cannot delete waypoint - minimum 2 waypoints required");
          e.preventDefault();
          return;
        }

        // Remove the waypoint
        const updatedWaypoints = route.waypoints.filter(
          (_: any, i: number) => i !== waypoint.waypointIndex
        );

        // Recalculate distance
        let totalDistance = 0;
        for (let i = 0; i < updatedWaypoints.length - 1; i++) {
          const dx = updatedWaypoints[i + 1].x - updatedWaypoints[i].x;
          const dy = updatedWaypoints[i + 1].y - updatedWaypoints[i].y;
          totalDistance += Math.sqrt(dx * dx + dy * dy);
        }

        // Update route in store
        updateRoute(waypoint.routeId, {
          waypoints: updatedWaypoints,
          distance: Math.round(totalDistance),
        });

        e.preventDefault();
      }
    };

    /**
     * Handle escape key - Cancel editing
     */
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isEditingRef.current) {
        routesLayer?.cancelEditingWaypoint();
        isEditingRef.current = false;
        editingRouteIdRef.current = null;
        editingWaypointIndexRef.current = null;

        // Restore original route from store
  const route = (routes as any[]).find((r: any) => r.id === editingRouteIdRef.current);
        if (route) {
          routesLayer?.updateRoute(route);
        }
      }
    };

    // Add event listeners
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);

      // Cancel any in-progress editing
      if (isEditingRef.current) {
        routesLayer?.cancelEditingWaypoint();
      }
    };
  }, [isEnabled, app, routesLayer, routes, updateRoute]);

  return {
    isEditing: isEditingRef.current,
    editingRouteId: editingRouteIdRef.current,
    editingWaypointIndex: editingWaypointIndexRef.current,
  };
}
