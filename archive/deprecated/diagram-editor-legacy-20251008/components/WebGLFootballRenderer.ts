/**
 * WebGL Football Field Renderer
 *
 * High-performance WebGL-based rendering engine for football diagrams.
 * Provides hardware-accelerated rendering with instancing for optimal performance.
 */

export interface WebGLFieldConfig {
  width: number;
  height: number;
  pixelsPerYard: number;
  backgroundColor: [number, number, number, number];
  lineColor: [number, number, number, number];
  hashColor: [number, number, number, number];
}

export interface WebGLPlayer {
  id: string;
  x: number;
  y: number;
  color: [number, number, number, number];
  label: string;
  selected: boolean;
}

export interface WebGLRoutePoint {
  x: number;
  y: number;
  color: [number, number, number, number];
  width: number;
}

export interface ViewportBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export class WebGLFootballRenderer {
  private gl: WebGLRenderingContext;
  private fieldProgram: WebGLProgram;
  private playerProgram: WebGLProgram;
  private routeProgram: WebGLProgram;
  private fieldBuffer: WebGLBuffer;
  private playerBuffer: WebGLBuffer;
  private routeBuffer: WebGLBuffer;
  private config: WebGLFieldConfig;

  constructor(canvas: HTMLCanvasElement, config: WebGLFieldConfig) {
    this.config = config;
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) {
      throw new Error("WebGL not supported");
    }
    this.gl = gl as WebGLRenderingContext;

    // Initialize WebGL
    this.initWebGL();

    // Create shaders and programs
    this.fieldProgram = this.createFieldProgram();
    this.playerProgram = this.createPlayerProgram();
    this.routeProgram = this.createRouteProgram();

