/**
 * WebGL Capability Detection Utilities
 * 
 * Checks if the browser/device supports WebGL and provides
 * detailed information about graphics capabilities.
 */

export interface WebGLCapabilities {
  supported: boolean;
  version: 1 | 2 | null;
  renderer: string | null;
  vendor: string | null;
  maxTextureSize: number | null;
  maxViewportDims: [number, number] | null;
  error: string | null;
}

/**
 * Check if WebGL is supported and get detailed capabilities
 */
export function detectWebGLCapabilities(): WebGLCapabilities {
  const result: WebGLCapabilities = {
    supported: false,
    version: null,
    renderer: null,
    vendor: null,
    maxTextureSize: null,
    maxViewportDims: null,
    error: null,
  };

  try {
    // Check for WebGL 2 first
    const canvas = document.createElement('canvas');
    let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
    
    // Try WebGL 2
    gl = canvas.getContext('webgl2') as WebGL2RenderingContext | null;
    if (gl) {
      result.version = 2;
      result.supported = true;
    } else {
      // Fallback to WebGL 1
      gl = canvas.getContext('webgl') as WebGLRenderingContext | null;
      if (!gl) {
        gl = canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
      }
      
      if (gl) {
        result.version = 1;
        result.supported = true;
      }
    }

    if (gl && result.supported) {
      // Get renderer info
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        result.renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string;
        result.vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) as string;
      }

      // Get capabilities
      result.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
      result.maxViewportDims = gl.getParameter(gl.MAX_VIEWPORT_DIMS) as [number, number];

      console.log('✅ WebGL Capabilities:', result);
    } else {
      result.error = 'WebGL not supported by this browser or device';
      console.warn('❌ WebGL not available');
    }

    // Clean up
    if (gl) {
      const loseContext = gl.getExtension('WEBGL_lose_context');
      if (loseContext) {
        loseContext.loseContext();
      }
    }

  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown WebGL detection error';
    console.error('❌ WebGL detection error:', error);
  }

  return result;
}

/**
 * Check if device meets minimum requirements for diagram editor
 */
export function checkMinimumRequirements(): {
  meetsRequirements: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  const capabilities = detectWebGLCapabilities();

  // Check WebGL support
  if (!capabilities.supported) {
    issues.push('WebGL is not supported');
  }

  // Check minimum texture size (4096x4096 for high-res field)
  if (capabilities.maxTextureSize && capabilities.maxTextureSize < 4096) {
    issues.push(`Maximum texture size (${capabilities.maxTextureSize}px) is below recommended (4096px)`);
  }

  // Check viewport dimensions
  if (capabilities.maxViewportDims) {
    const [maxWidth, maxHeight] = capabilities.maxViewportDims;
    if (maxWidth < 2048 || maxHeight < 2048) {
      issues.push(`Maximum viewport size (${maxWidth}×${maxHeight}) may limit canvas size`);
    }
  }

  // Check for software renderer (very slow)
  if (capabilities.renderer) {
    const renderer = capabilities.renderer.toLowerCase();
    if (renderer.includes('software') || renderer.includes('swiftshader')) {
      issues.push('Using software renderer - performance may be degraded');
    }
  }

  return {
    meetsRequirements: issues.length === 0,
    issues,
  };
}

/**
 * Get user-friendly error message based on capabilities
 */
export function getWebGLErrorMessage(capabilities: WebGLCapabilities): string {
  if (!capabilities.supported) {
    return 'Your browser does not support WebGL graphics, which is required for the diagram editor. Please update your browser or try a different device.';
  }

  if (capabilities.error) {
    return `Graphics initialization failed: ${capabilities.error}`;
  }

  return 'An unknown graphics error occurred. Please try refreshing the page.';
}

/**
 * Log detailed system info for debugging
 */
export function logSystemInfo(): void {
  const capabilities = detectWebGLCapabilities();
  const requirements = checkMinimumRequirements();

  console.group('🖥️ System Information');
  console.log('Browser:', navigator.userAgent);
  console.log('Platform:', navigator.platform);
  console.log('Screen:', `${screen.width}×${screen.height} @ ${window.devicePixelRatio}x`);
  console.log('WebGL:', capabilities);
  console.log('Requirements:', requirements);
  console.groupEnd();
}
