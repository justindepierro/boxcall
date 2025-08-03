import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Foundation/Typography",
  parameters: {
    docs: {
      description: {
        component:
          "BoxCall typography system: Bebas Neue for authoritative displays, Inter for clean interfaces, IBM Plex Mono for technical data precision.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const DisplayHierarchy: Story = {
  render: () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mb-6">
        Display Typography - Bebas Neue
      </h2>
      <div className="space-y-6">
        <div>
          <h1 className="text-7xl font-display text-navy-900 leading-none">
            CHAMPIONSHIP
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Display XL - 4.5rem (72px) - Team achievements, main headers
          </p>
        </div>
        <div>
          <h2 className="text-6xl font-display text-navy-800 leading-none">
            SEASON STATS
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Display LG - 3.75rem (60px) - Section headers, major stats
          </p>
        </div>
        <div>
          <h3 className="text-5xl font-display text-navy-700 leading-none">
            GAME RESULTS
          </h3>
          <p className="text-sm text-gray-600 mt-2">
            Display MD - 3rem (48px) - Game titles, important metrics
          </p>
        </div>
        <div>
          <h4 className="text-4xl font-display text-navy-600 leading-none">
            PLAYER STATS
          </h4>
          <p className="text-sm text-gray-600 mt-2">
            Display SM - 2.25rem (36px) - Player headers, feature callouts
          </p>
        </div>
      </div>
    </div>
  ),
};

export const InterfaceText: Story = {
  render: () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mb-6">Interface Typography - Inter</h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Interface XL Heading
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            1.25rem (20px) - Primary page headings, section titles
          </p>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-gray-800">
            Interface LG Heading
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            1.125rem (18px) - Secondary headings, card titles
          </p>
        </div>
        <div>
          <p className="text-base text-gray-700">
            Interface Base Text - This is the standard body text used throughout
            the application for general content, descriptions, and user
            interface elements.
          </p>
          <p className="text-sm text-gray-600 mt-1">
            1rem (16px) - Body text, form labels, general content
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">
            Interface SM Text - Used for helper text, captions, secondary
            information, and metadata that supports the main content.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            0.875rem (14px) - Helper text, captions, metadata
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">
            Interface XS Text - For very small UI elements, timestamps, legal
            text, and minimal interface details.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            0.75rem (12px) - Minimal text, fine print, micro-interactions
          </p>
        </div>
      </div>
    </div>
  ),
};

export const DataDisplay: Story = {
  render: () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mb-6">
        Data Typography - IBM Plex Mono
      </h2>
      <div className="space-y-6">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Player Statistics</h3>
          <div className="space-y-3">
            <div className="text-lg font-mono text-jade-600">
              #23 Marcus Johnson - QB
            </div>
            <div className="font-mono text-navy-600">
              2,847 YDS | 28 TDs | 68.3% COMP
            </div>
            <div className="text-sm font-mono text-gray-600">
              Season: 15 Games | 487/714 Attempts
            </div>
          </div>
        </div>

        <div className="bg-navy-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-navy-900">
            Team Performance
          </h3>
          <div className="space-y-3">
            <div className="text-lg font-mono text-navy-700">
              RECORD: 12-3 (Conference: 8-1)
            </div>
            <div className="font-mono text-jade-600">
              PPG: 31.2 | YPGA: 387.4 | TO DIFF: +18
            </div>
            <div className="text-sm font-mono text-gray-700">
              Last Updated: 2024-01-15 14:23:07 EST
            </div>
          </div>
        </div>

        <div className="bg-jade-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-jade-900">
            Live Game Data
          </h3>
          <div className="space-y-2">
            <div className="text-xl font-mono text-jade-700">
              Q4 02:47 | 3rd & 7 | OWN 35
            </div>
            <div className="font-mono text-gray-800">HOME: 21 | AWAY: 17</div>
            <div className="text-sm font-mono text-gray-600">
              TIMEOUTS: 2 | CHALLENGES: 1
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const FontWeights: Story = {
  render: () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mb-6">Font Weights & Emphasis</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Bebas Neue (Display)</h3>
          <div className="space-y-2">
            <div className="text-3xl font-display font-normal text-navy-900">
              Regular Weight
            </div>
            <p className="text-sm text-gray-600">
              Used for all display typography - naturally bold and authoritative
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Inter (Interface)</h3>
          <div className="space-y-2">
            <div className="text-lg font-normal text-gray-800">
              Regular (400) - Body text and standard interface elements
            </div>
            <div className="text-lg font-medium text-gray-800">
              Medium (500) - Emphasized text and secondary headings
            </div>
            <div className="text-lg font-semibold text-gray-800">
              Semibold (600) - Primary headings and important labels
            </div>
            <div className="text-lg font-bold text-gray-800">
              Bold (700) - Strong emphasis and critical information
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">IBM Plex Mono (Data)</h3>
          <div className="space-y-2">
            <div className="font-mono font-normal text-gray-800">
              Regular - Standard data display and code
            </div>
            <div className="font-mono font-medium text-jade-600">
              Medium - Emphasized statistics and metrics
            </div>
            <div className="font-mono font-semibold text-navy-600">
              Semibold - Critical data and key performance indicators
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const CoachingTypography: Story = {
  render: () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mb-6">Football Coaching Context</h2>

      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-display text-navy-900">BOXCALL</h1>
          <div className="text-right">
            <div className="font-mono text-sm text-gray-600">
              GAME 15 | SEASON 2024
            </div>
            <div className="font-mono text-jade-600 font-semibold">LIVE</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-2xl font-display text-navy-800 mb-3">
              TEAM STATS
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">Overall Record:</span>
                <span className="font-mono font-semibold text-jade-600">
                  12-3
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Conference:</span>
                <span className="font-mono font-semibold text-navy-600">
                  8-1
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Points Per Game:</span>
                <span className="font-mono font-semibold text-gray-800">
                  31.2
                </span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-display text-navy-800 mb-3">
              GAME STATUS
            </h2>
            <div className="bg-jade-50 p-4 rounded-lg border border-jade-200">
              <div className="font-mono text-lg text-jade-700 mb-2">
                Q4 02:47 | 3rd & 7
              </div>
              <div className="font-mono text-navy-600">HOME 21 - AWAY 17</div>
              <div className="text-sm text-gray-600 mt-2">
                Field Position: OWN 35
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <button className="bg-jade-500 hover:bg-jade-600 text-white px-4 py-2 rounded-md font-semibold">
            Call Timeout
          </button>
          <button className="bg-navy-500 hover:bg-navy-600 text-white px-4 py-2 rounded-md font-semibold">
            View Formation
          </button>
          <button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md font-semibold">
            Substitution
          </button>
        </div>
      </div>
    </div>
  ),
};
