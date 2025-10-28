/**
 * Canvas Abstraction Layer
 *
 * Clean API for diagram rendering that hides Pixi.js complexity
 * Supports easy swapping to other canvas libraries if needed
 */

import * as PIXI from 'pixi.js';
import type { FieldPosition, CanvasPosition } from '../../types/field';
import { ROUTE_STYLES } from '../../types/field';
import { Application } from 'pixi.js';
import type {
  FormationPlayer,
  Route
} from '../../types/diagram';

// ============================================================================
// PLAYER SPRITE INTERFACE
// ============================================================================

/** Player sprite interface for diagram interactions */
export interface PlayerSprite {
  getBounds(): { x: number; y: number; width: number; height: number };
  getId(): string;
  getGlobalPosition(): { x: number; y: number };
}

// ============================================================================
// PLAYERS LAYER INTERFACE
// ============================================================================

/** Players layer interface for drag box selection and sprite management */
export interface IPlayersLayer {
  getAllPlayers(): PlayerSprite[];
  clearSelection(): void;
  selectPlayer(id: string, additive?: boolean): void;
}

// ============================================================================
// PLAYERS LAYER IMPLEMENTATION
// ============================================================================

/** Players layer implementation for sprite management */
class PlayersLayer implements IPlayersLayer {
  private canvas: PixiDiagramCanvas;
  private selectedPlayerIds: Set<string> = new Set();

  constructor(canvas: PixiDiagramCanvas) {
    this.canvas = canvas;
  }

  getAllPlayers(): PlayerSprite[] {
    const sprites: PlayerSprite[] = [];
    this.canvas.getPlayerSprites().forEach((container, id) => {
      sprites.push(new PlayerSpriteImpl(container, id));
    });
    return sprites;
  }

  clearSelection(): void {
    this.selectedPlayerIds.clear();
    this.canvas.selectPlayer(null);
  }

  selectPlayer(id: string, additive: boolean = false): void {
    if (!additive) {
      this.selectedPlayerIds.clear();
    }
    this.selectedPlayerIds.add(id);
    this.canvas.selectPlayer(id);
  }
}

/** Player sprite implementation wrapping PIXI.Container */
class PlayerSpriteImpl implements PlayerSprite {
  constructor(private container: PIXI.Container, private id: string) {}

  getBounds(): { x: number; y: number; width: number; height: number } {
    const bounds = this.container.getBounds();
    return {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height
    };
  }

  getId(): string {
    return this.id;
  }

  getGlobalPosition(): { x: number; y: number } {
    return {
      x: this.container.worldTransform.tx,
      y: this.container.worldTransform.ty
    };
  }
}

// ============================================================================
// CORE CANVAS ABSTRACTION
// ============================================================================

/** Canvas abstraction interface */
export interface IDiagramCanvas {
  // Lifecycle
  initialize(container: HTMLElement): Promise<void>;
  destroy(): void;

  // Viewport
  setZoom(zoom: number): void;
  setPan(x: number, y: number): void;
  fitToView(): void;

  // Field rendering
  renderField(): void;

  // Player management
  addPlayer(player: FormationPlayer): string;
  updatePlayer(id: string, player: Partial<FormationPlayer>): void;
  removePlayer(id: string): void;
  getPlayerPosition(id: string): FieldPosition | null;

  // Route management
  addRoute(route: Route): string;
  updateRoute(id: string, route: Partial<Route>): void;
  removeRoute(id: string): void;

  // Selection and interaction
  selectPlayer(id: string | null): void;
  selectRoute(id: string | null): void;
  getSelectedPlayer(): string | null;
  getSelectedRoute(): string | null;
  getSelectedPlayerIds(): string[];
  clearSelection(): void;

  // Player data access
  getPlayer(id: string): FormationPlayer | null;
  getAllPlayers(): FormationPlayer[];

  // Canvas access for advanced operations
  getCanvasElement(): HTMLCanvasElement | null;
  canvasToField(canvasPos: CanvasPosition): FieldPosition;
  fieldToCanvas(fieldPos: FieldPosition): CanvasPosition;

