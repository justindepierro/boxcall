# Practice Planner Component Architecture

## 📋 Overview

The Practice Planner is a comprehensive React component system for managing football practice planning with hierarchical time blocks, group management, script assignment, and role-based access control.

## 🏗️ Architecture

### Core Structure
```
src/components/practice/
├── PracticePlannerModal.tsx     # Main orchestrating component (2732 lines → being refactored)
├── types.ts                     # TypeScript interfaces and types
├── utils.ts                     # Utility functions and helpers
├── hooks/
│   └── usePracticeState.ts     # Centralized state management hook
└── components/                  # Extracted UI components
    ├── PracticeHeader.tsx      # Header with title, role switching, mode toggles
    ├── TimeSummary.tsx         # Duration display and progress visualization
    ├── modals/
    │   ├── AddBlockModal.tsx   # Modal for adding practice blocks
    │   ├── AddGroupModal.tsx   # Modal for adding groups to blocks
    │   └── EditGroupModal.tsx  # Modal for editing existing groups
    └── index.ts               # Component exports
```

## 🧩 Component Breakdown

### 1. PracticePlannerModal (Main Component)
**Status**: 🔄 Currently being refactored
- **Purpose**: Main orchestrating component for the entire practice planner
- **Current State**: Monolithic 2732-line file containing all functionality
- **Refactoring Goal**: Extract UI components while maintaining central orchestration
- **Dependencies**: Uses types.ts, utils.ts, and hooks/usePracticeState.ts

### 2. PracticeHeader
**Status**: ✅ Extracted
- **Purpose**: Displays header with title, role switching, and mode toggles
- **Features**:
  - Event title and date display
  - User role indicator (Head Coach / Position Coach)
  - Time Allocation Mode toggle
  - Scaffold Mode toggle
  - Close button
- **Props**: PracticeHeaderProps interface

### 3. TimeSummary
**Status**: ✅ Extracted
- **Purpose**: Shows practice duration summary and progress visualization
- **Features**:
  - Total time scheduled vs. allocated
  - Progress bar with color coding
  - Category breakdown with duration display
  - Event details display
- **Props**: TimeSummaryProps interface

### 4. Modal Components
**Status**: ✅ Extracted

#### AddBlockModal
- **Purpose**: Add new practice blocks with full configuration
- **Features**: Time allocation, category selection, coach assignment, form validation

#### AddGroupModal
- **Purpose**: Add groups to existing practice blocks
- **Features**: Group name, location, notes configuration

#### EditGroupModal
- **Purpose**: Edit existing groups with script assignment display
- **Features**: Pre-populated form, script status display, full group editing

## 📊 Data Models

### Core Interfaces

```typescript
interface PracticeGroup {
  id: string;
  name: string;
  location: string;
  notes: string;
  scriptId?: string;
  scriptTitle?: string;
}

interface PracticeBlock {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  category: "offense" | "defense" | "special-teams" | "meeting" | "weight-room" | "transition" | "break";
  title: string;
  location: string;
  notes: string;
  scriptId?: string;
  scriptTitle?: string;
  assignedCoach?: string;
  isHeadCoachBlock?: boolean;
  groups?: PracticeGroup[];
}
```

## 🔧 State Management

### usePracticeState Hook
**Status**: ✅ Complete
- **Purpose**: Centralized state management for all practice planner functionality
- **Features**:
  - All useState and useEffect logic
  - Event handlers for all user interactions
  - Computed values and memoized functions
  - localStorage persistence
  - Group and block management

### Key State Variables
- `practiceBlocks`: Array of practice blocks
- `userRole`: "head_coach" | "position_coach"
- `timeAllocationMode`: Boolean for time allocation UI
- `scaffoldMode`: Boolean for scaffold practice UI
- `editingBlock`: Currently edited block
- `editingGroup`: Currently edited group
- Modal visibility states

## 🛠️ Utility Functions

### Core Utilities (utils.ts)
- `formatDuration(minutes)`: Format duration to hours:minutes
- `getCategoryColor(category)`: Get Tailwind classes for category styling
- `recalculateBlockTimes()`: Recalculate chronological block times
- `saveToLocalStorage()`: Persist practice data
- `loadFromLocalStorage()`: Restore practice data
- `generateSampleBlocks()`: Create sample practice data

## 🎨 Styling & Design

### Color System
- **Offense**: Blue (bg-blue-100 text-blue-800)
- **Defense**: Red (bg-red-100 text-red-800)
- **Special Teams**: Green (bg-green-100 text-green-800)
- **Meeting**: Purple (bg-purple-100 text-purple-800)
- **Weight Room**: Orange (bg-orange-100 text-orange-800)
- **Transition**: Gray (bg-gray-100 text-gray-800)
- **Break**: Yellow (bg-yellow-100 text-yellow-800)

