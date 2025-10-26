import { useEffect } from "react";
import { useGesture } from "@use-gesture/react";
import type { ProfessionalPixiEngine } from "../core/ProfessionalPixiEngine";

interface UseGesturesOptions {
  app: ProfessionalPixiEngine | null;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  enabled?: boolean;
}

/**
 * Unified gesture handling for diagram editor
 * Supports: mouse wheel zoom, touch pinch-zoom, drag-to-pan
 */
export const useGestures = ({
  app,
  canvasRef,
  enabled = true,
}: UseGesturesOptions) => {
  // Mouse wheel zoom
  useEffect(() => {
    if (!enabled || !app || !canvasRef.current) return;

    const canvas = canvasRef.current;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      // Get mouse position relative to canvas
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // Convert to world coordinates BEFORE zoom
      const worldPosBefore = app.screenToWorld(mouseX, mouseY);

      // Determine zoom direction and apply
      const deltaY = event.deltaY;
      if (deltaY < 0) {
        // Scroll up = zoom in
        app.camera.zoomIn();
      } else if (deltaY > 0) {
        // Scroll down = zoom out
        app.camera.zoomOut();
      }

      // Convert mouse position to world coordinates AFTER zoom
      const worldPosAfter = app.screenToWorld(mouseX, mouseY);

      // Calculate how much the world moved under the cursor
      const worldDeltaX = worldPosAfter.x - worldPosBefore.x;
      const worldDeltaY = worldPosAfter.y - worldPosBefore.y;

      // Pan to keep the point under the cursor stationary
      app.camera.pan(-worldDeltaX, -worldDeltaY);
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [app, canvasRef, enabled]);

  // Touch gestures (pinch-zoom, drag-pan, double-tap)
  useGesture(
    {
      onPinch: ({ offset: [scale], origin: [ox, oy], first, last }) => {
        if (!app || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const centerX = ox - rect.left;
        const centerY = oy - rect.top;

        if (first) {
          // Store initial world position at pinch center
          const worldPos = app.screenToWorld(centerX, centerY);
          (app as any)._pinchWorldPos = worldPos;
        }

        // Apply zoom based on pinch scale
        const targetZoom = Math.max(0.5, Math.min(3.0, scale));

        // Set zoom directly during pinch (smooth interpolation happens in Camera.update)
        app.camera.setZoom(targetZoom);

        // Keep pinch center stationary
        if ((app as any)._pinchWorldPos) {
          const worldPos = (app as any)._pinchWorldPos;
          const newScreenPos = app.worldToScreen(worldPos.x, worldPos.y);
          const dx = centerX - newScreenPos.x;
          const dy = centerY - newScreenPos.y;

          // Convert screen delta to world delta and pan
          const worldDelta = app.screenToWorld(dx, dy);
          const worldOrigin = app.screenToWorld(0, 0);
          app.camera.pan(
            worldDelta.x - worldOrigin.x,
            worldDelta.y - worldOrigin.y
          );
        }

        if (last) {
          // Clean up
          delete (app as any)._pinchWorldPos;
        }
      },

      onDrag: ({ offset: [x, y], pinching, tap }) => {
        if (!app || pinching || tap) return;

        // Convert drag delta from screen to world space
        const worldDelta = app.screenToWorld(x, y);
        const worldOrigin = app.screenToWorld(0, 0);

        app.camera.pan(
          worldDelta.x - worldOrigin.x,
          worldDelta.y - worldOrigin.y
        );
      },
    },
    {
      target: canvasRef,
      eventOptions: { passive: false },
      pinch: {
        scaleBounds: { min: 0.5, max: 3 },
        rubberband: true,
      },
      drag: {
        filterTaps: true,
        pointer: { touch: true },
      },
      enabled,
    }
  );

  // Double tap to reset (separate effect)
  useEffect(() => {
    if (!enabled || !app || !canvasRef.current) return;

    const canvas = canvasRef.current;
    let lastTap = 0;

    const handleTouchEnd = (event: TouchEvent) => {
      const now = Date.now();
      const timeSinceLastTap = now - lastTap;

      if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
        // Double tap detected
        event.preventDefault();
        app.camera.reset();
      }

      lastTap = now;
    };

    canvas.addEventListener("touchend", handleTouchEnd);

    return () => {
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [app, canvasRef, enabled]);
};
