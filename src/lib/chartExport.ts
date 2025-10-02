import { toast } from 'sonner';

export interface ChartExportOptions {
  title: string;
  filename?: string;
  width?: number;
  height?: number;
  backgroundColor?: string;
  scale?: number;
  format?: 'png' | 'jpeg';
  quality?: number;
}

/**
 * Export any SVG element as an image
 */
export async function exportSVGAsImage(
  svgElement: SVGElement | string,
  options: ChartExportOptions
): Promise<void> {
  const {
    title,
    filename,
    width = 800,
    height = 600,
    backgroundColor = 'white',
    scale = 2,
    format = 'png',
    quality = 0.95
  } = options;

  try {
    // Get SVG element
    let svg: SVGElement;
    if (typeof svgElement === 'string') {
      const element = document.querySelector(svgElement) as SVGElement;
      if (!element) {
        throw new Error(`SVG element not found: ${svgElement}`);
      }
      svg = element;
    } else {
      svg = svgElement;
    }

    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Set high-resolution canvas
    canvas.width = width * scale;
    canvas.height = height * scale;
    ctx.scale(scale, scale);

    // Set background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Get SVG bounds and adjust if needed
    const svgRect = svg.getBoundingClientRect();
    const svgWidth = svgRect.width || parseFloat(svg.getAttribute('width') || '800');
    const svgHeight = svgRect.height || parseFloat(svg.getAttribute('height') || '600');

    // Serialize SVG to string
    const svgClone = svg.cloneNode(true) as SVGElement;
    
    // Ensure SVG has proper dimensions
    svgClone.setAttribute('width', svgWidth.toString());
    svgClone.setAttribute('height', svgHeight.toString());
    
    // Add title if not present
    if (!svgClone.querySelector('title')) {
      const titleElement = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      titleElement.textContent = title;
      svgClone.insertBefore(titleElement, svgClone.firstChild);
    }

    const svgData = new XMLSerializer().serializeToString(svgClone);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    // Load SVG into image
    const img = new Image();
    
    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        try {
          // Calculate scaling to fit canvas while maintaining aspect ratio
          const scaleX = width / svgWidth;
          const scaleY = height / svgHeight;
          const finalScale = Math.min(scaleX, scaleY, 1); // Don't upscale

          const finalWidth = svgWidth * finalScale;
          const finalHeight = svgHeight * finalScale;
          const x = (width - finalWidth) / 2;
          const y = (height - finalHeight) / 2;

          // Draw image centered on canvas
          ctx.drawImage(img, x, y, finalWidth, finalHeight);

          // Add title overlay
          ctx.fillStyle = '#374151';
          ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
          ctx.fillText(title, 20, 35);

          // Add timestamp
          const timestamp = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          ctx.font = '12px system-ui, -apple-system, sans-serif';
          ctx.fillStyle = '#6b7280';
          ctx.fillText(`Exported on ${timestamp}`, 20, height - 25);

          // Export as image
          const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to create image blob'));
              return;
            }

            // Create download
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename || `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${format}`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(downloadUrl);
            resolve();
          }, mimeType, quality);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load SVG image'));
      img.src = url;
    });

    URL.revokeObjectURL(url);
    toast.success(`Chart exported as ${format.toUpperCase()} successfully!`);

  } catch (error) {
    console.error('Chart export failed:', error);
    toast.error('Failed to export chart. Please try again.');
    throw error;
  }
}

/**
 * Export a Recharts chart as an image
 */
export async function exportRechartsAsImage(
  containerSelector: string,
  options: ChartExportOptions
): Promise<void> {
  const container = document.querySelector(containerSelector);
  if (!container) {
    throw new Error(`Chart container not found: ${containerSelector}`);
  }

  const svg = container.querySelector('svg');
  if (!svg) {
    throw new Error('No SVG found in chart container');
  }

  return exportSVGAsImage(svg, options);
}

/**
 * Export any DOM element as an image using html2canvas-like approach
 */
export async function exportElementAsImage(
  element: HTMLElement | string,
  options: ChartExportOptions
): Promise<void> {
  const {
    title,
    filename,
    width = 800,
    height = 600,
    backgroundColor = 'white',
    scale = 2,
    format = 'png',
    quality = 0.95
  } = options;

  try {
    // Get element
    let targetElement: HTMLElement;
    if (typeof element === 'string') {
      const el = document.querySelector(element) as HTMLElement;
      if (!el) {
        throw new Error(`Element not found: ${element}`);
      }
      targetElement = el;
    } else {
      targetElement = element;
    }

    // First try to find an SVG within the element
    const svg = targetElement.querySelector('svg');
    if (svg) {
      return exportSVGAsImage(svg, options);
    }

    // Fallback: create canvas and try to capture element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    canvas.width = width * scale;
    canvas.height = height * scale;
    ctx.scale(scale, scale);

    // Set background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Add title
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
    ctx.fillText(title, 20, 35);

    // Add message about limited support
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px system-ui, -apple-system, sans-serif';
    ctx.fillText('Note: This element type has limited export support', 20, height / 2);
    ctx.fillText('For best results, use SVG-based charts', 20, height / 2 + 20);

    // Add timestamp
    const timestamp = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    ctx.font = '12px system-ui, -apple-system, sans-serif';
    ctx.fillText(`Exported on ${timestamp}`, 20, height - 25);

    // Export
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Failed to create image blob');
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${format}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    }, mimeType, quality);

    toast.success(`Element exported as ${format.toUpperCase()} successfully!`);

  } catch (error) {
    console.error('Element export failed:', error);
    toast.error('Failed to export element. Please try again.');
    throw error;
  }
}