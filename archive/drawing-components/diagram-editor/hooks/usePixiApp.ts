/**
 * React hook for managing Pixi.js application lifecycle
 *
 * Handles creation, updates, and cleanup of the Pixi app.
 */

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  ProfessionalPixiEngine,
  type ProfessionalEngineOptions,
} from "../core/ProfessionalPixiEngine";
import { FieldLayer } from "../layers/FieldLayer";
import { PlayersLayer } from "../layers/PlayersLayer";
import { RoutesLayer } from "../layers/RoutesLayer";
import { AlignmentGuidesLayer } from "../layers/AlignmentGuidesLayer";
import { SpacingIndicatorLayer } from "../layers/SpacingIndicatorLayer";
import { useDiagramStore } from "../stores/diagramStore";
import type { CameraConfig } from "../core/Camera";

/**
 * Simple throttle utility for performance optimization
 * Ensures function is called at most once per `wait` milliseconds
 */
function throttle<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): T {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;

  return ((...args: Parameters<T>) => {
    lastArgs = args;

    if (!timeoutId) {
      // Call immediately on first invocation
      func(...args);
      lastArgs = null;

      // Set up throttle window
      timeoutId = setTimeout(() => {
        // If there were additional calls during throttle, execute with last args
        if (lastArgs) {
          func(...lastArgs);
        }
        timeoutId = null;
        lastArgs = null;
      }, wait);
    }
  }) as T;
}

export interface UsePixiAppOptions {
  fieldWidth: number;
  fieldHeight: number;
  backgroundColor?: number;
  cameraConfig?: CameraConfig;
  enabled?: boolean; // NEW: Allow caller to control when initialization happens
  minPixelsPerYard?: number; // Minimum for readability (default: 10)
  maxPixelsPerYard?: number; // Maximum for touch targets (default: 25)
  padding?: number; // Viewport padding in pixels (default: 20)
}

