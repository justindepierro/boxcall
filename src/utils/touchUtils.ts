/**
 * Haptic Feedback and Animation Utilities
 * Part of Phase 3C: Professional Touch Experience
 */

// Haptic feedback patterns
export const HapticPatterns = {
  /** Light tap feedback */
  light: () => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  },

  /** Medium tap feedback */
  medium: () => {
    if (navigator.vibrate) {
      navigator.vibrate(25);
    }
  },

  /** Strong feedback for important actions */
  strong: () => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  },

  /** Success pattern */
  success: () => {
    if (navigator.vibrate) {
      navigator.vibrate([25, 50, 25]);
    }
  },

  /** Error pattern */
  error: () => {
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  },

  /** Double tap pattern */
  doubleTap: () => {
    if (navigator.vibrate) {
      navigator.vibrate([25, 50, 25]);
    }
  },

  /** Long press pattern */
  longPress: () => {
    if (navigator.vibrate) {
      navigator.vibrate(75);
    }
  },
};

// Animation timing functions
export const AnimationTimings = {
  /** Snappy material design timing */
  snappy: "cubic-bezier(0.4, 0.0, 0.2, 1)",

  /** Bouncy spring timing */
  bouncy: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",

  /** Smooth ease out */
  smooth: "cubic-bezier(0.2, 0, 0, 1)",

  /** Natural movement */
  natural: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",

  /** iOS-style timing */
  ios: "cubic-bezier(0.4, 0.0, 0.6, 1)",
};

// Animation utilities
export class AnimationUtils {
  /** Create scale animation for touch feedback */
  static createScaleAnimation(
    element: HTMLElement,
    scale = 0.95,
    duration = 150
  ) {
    const originalTransform = element.style.transform;

    return {
      start: () => {
        element.style.transition = `transform ${duration}ms ${AnimationTimings.snappy}`;
        element.style.transform = `${originalTransform} scale(${scale})`;
      },
      end: () => {
        element.style.transform = originalTransform;
      },
      cleanup: () => {
        setTimeout(() => {
          element.style.transition = "";
        }, duration);
      },
    };
  }

  /** Create ripple effect */
  static createRipple(element: HTMLElement, x: number, y: number) {
    const ripple = document.createElement("div");
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    ripple.className =
      "absolute rounded-full pointer-events-none bg-text-primary opacity-20";
    ripple.style.width = "0px";
    ripple.style.height = "0px";
    ripple.style.left = `${x - rect.left}px`;
    ripple.style.top = `${y - rect.top}px`;
    ripple.style.transform = "translate(-50%, -50%)";
    ripple.style.transition = `width 400ms ${AnimationTimings.smooth}, height 400ms ${AnimationTimings.smooth}, opacity 400ms ${AnimationTimings.smooth}`;

    // Ensure element has relative positioning for ripple
    const originalPosition = element.style.position;
    if (!originalPosition || originalPosition === "static") {
      element.style.position = "relative";
    }

    element.appendChild(ripple);

    // Animate in
    requestAnimationFrame(() => {
      ripple.style.width = `${size * 2}px`;
      ripple.style.height = `${size * 2}px`;
      ripple.style.opacity = "0";
    });

    // Clean up
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 400);

    return ripple;
  }

  /** Create slide animation */
  static createSlideAnimation(
    element: HTMLElement,
    direction: "left" | "right" | "up" | "down",
    distance = 20,
    duration = 200
  ) {
    const transforms = {
      left: `translateX(-${distance}px)`,
      right: `translateX(${distance}px)`,
      up: `translateY(-${distance}px)`,
      down: `translateY(${distance}px)`,
    };

    const originalTransform = element.style.transform;

    return {
      start: () => {
        element.style.transition = `transform ${duration}ms ${AnimationTimings.smooth}`;
        element.style.transform = `${originalTransform} ${transforms[direction]}`;
      },
      end: () => {
        element.style.transform = originalTransform;
      },
      cleanup: () => {
        setTimeout(() => {
          element.style.transition = "";
        }, duration);
      },
    };
  }

  /** Create fade animation */
  static createFadeAnimation(
    element: HTMLElement,
    fromOpacity = 1,
    toOpacity = 0,
    duration = 200
  ) {
    const originalOpacity = element.style.opacity || "1";

    return {
      start: () => {
        element.style.transition = `opacity ${duration}ms ${AnimationTimings.smooth}`;
        element.style.opacity = fromOpacity.toString();
        requestAnimationFrame(() => {
          element.style.opacity = toOpacity.toString();
        });
      },
      end: () => {
        element.style.opacity = originalOpacity;
      },
      cleanup: () => {
        setTimeout(() => {
          element.style.transition = "";
        }, duration);
      },
    };
  }

  /** Create bounce animation for emphasis */
  static createBounceAnimation(
    element: HTMLElement,
    intensity = 1.1,
    duration = 300
  ) {
    const originalTransform = element.style.transform;

    return {
      start: () => {
        element.style.transition = `transform ${duration}ms ${AnimationTimings.bouncy}`;
        element.style.transform = `${originalTransform} scale(${intensity})`;
      },
      end: () => {
        element.style.transform = originalTransform;
      },
      cleanup: () => {
        setTimeout(() => {
          element.style.transition = "";
        }, duration);
      },
    };
  }

  /** Chain multiple animations */
  static chainAnimations(
    ...animations: Array<{
      start: () => void;
      end: () => void;
      cleanup: () => void;
    }>
  ) {
    let currentIndex = 0;

    const runNext = () => {
      if (currentIndex < animations.length) {
        const animation = animations[currentIndex];
        animation.start();
        currentIndex++;

        // Assume each animation runs for 200ms by default
        setTimeout(() => {
          animation.end();
          animation.cleanup();
          runNext();
        }, 200);
      }
    };

    return { start: runNext };
  }
}