  // Event handling
  onPlayerMove(callback: (id: string, position: FieldPosition) => void): void;
  onPlayerSelect(callback: (id: string | null) => void): void;
  onPlayerDragStart(callback: (id: string) => void): void;
  onPlayerDragEnd(callback: (id: string) => void): void;
  onRouteDraw(callback: (route: Omit<Route, 'id'>) => void): void;
  onCanvasClick(callback: (position: FieldPosition) => void): void;

  // Export
  exportToImage(): Promise<Blob>;
  getCanvasData(): any; // Pixi.js specific data for advanced operations
}

/** Canvas configuration */
export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor: number;
  antialias: boolean;
  resolution: number;
}

// ============================================================================
// PIXI.JS IMPLEMENTATION
// ============================================================================

/** Pixi.js based diagram canvas implementation */
export class PixiDiagramCanvas implements IDiagramCanvas {
  private app: PIXI.Application | null = null;

  // Layers for organization
  private fieldLayer: PIXI.Container;
  private playersLayer: PIXI.Container;
  private routesLayer: PIXI.Container;
  private uiLayer: PIXI.Container;

  // Player and route storage
  private players: Map<string, PIXI.Container> = new Map();
  private routes: Map<string, PIXI.Graphics> = new Map();
  private playerData: Map<string, FormationPlayer> = new Map();
  private routeData: Map<string, Route> = new Map();

  // Selection state
  private selectedPlayerId: string | null = null;
  private selectedRouteId: string | null = null;

  // Drag state
  private draggedPlayerId: string | null = null;
  private dragStartPos: CanvasPosition | null = null;

  // Initialization state
  private isInitialized: boolean = false;

  // Players layer instance for external access
  private _playersLayerInstance: PlayersLayer | null = null;

  // Event callbacks
  private _onPlayerMoveCallback?: (id: string, position: FieldPosition) => void;
  private _onPlayerSelectCallback?: (id: string | null) => void;
  private _onPlayerDragStartCallback?: (id: string) => void;
  private _onPlayerDragEndCallback?: (id: string) => void;
  private _onCanvasClickCallback?: (position: FieldPosition) => void;

  // Configuration
  private config: CanvasConfig;

  constructor(config: Partial<CanvasConfig> = {}) {
    this.config = {
      width: 1200,
      height: 600,
      backgroundColor: 0x2d5a27, // Field green
      antialias: true,
      resolution: 2,
      ...config
    };

    // Initialize layers
    this.fieldLayer = new PIXI.Container();
    this.playersLayer = new PIXI.Container();
    this.routesLayer = new PIXI.Container();
    this.uiLayer = new PIXI.Container();
  }

  // ============================================================================
  // LIFECYCLE METHODS
  // ============================================================================

  async initialize(container: HTMLElement): Promise<void> {
    try {
      // Create Pixi.js application using v8 API
      this.app = new Application();

      // Initialize with options
      await this.app.init({
        width: this.config.width,
        height: this.config.height,
        backgroundColor: this.config.backgroundColor,
        antialias: this.config.antialias,
        resolution: this.config.resolution,
      });

      // Verify app was created and initialized
      if (!this.app) {
        throw new Error('Failed to create PixiJS application');
      }

      // Add to DOM using canvas property
      const canvasElement = this.app.canvas;
      if (!canvasElement) {
        throw new Error('PixiJS application canvas not available');
      }

      container.appendChild(canvasElement);

      // Force canvas to be visible
      canvasElement.style.display = 'block';
      canvasElement.style.width = '100%';
      canvasElement.style.height = '100%';

      // Setup layers
      this.app.stage.addChild(this.fieldLayer);
      this.app.stage.addChild(this.routesLayer);
      this.app.stage.addChild(this.playersLayer);
      this.app.stage.addChild(this.uiLayer);

      // Setup event handling
      this.setupEventHandling();

      // Render initial field
      this.renderField();

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize PixiJS canvas:', error);
      throw error;
    }
  }

  destroy(): void {
    if (this.isInitialized && this.app) {
      this.app.destroy(true);
      this.app = null;
    }

    // Clear references
    this.players.clear();
    this.routes.clear();
    this.playerData.clear();
    this.routeData.clear();
  }

