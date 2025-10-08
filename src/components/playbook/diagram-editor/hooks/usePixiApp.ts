/**
 * React hook for managing Pixi.js application lifecycle
 * 
 * Handles creation, updates, and cleanup of the Pixi app.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { DiagramPixiApp, type PixiAppConfig } from '../core/PixiApp';
import { FieldLayer } from '../layers/FieldLayer';
import { PlayersLayer } from '../layers/PlayersLayer';
import { useDiagramStore } from '../stores/diagramStore';

export interface UsePixiAppOptions {
  fieldWidth: number;
  fieldHeight: number;
  pixelsPerYard: number;
  backgroundColor?: number;
}

export function usePixiApp(canvasRef: React.RefObject<HTMLCanvasElement | null>, options: UsePixiAppOptions) {
  const [app, setApp] = useState<DiagramPixiApp | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number } | null>(null);
  const fieldLayerRef = useRef<FieldLayer | null>(null);
  const playersLayerRef = useRef<PlayersLayer | null>(null);

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
  }, []);

  // Watch for canvas to become visible and get dimensions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        // Only update state if we have VALID dimensions (not 0)
        if (width > 0 && height > 0) {
          console.log('📐 Canvas sized:', { width, height });
          setCanvasSize({ width, height });
        } else {
          console.log('⏳ Canvas not yet sized (0x0), waiting...');
        }
      }
    });

    observer.observe(canvas);

    // Also check immediately in case canvas already has size
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      console.log('📐 Canvas already sized:', { width: rect.width, height: rect.height });
      setCanvasSize({ width: rect.width, height: rect.height });
    }

    return () => {
      observer.disconnect();
    };
  }, [canvasRef]);

  // Initialize Pixi app
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasSize) return;

    const { width, height } = canvasSize;

    // Extra safety: don't initialize with invalid dimensions
    if (width <= 0 || height <= 0) {
      console.warn('⚠️ Skipping initialization - invalid dimensions:', { width, height });
      return;
    }

    console.log('🎨 Initializing Pixi with canvas dimensions:', { width, height });

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
    };

    // Create app
    const pixiApp = new DiagramPixiApp(config);
    
    // Wait for initialization before creating layers
    pixiApp.waitForReady().then(() => {
      // Create and add field layer DIRECTLY to stage
      const fieldLayer = new FieldLayer(pixiApp.coordinates, {
        width: options.fieldWidth,
        height: options.fieldHeight,
        backgroundColor: 0x82C91E, // Green
        lineColor: 0xFFFFFF,
        hashColor: 0xFFFFFF,
        numbersColor: 0xFFFFFF,
        showNumbers: true,
        showHashes: true,
      });
      
      fieldLayer.label = 'FieldLayer';
      pixiApp.stage.addChild(fieldLayer); // Add directly to stage!
      pixiApp.fieldLayer = fieldLayer; // Store reference
      fieldLayerRef.current = fieldLayer;

      // Create and add players layer DIRECTLY to stage
      const playersLayer = new PlayersLayer(pixiApp.coordinates, {
        onPlayerSelected: handlePlayerSelected,
        onPlayerMoved: handlePlayerMoved,
      });
      
      playersLayer.label = 'PlayersLayer';
      pixiApp.stage.addChild(playersLayer); // Add directly to stage!
      pixiApp.playersLayer = playersLayer; // Store reference
      playersLayerRef.current = playersLayer;

      setApp(pixiApp);
      setIsReady(true);
    }).catch((error) => {
      console.error('Failed to initialize Pixi app:', error);
      setIsReady(false);
    });

    // Cleanup
    return () => {
      // Wait for initialization to complete before destroying
      pixiApp.waitForReady()
        .then(() => {
          pixiApp.destroy();
        })
        .catch(() => {
          // If initialization failed, still try to clean up
          pixiApp.destroy();
        });
      
      setApp(null);
      setIsReady(false);
      fieldLayerRef.current = null;
      playersLayerRef.current = null;
    };
  }, [canvasRef, canvasSize, options.fieldWidth, options.fieldHeight, options.pixelsPerYard, options.backgroundColor, handlePlayerSelected, handlePlayerMoved]);

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
