/**
 * BoxCall Animation Utilities
 * Modern micro-interactions and motion design
 */

import type { CSSProperties } from "react";

// Animation duration tokens
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 250,
  slow: 350,
} as const;

// Easing functions
export const EASING = {
  easeOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
} as const;

// Hover effects
export const HOVER_EFFECTS = {
  lift: "hover:-translate-y-1",
  scale: "hover:scale-[1.02]",
  glow: "hover:shadow-lg hover:shadow-jade-500/25",
  borderGlow: "hover:border-jade-300 hover:shadow-sm hover:shadow-jade-500/10",
} as const;

// Transition utilities
export const createTransition = (
  properties: string[] = ["all"],
  duration: keyof typeof ANIMATION_DURATION = "normal",
  easing: keyof typeof EASING = "easeOut"
): CSSProperties => ({
  transition: `${properties.join(", ")} ${ANIMATION_DURATION[duration]}ms ${EASING[easing]}`,
});

// Common animation classes
export const ANIMATION_CLASSES = {
  // Fade animations
  fadeIn: "animate-in fade-in duration-300",
  fadeOut: "animate-out fade-out duration-300",

  // Slide animations
  slideInFromBottom: "animate-in slide-in-from-bottom-4 duration-300",
  slideInFromTop: "animate-in slide-in-from-top-4 duration-300",
  slideInFromLeft: "animate-in slide-in-from-left-4 duration-300",
  slideInFromRight: "animate-in slide-in-from-right-4 duration-300",

  // Scale animations
  scaleIn: "animate-in zoom-in-95 duration-200",
  scaleOut: "animate-out zoom-out-95 duration-200",

  // Bounce animations
  bounceIn: "animate-in bounce-in duration-500",
  bounceOut: "animate-out bounce-out duration-500",
} as const;

// Loading animations
export const LOADING_ANIMATIONS = {
  pulse: "animate-pulse",
  spin: "animate-spin",
  ping: "animate-ping",
  bounce: "animate-bounce",
} as const;

// Performance-optimized animation hooks
export const useReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

// Stagger animation utility for lists
export const createStaggerAnimation = (
  index: number,
  baseDelay: number = 50
) => ({
  animationDelay: `${index * baseDelay}ms`,
  animationFillMode: "both" as const,
});

// Page transition animations
export const PAGE_TRANSITIONS = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },
  slideLeft: {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
    transition: { duration: 0.3, ease: EASING.easeOut },
  },
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
    transition: { duration: 0.3, ease: EASING.easeOut },
  },
} as const;
