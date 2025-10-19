import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  MobileCTACard,
  MobilePageHeader,
  MobileSection,
  MobileQuickActions,
  MobileListItem,
  MobileListGroup,
  MobileCard,
  MobileCardHeader,
  MobileCardFooter,
} from "./index";
import { Badge } from "../../ui/Badge";
import { Icon } from "../../ui/Icon";
import { UserAvatar as Avatar } from "../../ui/UserAvatar";
import { Button } from "../../ui/Button";

const meta: Meta = {
  title: "Mobile Library/Overview",
  parameters: {
    layout: "fullscreen",
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        component: `
# Mobile Component Library

A comprehensive collection of mobile-first components designed for professional,
thumb-friendly experiences following iOS/Android design patterns.

## Design Principles

- **Touch targets**: 44px minimum (Apple HIG)
- **Typography**: 16px minimum for body text
- **Spacing**: Comfortable, mobile-optimized
- **Animation**: Smooth, native-feeling transitions
- **Accessibility**: WCAG 2.1 AA compliant

## Components

1. **MobileCTACard** - Hero action cards (180px height)
2. **MobilePageHeader** - Consistent page headers
3. **MobileSection** - Section wrappers with spacing
4. **MobileQuickActions** - Icon button grids
5. **MobileListItem** - Standard list items
6. **MobileCard** - Flexible content cards
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// ============================================================================
// Complete Mobile Page Example
// ============================================================================

export const CompleteMobilePage: Story = {
  name: "📱 Complete Mobile Page Example",
  render: () => (
    <div className="min-h-screen bg-surface-base pb-20">
      {/* Page Header */}
      <MobilePageHeader
        title="Playbook"
        subtitle="0/100 plays"
        badge={<Badge variant="info">0%</Badge>}
        actions={
          <button className="p-2 rounded-lg hover:bg-surface-subtle">
            <Icon name="filter" size="md" />
          </button>
        }
      />

      {/* Hero CTA */}
      <MobileSection spacing="tight">
        <MobileCTACard
          icon="plus"
          title="Create Your First Play"
          description="Build offensive and defensive plays with our diagram editor"
          action="Get Started"
          variant="primary"
          onTap={() => alert("Create play clicked!")}
        />
      </MobileSection>

      {/* Quick Actions */}
      <MobileSection title="Quick Actions" spacing="comfortable">
        <MobileQuickActions
          actions={[
            {
              id: "practice",
              icon: "clock",
              label: "Practice",
              badge: 3,
              onTap: () => alert("Practice clicked!"),
            },
            {
              id: "gameplan",
              icon: "flag",
              label: "Game Plan",
              onTap: () => alert("Game Plan clicked!"),
            },
            {
              id: "scripts",
              icon: "book",
              label: "Scripts",
              onTap: () => alert("Scripts clicked!"),
            },
          ]}
        />
      </MobileSection>

      {/* Recent Activity */}
      <MobileSection
        title="Recent Activity"
        action="See All"
        onAction={() => alert("See all clicked!")}
        defaultCollapsed={true}
        spacing="comfortable"
      >
        <div className="px-4 space-y-2">
          <MobileCard padding="standard" elevation="low">
            <p className="text-sm text-muted">No recent activity</p>
          </MobileCard>
        </div>
      </MobileSection>
    </div>
  ),
};

// ============================================================================
// MobileCTACard Examples
// ============================================================================

export const CTACards: Story = {
  name: "MobileCTACard - Variants",
  render: () => (
    <div className="space-y-4 p-4 bg-surface-base">
      <h2 className="text-xl font-bold mb-4">CTA Card Variants</h2>

      {/* Primary */}
      <MobileCTACard
        icon="plus"
        title="Create Your First Play"
        description="Build offensive and defensive plays with our diagram editor"
        action="Get Started"
        variant="primary"
        onTap={() => alert("Primary CTA")}
      />

      {/* Secondary */}
      <MobileCTACard
        icon="upload"
        title="Import Your Playbook"
        description="Upload existing plays from PDF or Excel"
        action="Choose Files"
        variant="secondary"
        onTap={() => alert("Secondary CTA")}
      />

      {/* Accent */}
      <MobileCTACard
        icon="star"
        title="Upgrade to Pro"
        description="Unlock unlimited plays, advanced analytics, and more"
        action="Learn More"
        variant="accent"
        onTap={() => alert("Accent CTA")}
      />

      {/* With Illustration */}
      <MobileCTACard
        title="No Plays Yet"
        description="Start building your playbook with your first play"
        action="Create Play"
        variant="primary"
        illustration={
          <div className="w-20 h-20 rounded-full bg-brand-primary/20 flex items-center justify-center">
            <Icon name="book" size="xl" className="text-brand-primary" />
          </div>
        }
        onTap={() => alert("With illustration")}
      />
    </div>
  ),
};

// ============================================================================
// MobilePageHeader Examples
// ============================================================================

export const PageHeaders: Story = {
  name: "MobilePageHeader - Variants",
  render: () => (
    <div className="space-y-0 bg-surface-base">
      <h2 className="text-xl font-bold p-4 mb-2">Page Header Variants</h2>

      {/* Simple */}
      <MobilePageHeader title="Playbook" subtitle="0/100 plays" />

      <div className="h-4" />

      {/* With Badge */}
      <MobilePageHeader
        title="Playbook"
        subtitle="0/100 plays"
        badge={<Badge variant="info">0%</Badge>}
        actions={
          <button className="p-2 rounded-lg hover:bg-surface-subtle">
            <Icon name="settings" size="md" />
          </button>
        }
      />

      <div className="h-4" />

      {/* With Greeting and Avatar */}
      <MobilePageHeader
        greeting="Good morning"
        title="Justin DePierro"
        subtitle="Head Coach"
        avatar={<Avatar name="Justin DePierro" userId="123" size="md" />}
        actions={
          <button className="p-2 rounded-lg hover:bg-surface-subtle">
            <Icon name="bell" size="md" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        }
      />

      <div className="h-4" />

      {/* Compact */}
      <MobilePageHeader
        title="Settings"
        actions={
          <button className="text-sm font-medium text-brand-primary">
            Done
          </button>
        }
      />
    </div>
  ),
};

// ============================================================================
// MobileSection Examples
// ============================================================================

export const Sections: Story = {
  name: "MobileSection - Spacing & Collapsible",
  render: () => (
    <div className="min-h-screen bg-surface-base p-4">
      <h2 className="text-xl font-bold mb-4">Section Spacing</h2>

      {/* Tight Spacing */}
      <MobileSection title="Tight Spacing" spacing="tight">
        <div className="px-4 p-4 bg-surface-secondary rounded-lg">
          <p className="text-sm">Content with tight spacing (16px margin)</p>
        </div>
      </MobileSection>

      {/* Comfortable Spacing (default) */}
      <MobileSection title="Comfortable Spacing" spacing="comfortable">
        <div className="px-4 p-4 bg-surface-secondary rounded-lg">
          <p className="text-sm">
            Content with comfortable spacing (24px margin)
          </p>
        </div>
      </MobileSection>

      {/* Spacious */}
      <MobileSection title="Spacious Spacing" spacing="spacious">
        <div className="px-4 p-4 bg-surface-secondary rounded-lg">
          <p className="text-sm">Content with spacious spacing (32px margin)</p>
        </div>
      </MobileSection>

      {/* With Action */}
      <MobileSection
        title="With Action Link"
        action="See All"
        onAction={() => alert("See all clicked!")}
      >
        <div className="px-4 p-4 bg-surface-secondary rounded-lg">
          <p className="text-sm">Section with action link</p>
        </div>
      </MobileSection>

      {/* Collapsible */}
      <MobileSection
        title="Collapsible Section"
        action="See All"
        onAction={() => alert("See all clicked!")}
        defaultCollapsed={true}
      >
        <div className="px-4 p-4 bg-surface-secondary rounded-lg">
          <p className="text-sm">This section can be collapsed/expanded</p>
        </div>
      </MobileSection>
    </div>
  ),
};

// ============================================================================
// MobileQuickActions Examples
// ============================================================================

export const QuickActions: Story = {
  name: "MobileQuickActions - Icon Grids",
  render: () => (
    <div className="space-y-8 p-4 bg-surface-base">
      <h2 className="text-xl font-bold">Quick Action Grids</h2>

      {/* 2 Actions */}
      <div>
        <h3 className="text-sm font-semibold text-muted mb-3">2 Actions</h3>
        <MobileQuickActions
          actions={[
            {
              id: "new",
              icon: "plus",
              label: "New Play",
              variant: "primary",
              onTap: () => alert("New play"),
            },
            {
              id: "practice",
              icon: "clock",
              label: "Practice",
              badge: 3,
              onTap: () => alert("Practice"),
            },
          ]}
        />
      </div>

      {/* 3 Actions */}
      <div>
        <h3 className="text-sm font-semibold text-muted mb-3">3 Actions</h3>
        <MobileQuickActions
          actions={[
            {
              id: "new",
              icon: "plus",
              label: "New Play",
              variant: "primary",
              onTap: () => alert("New play"),
            },
            {
              id: "practice",
              icon: "clock",
              label: "Practice",
              badge: 3,
              onTap: () => alert("Practice"),
            },
            {
              id: "gameplan",
              icon: "flag",
              label: "Game Plan",
              onTap: () => alert("Game plan"),
            },
          ]}
        />
      </div>

      {/* 4 Actions */}
      <div>
        <h3 className="text-sm font-semibold text-muted mb-3">4 Actions</h3>
        <MobileQuickActions
          actions={[
            {
              id: "new",
              icon: "plus",
              label: "New",
              variant: "primary",
              onTap: () => alert("New"),
            },
            {
              id: "practice",
              icon: "clock",
              label: "Practice",
              badge: 2,
              onTap: () => alert("Practice"),
            },
            {
              id: "gameplan",
              icon: "flag",
              label: "Game",
              onTap: () => alert("Game"),
            },
            {
              id: "scripts",
              icon: "book",
              label: "Scripts",
              onTap: () => alert("Scripts"),
            },
          ]}
        />
      </div>
    </div>
  ),
};

// ============================================================================
// MobileListItem Examples
// ============================================================================

export const ListItems: Story = {
  name: "MobileListItem - List Patterns",
  render: () => (
    <div className="space-y-6 p-4 bg-surface-base">
      <h2 className="text-xl font-bold">List Item Patterns</h2>

      {/* Simple List */}
      <div>
        <h3 className="text-sm font-semibold text-muted mb-3">Simple List</h3>
        <MobileListGroup>
          <MobileListItem title="Power Run" subtitle="22 Personnel • Left" />
          <MobileListItem title="Counter" subtitle="11 Personnel • Right" />
          <MobileListItem
            title="Play Action"
            subtitle="21 Personnel • Center"
          />
        </MobileListGroup>
      </div>

      {/* With Leading/Trailing */}
      <div>
        <h3 className="text-sm font-semibold text-muted mb-3">
          With Avatar & Badge
        </h3>
        <MobileListGroup>
          <MobileListItem
            leading={
              <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
                <Icon name="play" size="sm" className="text-brand-primary" />
              </div>
            }
            title="Twins Same Power"
            subtitle="11 Personnel • Right"
            metadata="Updated 2 hours ago"
            trailing={<Badge variant="success">Run</Badge>}
            onTap={() => alert("Play tapped")}
          />
          <MobileListItem
            leading={
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Icon name="play" size="sm" className="text-blue-500" />
              </div>
            }
            title="Flood Concept"
            subtitle="10 Personnel • Left"
            metadata="Updated yesterday"
            trailing={<Badge variant="info">Pass</Badge>}
            onTap={() => alert("Play tapped")}
          />
        </MobileListGroup>
      </div>

      {/* Clickable */}
      <div>
        <h3 className="text-sm font-semibold text-muted mb-3">
          Clickable Items
        </h3>
        <MobileListGroup>
          <MobileListItem
            title="Edit Profile"
            trailing={<Icon name="chevron-right" size="sm" />}
            onTap={() => alert("Edit profile")}
          />
          <MobileListItem
            title="Notifications"
            trailing={<Icon name="chevron-right" size="sm" />}
            onTap={() => alert("Notifications")}
          />
          <MobileListItem
            title="Privacy & Security"
            trailing={<Icon name="chevron-right" size="sm" />}
            onTap={() => alert("Privacy")}
          />
        </MobileListGroup>
      </div>
    </div>
  ),
};

// ============================================================================
// MobileCard Examples
// ============================================================================

export const Cards: Story = {
  name: "MobileCard - Elevation & Padding",
  render: () => (
    <div className="space-y-6 p-4 bg-surface-base">
      <h2 className="text-xl font-bold">Card Variants</h2>

      {/* Elevation Levels */}
      <div>
        <h3 className="text-sm font-semibold text-muted mb-3">Elevation</h3>
        <div className="space-y-3">
          <MobileCard elevation="none">
            <p className="text-sm">No elevation (flat)</p>
          </MobileCard>
          <MobileCard elevation="low">
            <p className="text-sm">Low elevation (subtle shadow)</p>
          </MobileCard>
          <MobileCard elevation="medium">
            <p className="text-sm">Medium elevation (standard shadow)</p>
          </MobileCard>
          <MobileCard elevation="high">
            <p className="text-sm">High elevation (prominent shadow)</p>
          </MobileCard>
        </div>
      </div>

      {/* Padding Sizes */}
      <div>
        <h3 className="text-sm font-semibold text-muted mb-3">Padding</h3>
        <div className="space-y-3">
          <MobileCard padding="compact" elevation="low">
            <p className="text-sm">Compact padding (12px)</p>
          </MobileCard>
          <MobileCard padding="standard" elevation="low">
            <p className="text-sm">Standard padding (16px)</p>
          </MobileCard>
          <MobileCard padding="spacious" elevation="low">
            <p className="text-sm">Spacious padding (24px)</p>
          </MobileCard>
        </div>
      </div>

      {/* Interactive Card */}
      <div>
        <h3 className="text-sm font-semibold text-muted mb-3">Interactive</h3>
        <MobileCard
          interactive
          elevation="medium"
          onTap={() => alert("Card tapped!")}
        >
          <MobileCardHeader
            title="Clickable Card"
            subtitle="Tap to interact"
            action={<Icon name="chevron-right" size="sm" />}
          />
          <p className="text-sm text-muted">
            This card responds to taps with scale animation
          </p>
        </MobileCard>
      </div>

      {/* Card with Header/Footer */}
      <div>
        <h3 className="text-sm font-semibold text-muted mb-3">
          With Header & Footer
        </h3>
        <MobileCard elevation="medium">
          <MobileCardHeader
            title="Play Statistics"
            subtitle="Last 30 days"
            action={
              <button className="text-sm text-brand-primary">View All</button>
            }
          />
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted">Total Plays</span>
              <span className="text-sm font-semibold">42</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted">Success Rate</span>
              <span className="text-sm font-semibold">78%</span>
            </div>
          </div>
          <MobileCardFooter>
            <Button variant="primary" size="sm" fullWidth>
              View Details
            </Button>
          </MobileCardFooter>
        </MobileCard>
      </div>
    </div>
  ),
};
