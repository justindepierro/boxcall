/**
 * Mobile Button Props Hook
 * 
 * Forces touch-friendly button sizes on mobile devices
 * Minimum 44px touch targets per Apple/Google HIG
 */

import { useIsMobile } from "./useBreakpoint";
import type { ButtonProps } from "../components/ui/Button/Button.types";

/**
 * Returns mobile-optimized button props
 * 
 * On mobile: Forces size="lg" (44px) or size="xl" (48px) for primary actions
 * On desktop: Preserves original size
 */
export function useMobileButtonProps(
  size: ButtonProps["size"] = "md",
  isPrimaryAction = false
): { size: ButtonProps["size"]; className?: string } {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return { size };
  }

  // On mobile, enforce minimum 44px touch targets
  if (isPrimaryAction) {
    // Primary actions get 48px (xl)
    return { size: "xl" };
  }

  // Secondary actions get 44px (lg) minimum
  if (size === "xs" || size === "sm" || size === "md") {
    return { size: "lg" };
  }

  return { size };
}

/**
 * Returns mobile-optimized input props
 * 
 * On mobile: Forces size="lg" (48px height, 16px font)
 * On desktop: Preserves original size
 */
export function useMobileInputProps(
  size: "sm" | "md" | "lg" = "md"
): { size: "sm" | "md" | "lg"; className?: string } {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return { size };
  }

  // On mobile, use large inputs (48px height, 16px font prevents iOS zoom)
  return { size: "lg" };
}

/**
 * Returns mobile-optimized touch target class names
 * 
 * Adds minimum 44px × 44px touch target on mobile
 */
export function useMobileTouchTarget(
  defaultClass = ""
): string {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return defaultClass;
  }

  // Ensure minimum 44px touch targets
  return `${defaultClass} min-h-[44px] min-w-[44px]`.trim();
}
