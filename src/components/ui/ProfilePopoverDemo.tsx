import React from "react";
import { UserAvatar } from "../ui/UserAvatar";
import { Typography } from "../design-system/Typography";

/**
 * Demo component to showcase the Discord-style profile popover system
 * This demonstrates how UserAvatar components can be used throughout the app
 */

type DemoUser = {
  id: string;
  name: string;
  role: string;
  avatarUrl: string | null;
};

// Mock user IDs (in real app, these would come from API/database)
const MOCK_USERS: DemoUser[] = [
  {
    id: "coach-1",
    name: "Coach Mike Thompson",
    role: "coach",
    avatarUrl: null,
  },
  {
    id: "player-1",
    name: "John Smith",
    role: "player",
    avatarUrl: null,
  },
  {
    id: "player-2",
    name: "Sarah Rodriguez",
    role: "player",
    avatarUrl: null,
  },
  {
    id: "assistant-coach-1",
    name: "Coach Jennifer Davis",
    role: "assistant_coach",
    avatarUrl: null,
  },
  {
    id: "parent-1",
    name: "Robert Johnson",
    role: "family",
    avatarUrl: null,
  },
];

function getRoleGroupLabel(role: string) {
  if (role === "coach" || role === "assistant_coach") return "Coaching Staff";
  if (role === "player") return "Team Member";
  return "Family";
}

const DemoSectionCard: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => {
  return (
    <div className="bg-white rounded-lg border p-6">
      <Typography variant="headline-md" className="text-primary mb-4">
        {title}
      </Typography>
      {children}
    </div>
  );
};

const ProfilePopoverDemoHeader: React.FC = () => {
  return (
    <div className="text-center">
      <Typography variant="headline-lg" className="text-primary mb-2">
        Profile Popover System
      </Typography>
      <Typography variant="body-md" className="text-secondary">
        Hover over any avatar or name to see their profile information
      </Typography>
    </div>
  );
};

const ProfilePopoverDemoAvatarSizes: React.FC<{ user: DemoUser }> = ({
  user,
}) => {
  const sizeOptions = ["xs", "sm", "md", "lg", "xl"] as const;

  return (
    <DemoSectionCard title="Avatar Sizes">
      <div className="flex items-center gap-6 flex-wrap">
        {sizeOptions.map((size) => (
          <div className="text-center" key={size}>
            <UserAvatar
              userId={user.id}
              name={user.name}
              role={user.role}
              size={size}
              showName={false}
            />
            <Typography variant="caption" className="text-muted mt-1 block">
              {size.toUpperCase()}
            </Typography>
          </div>
        ))}
      </div>
    </DemoSectionCard>
  );
};

const ProfilePopoverDemoTeamRoster: React.FC<{ users: DemoUser[] }> = ({
  users,
}) => {
  return (
    <DemoSectionCard title="Team Roster Example">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-4 bg-secondary rounded-lg"
          >
            <UserAvatar
              userId={user.id}
              name={user.name}
              role={user.role}
              size="md"
              showName={true}
              showPopover={true}
              showOnHover={true}
            />
            <div className="text-right">
              <Typography variant="body-sm" className="text-muted">
                {getRoleGroupLabel(user.role)}
              </Typography>
            </div>
          </div>
        ))}
      </div>
    </DemoSectionCard>
  );
};

const ProfilePopoverDemoActivityFeed: React.FC<{ users: DemoUser[] }> = ({
  users,
}) => {
  return (
    <DemoSectionCard title="Activity Feed Example">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-secondary rounded-lg">
          <UserAvatar
            userId={users[0].id}
            name={users[0].name}
            role={users[0].role}
            size="md"
            showPopover={true}
            showOnHover={true}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Typography
                variant="body-sm"
                className="font-semibold text-primary"
              >
                {users[0].name}
              </Typography>
              <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-xs font-medium">
                Coach
              </span>
            </div>
            <Typography variant="body-sm" className="text-primary">
              Posted a new practice plan for this week's games. Make sure to
              review the special teams plays!
            </Typography>
            <Typography variant="body-xs" className="text-muted mt-1">
              2 hours ago
            </Typography>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-secondary rounded-lg">
          <UserAvatar
            userId={users[1].id}
            name={users[1].name}
            role={users[1].role}
            size="md"
            showPopover={true}
            showOnHover={true}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Typography
                variant="body-sm"
                className="font-semibold text-primary"
              >
                {users[1].name}
              </Typography>
              <span className="text-success-600 bg-success-bg px-2 py-0.5 rounded-full text-xs font-medium">
                Player
              </span>
            </div>
            <Typography variant="body-sm" className="text-primary">
              Great practice today team! Looking forward to Friday's game. 🏈
            </Typography>
            <Typography variant="body-xs" className="text-muted mt-1">
              5 hours ago
            </Typography>
          </div>
        </div>
      </div>
    </DemoSectionCard>
  );
};