  // ============================================================================
  // VIEWPORT METHODS
  // ============================================================================

  setZoom(zoom: number): void {
    if (!this.app) return;
    this.app.stage.scale.set(zoom);
  }

  setPan(x: number, y: number): void {
    if (!this.app) return;
    this.app.stage.position.set(x, y);
  }

  fitToView(): void {
    if (!this.app) return;
    // Reset zoom and pan to show entire field
    this.setZoom(1);
    this.setPan(0, 0);
  }

  // ============================================================================
  // FIELD RENDERING
  // ============================================================================

  /**
   * Field context for rendering (midfield, redzone, goalline, backed_up)
   */
  private fieldContext: "midfield" | "redzone" | "goalline" | "backed_up" = "midfield";

  setFieldContext(context: "midfield" | "redzone" | "goalline" | "backed_up") {
    this.fieldContext = context;
    this.renderField();
  }

  renderField(): void {
    if (!this.fieldLayer) return;

    // Clear existing field
    this.fieldLayer.removeChildren();

    // Determine window for drawing area based on context
    let windowStartY = 0;
    let windowEndY = 120;
    let scrimmageY = 20; // Default line of scrimmage (yards from top)
    if (this.fieldContext === "midfield") {
      windowStartY = 45;
      windowEndY = 75;
      scrimmageY = 60;
    } else if (this.fieldContext === "redzone") {
      windowStartY = 80;
      windowEndY = 110;
      scrimmageY = 90;
    } else if (this.fieldContext === "goalline") {
      windowStartY = 100;
      windowEndY = 120;
      scrimmageY = 110;
    } else if (this.fieldContext === "backed_up") {
      windowStartY = 10;
      windowEndY = 40;
      scrimmageY = 20;
    }

    // Draw field background
    const fieldBg = new PIXI.Graphics();
    fieldBg.fill(0x2d5a27); // Field green
    fieldBg.rect(0, 0, this.config.width, this.config.height);
    this.fieldLayer.addChild(fieldBg);

    // Draw yard lines (every 10 yards with numbers) within window
    this.drawYardLines(windowStartY, windowEndY);

    // Draw hash marks (NFHS positioning) within window
    this.drawHashMarks(windowStartY, windowEndY);

    // Draw end zones if visible
    this.drawEndZones(windowStartY, windowEndY);

    // Draw line of scrimmage (orange)
    this.drawLineOfScrimmage(scrimmageY, windowStartY, windowEndY);
  }

  private drawYardLines(startY = 0, endY = 120): void {
    const graphics = new PIXI.Graphics();
    graphics.setStrokeStyle({ width: 2, color: 0xffffff });
    for (let yard = Math.ceil(startY / 10) * 10; yard <= endY; yard += 10) {
      const y = ((yard - startY) / (endY - startY)) * this.config.height;
      graphics.moveTo(0, y);
      graphics.lineTo(this.config.width, y);
      if (yard > 0 && yard < 120) {
        const yardNumber = yard <= 50 ? yard : 100 - yard;
        const text = new PIXI.Text({
          text: yardNumber.toString(),
          style: {
            fontFamily: 'Arial',
            fontSize: 16,
            fill: 0xffffff,
            align: 'center'
          }
        });
        text.x = this.config.width / 2 - text.width / 2;
        text.y = y - text.height / 2;
        this.fieldLayer.addChild(text);
      }
    }
    this.fieldLayer.addChild(graphics);
  }

  private drawHashMarks(startY = 0, endY = 120): void {
    const graphics = new PIXI.Graphics();
    graphics.setStrokeStyle({ width: 1, color: 0xffffff });
    const hashOffset = 0.333;
    for (let yard = Math.ceil(startY / 5) * 5; yard <= endY; yard += 5) {
      if (yard % 10 === 0) continue;
      const y = ((yard - startY) / (endY - startY)) * this.config.height;
      graphics.moveTo(this.config.width * hashOffset, y);
      graphics.lineTo(this.config.width * hashOffset + 8, y);
      graphics.moveTo(this.config.width * (1 - hashOffset) - 8, y);
      graphics.lineTo(this.config.width * (1 - hashOffset), y);
    }
    this.fieldLayer.addChild(graphics);
  }

