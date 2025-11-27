/**
 * Animation Utilities for Modern UI Effects
 *
 * Centralized animation classes for consistent application across all pages.
 * Uses design tokens from tailwind.config.js for brand-colored shadows,
 * gradients, and micro-interactions.
 *
 * Usage:
 * import { cardHover, glowEffect, shimmerSkeleton } from '@/utils/animations';
 * <div className={cardHover.jade}>...</div>
 */

/**
 * Card hover effects with lift and shadow elevation
 * Apply to interactive cards for modern SaaS feel
 */
export const cardHover = {
  // Standard hover with shadow lift
  base: "transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl cursor-pointer",

  // Brand-colored hover effects
  jade: "transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-jade-lg cursor-pointer group",
  orange:
    "transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-orange-lg cursor-pointer group",
  purple:
    "transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-purple-lg cursor-pointer group",

  // Scale + lift (more dramatic)
  scaleJade:
    "transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1 hover:shadow-jade-lg cursor-pointer group",
  scaleOrange:
    "transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1 hover:shadow-orange-lg cursor-pointer group",
  scalePurple:
    "transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1 hover:shadow-purple-lg cursor-pointer group",
};

/**
 * Glow effects for status indicators and active states
 * Use on badges, status dots, or accent elements
 */
export const glowEffect = {
  jade: "shadow-lg shadow-jade-500/50 animate-pulse",
  orange: "shadow-lg shadow-orange-500/50 animate-pulse",
  purple: "shadow-lg shadow-purple-500/50 animate-pulse",
  success: "shadow-lg shadow-emerald-500/50 animate-pulse",
  error: "shadow-lg shadow-red-500/50 animate-pulse",
  warning: "shadow-lg shadow-amber-500/50 animate-pulse",
};

/**
 * Shimmer loading skeleton (replaces old animate-pulse)
 * Modern 2024+ loading pattern for better perceived performance
 */
export const shimmerSkeleton = {
  base: "relative overflow-hidden bg-muted rounded",
  overlay:
    "absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent",
};

/**
 * Number emphasis for stats displays
 * Giant gradient text for dashboard metrics
 */
export const statNumber = {
  jade: "text-4xl md:text-5xl font-black bg-gradient-to-r from-jade-600 to-jade-500 bg-clip-text text-transparent",
  orange:
    "text-4xl md:text-5xl font-black bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent",
  purple:
    "text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent",
  gradient:
    "text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent",
};

/**
 * Icon animations for micro-interactions
 * Apply to icons inside cards for subtle feedback
 */
export const iconAnimation = {
  hover: "group-hover:scale-110 transition-transform duration-300",
  float: "animate-float",
  glow: "animate-glow",
};

/**
 * Button gradient backgrounds
 * Colorful alternatives to plain secondary buttons
 */
export const buttonGradient = {
  jade: "bg-gradient-to-br from-jade-50 to-jade-100 hover:from-jade-100 hover:to-jade-200 border-2 border-jade-200 hover:border-jade-300 shadow-jade-sm hover:shadow-jade-md transition-all duration-300",
  orange:
    "bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border-2 border-orange-200 hover:border-orange-300 shadow-orange-sm hover:shadow-orange-md transition-all duration-300",
  purple:
    "bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-2 border-purple-200 hover:border-purple-300 shadow-purple-sm hover:shadow-purple-md transition-all duration-300",
  blue: "bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-300",
};

/**
 * Card gradient backgrounds (subtle mesh)
 * Apply to card containers for depth without overwhelming content
 */
export const cardGradient = {
  jade: "bg-gradient-mesh-jade",
  orange: "bg-gradient-mesh-orange",
  purple: "bg-gradient-mesh-purple",
};

/**
 * Status indicator styles
 * Consistent active/inactive states across all pages
 */
export const statusIndicator = {
  active: `w-2 h-2 bg-jade-500 rounded-full ${glowEffect.jade}`,
  inactive: "w-2 h-2 bg-muted rounded-full",
  warning: `w-2 h-2 bg-orange-500 rounded-full ${glowEffect.orange}`,
  error: `w-2 h-2 bg-red-500 rounded-full ${glowEffect.error}`,
  success: `w-2 h-2 bg-emerald-500 rounded-full ${glowEffect.success}`,
};

/**
 * Badge styles with gradients
 * Replace plain colored badges with gradient versions
 */
export const badge = {
  jade: "px-3 py-1.5 bg-gradient-to-r from-jade-500 to-jade-600 text-white text-xs font-bold rounded-lg shadow-jade-sm",
  orange:
    "px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold rounded-lg shadow-orange-sm",
  purple:
    "px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold rounded-lg shadow-purple-sm",
  success:
    "px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold rounded-lg",
  warning:
    "px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold rounded-lg",
  error:
    "px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-lg",
};

/**
 * Empty state illustration containers
 * Consistent styling for empty states across pages
 */
export const emptyState = {
  container: "flex flex-col items-center justify-center py-12 px-6 text-center",
  icon: "w-16 h-16 mb-4 text-muted opacity-50",
  iconGradient:
    "w-16 h-16 mb-4 bg-gradient-to-br from-jade-100 to-jade-200 rounded-2xl p-4 flex items-center justify-center",
};
