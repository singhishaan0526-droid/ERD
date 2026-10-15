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

export function computeDiagramBounds(svgElement: SVGSVGElement): BoundingBox {
  const contentGroup = svgElement.querySelector('#diagram-content') as SVGGElement;
  if (!contentGroup) {
    return { minX: 0, minY: 0, maxX: 1200, maxY: 800 };
  }

  try {
    const bbox = contentGroup.getBBox();
    const padding = 60;
    return {
      minX: Math.floor(bbox.x - padding),
      minY: Math.floor(bbox.y - padding),
      maxX: Math.ceil(bbox.x + bbox.width + padding),
      maxY: Math.ceil(bbox.y + bbox.height + padding)
    };
  } catch (e) {
    return { minX: 0, minY: 0, maxX: 1400, maxY: 900 };
  }
}

/**
 * Generate a standalone, styled SVG string with pure white background
 */
export function getStandaloneSvgString(svgElement: SVGSVGElement): { svgString: string; width: number; height: number } {
  const bounds = computeDiagramBounds(svgElement);
  const width = Math.max(bounds.maxX - bounds.minX, 400);
  const height = Math.max(bounds.maxY - bounds.minY, 300);

  const contentGroup = svgElement.querySelector('#diagram-content');
  const innerHtml = contentGroup ? contentGroup.innerHTML : svgElement.innerHTML;

  const fontStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&display=swap');
    text {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    }
  `;

  const svgString = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="${bounds.minX} ${bounds.minY} ${width} ${height}"
     width="${width}"
     height="${height}">
  <style>
    ${fontStyles}
  </style>
  <rect x="${bounds.minX}" y="${bounds.minY}" width="${width}" height="${height}" fill="#FFFFFF" />
  <g id="diagram-content">
    ${innerHtml}
  </g>
</svg>`;

  return { svgString, width, height };
}

/**
 * Download diagram as SVG file
 */
export function downloadSvg(svgElement: SVGSVGElement, filename = 'er-diagram.svg') {
  const { svgString } = getStandaloneSvgString(svgElement);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.svg') ? filename : `${filename}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate high-res PNG data url & blob
 */
export function generatePngData(svgElement: SVGSVGElement, scale = 2): Promise<{ dataUrl: string; blob: Blob }> {
  return new Promise((resolve, reject) => {
    try {
      const { svgString, width, height } = getStandaloneSvgString(svgElement);
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/png');
        canvas.toBlob((pngBlob) => {
          URL.revokeObjectURL(url);
          if (!pngBlob) {
            reject(new Error('Failed to create PNG blob'));
            return;
          }
          resolve({ dataUrl, blob: pngBlob });
        }, 'image/png');
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG into image for PNG export'));
      };

      img.src = url;
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

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  if (isIOS && onMobileFallback) {
    onMobileFallback(dataUrl);
    return;
  }

  // Standard download
  try {
    const pngUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(pngUrl);
  } catch (e) {
    if (onMobileFallback) {
      onMobileFallback(dataUrl);
    } else {
      window.open(dataUrl, '_blank');
    }
  }
}
