/**
 * React hook for managing Pixi.js application lifecycle
 * 
 * Handles creation, updates, and cleanup of the Pixi app.
 */

import { useEffect, useRef, useState } from 'react';
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
  const fieldLayerRef = useRef<FieldLayer | null>(null);
  const playersLayerRef = useRef<PlayersLayer | null>(null);

  // Get store actions
  const { selectPlayer, updatePlayer, players } = useDiagramStore();

  // Initialize Pixi app
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Get canvas dimensions
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 600;

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
      onPlayerSelected: (playerId) => {
        selectPlayer(playerId);
      },
      onPlayerMoved: (playerId, x, y) => {
        updatePlayer(playerId, { x, y });
      },
    });
    
    playersLayer.label = 'PlayersLayer';
    pixiApp.stage.addChild(playersLayer); // Add directly to stage!
    pixiApp.playersLayer = playersLayer; // Store reference
    playersLayerRef.current = playersLayer;

    setApp(pixiApp);
    setIsReady(true);

    // Cleanup
    return () => {
      pixiApp.destroy();
      setApp(null);
      setIsReady(false);
      fieldLayerRef.current = null;
      playersLayerRef.current = null;
    };
  }, [canvasRef, options.fieldWidth, options.fieldHeight, options.pixelsPerYard, options.backgroundColor, selectPlayer, updatePlayer]);

  // Handle resize
  useEffect(() => {
    if (!app || !canvasRef.current) return;

    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      app.resize(rect.width, rect.height);
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
  }, [app, canvasRef]);

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
