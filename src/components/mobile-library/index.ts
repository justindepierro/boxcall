/**
 * Mobile Component Library
 *
 * A collection of mobile-first components designed for thumb-friendly,
 * professional mobile experiences following iOS/Android design patterns.
 *
 * All components follow these principles:
 * - Touch targets: 44px minimum (Apple HIG)
 * - Typography: 16px minimum for body text
 * - Spacing: Comfortable, mobile-optimized
 * - Animation: Smooth, native-feeling transitions
 * - Accessibility: WCAG 2.1 AA compliant
 *
 * @module mobile-library
 */

// Core Components
export { MobileCTACard } from "./MobileCTACard";
export type { MobileCTACardProps } from "./MobileCTACard";

export { MobilePageHeader } from "./MobilePageHeader";
export type { MobilePageHeaderProps } from "./MobilePageHeader";

export { MobileSection } from "./MobileSection";
export type { MobileSectionProps } from "./MobileSection";

export { MobileQuickActions, MobileQuickActionRow } from "./MobileQuickActions";
export type {
  MobileQuickActionsProps,
  MobileQuickActionRowProps,
  QuickAction,
} from "./MobileQuickActions";

export { MobileListItem, MobileListGroup } from "./MobileListItem";
export type {
  MobileListItemProps,
  MobileListGroupProps,
  SwipeAction,
} from "./MobileListItem";

export { MobileCard, MobileCardHeader, MobileCardFooter } from "./MobileCard";
export type {
  MobileCardProps,
  MobileCardHeaderProps,
  MobileCardFooterProps,
} from "./MobileCard";

// Dashboard-specific Components
export { MobileHeroStatsCard } from "./MobileHeroStatsCard";
export type { HeroStatsCardProps } from "./MobileHeroStatsCard";

export { MobileQuickActionGrid } from "./MobileQuickActionGrid";
export type {
  MobileQuickActionGridProps,
  QuickAction as QuickActionGridItem,
} from "./MobileQuickActionGrid";

export { MobileEventCard } from "./MobileEventCard";
export type {
  MobileEventCardProps,
  CalendarEvent,
} from "./MobileEventCard";
