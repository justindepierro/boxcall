# 📦 BoxCall Component Inventory & Storybook Specification

> **Design System Component Library**  
> _Complete component catalog for professional football coaching platform_

## 🎯 **STORYBOOK INTEGRATION PLAN**

### **Recommended Storybook Setup**

```bash
npm install --save-dev @storybook/react-vite @storybook/addon-essentials @storybook/addon-docs
npm install --save-dev @storybook/addon-controls @storybook/addon-viewport @storybook/addon-a11y
```

### **Storybook Configuration Structure**

```
.storybook/
├── main.ts                     # Core Storybook configuration
├── preview.ts                  # Global decorators and parameters
├── theme.ts                    # BoxCall jade/navy theme
├── viewports.ts                # Mobile device viewports
└── addons.ts                   # Addon configurations
```

---

## 🎨 **DESIGN SYSTEM STORIES**

### **1. Foundation Stories**

#### **Colors.stories.tsx**

```typescript
export default {
  title: 'Foundation/Colors',
  parameters: {
    docs: {
      description: {
        component: 'BoxCall jade/navy professional color system for football coaching interfaces.'
      }
    }
  }
}

export const PrimaryColors = () => (
  <div className="grid grid-cols-2 gap-4">
    <div className="bg-jade-500 h-20 rounded-md flex items-center justify-center text-white font-bold">
      Jade Primary (#00A86B)
    </div>
    <div className="bg-navy-500 h-20 rounded-md flex items-center justify-center text-white font-bold">
      Navy Primary (#1E3A8A)
    </div>
  </div>
)

export const ColorPalette = () => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold mb-3">Jade Scale</h3>
      <div className="grid grid-cols-9 gap-2">
        {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(weight => (
          <div key={weight} className={`bg-jade-${weight} h-16 rounded-md flex items-end p-2`}>
            <span className="text-xs font-mono text-white">{weight}</span>
          </div>
        ))}
      </div>
    </div>
    <div>
      <h3 className="text-lg font-semibold mb-3">Navy Scale</h3>
      <div className="grid grid-cols-9 gap-2">
        {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(weight => (
          <div key={weight} className={`bg-navy-${weight} h-16 rounded-md flex items-end p-2`}>
            <span className="text-xs font-mono text-white">{weight}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
)
```

#### **Typography.stories.tsx**

```typescript
export default {
  title: 'Foundation/Typography',
  parameters: {
    docs: {
      description: {
        component: 'Professional typography system: Bebas Neue for displays, Inter for interface, IBM Plex Mono for data.'
      }
    }
  }
}

export const DisplayHierarchy = () => (
  <div className="space-y-4">
    <h1 className="display-xl text-navy-900">Display XL - Team Championship</h1>
    <h2 className="display-lg text-navy-800">Display LG - Season Stats</h2>
    <h3 className="display-md text-navy-700">Display MD - Game Results</h3>
  </div>
)

export const InterfaceText = () => (
  <div className="space-y-4">
    <p className="text-xl text-gray-900">Interface XL - Primary headings</p>
    <p className="text-lg text-gray-800">Interface LG - Secondary headings</p>
    <p className="text-base text-gray-700">Interface Base - Body text and labels</p>
    <p className="text-sm text-gray-600">Interface SM - Helper text and captions</p>
  </div>
)

export const DataDisplay = () => (
  <div className="space-y-4">
    <div className="mono-lg text-jade-600">Player #23 - QB - 2,847 YDS</div>
    <div className="mono-base text-navy-600">Team Record: 12-3 (Conference: 8-1)</div>
    <div className="mono-sm text-gray-600">Last Updated: 2024-01-15 14:23:07</div>
  </div>
)
```

### **2. Component Stories**