  private drawEndZones(startY = 0, endY = 120): void {
    const graphics = new PIXI.Graphics();
    // Only draw end zones if visible in window
    if (startY <= 10 && endY > 0) {
      // Top end zone
      const topHeight = Math.min(10, endY) - startY;
      if (topHeight > 0) {
        graphics.fill(0x1e40af);
        graphics.rect(0, 0, this.config.width, (topHeight / (endY - startY)) * this.config.height);
      }
    }
    if (endY >= 110 && startY < 120) {
      // Bottom end zone
      const bottomStart = Math.max(110, startY);
      const bottomHeight = endY - bottomStart;
      if (bottomHeight > 0) {
        graphics.fill(0x1e40af);
        graphics.rect(0, ((bottomStart - startY) / (endY - startY)) * this.config.height, this.config.width, (bottomHeight / (endY - startY)) * this.config.height);
      }
    }
    this.fieldLayer.addChild(graphics);
  }

  private drawLineOfScrimmage(scrimmageY: number, windowStartY: number, windowEndY: number): void {
    // Draw a thick orange line at the line of scrimmage
    if (scrimmageY < windowStartY || scrimmageY > windowEndY) return;
    const y = ((scrimmageY - windowStartY) / (windowEndY - windowStartY)) * this.config.height;
    const graphics = new PIXI.Graphics();
    graphics.setStrokeStyle({ width: 6, color: 0xff8800 }); // Orange
    graphics.moveTo(0, y);
    graphics.lineTo(this.config.width, y);
    this.fieldLayer.addChild(graphics);
  }

  // ============================================================================
  // PLAYER MANAGEMENT
  // ============================================================================

  addPlayer(player: FormationPlayer): string {
    if (!this.playersLayer) return '';

    const playerId = player.id;

    // Create player container
    const playerContainer = new PIXI.Container();

    // Create player circle
    const circle = new PIXI.Graphics();
    circle.beginFill(this.getPlayerColor(player));
    circle.drawCircle(0, 0, 12); // 12px radius
    circle.endFill();
    circle.lineStyle(2, 0xffffff);
    circle.drawCircle(0, 0, 12);
    playerContainer.addChild(circle);

    // Create player label
    const label = new PIXI.Text(player.label, {
      fontFamily: 'Arial',
      fontSize: 14,
      fill: 0xffffff,
      fontWeight: 'bold'
    });
    label.anchor.set(0.5);
    playerContainer.addChild(label);

    // Position player
    const canvasPos = this.fieldToCanvas(player.fieldPosition);
    playerContainer.position.set(canvasPos.x, canvasPos.y);

    // Make interactive
    playerContainer.interactive = true;
    playerContainer.cursor = 'pointer';

    // Add event listeners
    playerContainer.on('pointerdown', (event: PIXI.FederatedPointerEvent) => {
      event.stopPropagation();
      this.selectPlayer(playerId);

      // Start drag
      this.draggedPlayerId = playerId;
      this.dragStartPos = { x: event.globalX, y: event.globalY };
      this._onPlayerDragStartCallback?.(playerId);
    });

    playerContainer.on('pointermove', (event: PIXI.FederatedPointerEvent) => {
      if (this.draggedPlayerId === playerId && this.dragStartPos) {
        const canvasPos = { x: event.globalX, y: event.globalY };
        const fieldPos = this.canvasToField(canvasPos);
        this._onPlayerMoveCallback?.(playerId, fieldPos);
      }
    });

    playerContainer.on('pointerup', (_event: PIXI.FederatedPointerEvent) => {
      if (this.draggedPlayerId === playerId) {
        // End drag
        this.draggedPlayerId = null;
        this.dragStartPos = null;
        this._onPlayerDragEndCallback?.(playerId);
      }
    });

    playerContainer.on('pointerupoutside', (_event: PIXI.FederatedPointerEvent) => {
      if (this.draggedPlayerId === playerId) {
        // End drag (released outside player)
        this.draggedPlayerId = null;
        this.dragStartPos = null;
        this._onPlayerDragEndCallback?.(playerId);
      }
    });

    // Store references
    this.players.set(playerId, playerContainer);
    this.playerData.set(playerId, player);
    this.playersLayer.addChild(playerContainer);

    return playerId;
  }

