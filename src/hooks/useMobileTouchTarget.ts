/**
 * useMobileTouchTarget Hook
 * 
 * Enforces 44px minimum touch targets on mobile devices
 * per Apple HIG and Google Material Design guidelines
 */

import { useIsMobile } from './useBreakpoint';

export type TouchTargetSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface TouchTargetProps {
  size: TouchTargetSize;
  className?: string;
  minHeight?: string;
  minWidth?: string;
}

/**
 * Returns touch-friendly sizing for interactive elements
 * 
 * Minimum sizes:
 * - Mobile: 44px (Apple HIG minimum)
 * - Desktop: Preserves original size
 * 
 * @param originalSize - Desired size on desktop
 * @param isPrimary - Whether this is a primary action (uses 48px on mobile)
 * @returns Props to spread on interactive element
 * 
 * @example
 * ```tsx
 * const ActionButton = () => {
 *   const touchProps = useMobileTouchTarget('md', true);
 *   
 *   return (
 *     <button {...touchProps}>
 *       Primary Action
 *     </button>
 *   );
 * };
 * ```
 */
export function useMobileTouchTarget(
  originalSize: TouchTargetSize = 'md',
  isPrimary: boolean = false
): TouchTargetProps {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return { size: originalSize };
  }

  // Mobile: Enforce minimum touch targets
  const mobileSize = getMobileTouchSize(originalSize, isPrimary);
  
  return {
    size: mobileSize,
    className: 'min-h-[44px] min-w-[44px]',
    minHeight: isPrimary ? '48px' : '44px',
    minWidth: isPrimary ? '48px' : '44px',
  };
}

/**
 * Maps desktop sizes to mobile-appropriate sizes
 */
function getMobileTouchSize(
  size: TouchTargetSize,
  isPrimary: boolean
): TouchTargetSize {
  if (isPrimary) {
    // Primary actions: Always large or XL
    if (size === 'xs' || size === 'sm' || size === 'md') {
      return 'xl'; // 48px
    }
    return 'xl';
  }

  // Secondary actions: Minimum large (44px)
  if (size === 'xs' || size === 'sm') {
    return 'lg'; // 44px
  }

  return size;
}

/**
 * Returns inline styles for touch target enforcement
 */
export function useMobileTouchTargetStyle(isPrimary: boolean = false): {
  minHeight: string;
  minWidth: string;
} {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return { minHeight: 'auto', minWidth: 'auto' };
  }

  return {
    minHeight: isPrimary ? '48px' : '44px',
    minWidth: isPrimary ? '48px' : '44px',
  };
}
