/**
 * Rendering Optimization Service
 *
 * Dedicated service for rendering optimization in mobile environments.
 * Provides intelligent frame rate management and visual performance optimization.
 *
 * @author BoxCall Development Team
 * @version 2.0.0
 */

import type { RenderingOptimization } from "../types/PerformanceTypes";

// ============================================================================
// RENDERING OPTIMIZATION SERVICE
// ============================================================================

export class RenderingOptimizationService {
  private static currentOptimization: RenderingOptimization | null = null;
  private static frameCount = 0;
  private static lastFrameTime = 0;

  /**
   * Optimize rendering performance
   */
  static async optimizeRendering(): Promise<RenderingOptimization> {
    const frameRate = await this.measureFrameRate();
    const renderTime = await this.measureRenderTime();
    const droppedFrames = await this.getDroppedFrames();

    const optimizations = {
      virtualization: frameRate < 45,
      lazyRendering: renderTime > 16,
      layoutCaching: droppedFrames > 5,
      imageOptimization: true,
    };

    const renderingOpt: RenderingOptimization = {
      frameRate,
      renderTime,
      droppedFrames,
      optimizations,
      quality: this.determineRenderingQuality(frameRate, renderTime),
    };

    // Auto-apply optimizations if performance is poor
    if (renderingOpt.quality === "choppy") {
      await this.applyRenderingOptimizations(optimizations);
    }

    this.currentOptimization = renderingOpt;
    return renderingOpt;
  }

  /**
   * Start monitoring frame rate
   */
  static startFrameRateMonitoring(): void {
    this.frameCount = 0;
    this.lastFrameTime = performance.now();

    const measureFrame = () => {
      this.frameCount++;
      requestAnimationFrame(measureFrame);
    };

    requestAnimationFrame(measureFrame);
  }

  /**
   * Stop monitoring frame rate
   */
  static stopFrameRateMonitoring(): number {
    const currentTime = performance.now();
    const elapsed = currentTime - this.lastFrameTime;
    const fps = (this.frameCount / elapsed) * 1000;

    this.frameCount = 0;
    return Math.round(fps);
  }

  /**
   * Enable performance mode (reduce visual quality for better performance)
   */
  static async enablePerformanceMode(): Promise<void> {
    // Disable animations
    document.body.classList.add("performance-mode");

    // Reduce image quality
    const images = document.querySelectorAll("img");
    images.forEach((img) => {
      img.style.imageRendering = "pixelated";
    });

    // Disable transitions
    const style = document.createElement("style");
    style.textContent = `
      .performance-mode * {
        transition: none !important;
        animation: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Disable performance mode (restore visual quality)
   */
  static async disablePerformanceMode(): Promise<void> {
    // Re-enable animations
    document.body.classList.remove("performance-mode");

    // Restore image quality
    const images = document.querySelectorAll("img");
    images.forEach((img) => {
      img.style.imageRendering = "";
    });

    // Remove performance style
    const performanceStyles = document.querySelectorAll("style");
    performanceStyles.forEach((style) => {
      if (style.textContent?.includes("performance-mode")) {
        style.remove();
      }
    });
  }

  /**
   * Get current rendering optimization state
   */
  static getCurrentOptimization(): RenderingOptimization | null {
    return this.currentOptimization;
  }

  // ==========================================
  // PRIVATE HELPER METHODS
  // ==========================================

  private static async measureFrameRate(): Promise<number> {
    return new Promise((resolve) => {
      let frameCount = 0;
      const startTime = performance.now();

      const countFrame = () => {
        frameCount++;
        const currentTime = performance.now();

        if (currentTime - startTime >= 1000) {
          // Measured for 1 second
          resolve(frameCount);
        } else {
          requestAnimationFrame(countFrame);
        }
      };

      requestAnimationFrame(countFrame);
    });
  }

  private static async measureRenderTime(): Promise<number> {
    const startTime = performance.now();

    // Force a layout calculation
    const height = document.body.offsetHeight;
    void height; // Use the value to avoid unused variable warning

    return performance.now() - startTime;
  }

  private static async getDroppedFrames(): Promise<number> {
    // Estimate dropped frames based on frame rate
    const idealFrameRate = 60;
    const actualFrameRate = await this.measureFrameRate();

    return Math.max(0, idealFrameRate - actualFrameRate);
  }

  private static determineRenderingQuality(
    frameRate: number,
    renderTime: number
  ): RenderingOptimization["quality"] {
    if (frameRate >= 55 && renderTime <= 16) {
      return "smooth";
    } else if (frameRate >= 30 && renderTime <= 33) {
      return "acceptable";
    } else {
      return "choppy";
    }
  }

  private static async applyRenderingOptimizations(
    optimizations: RenderingOptimization["optimizations"]
  ): Promise<void> {
    if (optimizations.virtualization) {
      // Enable virtual scrolling for long lists
      await this.enableVirtualization();
    }

    if (optimizations.lazyRendering) {
      // Enable lazy rendering for off-screen components
      await this.enableLazyRendering();
    }

    if (optimizations.layoutCaching) {
      // Enable layout caching
      await this.enableLayoutCaching();
    }

    if (optimizations.imageOptimization) {
      // Optimize images
      await this.optimizeImages();
    }
  }

  private static async enableVirtualization(): Promise<void> {
    // Add CSS class to enable virtual scrolling
    document.body.classList.add("virtualization-enabled");
  }

  private static async enableLazyRendering(): Promise<void> {
    // Add intersection observer for lazy rendering
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          element.classList.add("lazy-rendered");
        }
      });
    });

    // Observe all lazy components
    const lazyElements = document.querySelectorAll("[data-lazy-render]");
    lazyElements.forEach((el) => observer.observe(el));
  }

  private static async enableLayoutCaching(): Promise<void> {
    // Add CSS containment for layout caching
    const style = document.createElement("style");
    style.textContent = `
      .cached-layout {
        contain: layout style paint;
      }
    `;
    document.head.appendChild(style);
  }

  private static async optimizeImages(): Promise<void> {
    // Add lazy loading to images
    const images = document.querySelectorAll("img:not([loading])");
    images.forEach((img) => {
      img.setAttribute("loading", "lazy");
    });
  }
}