#### **Button.stories.tsx**

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '../src/components/ui/Button'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component: 'Professional coaching interface buttons with jade/navy styling and mobile optimization.'
      }
    }
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost']
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl']
    },
    color: {
      control: 'select',
      options: ['jade', 'navy', 'gray']
    },
    fullWidth: {
      control: 'boolean'
    },
    disabled: {
      control: 'boolean'
    }
  }
}

export default meta
type Story = StoryObj<typeof Button>

export const JadePrimary: Story = {
  args: {
    variant: 'primary',
    color: 'jade',
    children: 'Call Play'
  }
}

export const NavySecondary: Story = {
  args: {
    variant: 'secondary',
    color: 'navy',
    children: 'View Statistics'
  }
}

export const MobileOptimized: Story = {
  args: {
    size: 'lg',
    variant: 'primary',
    color: 'jade',
    fullWidth: true,
    children: 'Submit Game Plan'
  },
  parameters: {
    viewport: {
      defaultViewport: 'iphone12'
    }
  }
}

export const CoachingActions = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <Button variant="primary" color="jade">Start Practice</Button>
      <Button variant="secondary" color="navy">View Roster</Button>
    </div>
    <div className="grid grid-cols-3 gap-2">
      <Button variant="outline" size="sm">Timeout</Button>
      <Button variant="outline" size="sm">Substitution</Button>
      <Button variant="outline" size="sm">Challenge</Button>
    </div>
  </div>
)
```

#### **Card.stories.tsx**

```typescript
export default {
  title: 'Components/Card',
  component: Card,
  parameters: {
    docs: {
      description: {
        component: 'Professional coaching cards with substantial shadows and square design language.'
      }
    }
  }
}

export const PlayerCard: Story = {
  args: {
    children: (
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-jade-500 text-white rounded-md px-3 py-2 font-bold text-lg">
            #23
          </div>
          <div>
            <h3 className="text-xl font-semibold">Marcus Johnson</h3>
            <p className="text-gray-600">Quarterback • Senior</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="mono-lg text-jade-600">2,847</div>
            <div className="text-sm text-gray-600">Passing Yards</div>
          </div>
          <div>
            <div className="mono-lg text-navy-600">28</div>
            <div className="text-sm text-gray-600">Touchdowns</div>
          </div>
          <div>
            <div className="mono-lg text-gray-800">68.3%</div>
            <div className="text-sm text-gray-600">Completion</div>
          </div>
        </div>
      </div>
    )
  }
}

export const TeamStatsCard: Story = {
  args: {
    children: (
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-4">Season Performance</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Overall Record</span>
            <span className="mono-base text-jade-600 font-semibold">12-3</span>
          </div>
          <div className="flex justify-between">
            <span>Conference Record</span>
            <span className="mono-base text-navy-600 font-semibold">8-1</span>
          </div>
          <div className="flex justify-between">
            <span>Points Per Game</span>
            <span className="mono-base text-gray-800 font-semibold">31.2</span>
          </div>
        </div>
      </div>
    )
  }
}
```

### **3. Mobile Component Stories**

#### **MobileCalendar.stories.tsx**

```typescript
export default {
  title: 'Mobile/Calendar',
  component: MobileCalendar,
  parameters: {
    viewport: {
      defaultViewport: 'iphone12'
    },
    docs: {
      description: {
        component: 'Touch-optimized calendar for sideline coaching and mobile team management.'
      }
    }
  }
}

export const SidelineCalendar: Story = {
  args: {
    events: [
      {
        id: '1',
        title: 'Practice - Offense',
        startTime: new Date('2024-01-15T16:00:00'),
        endTime: new Date('2024-01-15T18:00:00'),
        type: 'practice'
      },
      {
        id: '2',
        title: 'Game vs. Ravens',
        startTime: new Date('2024-01-18T19:00:00'),
        endTime: new Date('2024-01-18T22:00:00'),
        type: 'game'
      }
    ],
    touchOptimized: true,
    gestureEnabled: true
  }
}

