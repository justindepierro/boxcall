/**
 * Micro-Animation Library
 *
 * Reusable animation utilities for consistent interactive feedback
 * across the BoxCall design system.
 */

import { type CSSProperties } from "react";

/**
 * Animation duration presets
 */
export const animationDurations = {
  instant: "0ms",
  fast: "150ms",
  normal: "200ms",
  slow: "300ms",
  slower: "500ms",
} as const;

/**
 * Animation easing presets
 */
export const animationEasings = {
  linear: "linear",
  ease: "ease",
  easeIn: "ease-in",
  easeOut: "ease-out",
  easeInOut: "ease-in-out",
  bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

/**
 * Hover animation presets
 */
export const hoverAnimations = {
  /** Subtle lift with shadow */
  lift: "hover:animate-card-lift hover:shadow-lg transition-all duration-200",

  /** Scale and lift combination */
  scale: "hover:scale-105 hover:-translate-y-1 transition-all duration-200",

  /** Electric glow effect */
  glow: "hover:shadow-electric-500/25 hover:shadow-lg transition-all duration-300",

  /** Combined lift, scale, and glow */
  premium:
    "hover:animate-card-hover hover:animate-card-glow transition-all duration-300",

  /** Subtle background change */
  subtle: "hover:bg-surface-secondary/50 transition-colors duration-200",
} as const;

/**
 * Loading animation presets
 */
export const loadingAnimations = {
  /** Standard pulse */
  pulse: "animate-pulse",

  /** Shimmer effect */
  shimmer:
    "animate-pulse bg-gradient-to-r from-border via-border-light to-border bg-[length:200%_100%]",

  /** Spin animation */
  spin: "animate-spin",

  /** Bounce animation */
  bounce: "animate-bounce",
} as const;

/**
 * Transition presets for common properties
 */
export const transitions = {
  /** All properties */
  all: `transition-all duration-200 ease-out`,

  /** Colors only */
  colors: `transition-colors duration-200 ease-out`,

  /** Transform only */
  transform: `transition-transform duration-200 ease-out`,

  /** Opacity only */
  opacity: `transition-opacity duration-200 ease-out`,

  /** Shadow only */
  shadow: `transition-shadow duration-200 ease-out`,
} as const;

/**
 * Animation utility functions
 */
export const animations = {
  /**
   * Creates a custom hover animation with specified parameters
   */
  createHoverAnimation: (
    scale = 1.02,
    lift = -2,
    duration = 200,
    easing = "ease-out"
  ): string => {
    return `hover:scale-[${scale}] hover:-translate-y-[${lift}px] transition-all duration-${duration} ease-${easing}`;
  },

  /**
   * Creates a staggered animation delay for list items
   */
  createStaggerDelay: (index: number, baseDelay = 50): CSSProperties => ({
    animationDelay: `${index * baseDelay}ms`,
  }),

  /**
   * Creates a fade-in animation with optional slide
   */
  createFadeIn: (
    direction: "up" | "down" | "left" | "right" = "up",
    _distance = 10,
    duration = 300
  ): string => {
    const animationName = `fadeIn${direction.charAt(0).toUpperCase() + direction.slice(1)}`;
    return `animate-[${animationName}_${duration}ms_ease-out]`;
  },
} as const;

/**
 * Keyframe definitions for custom animations
 * These should be added to tailwind.config.js
 */
export const keyframeDefinitions = {
  fadeInUp: {
    "0%": { opacity: "0", transform: "translateY(10px)" },
    "100%": { opacity: "1", transform: "translateY(0)" },
  },
  fadeInDown: {
    "0%": { opacity: "0", transform: "translateY(-10px)" },
    "100%": { opacity: "1", transform: "translateY(0)" },
  },
  fadeInLeft: {
    "0%": { opacity: "0", transform: "translateX(10px)" },
    "100%": { opacity: "1", transform: "translateX(0)" },
  },
  fadeInRight: {
    "0%": { opacity: "0", transform: "translateX(-10px)" },
    "100%": { opacity: "1", transform: "translateX(0)" },
  },
  slideInFromBottom: {
    "0%": { transform: "translateY(100%)", opacity: "0" },
    "100%": { transform: "translateY(0)", opacity: "1" },
  },
  scaleIn: {
    "0%": { transform: "scale(0.9)", opacity: "0" },
    "100%": { transform: "scale(1)", opacity: "1" },
  },
} as const;

/**
 * Animation classes for common UI patterns
 */
export const uiAnimations = {
  /** Modal/dialog entrance */
  modalEnter: "animate-in fade-in slide-in-from-bottom-4 duration-300",

  /** Dropdown menu entrance */
  dropdownEnter: "animate-in fade-in slide-in-from-top-2 duration-200",

  /** Tooltip entrance */
  tooltipEnter: "animate-in fade-in zoom-in-95 duration-150",

  /** Page transition */
  pageEnter: "animate-in fade-in slide-in-from-right-4 duration-300",

  /** Card entrance in lists */
  cardEnter: "animate-in fade-in slide-in-from-bottom-2 duration-300",

  /** Button press feedback */
  buttonPress: "active:scale-95 transition-transform duration-75",

  /** Loading spinner */
  spinner:
    "animate-spin border-2 border-border border-t-text-primary rounded-full",
} as const;

export default {
  durations: animationDurations,
  easings: animationEasings,
  hovers: hoverAnimations,
  loadings: loadingAnimations,
  transitions,
  animations,
  keyframes: keyframeDefinitions,
  ui: uiAnimations,
};
