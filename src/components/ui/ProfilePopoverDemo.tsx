import React from "react";
import { UserAvatar } from "../ui/UserAvatar";
import { Typography } from "../design-system/Typography";

/**
 * Demo component to showcase the Discord-style profile popover system
 * This demonstrates how UserAvatar components can be used throughout the app
 */
export const ProfilePopoverDemo: React.FC = () => {
  // Mock user IDs (in real app, these would come from API/database)
  const mockUsers = [
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <Typography variant="headline-lg" className="text-gray-900 mb-2">
          Profile Popover System
        </Typography>
        <Typography variant="body-md" className="text-gray-600">
          Hover over any avatar or name to see their profile information
        </Typography>
      </div>

      {/* Size Variations */}
      <div className="bg-white rounded-lg border p-6">
        <Typography variant="headline-md" className="text-gray-900 mb-4">
          Avatar Sizes
        </Typography>
        <div className="flex items-center gap-6 flex-wrap">
          <div className="text-center">
            <UserAvatar
              userId={mockUsers[0].id}
              name={mockUsers[0].name}
              role={mockUsers[0].role}
              size="xs"
              showName={false}
            />
            <Typography variant="caption" className="text-gray-500 mt-1 block">
              XS
            </Typography>
          </div>
          <div className="text-center">
            <UserAvatar
              userId={mockUsers[0].id}
              name={mockUsers[0].name}
              role={mockUsers[0].role}
              size="sm"
              showName={false}
            />
            <Typography variant="caption" className="text-gray-500 mt-1 block">
              SM
            </Typography>
          </div>
          <div className="text-center">
            <UserAvatar
              userId={mockUsers[0].id}
              name={mockUsers[0].name}
              role={mockUsers[0].role}
              size="md"
              showName={false}
            />
            <Typography variant="caption" className="text-gray-500 mt-1 block">
              MD
            </Typography>
          </div>
          <div className="text-center">
            <UserAvatar
              userId={mockUsers[0].id}
              name={mockUsers[0].name}
              role={mockUsers[0].role}
              size="lg"
              showName={false}
            />
            <Typography variant="caption" className="text-gray-500 mt-1 block">
              LG
            </Typography>
          </div>
          <div className="text-center">
            <UserAvatar
              userId={mockUsers[0].id}
              name={mockUsers[0].name}
              role={mockUsers[0].role}
              size="xl"
              showName={false}
            />
            <Typography variant="caption" className="text-gray-500 mt-1 block">
              XL
            </Typography>
          </div>
        </div>
      </div>

      {/* Team Roster Example */}
      <div className="bg-white rounded-lg border p-6">
        <Typography variant="headline-md" className="text-gray-900 mb-4">
          Team Roster Example
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
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
                <Typography variant="body-sm" className="text-gray-500">
                  {user.role === "coach" || user.role === "assistant_coach"
                    ? "Coaching Staff"
                    : user.role === "player"
                      ? "Team Member"
                      : "Family"}
                </Typography>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Feed Example */}
      <div className="bg-white rounded-lg border p-6">
        <Typography variant="headline-md" className="text-gray-900 mb-4">
          Activity Feed Example
        </Typography>
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <UserAvatar
              userId={mockUsers[0].id}
              name={mockUsers[0].name}
              role={mockUsers[0].role}
              size="md"
              showPopover={true}
              showOnHover={true}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Typography
                  variant="body-sm"
                  className="font-semibold text-gray-900"
                >
                  {mockUsers[0].name}
                </Typography>
                <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-xs font-medium">
                  Coach
                </span>
              </div>
              <Typography variant="body-sm" className="text-gray-700">
                Posted a new practice plan for this week's games. Make sure to
                review the special teams plays!
              </Typography>
              <Typography variant="body-xs" className="text-gray-500 mt-1">
                2 hours ago
              </Typography>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <UserAvatar
              userId={mockUsers[1].id}
              name={mockUsers[1].name}
              role={mockUsers[1].role}
              size="md"
              showPopover={true}
              showOnHover={true}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Typography
                  variant="body-sm"
                  className="font-semibold text-gray-900"
                >
                  {mockUsers[1].name}
                </Typography>
                <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs font-medium">
                  Player
                </span>
              </div>
              <Typography variant="body-sm" className="text-gray-700">
                Great practice today team! Looking forward to Friday's game. 🏈
              </Typography>
              <Typography variant="body-xs" className="text-gray-500 mt-1">
                5 hours ago
              </Typography>
            </div>
          </div>
        </div>
      </div>

      {/* New App Integration Examples */}
      <div className="bg-white rounded-lg border p-6">
        <Typography variant="headline-md" className="text-gray-900 mb-4">
          App Integration Examples
        </Typography>
        <div className="space-y-6">
          {/* Staff Management Integration */}
          <div>
            <Typography variant="headline-sm" className="text-gray-700 mb-3">
              Staff Management Cards
            </Typography>
            <div className="bg-gray-50 p-4 rounded-lg">
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
                    className="font-medium text-gray-900"
                  >
                    Coach Anderson
                  </Typography>
                  <Typography variant="body-sm" className="text-gray-600">
                    anderson@team.com
                  </Typography>
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full mt-1">
                    Position Coach
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Playbook Creator Integration */}
          <div>
            <Typography variant="headline-sm" className="text-gray-700 mb-3">
              Play Creator Attribution
            </Typography>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <Typography
                    variant="headline-md"
                    className="font-mono font-bold text-gray-900"
                  >
                    Smash Concept
                  </Typography>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-purple-600 text-white rounded-full text-xs font-medium">
                      Pass
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-800 border border-gray-200 rounded-full text-xs font-medium">
                      85%
                    </span>
                    <div className="flex items-center gap-1">
                      <Typography variant="body-xs" className="text-gray-500">
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
            <Typography variant="headline-sm" className="text-gray-700 mb-3">
              Calendar Event Comments
            </Typography>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
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
                    <Typography variant="body-xs" className="text-gray-500">
                      1 hour ago
                    </Typography>
                  </div>
                  <Typography variant="body-sm" className="text-gray-700">
                    Make sure to focus on red zone execution in today's
                    practice.
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
                    <Typography variant="body-xs" className="text-gray-500">
                      30 min ago
                    </Typography>
                  </div>
                  <Typography variant="body-sm" className="text-gray-700">
                    Got it, Coach! Ready to work on those fade routes.
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
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
    </div>
  );
};
