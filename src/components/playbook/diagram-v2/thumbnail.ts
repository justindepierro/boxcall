// Utility to rasterize a DiagramDocument SVG rendering to a PNG Blob/DataURL.
// Simple implementation: clone the SVG produced by FieldCanvas (expect a ref passed in) and draw to canvas.

export interface ThumbnailOptions {
  width?: number; // output width in px
  height?: number; // output height in px
  background?: string; // background color fill
  scale?: number; // optional scale multiplier
  type?: 'image/png' | 'image/jpeg';
  quality?: number; // for jpeg
}

export async function svgElementToDataUrl(svg: SVGSVGElement, opts: ThumbnailOptions = {}): Promise<string> {
  const width = opts.width || 400;
  const height = opts.height || Math.round(width * (9 / 16));
  const clone = svg.cloneNode(true) as SVGSVGElement;
  // Normalize size
  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));
  // Inline style background via rect if needed
  if (opts.background) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
    rect.setAttribute('x','0');
    rect.setAttribute('y','0');
    rect.setAttribute('width','100%');
    rect.setAttribute('height','100%');
    rect.setAttribute('fill', opts.background);
    clone.insertBefore(rect, clone.firstChild);
  }
  const serialized = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  try {
    const img = new Image();
    img.decoding = 'async';
    const dataUrl: string = await new Promise((resolve, reject) => {
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas 2D context unavailable'));
          if (opts.background) {
            ctx.fillStyle = opts.background;
            ctx.fillRect(0,0,width,height);
          }
          ctx.drawImage(img,0,0,width,height);
          resolve(canvas.toDataURL(opts.type || 'image/png', opts.quality));
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