export function usePixiApp(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  containerRef: React.RefObject<HTMLElement | null>,
  options: UsePixiAppOptions
) {
  const [app, setApp] = useState<ProfessionalPixiEngine | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [canvasSize, setCanvasSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const fieldLayerRef = useRef<FieldLayer | null>(null);
  const playersLayerRef = useRef<PlayersLayer | null>(null);
  const routesLayerRef = useRef<RoutesLayer | null>(null);
  const initializingRef = useRef(false); // Flag to prevent duplicate initialization

  // Get store actions - use refs to prevent recreation
  const { selectPlayer, updatePlayer, players, routes, selectedRouteId } =
    useDiagramStore();
  const selectPlayerRef = useRef(selectPlayer);
  const updatePlayerRef = useRef(updatePlayer);

  // Keep refs updated
  useEffect(() => {
    selectPlayerRef.current = selectPlayer;
    updatePlayerRef.current = updatePlayer;
  }, [selectPlayer, updatePlayer]);

  // Stable callback wrappers
  const handlePlayerSelected = useCallback((playerId: string | null) => {
    selectPlayerRef.current(playerId);
  }, []);

  // Throttled player movement handler for 60fps smooth dragging (memoized)
  const handlePlayerMoved = useMemo(
    () =>
      throttle((playerId: string, x: number, y: number) => {
        updatePlayerRef.current(playerId, { x, y });

        // Update spacing indicator with new player positions
        if (app?.spacingIndicatorLayer) {
          app.spacingIndicatorLayer.updatePlayers(
            useDiagramStore.getState().players
          );
        }
      }, 16), // 16ms = 60fps
    [app]
  );

  // Watch for canvas to become visible and get dimensions
  useEffect(() => {
    // Don't run if explicitly disabled
    if (options.enabled === false) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Function to check and update canvas size
    const updateCanvasSize = () => {
      // CRITICAL: Canvas must be in DOM
      if (!canvas.parentElement || !document.body.contains(canvas)) {
        return false;
      }

      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        // Only update if dimensions actually changed to avoid unnecessary re-renders
        setCanvasSize((prev) => {
          if (
            prev &&
            prev.width === rect.width &&
            prev.height === rect.height
          ) {
            return prev; // Return same object to maintain reference equality
          }
          return { width: rect.width, height: rect.height };
        });
        return true;
      }
      return false;
    };

    // Try to get initial size immediately
    const hasInitialSize = updateCanvasSize();

    // If no initial size, set up observers and polling
    if (!hasInitialSize) {
      console.log(
        "⏳ Waiting for canvas to be ready in DOM with dimensions..."
      );

      // Set up ResizeObserver for when canvas becomes visible
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0 && document.body.contains(canvas)) {
            console.log("✅ Canvas dimensions detected:", { width, height });
            // Only update if dimensions actually changed
            setCanvasSize((prev) => {
              if (prev && prev.width === width && prev.height === height) {
                return prev;
              }
              return { width, height };
            });
          }
        }
      });

      observer.observe(canvas);

      // Also poll for dimensions in case ResizeObserver misses it
      const pollInterval = setInterval(() => {
        if (updateCanvasSize()) {
          clearInterval(pollInterval);
          clearTimeout(timeoutId);
        }
      }, 100);

      // Add timeout fallback - if canvas doesn't get dimensions within 5 seconds, use fallback
      const timeoutId = setTimeout(() => {
        console.warn(
          "⏰ Canvas size detection timeout - using fallback dimensions"
        );
        clearInterval(pollInterval);
        setCanvasSize({ width: 800, height: 600 }); // Fallback dimensions
      }, 5000);

      return () => {
        observer.disconnect();
        clearInterval(pollInterval);
        clearTimeout(timeoutId);
      };
    } else {
      // Has initial size, just observe for changes
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            // Only update if dimensions actually changed
            setCanvasSize((prev) => {
              if (prev && prev.width === width && prev.height === height) {
                return prev;
              }
              return { width, height };
            });
          }
        }
      });

      observer.observe(canvas);

      return () => {
        observer.disconnect();
      };
    }
  }, [canvasRef, options.enabled]);

  // Initialize Pixi app
  useEffect(() => {
    // Don't initialize if explicitly disabled
    if (options.enabled === false) {
      console.log(
        "⏸️  usePixiApp: Skipping initialization - disabled by caller"
      );
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas || !canvasSize) {
      console.log("⏸️  usePixiApp: Waiting for canvas or canvasSize...", {
        hasCanvas: !!canvas,
        hasCanvasSize: !!canvasSize,
      });
      return;
    }

    // If app exists and pixelsPerYard changed, we need to destroy and recreate
    // The app will be cleaned up by the return function, then this effect runs again
    if (app && !initializingRef.current) {
      console.log(
        "🔄 usePixiApp: Existing app will be destroyed due to dependency change"
      );
      // Don't block re-initialization - let cleanup handle it
    }

    // CRITICAL: Don't re-initialize if we're currently initializing
    if (initializingRef.current) {
      console.log("⏸️  usePixiApp: Currently initializing, skipping");
      return;
    }

    // Set initializing flag
    initializingRef.current = true;

    // CRITICAL: Canvas MUST be in DOM before we proceed
    if (!canvas.parentElement || !document.body.contains(canvas)) {
      // This is expected during React's effect lifecycle - not an error
      console.log("⏸️  Canvas not in DOM yet, waiting...", {
        parentElement: canvas.parentElement,
        inDOM: document.body.contains(canvas),
      });
      initializingRef.current = false; // Reset flag if we can't proceed
      return;
    }

    const { width, height } = canvasSize;

    // Extra safety: don't initialize with invalid dimensions
    if (width <= 0 || height <= 0) {
      console.warn("⚠️ Skipping initialization - invalid dimensions:", {
        width,
        height,
      });
      return;
    }

    console.log("🚀 usePixiApp: Initializing Pixi with dimensions:", {
      width,
      height,
    });

    // CRITICAL: Double-check canvas dimensions immediately before creating app
    const currentRect = canvas.getBoundingClientRect();
    let finalWidth = width;
    let finalHeight = height;

    if (currentRect.width === 0 || currentRect.height === 0) {
      console.warn("⚠️ Canvas has no dimensions, using fallback size", {
        canvasSize: { width, height },
        currentRect: { width: currentRect.width, height: currentRect.height },
        parentElement: canvas.parentElement,
        canvasInDOM: document.body.contains(canvas),
      });

      // Use fallback dimensions
      finalWidth = width || 800;
      finalHeight = height || 600;
    } else {
      finalWidth = currentRect.width;
      finalHeight = currentRect.height;
    }

    console.log("✅ Canvas dimensions confirmed:", currentRect);

    // Calculate initial pixelsPerYard from container
    const container = containerRef.current;
    let initialPixelsPerYard = 15; // fallback default

    if (container) {
      const containerRect = container.getBoundingClientRect();
      const padding = options.padding ?? 20;
      const availableWidth = containerRect.width - padding * 2;
      const availableHeight = containerRect.height - padding * 2;

      const widthScale = availableWidth / options.fieldWidth;
      const heightScale = availableHeight / options.fieldHeight;
      const optimalScale = Math.min(widthScale, heightScale);

      initialPixelsPerYard = Math.max(
        options.minPixelsPerYard ?? 10,
        Math.min(
          options.maxPixelsPerYard ?? 25,
          Math.round(optimalScale * 10) / 10
        )
      );

      console.log("📐 Initial pixelsPerYard calculation:", {
        container: { width: containerRect.width, height: containerRect.height },
        available: { width: availableWidth, height: availableHeight },
        scales: {
          width: widthScale.toFixed(2),
          height: heightScale.toFixed(2),
        },
        calculated: initialPixelsPerYard,
      });
    }

    // Create config for ProfessionalPixiEngine
    const config: ProfessionalEngineOptions = {
      canvas,
      width: finalWidth,
      height: finalHeight,
      fieldDimensions: {
        width: options.fieldWidth,
        height: options.fieldHeight,
        pixelsPerYard: initialPixelsPerYard,
      },
      backgroundColor: options.backgroundColor,
      resolution: window.devicePixelRatio || 1,
      enablePerformanceMonitoring: true,
      enableAdvancedInteractions: true,
      maxFPS: 60,
      minFPS: 15,
    };

    // Create and initialize app
    const pixiApp = new ProfessionalPixiEngine(config);
    console.log("🎨 Creating ProfessionalPixiEngine instance...");

    // Initialize the engine asynchronously
    pixiApp
      .initialize()
      .then(() => {
        console.log("🎨 ProfessionalPixiEngine ready, creating layers...");
        // Create and add field layer DIRECTLY to stage with jade color mode
        const fieldLayer = new FieldLayer(pixiApp.coordinates, {
          width: options.fieldWidth,
          height: options.fieldHeight,
          colorMode: "jade", // Default to jade mode (soft jade background)
          showNumbers: true,
          showHashes: true,
        });

        // Note: v7 doesn't have .label property
        pixiApp.stage.addChild(fieldLayer); // Add directly to stage!
        pixiApp.setFieldLayer(fieldLayer); // Store reference
        fieldLayerRef.current = fieldLayer;

        // Create and add alignment guides layer (between field and players)
        const alignmentGuidesLayer = new AlignmentGuidesLayer(
          pixiApp.coordinates
        );
        pixiApp.stage.addChild(alignmentGuidesLayer); // Add directly to stage!

        // Create and add players layer DIRECTLY to stage
        const playersLayer = new PlayersLayer(pixiApp.coordinates, {
          onPlayerSelected: handlePlayerSelected,
          onPlayerMoved: handlePlayerMoved,
        });

        // Note: v7 doesn't have .label property
        pixiApp.stage.addChild(playersLayer); // Add directly to stage!
        pixiApp.setPlayersLayer(playersLayer); // Store reference
        playersLayerRef.current = playersLayer;

        // Connect alignment guides to players layer
        playersLayer.setAlignmentGuidesLayer(alignmentGuidesLayer);

        // Create and add routes layer (between players and spacing indicator)
        const routesLayer = new RoutesLayer(pixiApp.coordinates, {
          onRouteSelected: (routeId) => {
            useDiagramStore.getState().selectRoute(routeId);
          },
          onRouteClicked: (routeId) => {
            console.log("Route clicked:", routeId);
          },
        });
        pixiApp.stage.addChild(routesLayer); // Add to stage
        pixiApp.setRoutesLayer(routesLayer); // Store reference
        routesLayerRef.current = routesLayer;

        // Create and add spacing indicator layer (on top of everything)
        const spacingIndicatorLayer = new SpacingIndicatorLayer(
          pixiApp.coordinates
        );
        pixiApp.stage.addChild(spacingIndicatorLayer); // Add on top!
        pixiApp.setSpacingIndicatorLayer(spacingIndicatorLayer); // Store reference
        spacingIndicatorLayer.hide(); // Hidden by default

        setApp(pixiApp);
        setIsReady(true);
        console.log("✅ usePixiApp: Initialization complete, isReady = true");
      })
      .catch((error) => {
        console.error("Failed to initialize Pixi app:", error);
        setIsReady(false);
        initializingRef.current = false; // Reset flag on error
      });

    // Cleanup
    return () => {
      console.log("🧹 usePixiApp: Cleanup function called");

      // CRITICAL: Don't destroy if app is still needed (flag is still true)
      // This prevents cleanup from a previous effect run from destroying a successful initialization
      if (initializingRef.current) {
        console.log(
          "⏸️  usePixiApp: Skipping cleanup - app still initializing or needed"
        );
        return;
      }

      initializingRef.current = false; // Reset flag on cleanup

      // Wait for initialization to complete before destroying
      console.log("🧹 Destroying Pixi app");
      pixiApp.destroy();

      setApp(null);
      setIsReady(false);
      fieldLayerRef.current = null;
      playersLayerRef.current = null;
      routesLayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    canvasRef,
    canvasSize,
    options.fieldWidth,
    options.fieldHeight,
    // NOTE: options.pixelsPerYard removed - handled by separate effect below
    options.backgroundColor,
    options.enabled,
    handlePlayerSelected,
    handlePlayerMoved,
  ]);

  // PERFORMANCE: Coordinate pixelsPerYard and resize together
  // CRITICAL: Update pixelsPerYard BEFORE resizing renderer to avoid mismatched scales
  // NOW: Calculate pixelsPerYard responsively from container size
  useEffect(() => {
    if (!app || !canvasRef.current || !containerRef.current || !isReady) return;

    const rafRef = { current: null as number | null };
    const lastState = { width: 0, height: 0, ppy: 0 };

    // Destructure options with defaults
    const {
      fieldWidth,
      fieldHeight,
      minPixelsPerYard = 10,
      maxPixelsPerYard = 25,
      padding = 20,
    } = options;

    const handleResize = () => {
      // Cancel any pending update
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // Schedule update on next frame for smooth batching
      rafRef.current = requestAnimationFrame(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        // Get container dimensions (NOT canvas - canvas follows container)
        const containerRect = container.getBoundingClientRect();
        const availableWidth = containerRect.width - padding * 2;
        const availableHeight = containerRect.height - padding * 2;

        // Calculate optimal pixelsPerYard to fit field in container
        const widthScale = availableWidth / fieldWidth;
        const heightScale = availableHeight / fieldHeight;
        const optimalScale = Math.min(widthScale, heightScale);

        // Apply constraints
        const ppy = Math.max(
          minPixelsPerYard,
          Math.min(maxPixelsPerYard, Math.round(optimalScale * 10) / 10)
        );

        // Get canvas dimensions (for renderer)
        const canvasRect = canvas.getBoundingClientRect();
        const width = canvasRect.width;
        const height = canvasRect.height;

        // Check if anything actually changed (avoid redundant updates)
        if (
          Math.abs(lastState.width - width) < 1 &&
          Math.abs(lastState.height - height) < 1 &&
          Math.abs(lastState.ppy - ppy) < 0.1
        ) {
          return; // No significant change
        }

        // Save current state
        lastState.width = width;
        lastState.height = height;
        lastState.ppy = ppy;

        console.log("📐 Unified resize handler:", {
          container: {
            width: containerRect.width,
            height: containerRect.height,
          },
          canvas: { width, height },
          calculated: {
            widthScale: widthScale.toFixed(2),
            heightScale: heightScale.toFixed(2),
            ppy,
          },
        });

        // ATOMIC UPDATE: Do everything in correct order
        // 1. Update coordinate system FIRST (so layers render at correct scale)
        app.coordinates.updatePixelsPerYard(ppy);

        // 2. Then resize renderer and camera (preserves user view)
        if (width > 0 && height > 0) {
          app.resize(width, height);
        }
      });
    };

    // Initial resize
    handleResize();

    // Single ResizeObserver on CONTAINER (not canvas)
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [app, canvasRef, containerRef, isReady, options]);

  // Sync players from store to PlayersLayer
  useEffect(() => {
    const playersLayer = playersLayerRef.current;
    if (!playersLayer) return;

    // Get current sprite IDs
    const currentIds = new Set(
      playersLayer.getAllPlayers().map((s) => s.getId())
    );
    const storeIds = new Set(players.map((p) => p.id));

    // Add new players
    players.forEach((player) => {
      if (!currentIds.has(player.id)) {
        playersLayer.addPlayer(player);
      } else {
        // Update existing players
        playersLayer.updatePlayer(player.id, player);
      }
    });

    // Remove deleted players
    currentIds.forEach((id) => {
      if (!storeIds.has(id)) {
        playersLayer.removePlayer(id);
      }
    });
  }, [players]);

  // Sync routes from store to RoutesLayer
  useEffect(() => {
    const routesLayer = routesLayerRef.current;
    if (!routesLayer) return;

    // Get current route IDs in the layer
    const currentIds = new Set(routesLayer.getRouteIds());
    const storeIds = new Set(routes.map((r) => r.id));

    // Add new routes or update existing ones
    routes.forEach((route) => {
      if (!currentIds.has(route.id)) {
        routesLayer.addRoute(route);
        // Store route data for retrieval
        routesLayer.setRouteData(route.id, route);
      } else {
        // Update existing route
        routesLayer.setRouteData(route.id, route);
        routesLayer.updateRoute(route);
      }
    });

    // Remove deleted routes
    currentIds.forEach((id) => {
      if (!storeIds.has(id)) {
        routesLayer.removeRoute(id);
      }
    });

    // Update selection state
    routesLayer.selectRoute(selectedRouteId);
  }, [routes, selectedRouteId]);

  return {
    app,
    isReady,
    fieldLayer: fieldLayerRef.current,
    playersLayer: playersLayerRef.current,
    routesLayer: routesLayerRef.current,
    debugCoordinates: () => {
      if (app?.coordinates) {
        console.log("Field width:", app.coordinates.fieldWidth);
        console.log("Field height:", app.coordinates.fieldHeight);
        console.log("Pixels per yard:", app.coordinates.pixelsPerYard);
      }
    },
  };
}
