/**
 * Input Validation Utilities for Pixi.js Diagram Editor
 *
 * Validates all inputs to prevent crashes from invalid data.
 * Provides clear error messages for debugging.
 */

/**
 * Validate dimensions (width/height)
 */
export function validateDimension(
  value: number,
  name: string,
  options: { min?: number; max?: number } = {}
): void {
  const { min = 0.1, max = 10000 } = options;

  if (typeof value !== "number" || isNaN(value)) {
    throw new Error(`${name} must be a valid number, got: ${value}`);
  }

  if (!isFinite(value)) {
    throw new Error(`${name} must be finite, got: ${value}`);
  }

  if (value <= 0) {
    throw new Error(`${name} must be positive, got: ${value}`);
  }

  if (value < min) {
    throw new Error(`${name} must be >= ${min}, got: ${value}`);
  }

  if (value > max) {
    throw new Error(`${name} must be <= ${max}, got: ${value}`);
  }
}

/**
 * Validate coordinates (x/y position)
 */
export function validateCoordinate(
  value: number,
  name: string,
  options: { min?: number; max?: number; allowNegative?: boolean } = {}
): void {
  const { min = -1000, max = 1000, allowNegative = true } = options;

  if (typeof value !== "number" || isNaN(value)) {
    throw new Error(`${name} must be a valid number, got: ${value}`);
  }

  if (!isFinite(value)) {
    throw new Error(`${name} must be finite, got: ${value}`);
  }

  if (!allowNegative && value < 0) {
    throw new Error(`${name} must be non-negative, got: ${value}`);
  }

  if (value < min) {
    throw new Error(`${name} must be >= ${min}, got: ${value}`);
  }

  if (value > max) {
    throw new Error(`${name} must be <= ${max}, got: ${value}`);
  }
}

/**
 * Validate zoom level
 */
export function validateZoom(
  value: number,
  options: { min?: number; max?: number } = {}
): void {
  const { min = 0.1, max = 10 } = options;

  if (typeof value !== "number" || isNaN(value)) {
    throw new Error(`Zoom must be a valid number, got: ${value}`);
  }

  if (!isFinite(value)) {
    throw new Error(`Zoom must be finite, got: ${value}`);
  }

  if (value <= 0) {
    throw new Error(`Zoom must be positive, got: ${value}`);
  }

  if (value < min) {
    throw new Error(`Zoom must be >= ${min}, got: ${value}`);
  }

  if (value > max) {
    throw new Error(`Zoom must be <= ${max}, got: ${value}`);
  }
}

/**
 * Validate player ID
 */
export function validatePlayerId(id: string): void {
  if (typeof id !== "string") {
    throw new Error(`Player ID must be a string, got: ${typeof id}`);
  }

  if (id.trim().length === 0) {
    throw new Error("Player ID cannot be empty");
  }

  if (id.length > 100) {
    throw new Error(`Player ID too long (max 100 chars), got: ${id.length}`);
  }
}

/**
 * Validate player position
 */
export function validatePlayerPosition(x: number, y: number): void {
  validateCoordinate(x, "Player X", { min: 0, max: 200, allowNegative: false });
  validateCoordinate(y, "Player Y", { min: 0, max: 200, allowNegative: false });
}

/**
 * Validate field dimensions
 */
export function validateFieldDimensions(width: number, height: number): void {
  validateDimension(width, "Field width", { min: 10, max: 200 });
  validateDimension(height, "Field height", { min: 10, max: 200 });
}

/**
 * Validate pixels per yard
 */
export function validatePixelsPerYard(value: number): void {
  validateDimension(value, "Pixels per yard", { min: 1, max: 100 });
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Safe number conversion with fallback
 */
export function toSafeNumber(
  value: unknown,
  fallback: number,
  options: { min?: number; max?: number } = {}
): number {
  const num = typeof value === "number" ? value : parseFloat(String(value));

  if (isNaN(num) || !isFinite(num)) {
    return fallback;
  }

  if (options.min !== undefined && num < options.min) {
    return options.min;
  }

  if (options.max !== undefined && num > options.max) {
    return options.max;
  }

  return num;
}

/**
 * Validate canvas element
 */
export function validateCanvas(canvas: unknown): canvas is HTMLCanvasElement {
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error("Canvas must be an HTMLCanvasElement");
  }

  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    // Provide more helpful error message
    console.error("❌ Canvas validation failed:", {
      width: rect.width,
      height: rect.height,
      parentElement: canvas.parentElement,
      parentRect: canvas.parentElement?.getBoundingClientRect(),
      canvasStyle: {
        display: getComputedStyle(canvas).display,
        width: getComputedStyle(canvas).width,
        height: getComputedStyle(canvas).height,
        position: getComputedStyle(canvas).position,
      },
    });
    throw new Error(
      `Canvas must have non-zero dimensions (got ${rect.width}x${rect.height}). ` +
        "Ensure the canvas container is visible and has size before initializing Pixi."
    );
  }

  return true;
}
