/**
 * useResponsivePixelsPerYard
 * 
 * Calculates optimal pixelsPerYard to fit field in available viewport space.
 * Ensures field fills container while maintaining aspect ratio.
 * 
 * Algorithm:
 * 1. Measure available container dimensions (width × height)
 * 2. Calculate scaling factors for width and height
 * 3. Use the smaller factor (to fit both dimensions)
 * 4. Apply min/max constraints for touch targets and readability
 */

import { useState, useEffect } from 'react';
import type { RefObject } from 'react';

interface ResponsivePixelsPerYardOptions {
  containerRef: RefObject<HTMLElement | null>;
  fieldWidth: number;    // Field width in yards (53.333)
  fieldHeight: number;   // Field height in yards (35)
  minPixelsPerYard?: number;  // Minimum for readability (10)
  maxPixelsPerYard?: number;  // Maximum for touch targets (25)
  padding?: number;      // Padding in pixels (default: 20)
}

export function useResponsivePixelsPerYard({
  containerRef,
  fieldWidth,
  fieldHeight,
  minPixelsPerYard = 10,
  maxPixelsPerYard = 25,
  padding = 20,
}: ResponsivePixelsPerYardOptions): number {
  const [pixelsPerYard, setPixelsPerYard] = useState(15); // Default fallback

  useEffect(() => {
    const calculatePixelsPerYard = () => {
      const container = containerRef.current;
      if (!container) return;

      // Get container dimensions
      const rect = container.getBoundingClientRect();
      const availableWidth = rect.width - padding * 2;
      const availableHeight = rect.height - padding * 2;

      // Prevent division by zero
      if (availableWidth <= 0 || availableHeight <= 0) return;

      // Calculate scaling factors
      const widthScale = availableWidth / fieldWidth;
      const heightScale = availableHeight / fieldHeight;

      // Use the smaller scale to fit both dimensions
      const optimalScale = Math.min(widthScale, heightScale);

      // Apply constraints
      const constrainedScale = Math.max(
        minPixelsPerYard,
        Math.min(maxPixelsPerYard, optimalScale)
      );

      // Round to 1 decimal for consistency
      const finalScale = Math.round(constrainedScale * 10) / 10;

      setPixelsPerYard(finalScale);
      
      console.log('📐 Responsive pixelsPerYard calculation:', {
        containerSize: { width: rect.width, height: rect.height },
        availableSpace: { width: availableWidth, height: availableHeight },
        fieldDimensions: { width: fieldWidth, height: fieldHeight },
        scales: { width: widthScale.toFixed(2), height: heightScale.toFixed(2) },
        optimal: optimalScale.toFixed(2),
        final: finalScale,
      });
    };

    // Calculate on mount
    calculatePixelsPerYard();

    // Recalculate on window resize
    const handleResize = () => {
      calculatePixelsPerYard();
    };

    // Use ResizeObserver for more accurate detection
    const resizeObserver = new ResizeObserver(() => {
      calculatePixelsPerYard();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Fallback to window resize
    window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [containerRef, fieldWidth, fieldHeight, minPixelsPerYard, maxPixelsPerYard, padding]);

  return pixelsPerYard;
}