### Component Styling
- Uses Tailwind CSS for consistent styling
- Responsive design with mobile considerations
- Color-coded categories for visual organization
- Progress bars for time allocation visualization

## 🔄 User Workflows

### Head Coach Workflow
1. **Time Allocation Mode**: Allocate time blocks visually on timeline
2. **Block Creation**: Add practice blocks with categories and durations
3. **Coach Assignment**: Assign position coaches to specific blocks
4. **Group Management**: Create sub-groups within blocks
5. **Script Assignment**: Assign scripts to blocks and individual groups

### Position Coach Workflow
1. **View Assigned Blocks**: See blocks assigned by head coach
2. **Group Management**: Add/edit groups within assigned blocks
3. **Script Assignment**: Assign scripts to individual groups
4. **Detail Addition**: Fill in specific drills and instructions

## 🏃‍♂️ Getting Started

### Using Components

```typescript
import { PracticeHeader, TimeSummary } from './components/practice/components';
import { usePracticeState } from './components/practice/hooks/usePracticeState';

function MyPracticePlanner() {
  const {
    event,
    userRole,
    timeAllocationMode,
    scaffoldMode,
    practiceBlocks,
    // ... other state and handlers
  } = usePracticeState(initialEvent);

  return (
    <div>
      <PracticeHeader
        event={event}
        userRole={userRole}
        timeAllocationMode={timeAllocationMode}
        scaffoldMode={scaffoldMode}
        onUserRoleChange={setUserRole}
        onTimeAllocationModeToggle={() => setTimeAllocationMode(!timeAllocationMode)}
        onScaffoldModeToggle={() => setScaffoldMode(!scaffoldMode)}
        onClose={onClose}
      />
      
      <TimeSummary
        scheduledDuration={scheduledDuration}
        totalDuration={totalDuration}
        practiceBlocks={practiceBlocks}
        event={event}
      />
    </div>
  );
}
```

## 🔮 Refactoring Progress

### ✅ Completed (Phase 1)
- [x] Type definitions extraction (types.ts)
- [x] Utility functions extraction (utils.ts)
- [x] State management hook extraction (usePracticeState.ts)
- [x] Repository cleanup (removed incomplete files)

### ✅ Completed (Phase 2)
- [x] PracticeHeader component extraction
- [x] TimeSummary component extraction
- [x] AddBlockModal component extraction
- [x] AddGroupModal component extraction
- [x] EditGroupModal component extraction
- [x] Component index files creation
- [x] Architecture documentation

### 🔄 Next Steps (Phase 3)
- [ ] Extract PracticeBlocksList component
- [ ] Extract TimelineAllocation component
- [ ] Extract ScriptSelector component
- [ ] Update main PracticePlannerModal to use extracted components
- [ ] Integration testing
- [ ] Performance optimization

## 🧪 Testing Strategy

### Unit Testing
- Test individual components in isolation
- Mock state management hook
- Test user interactions and form submissions
- Validate prop interfaces and TypeScript compliance

### Integration Testing
- Test component interactions with state management
- Validate localStorage persistence
- Test role-based functionality
- Verify drag-and-drop functionality

### E2E Testing
- Complete practice planning workflows
- Multi-user role scenarios
- Data persistence across sessions
- Mobile responsiveness

## 📈 Performance Considerations

### Optimization Techniques
- **Memoization**: useMemo for computed values in usePracticeState
- **Component Memoization**: React.memo for pure components
- **Event Handler Stability**: useCallback for event handlers
- **Selective Re-rendering**: Targeted state updates to minimize re-renders

### Bundle Size Management
- Tree-shaking friendly exports
- Lazy loading for modal components
- Optimized dependency imports

## 🚀 Future Enhancements

### Planned Features
1. **Real-time Collaboration**: Multiple coaches editing simultaneously
2. **Template System**: Save and reuse practice templates
3. **Analytics Dashboard**: Practice efficiency metrics
4. **Mobile App**: React Native implementation
5. **Integration**: Calendar sync and notification system

### Technical Improvements
1. **Advanced State Management**: Consider Redux Toolkit for complex state
2. **Animation System**: Framer Motion for smooth transitions
3. **Accessibility**: Enhanced ARIA support and keyboard navigation
4. **Internationalization**: Multi-language support
5. **Offline Support**: Service worker for offline functionality

---

## 📝 Development Notes

### ESLint Configuration
- Unused variables prefixed with underscore (`_onUserRoleChange`)
- Strict TypeScript checking enabled
- React Hooks rules enforced

### Git Strategy
- Feature branch for each component extraction
- Detailed commit messages with component scope
- Clean history with squashed commits for major milestones

### Code Quality
- 100% TypeScript coverage
- Comprehensive JSDoc documentation
- Consistent naming conventions
- Modular architecture with single responsibility principle
