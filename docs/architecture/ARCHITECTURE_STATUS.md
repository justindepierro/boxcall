# BoxCall Architecture Status

**Last Updated**: January 2025  
**File Count**: 1,137 source files (.ts/.tsx)  
**Build Status**: ✅ TypeScript compiles clean

## Directory Structure Overview

```
src/
├── hooks/          (68 files)  - React hooks for state & business logic
├── services/       (60 files)  - API clients & business services
├── utils/          (52 files)  - Pure utility functions
├── components/     (400+ files) - UI components organized by feature
├── pages/          (22 files)  - Route-level page components
├── types/          (26 files)  - TypeScript type definitions
├── routes/         (10 files)  - React Router configuration
├── contexts/       - React contexts for global state
├── stores/         - Zustand stores
└── features/       - Feature modules (profile, dashboard)
```

## Key Architectural Patterns

### 1. Component Organization

- **UI Components**: `src/components/ui/` - Design system primitives (Button, Input, Badge)
- **Feature Components**: `src/components/[feature]/` - playbook, boxcall, team, calendar
- **Mobile Components**: `src/components/mobile/` - Mobile-specific UI

### 2. State Management

- **Zustand**: Global app state (`src/stores/`)
- **React Query**: Server state & caching (`src/app/queryClient.ts`)
- **React Context**: Theme, offline, save state

### 3. Service Layer

- **Data Services**: playsService, gamePlanService, practiceService
- **Analytics**: playAnalyticsService, sessionAnalyticsService
- **Infrastructure**: imageUploadService, offlineDataManager

### 4. Design Token System

- Component tokens: `btn-primary`, `card-padding`
- Semantic tokens: `text-primary`, `bg-surface-muted`
- Brand scales: jade-_, navy-_, neutral-\*
- Enforced via custom ESLint rules

## Recent Cleanup (January 2025)

### Removed Dead Code

| Category   | Items Removed                                                                                                                                |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Hooks      | useWizardState (duplicate), useDataFlowTracking, useNetworkStatus, useSidebarState, useAccessibleModal, useMobileTouchTarget, useOrientation |
| Services   | smartDataAnalyzer, situationalRecommender, errorReportingService, playbookViewPresetsService                                                 |
| Utils      | authRateLimit.ts (429 lines), useErrorHandler.ts                                                                                             |
| Components | PlayMaturityBadge, ReactionPicker, 13 formation components                                                                                   |
| Other      | design-tokens/, seo/, many dev-profile related files                                                                                         |

### Files Removed: ~89 total

From ~1,226 → 1,137 source files

## Code Quality Metrics

- **TypeScript**: Strict mode enabled, compiles clean
- **ESLint**: 0 errors, 8 warnings (large function warnings)
- **Test Coverage**: Vitest for unit tests
- **Build Size**: 2.83MB (975KB gzipped)

## Critical Files

### Entry Points

- `src/App.tsx` - Root application component
- `src/main.tsx` - Application bootstrap
- `src/routes/DataRouter.tsx` - Route configuration

### Core Providers

- `src/components/core/AppProvider.tsx` - Global providers
- `src/contexts/SaveStateContext.tsx` - Offline save handling
- `src/contexts/OfflineContext.tsx` - Network state

### Key Pages

- `src/pages/PlaybookPage.tsx` - Playbook management (optimistic updates)
- `src/pages/GamePlansPage.tsx` - Game planning (Billick methodology)
- `src/pages/TeamBulletin.tsx` - Social hub (real-time updates)
- `src/pages/BoxCall.tsx` - Live session tracking

## Next Steps

1. **Consolidation**: Merge related services where appropriate
2. **Testing**: Increase coverage for core business logic
3. **Documentation**: Keep this file updated with changes
4. **Performance**: Monitor bundle size as features grow

## See Also

- [Complete Architecture](./COMPLETE_ARCHITECTURE_DEC7_2025.md)
- [Database Schema](../database/COMPLETE_SCHEMA_REFERENCE.md)
- [Design System](../DESIGN_SYSTEM_REFERENCE.md)