  updatePlayer(id: string, updates: Partial<FormationPlayer>): void {
    const player = this.playerData.get(id);
    const container = this.players.get(id);

    if (!player || !container) return;

    // Update data
    const updatedPlayer = { ...player, ...updates };
    this.playerData.set(id, updatedPlayer);

    // Update visual position
    if (updates.fieldPosition) {
      const canvasPos = this.fieldToCanvas(updates.fieldPosition);
      container.position.set(canvasPos.x, canvasPos.y);
    }

    // Update label
    if (updates.label) {
      const label = container.children[1] as PIXI.Text;
      label.text = updates.label;
    }

    // Update color
    if (updates.color) {
      const circle = container.children[0] as PIXI.Graphics;
      circle.clear();
      circle.beginFill(this.parseColor(updates.color));
      circle.drawCircle(0, 0, 12);
      circle.endFill();
      circle.lineStyle(2, 0xffffff);
      circle.drawCircle(0, 0, 12);
    }
  }

  removePlayer(id: string): void {
    const container = this.players.get(id);
    if (container && this.playersLayer) {
      this.playersLayer.removeChild(container);
    }

    this.players.delete(id);
    this.playerData.delete(id);

    if (this.selectedPlayerId === id) {
      this.selectPlayer(null);
    }
  }

  getPlayerPosition(id: string): FieldPosition | null {
    const player = this.playerData.get(id);
    return player ? player.fieldPosition : null;
  }

  // ============================================================================
  // ROUTE MANAGEMENT
  // ============================================================================

  addRoute(route: Route): string {
    if (!this.routesLayer) return '';

    const routeId = route.id;

    // Create route graphics
    const graphics = new PIXI.Graphics();
    this.drawRoutePath(graphics, route);

    // Make interactive
    graphics.interactive = true;
    graphics.cursor = 'pointer';

    graphics.on('pointerdown', (event: PIXI.FederatedPointerEvent) => {
      event.stopPropagation();
      this.selectRoute(routeId);
    });

    // Store references
    this.routes.set(routeId, graphics);
    this.routeData.set(routeId, route);
    this.routesLayer.addChild(graphics);

    return routeId;
  }

  updateRoute(id: string, updates: Partial<Route>): void {
    const route = this.routeData.get(id);
    const graphics = this.routes.get(id);

    if (!route || !graphics) return;

    // Update data
    const updatedRoute = { ...route, ...updates };
    this.routeData.set(id, updatedRoute);

    // Redraw route
    graphics.clear();
    this.drawRoutePath(graphics, updatedRoute);
  }

  removeRoute(id: string): void {
    const graphics = this.routes.get(id);
    if (graphics && this.routesLayer) {
      this.routesLayer.removeChild(graphics);
    }

    this.routes.delete(id);
    this.routeData.delete(id);

    if (this.selectedRouteId === id) {
      this.selectRoute(null);
    }
  }

  private drawRoutePath(graphics: PIXI.Graphics, route: Route): void {
    if (route.path.length < 2) return;

    const style = ROUTE_STYLES[route.type];
    const color = this.parseColor(style.color);

    // Set line style
    if (style.style === 'dashed') {
      // For dashed lines, we'll use a thicker solid line for now
      // TODO: Implement proper dashed lines with custom shader
      graphics.lineStyle(style.width * 2, color, 0.7);
    } else if (style.style === 'dotted') {
      // For dotted lines, we'll use a thinner solid line for now
      // TODO: Implement proper dotted lines with custom shader
      graphics.lineStyle(style.width, color, 0.5);
    } else {
      graphics.lineStyle(style.width, color);
    }

    // Draw path
    const startPos = this.fieldToCanvas(route.path[0]);
    graphics.moveTo(startPos.x, startPos.y);

    for (let i = 1; i < route.path.length; i++) {
      const pos = this.fieldToCanvas(route.path[i]);
      graphics.lineTo(pos.x, pos.y);
    }

    // Draw arrow head at end
    if (route.path.length >= 2) {
      const endPos = this.fieldToCanvas(route.path[route.path.length - 1]);
      const prevPos = this.fieldToCanvas(route.path[route.path.length - 2]);

      this.drawArrowHead(graphics, prevPos, endPos, color);
    }
  }

