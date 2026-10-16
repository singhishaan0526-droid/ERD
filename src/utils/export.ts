/**
 * Export utilities for ER Diagram in SVG and PNG formats
 * Fully optimized for Desktop & Mobile (iOS Safari, Android Chrome)
 */

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * Safely compute bounding box for diagram elements
 */
export function computeDiagramBounds(svgElement: SVGSVGElement): BoundingBox {
  const contentGroup = svgElement.querySelector('#diagram-content') as SVGGElement | null;
  const padding = 60;

  if (contentGroup) {
    try {
      const bbox = contentGroup.getBBox();
      if (
        isFinite(bbox.x) &&
        isFinite(bbox.y) &&
        isFinite(bbox.width) &&
        isFinite(bbox.height) &&
        bbox.width > 10 &&
        bbox.height > 10
      ) {
        return {
          minX: Math.floor(bbox.x - padding),
          minY: Math.floor(bbox.y - padding),
          maxX: Math.ceil(bbox.x + bbox.width + padding),
          maxY: Math.ceil(bbox.y + bbox.height + padding)
        };
      }
    } catch (e) {
      console.warn('getBBox on diagram-content failed:', e);
    }

    // Fallback: estimate from translated child groups if getBBox returned zero/failed
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    const elementsWithTransform = contentGroup.querySelectorAll('g[transform]');
    elementsWithTransform.forEach(el => {
      const transform = el.getAttribute('transform');
      if (transform) {
        const match = /translate\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/.exec(transform);
        if (match) {
          const x = parseFloat(match[1]);
          const y = parseFloat(match[2]);
          if (isFinite(x) && isFinite(y)) {
            minX = Math.min(minX, x - 120);
            minY = Math.min(minY, y - 60);
            maxX = Math.max(maxX, x + 120);
            maxY = Math.max(maxY, y + 60);
          }
        }
      }
    });

    if (isFinite(minX) && isFinite(minY) && isFinite(maxX) && isFinite(maxY) && maxX > minX) {
      return {
        minX: Math.floor(minX - padding),
        minY: Math.floor(minY - padding),
        maxX: Math.ceil(maxX + padding),
        maxY: Math.ceil(maxY + padding)
      };
    }
  }

  return { minX: 0, minY: 0, maxX: 1200, maxY: 800 };
}

/**
 * Generate a standalone, styled, valid XML SVG string with white background
 */