export const CoachingGestures = () => (
  <div className="space-y-4">
    <div className="bg-gray-50 p-4 rounded-md">
      <h4 className="font-semibold mb-2">Touch Gestures</h4>
      <ul className="text-sm space-y-1">
        <li>• Swipe left/right: Navigate months</li>
        <li>• Long press: Create event</li>
        <li>• Pinch: Zoom in/out</li>
        <li>• Tap: Select date/event</li>
      </ul>
    </div>
  </div>
)
```

### **4. Football-Specific Stories**

#### **FormationDiagram.stories.tsx**

```typescript
export default {
  title: "Football/Formation",
  component: FormationDiagram,
  parameters: {
    docs: {
      description: {
        component:
          "Interactive football formation diagrams for tactical planning and coaching.",
      },
    },
  },
};

export const OffensiveFormation: Story = {
  args: {
    formation: {
      name: "I-Formation",
      players: [
        { position: "QB", x: 50, y: 75 },
        { position: "FB", x: 50, y: 65 },
        { position: "RB", x: 50, y: 55 },
        { position: "WR", x: 20, y: 85 },
        { position: "WR", x: 80, y: 85 },
        { position: "TE", x: 35, y: 80 },
        { position: "LT", x: 35, y: 75 },
        { position: "LG", x: 42, y: 75 },
        { position: "C", x: 50, y: 75 },
        { position: "RG", x: 58, y: 75 },
        { position: "RT", x: 65, y: 75 },
      ],
    },
    interactive: true,
    showGrid: true,
  },
};

export const DefensiveFormation: Story = {
  args: {
    formation: {
      name: "4-3 Defense",
      players: [
        { position: "DE", x: 30, y: 45 },
        { position: "DT", x: 45, y: 45 },
        { position: "DT", x: 55, y: 45 },
        { position: "DE", x: 70, y: 45 },
        { position: "LB", x: 35, y: 35 },
        { position: "MLB", x: 50, y: 35 },
        { position: "LB", x: 65, y: 35 },
        { position: "CB", x: 15, y: 25 },
        { position: "S", x: 40, y: 15 },
        { position: "S", x: 60, y: 15 },
        { position: "CB", x: 85, y: 25 },
      ],
    },
    side: "defense",
    interactive: true,
  },
};
```

---

## 📱 **MOBILE STORY CONFIGURATIONS**

### **Viewport Configurations**

```typescript
// .storybook/preview.ts
export const parameters = {
  viewport: {
    viewports: {
      iphone12: {
        name: "iPhone 12/13/14",
        styles: {
          width: "390px",
          height: "844px",
        },
      },
      iphone12mini: {
        name: "iPhone 12/13 Mini",
        styles: {
          width: "375px",
          height: "812px",
        },
      },
      iphone14plus: {
        name: "iPhone 14/15 Plus",
        styles: {
          width: "428px",
          height: "926px",
        },
      },
      android: {
        name: "Android (Typical)",
        styles: {
          width: "360px",
          height: "640px",
        },
      },
      tablet: {
        name: "iPad",
        styles: {
          width: "768px",
          height: "1024px",
        },
      },
    },
  },
};
```

### **Touch Gesture Documentation**

```typescript
// Touch interaction stories
export const TouchInteractions = () => (
  <div className="space-y-6">
    <div className="bg-jade-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-jade-900 mb-3">Coaching Gestures</h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span>Call Timeout</span>
          <code className="bg-jade-100 px-2 py-1 rounded">Long Press</code>
        </div>
        <div className="flex justify-between">
          <span>Quick Substitute</span>
          <code className="bg-jade-100 px-2 py-1 rounded">Double Tap</code>
        </div>
        <div className="flex justify-between">
          <span>View Formation</span>
          <code className="bg-jade-100 px-2 py-1 rounded">Pinch Zoom</code>
        </div>
      </div>
    </div>
  </div>
)
```

---

## 🎯 **STORYBOOK ORGANIZATION STRUCTURE**

### **Story Categories**

```
Foundation/
├── Colors                      # Color system and palettes
├── Typography                  # Font hierarchy and usage
├── Spacing                     # Layout and spacing standards
├── Icons                       # Icon system and usage
└── Elevation                   # Shadow and depth system