  private drawArrowHead(graphics: PIXI.Graphics, from: CanvasPosition, to: CanvasPosition, color: number): void {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const arrowLength = 8;

    const arrowX = to.x - arrowLength * Math.cos(angle);
    const arrowY = to.y - arrowLength * Math.sin(angle);

    graphics.lineStyle(2, color);
    graphics.moveTo(to.x, to.y);
    graphics.lineTo(
      arrowX - arrowLength * Math.cos(angle - Math.PI/6),
      arrowY - arrowLength * Math.sin(angle - Math.PI/6)
    );
    graphics.moveTo(to.x, to.y);
    graphics.lineTo(
      arrowX - arrowLength * Math.cos(angle + Math.PI/6),
      arrowY - arrowLength * Math.sin(angle + Math.PI/6)
    );
  }

  // ============================================================================
  // SELECTION AND INTERACTION
  // ============================================================================

  selectPlayer(id: string | null): void {
    // Clear previous selection
    if (this.selectedPlayerId) {
      const prevContainer = this.players.get(this.selectedPlayerId);
      if (prevContainer) {
        // Remove selection highlight
        const circle = prevContainer.children[0] as PIXI.Graphics;
        circle.clear();
        const player = this.playerData.get(this.selectedPlayerId)!;
        circle.beginFill(this.getPlayerColor(player));
        circle.drawCircle(0, 0, 12);
        circle.endFill();
        circle.lineStyle(2, 0xffffff);
        circle.drawCircle(0, 0, 12);
      }
    }

    this.selectedPlayerId = id;

    // Highlight new selection
    if (id) {
      const container = this.players.get(id);
      if (container) {
        const circle = container.children[0] as PIXI.Graphics;
        circle.clear();
        const player = this.playerData.get(id)!;
        circle.beginFill(this.getPlayerColor(player));
        circle.drawCircle(0, 0, 12);
        circle.endFill();
        circle.lineStyle(3, 0xffff00); // Yellow selection border
        circle.drawCircle(0, 0, 12);
      }
    }

    this._onPlayerSelectCallback?.(id);
  }

  selectRoute(id: string | null): void {
    // Clear previous selection
    if (this.selectedRouteId) {
      const prevGraphics = this.routes.get(this.selectedRouteId);
      if (prevGraphics) {
        const route = this.routeData.get(this.selectedRouteId)!;
        prevGraphics.clear();
        this.drawRoutePath(prevGraphics, route);
      }
    }

    this.selectedRouteId = id;

    // Highlight new selection (thicker line)
    if (id) {
      const graphics = this.routes.get(id);
      if (graphics) {
        const route = this.routeData.get(id)!;
        graphics.clear();
        const style = ROUTE_STYLES[route.type];
        graphics.lineStyle(style.width + 2, 0xffff00); // Yellow selection
        // Redraw path with highlight
        const startPos = this.fieldToCanvas(route.path[0]);
        graphics.moveTo(startPos.x, startPos.y);
        for (let i = 1; i < route.path.length; i++) {
          const pos = this.fieldToCanvas(route.path[i]);
          graphics.lineTo(pos.x, pos.y);
        }
      }
    }
  }

  getSelectedPlayer(): string | null {
    return this.selectedPlayerId;
  }

  getSelectedRoute(): string | null {
    return this.selectedRouteId;
  }

  getSelectedPlayerIds(): string[] {
    return this.selectedPlayerId ? [this.selectedPlayerId] : [];
  }

  clearSelection(): void {
    this.selectPlayer(null);
    this.selectRoute(null);
  }

  getPlayer(id: string): FormationPlayer | null {
    return this.playerData.get(id) || null;
  }

  getAllPlayers(): FormationPlayer[] {
    return Array.from(this.playerData.values());
  }