// Performance monitoring for animations
export class AnimationPerformanceMonitor {
  private static frameCount = 0;
  private static startTime = 0;
  private static isMonitoring = false;

  /** Start monitoring frame rate */
  static startMonitoring() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.frameCount = 0;
    this.startTime = performance.now();

    const countFrames = () => {
      if (this.isMonitoring) {
        this.frameCount++;
        requestAnimationFrame(countFrames);
      }
    };

    requestAnimationFrame(countFrames);
  }

  /** Stop monitoring and get FPS */
  static stopMonitoring(): number {
    if (!this.isMonitoring) return 0;

    this.isMonitoring = false;
    const duration = performance.now() - this.startTime;
    const fps = Math.round((this.frameCount * 1000) / duration);

    return fps;
  }

  /** Check if device can handle 60fps animations */
  static async checkPerformanceCapability(): Promise<boolean> {
    return new Promise((resolve) => {
      this.startMonitoring();

      // Run a test animation for 1 second
      const testElement = document.createElement("div");
      testElement.style.position = "fixed";
      testElement.style.top = "-100px";
      testElement.style.width = "1px";
      testElement.style.height = "1px";
      document.body.appendChild(testElement);

      const animation = this.createScaleAnimation(testElement, 0.5, 50);

      // Run multiple animations
      const runTest = () => {
        animation.start();
        setTimeout(() => {
          animation.end();
          animation.cleanup();
        }, 50);
      };

      const interval = setInterval(runTest, 100);

      setTimeout(() => {
        clearInterval(interval);
        document.body.removeChild(testElement);
        const fps = this.stopMonitoring();
        resolve(fps >= 55); // Consider 55+ fps as capable
      }, 1000);
    });
  }

  private static createScaleAnimation = AnimationUtils.createScaleAnimation;
}

// Touch gesture detection
export class GestureDetector {
  private static readonly SWIPE_THRESHOLD = 50;
  private static readonly VELOCITY_THRESHOLD = 0.5;

  /** Detect swipe gesture */
  static detectSwipe(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    startTime: number,
    endTime: number
  ): { direction: "left" | "right" | "up" | "down" | null; velocity: number } {
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const deltaTime = endTime - startTime;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / deltaTime;

    if (distance < this.SWIPE_THRESHOLD || velocity < this.VELOCITY_THRESHOLD) {
      return { direction: null, velocity: 0 };
    }

    // Determine primary direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return { direction: deltaX > 0 ? "right" : "left", velocity };
    } else {
      return { direction: deltaY > 0 ? "down" : "up", velocity };
    }
  }

  /** Detect pinch gesture */
  static detectPinch(
    touches: TouchList
  ): { scale: number; center: { x: number; y: number } } | null {
    if (touches.length !== 2) return null;

    const touch1 = touches[0];
    const touch2 = touches[1];

    const distance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
    );

    const center = {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };

    return { scale: distance, center };
  }

  /** Detect rotation gesture */
  static detectRotation(touches: TouchList): number | null {
    if (touches.length !== 2) return null;

    const touch1 = touches[0];
    const touch2 = touches[1];

    return (
      Math.atan2(
        touch2.clientY - touch1.clientY,
        touch2.clientX - touch1.clientX
      ) *
      (180 / Math.PI)
    );
  }
}