    // Create buffers
    this.fieldBuffer = this.createFieldBuffer();
    this.playerBuffer = this.createPlayerBuffer();
    this.routeBuffer = this.createRouteBuffer();
  }

  private initWebGL(): void {
    const gl = this.gl;

    // Enable extensions for better performance
    const ext = gl.getExtension("OES_vertex_array_object");
    if (ext) {
      // Use VAOs if available
    }

    // Set viewport
    gl.viewport(0, 0, this.config.width, this.config.height);

    // Enable blending for transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Clear color
    gl.clearColor(...this.config.backgroundColor);
  }

  private createShader(type: number, source: string): WebGLShader {
    const gl = this.gl;
    const shader = gl.createShader(type);
    if (!shader) throw new Error("Failed to create shader");

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Shader compilation error: ${error}`);
    }

    return shader;
  }

  private createProgram(
    vertexSource: string,
    fragmentSource: string
  ): WebGLProgram {
    const gl = this.gl;
    const program = gl.createProgram();
    if (!program) throw new Error("Failed to create program");

    const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.createShader(
      gl.FRAGMENT_SHADER,
      fragmentSource
    );

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const error = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(`Program linking error: ${error}`);
    }

    return program;
  }

  private createFieldProgram(): WebGLProgram {
    const vertexSource = `
      attribute vec2 a_position;
      attribute vec4 a_color;
      uniform vec2 u_resolution;
      uniform vec2 u_translation;
      uniform float u_scale;
      varying vec4 v_color;

      void main() {
        vec2 position = (a_position + u_translation) * u_scale;
        vec2 clipSpace = (position / u_resolution) * 2.0 - 1.0;
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        v_color = a_color;
      }
    `;

    const fragmentSource = `
      precision mediump float;
      varying vec4 v_color;

      void main() {
        gl_FragColor = v_color;
      }
    `;

    return this.createProgram(vertexSource, fragmentSource);
  }

  private createPlayerProgram(): WebGLProgram {
    const vertexSource = `
      attribute vec2 a_position;
      attribute vec4 a_color;
      attribute float a_size;
      uniform vec2 u_resolution;
      uniform vec2 u_translation;
      uniform float u_scale;
      varying vec4 v_color;

      void main() {
        vec2 position = (a_position + u_translation) * u_scale;
        vec2 clipSpace = (position / u_resolution) * 2.0 - 1.0;
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        gl_PointSize = a_size * u_scale;
        v_color = a_color;
      }
    `;

    const fragmentSource = `
      precision mediump float;
      varying vec4 v_color;

      void main() {
        // Create circular points
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);

        if (dist > 0.5) {
          discard;
        }

        // Soft edges
        float alpha = 1.0 - smoothstep(0.4, 0.5, dist);
        gl_FragColor = vec4(v_color.rgb, v_color.a * alpha);
      }
    `;

    return this.createProgram(vertexSource, fragmentSource);
  }

  private createRouteProgram(): WebGLProgram {
    const vertexSource = `
      attribute vec2 a_position;
      attribute vec4 a_color;
      attribute float a_width;
      uniform vec2 u_resolution;
      uniform vec2 u_translation;
      uniform float u_scale;
      varying vec4 v_color;
      varying float v_width;

      void main() {
        vec2 position = (a_position + u_translation) * u_scale;
        vec2 clipSpace = (position / u_resolution) * 2.0 - 1.0;
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        gl_PointSize = a_width * u_scale;
        v_color = a_color;
        v_width = a_width;
      }
    `;

    const fragmentSource = `
      precision mediump float;
      varying vec4 v_color;
      varying float v_width;

      void main() {
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);

        if (dist > 0.5) {
          discard;
        }

        gl_FragColor = v_color;
      }
    `;

    return this.createProgram(vertexSource, fragmentSource);
  }

  private createFieldBuffer(): WebGLBuffer {
    const gl = this.gl;
    const buffer = gl.createBuffer();
    if (!buffer) throw new Error("Failed to create field buffer");

    // Field geometry will be created dynamically
    return buffer;
  }

  private createPlayerBuffer(): WebGLBuffer {
    const gl = this.gl;
    const buffer = gl.createBuffer();
    if (!buffer) throw new Error("Failed to create player buffer");

    return buffer;
  }

  private createRouteBuffer(): WebGLBuffer {
    const gl = this.gl;
    const buffer = gl.createBuffer();
    if (!buffer) throw new Error("Failed to create route buffer");

    return buffer;
  }

  public renderField(
    translation: [number, number],
    scale: number,
    fieldWidth: number,
    fieldHeight: number,
    viewportBounds?: ViewportBounds
  ): void {
    const gl = this.gl;

    gl.useProgram(this.fieldProgram);

    // Set uniforms
    const resolutionLoc = gl.getUniformLocation(
      this.fieldProgram,
      "u_resolution"
    );
    const translationLoc = gl.getUniformLocation(
      this.fieldProgram,
      "u_translation"
    );
    const scaleLoc = gl.getUniformLocation(this.fieldProgram, "u_scale");

    gl.uniform2f(resolutionLoc, this.config.width, this.config.height);
    gl.uniform2f(translationLoc, translation[0], translation[1]);
    gl.uniform1f(scaleLoc, scale);

    // Generate field geometry (yard lines, hash marks, etc.) with viewport culling
    const fieldGeometry = this.generateFieldGeometry(
      fieldWidth,
      fieldHeight,
      viewportBounds
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, this.fieldBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(fieldGeometry.vertices),
      gl.STATIC_DRAW
    );

    const positionLoc = gl.getAttribLocation(this.fieldProgram, "a_position");
    const colorLoc = gl.getAttribLocation(this.fieldProgram, "a_color");

    gl.enableVertexAttribArray(positionLoc);
    gl.enableVertexAttribArray(colorLoc);

    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 24, 0); // 2 floats for position
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 24, 8); // 4 floats for color

    gl.drawArrays(gl.LINES, 0, fieldGeometry.vertices.length / 6);
  }

  public renderPlayers(
    players: WebGLPlayer[],
    translation: [number, number],
    scale: number
  ): void {
    const gl = this.gl;

    if (players.length === 0) return;

    gl.useProgram(this.playerProgram);

    // Set uniforms
    const resolutionLoc = gl.getUniformLocation(
      this.playerProgram,
      "u_resolution"
    );
    const translationLoc = gl.getUniformLocation(
      this.playerProgram,
      "u_translation"
    );
    const scaleLoc = gl.getUniformLocation(this.playerProgram, "u_scale");

    gl.uniform2f(resolutionLoc, this.config.width, this.config.height);
    gl.uniform2f(translationLoc, translation[0], translation[1]);
    gl.uniform1f(scaleLoc, scale);

    // Prepare player data for instanced rendering
    const playerData: number[] = [];
    players.forEach((player) => {
      playerData.push(
        player.x,
        player.y,
        ...player.color,
        player.selected ? 12 : 10
      );
    });

    gl.bindBuffer(gl.ARRAY_BUFFER, this.playerBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(playerData),
      gl.DYNAMIC_DRAW
    );

    const positionLoc = gl.getAttribLocation(this.playerProgram, "a_position");
    const colorLoc = gl.getAttribLocation(this.playerProgram, "a_color");
    const sizeLoc = gl.getAttribLocation(this.playerProgram, "a_size");

    gl.enableVertexAttribArray(positionLoc);
    gl.enableVertexAttribArray(colorLoc);
    gl.enableVertexAttribArray(sizeLoc);

    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 24, 8);
    gl.vertexAttribPointer(sizeLoc, 1, gl.FLOAT, false, 24, 20);

    gl.drawArrays(gl.POINTS, 0, players.length);
  }

  public renderRoutes(
    routes: WebGLRoutePoint[][],
    translation: [number, number],
    scale: number,
    _viewportBounds?: ViewportBounds
  ): void {
    const gl = this.gl;

    gl.useProgram(this.routeProgram);

    // Set uniforms
    const resolutionLoc = gl.getUniformLocation(
      this.routeProgram,
      "u_resolution"
    );
    const translationLoc = gl.getUniformLocation(
      this.routeProgram,
      "u_translation"
    );
    const scaleLoc = gl.getUniformLocation(this.routeProgram, "u_scale");

    gl.uniform2f(resolutionLoc, this.config.width, this.config.height);
    gl.uniform2f(translationLoc, translation[0], translation[1]);
    gl.uniform1f(scaleLoc, scale);

    routes.forEach((route) => {
      if (route.length === 0) return;

      const routeData: number[] = [];
      route.forEach((point) => {
        routeData.push(point.x, point.y, ...point.color, point.width);
      });

      gl.bindBuffer(gl.ARRAY_BUFFER, this.routeBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(routeData),
        gl.DYNAMIC_DRAW
      );

      const positionLoc = gl.getAttribLocation(this.routeProgram, "a_position");
      const colorLoc = gl.getAttribLocation(this.routeProgram, "a_color");
      const widthLoc = gl.getAttribLocation(this.routeProgram, "a_width");

      gl.enableVertexAttribArray(positionLoc);
      gl.enableVertexAttribArray(colorLoc);
      gl.enableVertexAttribArray(widthLoc);

      gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 24, 0);
      gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 24, 8);
      gl.vertexAttribPointer(widthLoc, 1, gl.FLOAT, false, 24, 20);

      gl.drawArrays(gl.POINTS, 0, route.length);
    });
  }

  public renderAnnotations(
    annotations: WebGLRoutePoint[][],
    translation: [number, number],
    scale: number,
    _viewportBounds?: ViewportBounds
  ): void {
    // For now, annotations use the same rendering as routes
    this.renderRoutes(annotations, translation, scale, _viewportBounds);
  }

  private generateFieldGeometry(
    fieldWidth: number,
    fieldHeight: number,
    viewportBounds?: ViewportBounds
  ) {
    const vertices: number[] = [];
    const pixelsPerYard = this.config.pixelsPerYard;

    // If viewport bounds are provided, only generate geometry for visible area
    const minYard = viewportBounds
      ? Math.max(0, Math.floor(viewportBounds.top))
      : 0;
    const maxYard = viewportBounds
      ? Math.min(fieldHeight, Math.ceil(viewportBounds.bottom))
      : fieldHeight;

    // Yard lines (every yard)
    for (let yard = minYard; yard <= maxYard; yard++) {
      const y = yard * pixelsPerYard;
      const isMajorLine = yard % 5 === 0;

      if (isMajorLine) {
        // Full width yard lines
        vertices.push(0, y, ...this.config.lineColor);
        vertices.push(fieldWidth * pixelsPerYard, y, ...this.config.lineColor);
      } else {
        // Hash marks only
        const hashLength = 8;
        const hashOffset = (17.7 / 2) * pixelsPerYard; // 8.85 yards from center
        const centerX = (fieldWidth * pixelsPerYard) / 2;

        // Left hash
        vertices.push(centerX - hashOffset, y, ...this.config.hashColor);
        vertices.push(
          centerX - hashOffset + hashLength,
          y,
          ...this.config.hashColor
        );

        // Right hash
        vertices.push(
          centerX + hashOffset - hashLength,
          y,
          ...this.config.hashColor
        );
        vertices.push(centerX + hashOffset, y, ...this.config.hashColor);
      }
    }

    // Sidelines
    vertices.push(0, 0, ...this.config.lineColor);
    vertices.push(fieldWidth * pixelsPerYard, 0, ...this.config.lineColor);
    vertices.push(0, fieldHeight * pixelsPerYard, ...this.config.lineColor);
    vertices.push(
      fieldWidth * pixelsPerYard,
      fieldHeight * pixelsPerYard,
      ...this.config.lineColor
    );

    return { vertices };
  }

  public clear(): void {
    const gl = this.gl;
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  public resize(width: number, height: number): void {
    this.config.width = width;
    this.config.height = height;
    this.gl.viewport(0, 0, width, height);
  }

  public destroy(): void {
    const gl = this.gl;

    // Clean up programs
    if (this.fieldProgram) gl.deleteProgram(this.fieldProgram);
    if (this.playerProgram) gl.deleteProgram(this.playerProgram);
    if (this.routeProgram) gl.deleteProgram(this.routeProgram);

    // Clean up buffers
    if (this.fieldBuffer) gl.deleteBuffer(this.fieldBuffer);
    if (this.playerBuffer) gl.deleteBuffer(this.playerBuffer);
    if (this.routeBuffer) gl.deleteBuffer(this.routeBuffer);
  }
}