  getCanvasElement(): HTMLCanvasElement | null {
    return this.app?.canvas || null;
  }

  // ============================================================================
  // PLAYERS LAYER ACCESS
  // ============================================================================

  /** Get access to player sprites for drag box selection */
  getPlayersLayer(): IPlayersLayer {
    if (!this._playersLayerInstance) {
      this._playersLayerInstance = new PlayersLayer(this);
    }
    return this._playersLayerInstance;
  }

  /** Get player sprite containers (for internal use) */
  getPlayerSprites(): Map<string, PIXI.Container> {
    return this.players;
  }

  // ============================================================================
  // EVENT HANDLING
  // ============================================================================

  onPlayerMove(callback: (id: string, position: FieldPosition) => void): void {
    this._onPlayerMoveCallback = callback;
  }

  onPlayerSelect(callback: (id: string | null) => void): void {
    this._onPlayerSelectCallback = callback;
  }

  onPlayerDragStart(callback: (id: string) => void): void {
    this._onPlayerDragStartCallback = callback;
  }

  onPlayerDragEnd(callback: (id: string) => void): void {
    this._onPlayerDragEndCallback = callback;
  }

  onRouteDraw(_callback: (route: Omit<Route, 'id'>) => void): void {
    // Not implemented - route drawing handled elsewhere
  }

  onCanvasClick(callback: (position: FieldPosition) => void): void {
    this._onCanvasClickCallback = callback;
  }

  private setupEventHandling(): void {
    if (!this.app) return;

    // Canvas click handling
    this.app.stage.interactive = true;
    this.app.stage.on('pointerdown', (event: PIXI.FederatedPointerEvent) => {
      // Only handle if not clicking on a player or route
      if (event.target === this.app!.stage) {
        const canvasPos = { x: event.globalX, y: event.globalY };
        const fieldPos = this.canvasToField(canvasPos);
        this._onCanvasClickCallback?.(fieldPos);
      }
    });
  }

  // ============================================================================
  // EXPORT METHODS
  // ============================================================================

  async exportToImage(): Promise<Blob> {
    if (!this.app) throw new Error('Canvas not initialized');

    const canvas = this.app.renderer.extract.canvas(this.app.stage);
    if (!canvas) throw new Error('Failed to extract canvas');

    return new Promise((resolve, reject) => {
      (canvas as HTMLCanvasElement).toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      });
    });
  }

  getCanvasData(): any {
    return {
      app: this.app,
      stage: this.app?.stage,
      players: this.players,
      routes: this.routes,
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  fieldToCanvas(fieldPos: FieldPosition): CanvasPosition {
    return {
      x: (fieldPos.x / 120) * this.config.width,
      y: (fieldPos.y / 53.3) * this.config.height,
    };
  }

  canvasToField(canvasPos: CanvasPosition): FieldPosition {
    return {
      x: (canvasPos.x / this.config.width) * 120,
      y: (canvasPos.y / this.config.height) * 53.3,
    };
  }

  private getPlayerColor(player: FormationPlayer): number {
    if (player.color) return this.parseColor(player.color);

    // Accessible, colorblind-friendly palette using design tokens (semantic mapping)
    switch (player.playerPosition) {
      case 'QB': return 0xffa500; // Orange (semantic: qb-primary)
      case 'RB': case 'FB': return 0x009688; // Teal (semantic: rb-primary)
      case 'WR': case 'SLOT': case 'SE': case 'FL': case 'X': case 'Y': case 'Z': case 'H':
        return 0x1976d2; // Blue (semantic: wr-primary)
      case 'TE': return 0x388e3c; // Green (semantic: te-primary)
      case 'LT': case 'LG': case 'C': case 'RG': case 'RT':
        return 0x757575; // Gray (semantic: ol-primary)
      default: return 0xbdbdbd; // Neutral/gray fallback
    }
  }

  private parseColor(color: string): number {
    // Convert hex string to number
    return parseInt(color.replace('#', ''), 16);
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/** Create a new diagram canvas instance */
export function createDiagramCanvas(config?: Partial<CanvasConfig>): IDiagramCanvas {
  return new PixiDiagramCanvas(config);
}