import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  analyzePlayComplexity,
  getComplexityBadgeInfo,
  checkComplexityMilestones,
  type ComplexityBadgeType,
} from "./playComplexity";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

const meta: Meta = {
  title: "Utils/playComplexity",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Play complexity analysis utility for gamification and badge system.

**Features:**
- Analyzes play designs based on routes, formations, personnel, and concepts
- Awards complexity badges (beginner to innovative)
- Tracks complexity milestones and achievements
- Provides detailed metrics breakdown

**Usage:**
\`\`\`tsx
import { analyzePlayComplexity, getComplexityBadgeInfo } from './utils/playComplexity';

const play = { p_type: "RPO", formation: "Shotgun", tags: ["deep", "crossing"] };
const metrics = analyzePlayComplexity(play);
const badgeInfo = getComplexityBadgeInfo(metrics.badge);

// Display badge
<Badge variant={badgeInfo.color}>{badgeInfo.icon} {badgeInfo.title}</Badge>
\`\`\`
        `,
      },
    },
  },
};

export default meta;

// Play Complexity Demo Component
const PlayComplexityDemo = () => {
  // Sample plays with different complexity levels
  const samplePlays = [
    {
      id: "1",
      playbook_id: "pb-1",
      p_type: "Run" as const,
      formation: "I-Formation",
      play_name: "Inside Zone",
      personnel: "11",
      confidence_base: 70,
      times_called: 10,
      times_successful: 8,
      created_by: "user-1",
      created_at: new Date(),
      updated_at: new Date(),
      notes: "Simple inside run",
    },
    {
      id: "2",
      playbook_id: "pb-1",
      p_type: "Pass" as const,
      formation: "Shotgun",
      play_name: "Slant/Curl/Crossing",
      personnel: "11",
      confidence_base: 70,
      times_called: 15,
      times_successful: 10,
      created_by: "user-1",
      created_at: new Date(),
      updated_at: new Date(),
      notes: "Three route combination with protection",
    },
    {
      id: "3",
      playbook_id: "pb-1",
      p_type: "RPO" as const,
      formation: "Pistol",
      play_name: "RPO Deep Cross Rub",
      personnel: "12",
      confidence_base: 70,
      times_called: 8,
      times_successful: 3,
      created_by: "user-1",
      created_at: new Date(),
      updated_at: new Date(),
      notes:
        "Complex read-option with multiple vertical routes and rub concepts",
    },
    {
      id: "4",
      playbook_id: "pb-1",
      p_type: "Play Action" as const,
      formation: "Wildcat",
      play_name: "PA Bootleg Flood",
      personnel: "21",
      confidence_base: 70,
      times_called: 5,
      times_successful: 1,
      created_by: "user-1",
      created_at: new Date(),
      updated_at: new Date(),
      notes:
        "Highly complex play action bootleg with multiple concepts and motion",
    },
  ];

  const analyzedPlays = samplePlays.map((play) => ({
    ...play,
    metrics: analyzePlayComplexity(play),
  }));

  return (
    <Card className="w-full max-w-6xl p-lg">
      <div className="space-y-lg">
        <div>
          <h3 className="text-lg font-semibold mb-xs">
            Play Complexity Analysis
          </h3>
          <p className="text-sm text-secondary mb-md">
            Analyze football plays for complexity and award appropriate badges
            based on routes, formations, personnel, and concepts.
          </p>
        </div>

        {/* Badge Legend */}
        <div className="space-y-md">
          <h4 className="font-medium">Complexity Badge System</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-md">
            {(
              [
                "beginner",
                "intermediate",
                "advanced",
                "expert",
                "innovative",
              ] as ComplexityBadgeType[]
            ).map((badge) => {
              const info = getComplexityBadgeInfo(badge);
              return (
                <div key={badge} className="p-sm border rounded-lg text-center">
                  <div className="text-2xl mb-xs">{info.icon}</div>
                  <div className="font-medium text-sm">{info.title}</div>
                  <Badge variant={info.color as any} className="mt-xs text-xs">
                    {badge}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Analyzed Plays */}
        <div className="space-y-md">
          <h4 className="font-medium">Play Analysis Examples</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            {analyzedPlays.map((play) => {
              const badgeInfo = getComplexityBadgeInfo(play.metrics.badge);
              const maxScore = 100;
              const progressPercentage =
                (play.metrics.totalScore / maxScore) * 100;

              return (
                <div
                  key={play.id}
                  className="p-md border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-md">
                    <div>
                      <h5 className="font-medium">
                        {play.p_type} - {play.formation}
                      </h5>
                      <p className="text-sm text-secondary">{play.notes}</p>
                    </div>
                    <Badge variant={badgeInfo.color as any}>
                      {badgeInfo.icon} {badgeInfo.title}
                    </Badge>
                  </div>

                  {/* Complexity Score */}
                  <div className="space-y-xs mb-md">
                    <div className="flex items-center justify-between text-sm">
                      <span>Complexity Score</span>
                      <span className="font-medium">
                        {play.metrics.totalScore}/100
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Metrics Breakdown */}
                  <div className="grid grid-cols-2 gap-sm text-sm">
                    <div className="space-y-xs">
                      <div className="flex justify-between">
                        <span>Routes:</span>
                        <span className="font-medium">
                          {play.metrics.routeCount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Formation:</span>
                        <span className="font-medium">
                          {play.metrics.formationComplexity}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-xs">
                      <div className="flex justify-between">
                        <span>Personnel:</span>
                        <span className="font-medium">
                          {play.metrics.personnelVariety}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Concept:</span>
                        <span className="font-medium">
                          {play.metrics.conceptDifficulty}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {/* Note: Tags are not part of the core Play interface but can be derived from other fields */}
                  <div className="mt-sm">
                    <div className="text-xs text-gray-500">
                      Tags derived from play characteristics
                    </div>
                  </div>

                  {/* Success Rate */}
                  <div className="mt-sm pt-sm border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span>Success Rate:</span>
                      <span
                        className={`font-medium ${play.times_called > 0 && play.times_successful / play.times_called < 0.5 ? "text-error-600" : "text-green-600"}`}
                      >
                        {play.times_called > 0
                          ? Math.round(
                              (play.times_successful / play.times_called) * 100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="text-xs text-secondary mt-xs">
                      Called: {play.times_called} | Successful:{" "}
                      {play.times_successful}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scoring System */}
        <div className="space-y-md">
          <h4 className="font-medium">Scoring System</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <div className="space-y-sm">
              <h5 className="font-medium text-sm">Play Type Base Scores</h5>
              <div className="space-y-xs text-sm">
                <div className="flex justify-between">
                  <span>Run:</span>
                  <span className="font-medium">10 points</span>
                </div>
                <div className="flex justify-between">
                  <span>Pass:</span>
                  <span className="font-medium">15 points</span>
                </div>
                <div className="flex justify-between">
                  <span>RPO:</span>
                  <span className="font-medium">25 points</span>
                </div>
                <div className="flex justify-between">
                  <span>Play Action:</span>
                  <span className="font-medium">30 points</span>
                </div>
              </div>
            </div>

            <div className="space-y-sm">
              <h5 className="font-medium text-sm">Personnel Complexity</h5>
              <div className="space-y-xs text-sm">
                <div className="flex justify-between">
                  <span>11 Personnel:</span>
                  <span className="font-medium">10 points</span>
                </div>
                <div className="flex justify-between">
                  <span>12 Personnel:</span>
                  <span className="font-medium">20 points</span>
                </div>
                <div className="flex justify-between">
                  <span>21 Personnel:</span>
                  <span className="font-medium">25 points</span>
                </div>
                <div className="flex justify-between">
                  <span>10 Personnel:</span>
                  <span className="font-medium">15 points</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Function Signatures */}
        <div className="space-y-md">
          <h4 className="font-medium">Function Signatures</h4>
          <div className="text-sm space-y-xs text-secondary">
            <div>
              <code>analyzePlayComplexity(play: Play): ComplexityMetrics</code>
            </div>
            <div>
              <code>
                getComplexityBadgeInfo(badge: ComplexityBadgeType): BadgeInfo
              </code>
            </div>
            <div>
              <code>
                checkComplexityMilestones(newMetrics, previousBestScore?):
                MilestoneResult
              </code>
            </div>
          </div>
        </div>

        {/* Badge Thresholds */}
        <div className="space-y-md">
          <h4 className="font-medium">Badge Thresholds</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-md text-sm">
            <div className="p-sm border rounded-lg text-center">
              <div className="font-medium text-blue-600">0-25</div>
              <div>Beginner</div>
            </div>
            <div className="p-sm border rounded-lg text-center">
              <div className="font-medium text-yellow-600">26-50</div>
              <div>Intermediate</div>
            </div>
            <div className="p-sm border rounded-lg text-center">
              <div className="font-medium text-green-600">51-75</div>
              <div>Advanced</div>
            </div>
            <div className="p-sm border rounded-lg text-center">
              <div className="font-medium text-purple-600">76-90</div>
              <div>Expert</div>
            </div>
            <div className="p-sm border rounded-lg text-center">
              <div className="font-medium text-purple-800">91+</div>
              <div>Innovative</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Story definitions
export const Default: StoryObj = {
  render: () => <PlayComplexityDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Complete play complexity analysis demo with different play types and badge system.",
      },
    },
  },
};

export const BadgeSystem: StoryObj = {
  render: () => {
    const badges: ComplexityBadgeType[] = [
      "beginner",
      "intermediate",
      "advanced",
      "expert",
      "innovative",
    ];

    return (
      <Card className="p-lg max-w-2xl">
        <h3 className="text-lg font-semibold mb-md">Complexity Badge System</h3>
        <div className="space-y-md">
          {badges.map((badge) => {
            const info = getComplexityBadgeInfo(badge);
            return (
              <div
                key={badge}
                className="flex items-center gap-md p-sm border rounded-lg"
              >
                <div className="text-2xl">{info.icon}</div>
                <div className="flex-1">
                  <div className="font-medium">{info.title}</div>
                  <div className="text-sm text-secondary">
                    {info.description}
                  </div>
                </div>
                <Badge variant={info.color as any}>{badge}</Badge>
              </div>
            );
          })}
        </div>
      </Card>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows all complexity badges with their descriptions and visual representations.",
      },
    },
  },
};

export const ComplexityBreakdown: StoryObj = {
  render: () => {
    const testPlay = {
      id: "test",
      playbook_id: "pb-test",
      p_type: "RPO" as const,
      formation: "Pistol",
      play_name: "RPO Deep Cross Rub",
      personnel: "12",
      confidence_base: 70,
      times_called: 12,
      times_successful: 6,
      created_by: "user-test",
      created_at: new Date(),
      updated_at: new Date(),
      notes: "Complex RPO with multiple route concepts",
    };

    const metrics = analyzePlayComplexity(testPlay);
    const badgeInfo = getComplexityBadgeInfo(metrics.badge);

    return (
      <Card className="p-lg max-w-md">
        <h3 className="text-lg font-semibold mb-md">Complexity Breakdown</h3>
        <div className="space-y-md">
          <div className="text-center">
            <div className="text-3xl mb-xs">{badgeInfo.icon}</div>
            <Badge variant={badgeInfo.color as any} className="mb-xs">
              {badgeInfo.title}
            </Badge>
            <div className="text-sm text-secondary">
              {badgeInfo.description}
            </div>
          </div>

          <div className="space-y-sm">
            <div className="flex justify-between items-center">
              <span>Total Score:</span>
              <span className="font-bold text-lg">
                {metrics.totalScore}/100
              </span>
            </div>

            <div className="space-y-xs">
              <div className="flex justify-between text-sm">
                <span>Route Complexity:</span>
                <span>{metrics.routeCount} pts</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Formation Complexity:</span>
                <span>{metrics.formationComplexity} pts</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Personnel Variety:</span>
                <span>{metrics.personnelVariety} pts</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Concept Difficulty:</span>
                <span>{metrics.conceptDifficulty} pts</span>
              </div>
            </div>
          </div>

          <div className="pt-sm border-t">
            <div className="text-sm text-secondary">
              <div>
                <strong>Play Type:</strong> {testPlay.p_type}
              </div>
              <div>
                <strong>Formation:</strong> {testPlay.formation}
              </div>
              <div>
                <strong>Personnel:</strong> {testPlay.personnel}
              </div>
              <div>
                <strong>Success Rate:</strong>{" "}
                {testPlay.times_called > 0
                  ? Math.round(
                      (testPlay.times_successful / testPlay.times_called) * 100
                    )
                  : 0}
                %
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows detailed complexity breakdown for a single play with all metrics explained.",
      },
    },
  },
};

export const MilestoneTracking: StoryObj = {
  render: () => {
    const plays = [
      { score: 20, previous: 0 }, // No milestone
      { score: 30, previous: 20 }, // Intermediate milestone
      { score: 55, previous: 30 }, // Advanced milestone
      { score: 80, previous: 55 }, // Expert milestone
      { score: 95, previous: 80 }, // Innovative milestone
    ];

    return (
      <Card className="p-lg max-w-2xl">
        <h3 className="text-lg font-semibold mb-md">Complexity Milestones</h3>
        <div className="space-y-md">
          {plays.map((play, index) => {
            const mockMetrics = {
              totalScore: play.score,
              badge: "beginner" as ComplexityBadgeType,
            } as any;
            const milestone = checkComplexityMilestones(
              mockMetrics,
              play.previous
            );

            return (
              <div key={index} className="p-sm border rounded-lg">
                <div className="flex items-center justify-between mb-xs">
                  <span className="font-medium">
                    Score: {play.score} (Previous: {play.previous})
                  </span>
                  {milestone.isNewMilestone ? (
                    <Badge variant="achievement">🎉 Milestone!</Badge>
                  ) : (
                    <Badge variant="neutral">No Milestone</Badge>
                  )}
                </div>
                {milestone.isNewMilestone && milestone.milestone && (
                  <div className="text-sm text-green-700 font-medium">
                    {milestone.milestone}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-md p-sm bg-status-info-bg rounded-lg">
          <h5 className="font-medium text-sm mb-xs">Milestone Thresholds</h5>
          <div className="text-sm text-secondary space-y-xs">
            <div>• 26+ points: First Intermediate Play</div>
            <div>• 51+ points: Advanced Play Designer</div>
            <div>• 76+ points: Expert Level Reached</div>
            <div>• 91+ points: Innovation Unlocked</div>
          </div>
        </div>
      </Card>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates milestone tracking when players achieve new complexity levels.",
      },
    },
  },
};
