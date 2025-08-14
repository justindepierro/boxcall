// Utility to rasterize a DiagramDocument SVG rendering to a PNG Blob/DataURL.
// Simple implementation: clone the SVG produced by FieldCanvas (expect a ref passed in) and draw to canvas.

export interface ThumbnailOptions {
  width?: number; // output width in px
  height?: number; // output height in px
  background?: string; // background color fill
  scale?: number; // optional scale multiplier
  type?: "image/png" | "image/jpeg";
  quality?: number; // for jpeg
}

export async function svgElementToDataUrl(
  svg: SVGSVGElement,
  opts: ThumbnailOptions = {}
): Promise<string> {
  const width = opts.width || 400;
  const height = opts.height || Math.round(width * (9 / 16));
  const clone = svg.cloneNode(true) as SVGSVGElement;
  // Normalize size
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  // Inline style background via rect if needed
  if (opts.background) {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", "0");
    rect.setAttribute("y", "0");
    rect.setAttribute("width", "100%");
    rect.setAttribute("height", "100%");
    rect.setAttribute("fill", opts.background);
    clone.insertBefore(rect, clone.firstChild);
  }
  const serialized = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([serialized], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(svgBlob);
  try {
    const img = new Image();
    img.decoding = "async";
    const dataUrl: string = await new Promise((resolve, reject) => {
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Canvas 2D context unavailable"));
          if (opts.background) {
            ctx.fillStyle = opts.background;
            ctx.fillRect(0, 0, width, height);
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL(opts.type || "image/png", opts.quality));
        } catch (err) {
          reject(err);
        } finally {
          URL.revokeObjectURL(url);
        }
      };
      img.onerror = (e) => reject(e);
      img.src = url;
    });
    return dataUrl;
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Helper: clone the SVG and reset the top-level pan/zoom transform so exports are full-frame.
function cloneSvgFullFrame(
  svg: SVGSVGElement,
  opts: { width?: number; height?: number; background?: string } = {}
): SVGSVGElement {
  const width = opts.width || 1600;
  const height = opts.height || Math.round(width * (9 / 16));
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  // Reset top-level <g> transform (first group with a transform attr)
  const g = clone.querySelector("g[transform]");
  if (g) g.setAttribute("transform", "translate(0 0) scale(1)");
  if (opts.background) {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", "0");
    rect.setAttribute("y", "0");
    rect.setAttribute("width", "100%");
    rect.setAttribute("height", "100%");
    rect.setAttribute("fill", opts.background);
    clone.insertBefore(rect, clone.firstChild);
  }
  return clone;
}

// Export: full-size PNG (data URL) — clears pan/zoom and normalizes size.
export async function svgFullToPngDataUrl(
  svg: SVGSVGElement,
  opts: ThumbnailOptions = {}
): Promise<string> {
  const width = opts.width || 1600;
  const height = opts.height || Math.round(width * (9 / 16));
  const prepared = cloneSvgFullFrame(svg, {
    width,
    height,
    background: opts.background,
  });
  const serialized = new XMLSerializer().serializeToString(prepared);
  const svgBlob = new Blob([serialized], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(svgBlob);
  try {
    const img = new Image();
    img.decoding = "async";
    const dataUrl: string = await new Promise((resolve, reject) => {
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Canvas 2D context unavailable"));
          if (opts.background) {
            ctx.fillStyle = opts.background;
            ctx.fillRect(0, 0, width, height);
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL(opts.type || "image/png", opts.quality));
        } catch (err) {
          reject(err);
        } finally {
          URL.revokeObjectURL(url);
        }
      };
      img.onerror = (e) => reject(e);
      img.src = url;
    });
    return dataUrl;
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Export: full-size SVG markup string — clears pan/zoom and normalizes size.
export function svgFullToString(
  svg: SVGSVGElement,
  opts: { width?: number; height?: number; background?: string } = {}
): string {
  const width = opts.width || 1600;
  const height = opts.height || Math.round(width * (9 / 16));
  const prepared = cloneSvgFullFrame(svg, { width, height, background: opts.background });
  return new XMLSerializer().serializeToString(prepared);
}
