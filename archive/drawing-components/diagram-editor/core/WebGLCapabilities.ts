/**
 * WebGL Capability Detection
 *
 * Detects WebGL support and advanced features for optimal rendering
 */

export interface WebGLCapabilitiesResult {
  supported: boolean;
  version: number; // 0, 1, or 2
  features: {
    webgl2: boolean;
    instancing: boolean;
    floatTextures: boolean;
    anisotropy: boolean;
    compressedTextures: boolean;
    vertexArrayObjects: boolean;
  };
  limits: {
    maxTextureSize: number;
    maxViewportDims: [number, number];
    maxRenderbufferSize: number;
  };
}

/**
 * Detect WebGL capabilities and features
 */
export function detectWebGLCapabilities(): WebGLCapabilitiesResult {
  const canvas = document.createElement('canvas');
  const result: WebGLCapabilitiesResult = {
    supported: false,
    version: 0,
    features: {
      webgl2: false,
      instancing: false,
      floatTextures: false,
      anisotropy: false,
      compressedTextures: false,
      vertexArrayObjects: false,
    },
    limits: {
      maxTextureSize: 0,
      maxViewportDims: [0, 0],
      maxRenderbufferSize: 0,
    },
  };

  let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;

  // Try WebGL 2 first
  try {
    gl = canvas.getContext('webgl2', {
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false,
    }) as WebGL2RenderingContext | null;

    if (gl) {
      result.version = 2;
      result.features.webgl2 = true;
    }
  } catch {
    // WebGL2 not supported
  }

  // Fallback to WebGL 1
  if (!gl) {
    try {
      gl = canvas.getContext('webgl', {
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false,
      }) as WebGLRenderingContext | null;

      if (gl) {
        result.version = 1;
      }
    } catch {
      // WebGL not supported at all
      return result;
    }
  }

  if (!gl) {
    return result;
  }

  result.supported = true;

  // Detect features
  result.features.instancing = !!(gl as any).drawArraysInstanced || !!(gl as any).drawElementsInstanced;
  result.features.floatTextures = !!gl.getExtension('OES_texture_float');
  result.features.anisotropy = !!gl.getExtension('EXT_texture_filter_anisotropic');
  result.features.compressedTextures = !!gl.getExtension('WEBGL_compressed_texture_s3tc');
  result.features.vertexArrayObjects = !!gl.getExtension('OES_vertex_array_object');

  // Get limits
  result.limits.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  result.limits.maxViewportDims = gl.getParameter(gl.MAX_VIEWPORT_DIMS) as [number, number];
  result.limits.maxRenderbufferSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);

  return result;
}

/**
 * Check if the current environment meets minimum requirements
 */
export function checkMinimumRequirements(): boolean {
  const caps = detectWebGLCapabilities();

  if (!caps.supported) return false;
  if (caps.limits.maxTextureSize < 2048) return false; // Minimum texture size
  if (caps.limits.maxViewportDims[0] < 1024 || caps.limits.maxViewportDims[1] < 768) return false;

  return true;
}

/**
 * Get a user-friendly error message for WebGL issues
 */
export function getWebGLErrorMessage(): string {
  const caps = detectWebGLCapabilities();

  if (!caps.supported) {
    return 'WebGL is not supported on this device. Please update your browser or graphics drivers.';
  }

  if (!checkMinimumRequirements()) {
    return 'Your device does not meet the minimum requirements for the diagram editor. Please try on a more powerful device.';
  }

  return 'Unknown WebGL error occurred.';
}