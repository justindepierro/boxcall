/**
 * Mobile Component Library
 * 
 * Consolidated mobile components following industry-standard organization:
 * - core/: Navigation and layout (BottomNav, Drawer)
 * - ui/: Reusable UI components (Cards, Sections, Lists)
 * 
 * All components follow mobile-first design principles:
 * - Touch targets: 44px minimum (Apple HIG)
 * - Typography: 16px minimum for body text
 * - Spacing: Comfortable, mobile-optimized
 * - Animation: Smooth, native-feeling transitions
 * - Accessibility: WCAG 2.1 AA compliant
 * 
 * Breakpoints (aligned with tailwind.config.js):
 * - Mobile: < 768px (default, no prefix)
 * - Tablet: 768px+ (sm:)
 * - Desktop: 1024px+ (md:)
 * 
 * @module mobile
 */

// ============================================================================
// CORE COMPONENTS (Navigation & Layout)
// ============================================================================

export { MobileBottomNavigation } from "./core/MobileBottomNavigation";
export type { 
  MobileBottomNavigationProps,
  MobileNavItem 
} from "./core/MobileBottomNavigation";

export { MobileDrawer } from "./core/MobileDrawer";
// Note: MobileDrawerProps is not exported from MobileDrawer.tsx

// ============================================================================
// UI COMPONENTS (Reusable UI Elements)
// ============================================================================

// Cards
export { MobileCTACard } from "./ui/MobileCTACard";
export type { MobileCTACardProps } from "./ui/MobileCTACard";

export { MobileCard, MobileCardHeader, MobileCardFooter } from "./ui/MobileCard";
export type {
  MobileCardProps,
  MobileCardHeaderProps,
  MobileCardFooterProps,
} from "./ui/MobileCard";

export { MobileEventCard } from "./ui/MobileEventCard";
export type { MobileEventCardProps, CalendarEvent } from "./ui/MobileEventCard";

export { MobileHeroStatsCard } from "./ui/MobileHeroStatsCard";
export type { HeroStatsCardProps } from "./ui/MobileHeroStatsCard";

// Layout
export { MobilePageHeader } from "./ui/MobilePageHeader";
export type { MobilePageHeaderProps } from "./ui/MobilePageHeader";

export { MobileSection } from "./ui/MobileSection";
export type { MobileSectionProps } from "./ui/MobileSection";

// Interactive
export { MobileQuickActions, MobileQuickActionRow } from "./ui/MobileQuickActions";
export type {
  MobileQuickActionsProps,
  MobileQuickActionRowProps,
  QuickAction,
} from "./ui/MobileQuickActions";

export { MobileQuickActionGrid } from "./ui/MobileQuickActionGrid";
export type {
  MobileQuickActionGridProps,
  QuickAction as QuickActionGridItem,
} from "./ui/MobileQuickActionGrid";

export { MobileListItem, MobileListGroup } from "./ui/MobileListItem";
export type {
  MobileListItemProps,
  MobileListGroupProps,
  SwipeAction,
} from "./ui/MobileListItem";

// ============================================================================
// USAGE GUIDELINES
// ============================================================================

/**
 * When to use mobile components:
 * 
 * 1. Use mobile/core components for:
 *    - Bottom navigation bars
 *    - Side drawers
 *    - Mobile-specific layouts
 * 
 * 2. Use mobile/ui components for:
 *    - Cards with mobile-optimized spacing
 *    - Sections with mobile-friendly layouts
 *    - Lists with swipe actions
 *    - Quick action grids
 * 
 * 3. For simple responsive styling:
 *    - Prefer Tailwind breakpoints (sm:, md:, lg:)
 *    - Only use components for complex mobile interactions
 * 
 * 4. For mobile detection logic:
 *    - Use useIsMobile() hook from hooks/useBreakpoint
 *    - Don't check window.innerWidth manually
 * 
 * Example:
 * ```tsx
 * import { MobileSection, MobileCTACard } from 'components/mobile';
 * import { useIsMobile } from 'hooks/useBreakpoint';
 * 
 * const MyComponent = () => {
 *   const isMobile = useIsMobile();
 *   
 *   return isMobile ? (
 *     <MobileSection>
 *       <MobileCTACard title="Action" onClick={handleClick} />
 *     </MobileSection>
 *   ) : (
 *     <div className="p-6">
 *       <button onClick={handleClick}>Action</button>
 *     </div>
 *   );
 * };
 * ```
 */