const ProfilePopoverDemoIntegrationExamples: React.FC = () => {
  return (
    <DemoSectionCard title="App Integration Examples">
      <div className="space-y-6">
        {/* Staff Management Integration */}
        <div>
          <Typography variant="headline-sm" className="text-primary mb-3">
            Staff Management Cards
          </Typography>
          <div className="bg-secondary p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <UserAvatar
                userId="staff-1"
                name="Coach Anderson"
                role="coach"
                size="lg"
              />
              <div>
                <Typography
                  variant="body-md"
                  className="font-medium text-primary"
                >
                  Coach Anderson
                </Typography>
                <Typography variant="body-sm" className="text-secondary">
                  anderson@team.com
                </Typography>
                <span className="inline-block px-2 py-1 bg-success-bg text-success-600 text-xs font-medium rounded-full mt-1">
                  Position Coach
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Playbook Creator Integration */}
        <div>
          <Typography variant="headline-sm" className="text-primary mb-3">
            Play Creator Attribution
          </Typography>
          <div className="bg-secondary p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <Typography
                  variant="headline-md"
                  className="font-mono font-bold text-primary"
                >
                  Smash Concept
                </Typography>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-purple-600 text-white rounded-full text-xs font-medium">
                    Pass
                  </span>
                  <span className="px-2 py-0.5 bg-muted text-primary border rounded-full text-xs font-medium">
                    85%
                  </span>
                  <div className="flex items-center gap-1">
                    <Typography variant="body-xs" className="text-muted">
                      by
                    </Typography>
                    <UserAvatar
                      userId="creator-1"
                      name="Coach Thompson"
                      role="coach"
                      size="xs"
                      showName={false}
                      showPopover={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Comments Integration */}
        <div>
          <Typography variant="headline-sm" className="text-primary mb-3">
            Calendar Event Comments
          </Typography>
          <div className="bg-secondary p-4 rounded-lg space-y-3">
            <div className="flex items-start gap-2">
              <UserAvatar
                userId="coach-calendar"
                name="Coach Davis"
                role="coach"
                size="xs"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Typography variant="body-sm" className="font-medium">
                    Coach Davis
                  </Typography>
                  <Typography variant="body-xs" className="text-muted">
                    1 hour ago
                  </Typography>
                </div>
                <Typography variant="body-sm" className="text-primary">
                  Make sure to focus on red zone execution in today's practice.
                </Typography>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <UserAvatar
                userId="player-calendar"
                name="Jake Martinez"
                role="player"
                size="xs"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Typography variant="body-sm" className="font-medium">
                    Jake Martinez
                  </Typography>
                  <Typography variant="body-xs" className="text-muted">
                    30 min ago
                  </Typography>
                </div>
                <Typography variant="body-sm" className="text-primary">
                  Got it, Coach! Ready to work on those fade routes.
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DemoSectionCard>
  );
};

const ProfilePopoverDemoUsageInstructions: React.FC = () => {
  return (
    <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
      <Typography variant="headline-sm" className="text-blue-900 mb-3">
        How It Works
      </Typography>
      <ul className="space-y-2 text-blue-800">
        <li className="flex items-start">
          <span className="text-blue-600 mr-2">•</span>
          <Typography variant="body-sm">
            <strong>Hover:</strong> Profile popover appears automatically when
            you hover over avatars or names
          </Typography>
        </li>
        <li className="flex items-start">
          <span className="text-blue-600 mr-2">•</span>
          <Typography variant="body-sm">
            <strong>Click:</strong> On mobile devices, tap avatars to see
            profile information
          </Typography>
        </li>
        <li className="flex items-start">
          <span className="text-blue-600 mr-2">•</span>
          <Typography variant="body-sm">
            <strong>Rich Info:</strong> Each popover shows avatar, role, bio,
            achievements, social links, and contact info
          </Typography>
        </li>
        <li className="flex items-start">
          <span className="text-blue-600 mr-2">•</span>
          <Typography variant="body-sm">
            <strong>Role Colors:</strong> Different roles get different accent
            colors (blue for coaches, green for players, etc.)
          </Typography>
        </li>
        <li className="flex items-start">
          <span className="text-blue-600 mr-2">•</span>
          <Typography variant="body-sm">
            <strong>Smart Integration:</strong> Now integrated across team
            rosters, activity feeds, calendar comments, staff management, and
            playbook creators
          </Typography>
        </li>
      </ul>
    </div>
  );
};

export const ProfilePopoverDemo: React.FC = () => {
  return (
    <div className="content-medium p-6 space-y-8">
      <ProfilePopoverDemoHeader />
      <ProfilePopoverDemoAvatarSizes user={MOCK_USERS[0]} />
      <ProfilePopoverDemoTeamRoster users={MOCK_USERS} />
      <ProfilePopoverDemoActivityFeed users={MOCK_USERS} />
      <ProfilePopoverDemoIntegrationExamples />
      <ProfilePopoverDemoUsageInstructions />
    </div>
  );
};