export function getStandaloneSvgString(
  svgElement: SVGSVGElement,
  scale = 1
): { svgString: string; width: number; height: number } {
  const bounds = computeDiagramBounds(svgElement);
  const rawWidth = bounds.maxX - bounds.minX;
  const rawHeight = bounds.maxY - bounds.minY;
  const minDimensionX = 400;
  const minDimensionY = 300;

  let minX = bounds.minX;
  let minY = bounds.minY;
  let width = Math.max(rawWidth, minDimensionX);
  let height = Math.max(rawHeight, minDimensionY);

  // Center diagram if dimensions were smaller than minimum
  if (rawWidth < minDimensionX) {
    minX -= Math.floor((minDimensionX - rawWidth) / 2);
  }
  if (rawHeight < minDimensionY) {
    minY -= Math.floor((minDimensionY - rawHeight) / 2);
  }

  const contentGroup = svgElement.querySelector('#diagram-content') as SVGGElement | null;
  let contentString = '';

  if (contentGroup) {
    // Clone node so we don't alter the interactive canvas DOM
    const clone = contentGroup.cloneNode(true) as SVGGElement;

    // Clean up temporary UI interactive decorators from export
    // 1. Selection dashed halos
    const halos = clone.querySelectorAll(
      'ellipse[stroke-dasharray="3 3"], polygon[stroke-dasharray="3 3"], rect[stroke-dasharray="4 3"]'
    );
    halos.forEach(h => h.remove());

    // 2. Direct edit pencil icon triggers
    const editButtons = clone.querySelectorAll('path[d^="M2.5 7.5"]');
    editButtons.forEach(btn => {
      const parentG = btn.closest('g');
      if (parentG && parentG !== clone) {
        parentG.remove();
      }
    });

    const serializer = new XMLSerializer();
    contentString = serializer.serializeToString(clone);
  } else {
    const serializer = new XMLSerializer();
    contentString = serializer.serializeToString(svgElement);
  }

  // System font stack with Plus Jakarta Sans (loaded by host app), avoiding any external @import
  // which causes browsers to reject SVG images or taint the canvas
  const fontStyles = `
    text {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
  `;

  const outputWidth = Math.round(width * scale);
  const outputHeight = Math.round(height * scale);

  const svgString = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="${minX} ${minY} ${width} ${height}"
     width="${outputWidth}"
     height="${outputHeight}">
  <style>
    ${fontStyles}
  </style>
  <rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="#FFFFFF" />
  ${contentString}
</svg>`;

  return { svgString, width, height };
}

/**
 * Trigger file download via temporary anchor with delayed URL revocation
 */
function triggerBrowserDownload(blobOrDataUrl: Blob | string, filename: string): void {
  const isBlob = blobOrDataUrl instanceof Blob;
  const url = isBlob ? URL.createObjectURL(blobOrDataUrl) : blobOrDataUrl;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();

  // Allow the browser download manager ample time to initiate before cleaning up
  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
    if (isBlob) {
      URL.revokeObjectURL(url);
    }
  }, 2500);
}

/**
 * Download diagram as SVG file
 */
export function downloadSvg(svgElement: SVGSVGElement, filename = 'er-diagram.svg'): void {
  const { svgString } = getStandaloneSvgString(svgElement, 1);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const finalFilename = filename.endsWith('.svg') ? filename : `${filename}.svg`;
  triggerBrowserDownload(blob, finalFilename);
}

/**
 * Generate high-res PNG data URL and Blob
 */
export function generatePngData(
  svgElement: SVGSVGElement,
  scale = 2
): Promise<{ dataUrl: string; blob: Blob }> {
  return new Promise((resolve, reject) => {
    try {
      // Generate standalone SVG rendered natively at scaled dimensions for ultra-crisp output
      const { svgString, width, height } = getStandaloneSvgString(svgElement, scale);
      const targetWidth = Math.round(width * scale);
      const targetHeight = Math.round(height * scale);

      const renderToCanvas = (img: HTMLImageElement) => {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Canvas 2D context not available');
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        const dataUrl = canvas.toDataURL('image/png');
        canvas.toBlob((pngBlob) => {
          if (!pngBlob) {
            // Fallback converting dataURL to blob directly
            try {
              const byteString = atob(dataUrl.split(',')[1]);
              const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
              const ab = new ArrayBuffer(byteString.length);
              const ia = new Uint8Array(ab);
              for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
              }
              const fallbackBlob = new Blob([ab], { type: mimeString });
              resolve({ dataUrl, blob: fallbackBlob });
            } catch (convErr) {
              reject(new Error('Failed to create PNG blob from canvas'));
            }
            return;
          }
          resolve({ dataUrl, blob: pngBlob });
        }, 'image/png');
      };

      // 1. Primary approach: Data URI with URL encoding (safe across all modern browsers)
      const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
      const primaryImg = new Image();
      primaryImg.crossOrigin = 'anonymous';

      primaryImg.onload = () => {
        try {
          renderToCanvas(primaryImg);
        } catch (err) {
          reject(err);
        }
      };

      primaryImg.onerror = () => {
        // 2. Secondary fallback: Blob URL
        try {
          const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
          const blobUrl = URL.createObjectURL(blob);
          const fallbackImg = new Image();
          fallbackImg.crossOrigin = 'anonymous';

          fallbackImg.onload = () => {
            try {
              renderToCanvas(fallbackImg);
            } catch (err) {
              reject(err);
            } finally {
              URL.revokeObjectURL(blobUrl);
            }
          };

          fallbackImg.onerror = () => {
            URL.revokeObjectURL(blobUrl);
            reject(new Error('Failed to load SVG diagram into image for PNG export'));
          };

          fallbackImg.src = blobUrl;
        } catch (blobErr) {
          reject(blobErr);
        }
      };

      primaryImg.src = svgDataUrl;
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Download diagram as PNG file with mobile fallback
 */
export async function downloadPng(
  svgElement: SVGSVGElement,
  filename = 'er-diagram.png',
  scale = 2,
  onMobileFallback?: (dataUrl: string) => void
): Promise<void> {
  const { dataUrl, blob } = await generatePngData(svgElement, scale);
  const finalFilename = filename.endsWith('.png') ? filename : `${filename}.png`;

  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  // iOS Safari cannot download canvas/blobs reliably via <a> download attribute;
  // it requires user touch & hold or Web Share API preview modal
  if (isIOS && onMobileFallback) {
    onMobileFallback(dataUrl);
    return;
  }

  // Standard download
  try {
    triggerBrowserDownload(blob, finalFilename);
  } catch (e) {
    if (onMobileFallback) {
      onMobileFallback(dataUrl);
    } else {
      window.open(dataUrl, '_blank');
    }
  }
}