Components/
├── Button                      # All button variants
├── Input                       # Form input components
├── Card                        # Card component variations
├── Modal                       # Modal and dialog components
├── Navigation                  # Navigation components
└── Feedback                    # Toast, alert, loading states

Mobile/
├── Calendar                    # Mobile calendar components
├── Navigation                  # Mobile navigation patterns
├── Gestures                    # Touch interaction components
├── Dashboard                   # Mobile dashboard layouts
└── Performance                 # Performance-optimized variants

Football/
├── Statistics                  # Data display components
├── Formation                   # Formation and field components
├── Team                        # Team management interfaces
├── Performance                 # Analytics and coaching tools
└── Game                        # Game management components

Templates/
├── Dashboard                   # Complete dashboard layouts
├── Mobile                      # Mobile page templates
├── Coaching                    # Coaching-specific layouts
└── Team                        # Team management templates
```

### **Interactive Story Features**

```typescript
// Interactive controls for coaching scenarios
export const CoachingScenario = {
  args: {
    gameState: "in-progress",
    timeRemaining: "02:47",
    quarter: 4,
    score: { home: 21, away: 17 },
    down: 3,
    yardsToGo: 7,
    fieldPosition: "OWN 35",
  },
  argTypes: {
    gameState: {
      control: "select",
      options: ["pre-game", "in-progress", "halftime", "post-game"],
    },
    quarter: {
      control: { type: "range", min: 1, max: 4, step: 1 },
    },
  },
};
```

---

## 📋 **IMPLEMENTATION CHECKLIST**

### **Phase 1: Foundation Setup**

- [ ] Initialize Storybook with Vite configuration
- [ ] Set up BoxCall theme with jade/navy colors
- [ ] Configure mobile viewports and responsive testing
- [ ] Create foundation stories (colors, typography, spacing)
- [ ] Set up accessibility testing addon

### **Phase 2: Core Components**

- [ ] Button component stories with all variants
- [ ] Input and form component stories
- [ ] Card component stories with football examples
- [ ] Navigation component stories
- [ ] Modal and feedback component stories

### **Phase 3: Mobile Optimization**

- [ ] Mobile calendar component stories
- [ ] Touch gesture demonstration stories
- [ ] Mobile navigation pattern stories
- [ ] Performance optimization story examples
- [ ] Cross-device compatibility testing

### **Phase 4: Football-Specific Components**

- [ ] Formation diagram interactive stories
- [ ] Statistics display component stories
- [ ] Team management interface stories
- [ ] Coaching analytics component stories
- [ ] Game management component stories

### **Phase 5: Templates & Layouts**

- [ ] Complete dashboard template stories
- [ ] Mobile page template stories
- [ ] Coaching workflow template stories
- [ ] Team management template stories
- [ ] Responsive layout testing stories

---

## 🚀 **DEPLOYMENT & INTEGRATION**

### **Storybook Build & Deploy**

```bash
# Build Storybook for production
npm run build-storybook

# Deploy to GitHub Pages or Netlify
npm run deploy-storybook

# Integration with main application
npm run storybook:test  # Visual regression testing
npm run storybook:a11y  # Accessibility testing
```

### **Design System Integration**

```typescript
// Export components from Storybook for main application
export { Button } from "./components/Button/Button";
export { Card } from "./components/Card/Card";
export { MobileCalendar } from "./components/Mobile/MobileCalendar";
export { FormationDiagram } from "./components/Football/FormationDiagram";

// Design tokens integration
export { colors, typography, spacing, shadows } from "./tokens";
```

This comprehensive component inventory provides the foundation for implementing Storybook with all our design system components. Should we proceed with initializing Storybook and creating the foundation stories?
