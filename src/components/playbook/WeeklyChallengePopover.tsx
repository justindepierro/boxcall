import React from "react";
import { Icon } from "../ui/Icon";
import { Button } from "../ui/Button/Button";
import { Badge } from "../ui/Badge";
import { Typography } from "../design-system/Typography";

interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: string;
  difficulty: "easy" | "medium" | "hard";
  completed: boolean;
}

interface WeeklyChallengePopoverProps {
  isOpen: boolean;
  onClose: () => void;
  challenges: WeeklyChallenge[];
}

export const WeeklyChallengePopover: React.FC<WeeklyChallengePopoverProps> = ({
  isOpen,
  onClose,
  challenges,
}) => {
  if (!isOpen) return null;

  const completedCount = challenges.filter((c) => c.completed).length;
  const totalCount = challenges.length;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-overlay-modal">
      <div className="bg-primary rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-primary p-6 text-inverse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="trophy" size="lg" className="text-warning" />
              <div>
                <Typography variant="headline-md" className="text-inverse">
                  Weekly Challenges
                </Typography>
                <p className="text-secondary text-sm">
                  Complete challenges to earn rewards!
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-inverse hover:bg-primary/20"
            >
              <Icon name="close" size="sm" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-secondary mb-2">
              <span>Progress</span>
              <span>
                {completedCount}/{totalCount} completed
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-accent-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Challenges List */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  challenge.completed
                    ? "bg-success/20 border-success"
                    : "bg-secondary border-secondary"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Typography variant="label-md" className="font-medium">
                        {challenge.title}
                      </Typography>
                      <Badge
                        variant={(() => {
                          if (challenge.difficulty === "easy") return "success";
                          if (challenge.difficulty === "medium")
                            return "warning";
                          return "danger";
                        })()}
                        size="sm"
                      >
                        {challenge.difficulty}
                      </Badge>
                      {challenge.completed && (
                        <Badge variant="success" size="sm">
                          ✓ Completed
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-secondary mb-3">
                      {challenge.description}
                    </p>

                    {/* Progress */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-tertiary rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            challenge.completed
                              ? "bg-text-success"
                              : "bg-accent-primary"
                          }`}
                          style={{
                            width: `${Math.min((challenge.progress / challenge.target) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted">
                        {challenge.progress}/{challenge.target}
                      </span>
                    </div>

                    {/* Reward */}
                    <div className="mt-2 flex items-center gap-1">
                      <Icon name="trophy" size="xs" className="text-warning" />
                      <span className="text-xs text-secondary">
                        Reward: {challenge.reward}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {challenges.length === 0 && (
            <div className="text-center py-8">
              <Icon
                name="trophy"
                size="lg"
                className="text-muted mx-auto mb-4"
              />
              <Typography variant="label-md" className="text-muted">
                No challenges available this week
              </Typography>
              <p className="text-sm text-muted mt-1">
                Check back next week for new challenges!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-secondary px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-secondary">
              Complete all challenges to unlock special rewards!
            </div>
            <Button variant="primary" size="sm" onClick={onClose}>
              Got it!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
