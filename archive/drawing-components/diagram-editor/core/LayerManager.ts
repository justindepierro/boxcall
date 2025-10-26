/**
 * Layer Manager for Pixi.js Rendering
 *
 * Manages z-index ordering and rendering optimization for diagram layers
 */

import { Container } from "pixi.js";

export interface LayerConfig {
  zIndex: number;
  visible: boolean;
  interactive: boolean;
  name: string;
}

export class LayerManager {
  private stage: Container;
  private layers: Map<string, Container> = new Map();
  private layerConfigs: Map<string, LayerConfig> = new Map();

  // Standard layer ordering (lower z-index renders first)
  private static readonly LAYER_ORDER = {
    field: { zIndex: 0, visible: true, interactive: false, name: 'field' },
    alignmentGuides: { zIndex: 1, visible: true, interactive: false, name: 'alignment' },
    spacingIndicators: { zIndex: 2, visible: true, interactive: false, name: 'spacing' },
    routes: { zIndex: 3, visible: true, interactive: true, name: 'routes' },
    players: { zIndex: 4, visible: true, interactive: true, name: 'players' },
  };

  constructor(stage: Container) {
    this.stage = stage;
    this.initializeLayers();
  }

  /**
   * Initialize standard layers
   */
  private initializeLayers(): void {
    Object.entries(LayerManager.LAYER_ORDER).forEach(([key, config]) => {
      const layer = new Container();
      layer.name = config.name;
      layer.visible = config.visible;
      layer.interactive = config.interactive;
      layer.zIndex = config.zIndex;

      this.layers.set(key, layer);
      this.layerConfigs.set(key, config);
      this.stage.addChild(layer);
    });

    // Sort by z-index
    this.sortLayers();
  }

  /**
   * Sort layers by z-index for proper rendering order
   */
  private sortLayers(): void {
    this.stage.children.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
  }

  /**
   * Add a layer to the stage
   */
  addLayer(key: string, layer: Container, config?: Partial<LayerConfig>): void {
    const defaultConfig = LayerManager.LAYER_ORDER[key as keyof typeof LayerManager.LAYER_ORDER] || {
      zIndex: 999,
      visible: true,
      interactive: false,
      name: key,
    };

    const finalConfig = { ...defaultConfig, ...config };
    layer.name = finalConfig.name;
    layer.visible = finalConfig.visible;
    layer.interactive = finalConfig.interactive;
    layer.zIndex = finalConfig.zIndex;

    this.layers.set(key, layer);
    this.layerConfigs.set(key, finalConfig);
    this.stage.addChild(layer);
    this.sortLayers();
  }

  /**
   * Get a layer by key
   */
  getLayer(key: string): Container | undefined {
    return this.layers.get(key);
  }

  /**
   * Set layer visibility
   */
  setLayerVisible(key: string, visible: boolean): void {
    const layer = this.layers.get(key);
    if (layer) {
      layer.visible = visible;
      const config = this.layerConfigs.get(key);
      if (config) {
        config.visible = visible;
      }
    }
  }

  /**
   * Set layer interactivity
   */
  setLayerInteractive(key: string, interactive: boolean): void {
    const layer = this.layers.get(key);
    if (layer) {
      layer.interactive = interactive;
      const config = this.layerConfigs.get(key);
      if (config) {
        config.interactive = interactive;
      }
    }
  }

  /**
   * Update layer z-index
   */
  setLayerZIndex(key: string, zIndex: number): void {
    const layer = this.layers.get(key);
    if (layer) {
      layer.zIndex = zIndex;
      const config = this.layerConfigs.get(key);
      if (config) {
        config.zIndex = zIndex;
      }
      this.sortLayers();
    }
  }

  /**
   * Get all layer configurations
   */
  getLayerConfigs(): Map<string, LayerConfig> {
    return new Map(this.layerConfigs);
  }

  /**
   * Update all layers (called every frame)
   */
  update(_deltaTime: number): void {
    // Layers handle their own updates
    // This could be extended for layer-specific update logic
  }

  /**
   * Handle resize events
   */
  onResize(_width: number, _height: number): void {
    // Layers may need to adjust to new viewport size
    // This could be extended for layer-specific resize logic
  }

  /**
   * Clean up all layers
   */
  destroy(): void {
    this.layers.forEach((layer) => {
      layer.destroy({ children: true });
    });
    this.layers.clear();
    this.layerConfigs.clear();
  }

  // Convenience methods for standard layers

  /**
   * Get the field layer
   */
  get fieldLayer(): Container | undefined {
    return this.getLayer('field');
  }

  /**
   * Get the players layer
   */
  get playersLayer(): Container | undefined {
    return this.getLayer('players');
  }

  /**
   * Get the routes layer
   */
  get routesLayer(): Container | undefined {
    return this.getLayer('routes');
  }

  /**
   * Get the spacing indicators layer
   */
  get spacingLayer(): Container | undefined {
    return this.getLayer('spacingIndicators');
  }

  /**
   * Get the alignment guides layer
   */
  get alignmentLayer(): Container | undefined {
    return this.getLayer('alignmentGuides');
  }
}