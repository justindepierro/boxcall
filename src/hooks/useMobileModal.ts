/**
 * useMobileModal Hook
 * 
 * Automatically applies fullscreen modal size on mobile devices
 * for consistent mobile UX across the app
 */

import { useIsMobile } from './useBreakpoint';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';

/**
 * Returns appropriate modal size based on device type
 * 
 * @param desktopSize - Desired size on desktop (default: 'lg')
 * @param forceFullscreenMobile - Always use fullscreen on mobile (default: true)
 * @returns Modal size optimized for current device
 * 
 * @example
 * ```tsx
 * const MyModal = () => {
 *   const modalSize = useMobileModal('lg');
 *   
 *   return (
 *     <Modal size={modalSize} isOpen={isOpen} onClose={onClose}>
 *       <ModalContent />
 *     </Modal>
 *   );
 * };
 * ```
 */
export function useMobileModal(
  desktopSize: ModalSize = 'lg',
  forceFullscreenMobile: boolean = true
): ModalSize {
  const isMobile = useIsMobile();

  if (isMobile && forceFullscreenMobile) {
    return 'fullscreen';
  }

  return desktopSize;
}

/**
 * Returns modal className optimized for mobile
 * Adds rounded-none on mobile for fullscreen feel
 */
export function useMobileModalClassName(isMobile: boolean): string {
  return isMobile ? 'rounded-none' : '';
}
