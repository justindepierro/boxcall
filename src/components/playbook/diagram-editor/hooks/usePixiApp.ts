/**
 * React hook for managing Pixi.js application lifecycle
 * 
 * Handles creation, updates, and cleanup of the Pixi app.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { DiagramPixiApp, type PixiAppConfig } from '../core/PixiApp';
import { FieldLayer } from '../layers/FieldLayer';
import { PlayersLayer } from '../layers/PlayersLayer';
import { AlignmentGuidesLayer } from '../layers/AlignmentGuidesLayer';
import { SpacingIndicatorLayer } from '../layers/SpacingIndicatorLayer';
import { useDiagramStore } from '../stores/diagramStore';
import type { CameraConfig } from '../core/Camera';

export interface UsePixiAppOptions {
  fieldWidth: number;
  fieldHeight: number;
  pixelsPerYard: number;
  backgroundColor?: number;
  cameraConfig?: CameraConfig;
  enabled?: boolean; // NEW: Allow caller to control when initialization happens
}

export function usePixiApp(canvasRef: React.RefObject<HTMLCanvasElement | null>, options: UsePixiAppOptions) {
  const [app, setApp] = useState<DiagramPixiApp | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number } | null>(null);
  const fieldLayerRef = useRef<FieldLayer | null>(null);
  const playersLayerRef = useRef<PlayersLayer | null>(null);
  const initializingRef = useRef(false); // Flag to prevent duplicate initialization

  // Get store actions - use refs to prevent recreation
  const { selectPlayer, updatePlayer, players } = useDiagramStore();
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

  const handlePlayerMoved = useCallback((playerId: string, x: number, y: number) => {
    updatePlayerRef.current(playerId, { x, y });
    
    // Update spacing indicator with new player positions
    if (app?.spacingIndicatorLayer) {
      app.spacingIndicatorLayer.updatePlayers(useDiagramStore.getState().players);
    }
  }, [app]);

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
        setCanvasSize(prev => {
          if (prev && prev.width === rect.width && prev.height === rect.height) {
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
      console.log('⏳ Waiting for canvas to be ready in DOM with dimensions...');
      
      // Set up ResizeObserver for when canvas becomes visible
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0 && document.body.contains(canvas)) {
            console.log('✅ Canvas dimensions detected:', { width, height });
            // Only update if dimensions actually changed
            setCanvasSize(prev => {
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
        }
      }, 100);

      return () => {
        observer.disconnect();
        clearInterval(pollInterval);
      };
    } else {
      // Has initial size, just observe for changes
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            // Only update if dimensions actually changed
            setCanvasSize(prev => {
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
      console.log('⏸️  usePixiApp: Skipping initialization - disabled by caller');
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas || !canvasSize) {
      console.log('⏸️  usePixiApp: Waiting for canvas or canvasSize...', { 
        hasCanvas: !!canvas, 
        hasCanvasSize: !!canvasSize 
      });
      return;
    }

    // If app exists and pixelsPerYard changed, we need to destroy and recreate
    // The app will be cleaned up by the return function, then this effect runs again
    if (app && !initializingRef.current) {
      console.log('🔄 usePixiApp: Existing app will be destroyed due to dependency change');
      // Don't block re-initialization - let cleanup handle it
    }
    
    // CRITICAL: Don't re-initialize if we're currently initializing
    if (initializingRef.current) {
      console.log('⏸️  usePixiApp: Currently initializing, skipping');
      return;
    }

    // Set initializing flag
    initializingRef.current = true;

    // CRITICAL: Canvas MUST be in DOM before we proceed
    if (!canvas.parentElement || !document.body.contains(canvas)) {
      // This is expected during React's effect lifecycle - not an error
      console.log('⏸️  Canvas not in DOM yet, waiting...', {
        parentElement: canvas.parentElement,
        inDOM: document.body.contains(canvas),
      });
      initializingRef.current = false; // Reset flag if we can't proceed
      return;
    }

    const { width, height } = canvasSize;

    // Extra safety: don't initialize with invalid dimensions
    if (width <= 0 || height <= 0) {
      console.warn('⚠️ Skipping initialization - invalid dimensions:', { width, height });
      return;
    }

    console.log('🚀 usePixiApp: Initializing Pixi with dimensions:', { width, height });

    // CRITICAL: Double-check canvas dimensions immediately before creating app
    const currentRect = canvas.getBoundingClientRect();
    if (currentRect.width === 0 || currentRect.height === 0) {
      console.error('❌ Canvas dimensions changed to 0x0 since last check!', {
        canvasSize: { width, height },
        currentRect: { width: currentRect.width, height: currentRect.height },
        parentElement: canvas.parentElement,
        canvasInDOM: document.body.contains(canvas),
      });
      return; // Abort initialization
    }

    console.log('✅ Canvas dimensions confirmed:', currentRect);

    // Create config
    const config: PixiAppConfig = {
      canvas,
      width,
      height,
      fieldDimensions: {
        width: options.fieldWidth,
        height: options.fieldHeight,
        pixelsPerYard: options.pixelsPerYard,
      },
      backgroundColor: options.backgroundColor,
      resolution: window.devicePixelRatio || 1,
      cameraConfig: options.cameraConfig,
    };

    // Create app
    const pixiApp = new DiagramPixiApp(config);
    console.log('🎨 Creating DiagramPixiApp instance...');
    
    // Wait for initialization before creating layers
    pixiApp.waitForReady().then(() => {
      console.log('🎨 DiagramPixiApp ready, creating layers...');
      // Create and add field layer DIRECTLY to stage with jade color mode
      const fieldLayer = new FieldLayer(pixiApp.coordinates, {
        width: options.fieldWidth,
        height: options.fieldHeight,
        colorMode: 'jade', // Default to jade mode (soft jade background)
        showNumbers: true,
        showHashes: true,
      });
      
      // Note: v7 doesn't have .label property
      pixiApp.stage.addChild(fieldLayer); // Add directly to stage!
      pixiApp.fieldLayer = fieldLayer; // Store reference
      fieldLayerRef.current = fieldLayer;

      // Create and add alignment guides layer (between field and players)
      const alignmentGuidesLayer = new AlignmentGuidesLayer(pixiApp.coordinates);
      pixiApp.stage.addChild(alignmentGuidesLayer); // Add directly to stage!

      // Create and add players layer DIRECTLY to stage
      const playersLayer = new PlayersLayer(pixiApp.coordinates, {
        onPlayerSelected: handlePlayerSelected,
        onPlayerMoved: handlePlayerMoved,
      });
      
      // Note: v7 doesn't have .label property
      pixiApp.stage.addChild(playersLayer); // Add directly to stage!
      pixiApp.playersLayer = playersLayer; // Store reference
      playersLayerRef.current = playersLayer;

      // Connect alignment guides to players layer
      playersLayer.setAlignmentGuidesLayer(alignmentGuidesLayer);

      // Create and add spacing indicator layer (on top of everything)
      const spacingIndicatorLayer = new SpacingIndicatorLayer(pixiApp.coordinates);
      pixiApp.stage.addChild(spacingIndicatorLayer); // Add on top!
      pixiApp.spacingIndicatorLayer = spacingIndicatorLayer; // Store reference
      spacingIndicatorLayer.hide(); // Hidden by default

      setApp(pixiApp);
      setIsReady(true);
      console.log('✅ usePixiApp: Initialization complete, isReady = true');
    }).catch((error) => {
      console.error('Failed to initialize Pixi app:', error);
      setIsReady(false);
      initializingRef.current = false; // Reset flag on error
    });

    // Cleanup
    return () => {
      console.log('🧹 usePixiApp: Cleanup function called');
      
      // CRITICAL: Don't destroy if app is still needed (flag is still true)
      // This prevents cleanup from a previous effect run from destroying a successful initialization
      if (initializingRef.current) {
        console.log('⏸️  usePixiApp: Skipping cleanup - app still initializing or needed');
        return;
      }
      
      initializingRef.current = false; // Reset flag on cleanup
      
      // Wait for initialization to complete before destroying
      pixiApp.waitForReady()
        .then(() => {
          console.log('🧹 Destroying Pixi app');
          pixiApp.destroy();
        })
        .catch(() => {
          // If initialization failed, still try to clean up
          console.log('🧹 Destroying Pixi app (after init failure)');
          pixiApp.destroy();
        });
      
      setApp(null);
      setIsReady(false);
      fieldLayerRef.current = null;
      playersLayerRef.current = null;
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
    handlePlayerMoved
  ]);

  // PERFORMANCE: Handle pixelsPerYard changes without recreating entire app
  // The CoordinateSystem observer pattern notifies all layers to re-render
  useEffect(() => {
    if (!app || !isReady) return;
    
    app.coordinates.updatePixelsPerYard(options.pixelsPerYard);
  }, [app, isReady, options.pixelsPerYard]);

  // Handle resize
  useEffect(() => {
    if (!app || !canvasRef.current || !isReady) return;

    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      
      // Only resize if we have valid dimensions
      if (rect.width > 0 && rect.height > 0) {
        app.resize(rect.width, rect.height);
      }
    };

    // Initial resize
    handleResize();

    // Listen for window resize
    window.addEventListener('resize', handleResize);
    
    // Use ResizeObserver for better responsiveness
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvasRef.current);

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, [app, canvasRef, isReady]);

  // Sync players from store to PlayersLayer
  useEffect(() => {
    const playersLayer = playersLayerRef.current;
    if (!playersLayer) return;

    // Get current sprite IDs
    const currentIds = new Set(playersLayer.getAllPlayers().map(s => s.getId()));
    const storeIds = new Set(players.map(p => p.id));

    // Add new players
    players.forEach(player => {
      if (!currentIds.has(player.id)) {
        playersLayer.addPlayer(player);
      } else {
        // Update existing players
        playersLayer.updatePlayer(player.id, player);
      }
    });

    // Remove deleted players
    currentIds.forEach(id => {
      if (!storeIds.has(id)) {
        playersLayer.removePlayer(id);
      }
    });
  }, [players]);

  return {
    app,
    isReady,
    fieldLayer: fieldLayerRef.current,
    playersLayer: playersLayerRef.current,
    debugCoordinates: () => app?.debugCoordinates(),
  };
}
