/**
 * Team Vote Widget Component
 * Phase 2B Sprint 6: Collaborative Planning Tools
 *
 * Features:
 * - Create team votes and decisions
 * - Real-time voting with live results
 * - Role-based voting permissions
 * - Anonymous and public voting modes
 */

import React, { useState, useCallback } from "react";
import { CollaborativeWidget } from "./CollaborativeWidget";
import { Button, Card } from "../ui";
import { Typography } from "../design-system/Typography";
import { Icon } from "../ui/Icon/Icon";

interface VoteOption {
  id: string;
  text: string;
  votes: number;
  voters: string[]; // User IDs
}

interface Vote {
  id: string;
  title: string;
  description: string;
  options: VoteOption[];
  createdBy: string;
  createdAt: string;
  endsAt: string;
  isAnonymous: boolean;
  allowedVoters: "all" | "coaches" | "players" | "captains";
  status: "active" | "closed" | "draft";
  multipleChoice: boolean;
}

export interface TeamVoteWidgetProps {
  /**
   * Widget ID for collaboration
   */
  widgetId: string;

  /**
   * Current user's role
   */
  userRole: "coach" | "player" | "family";

  /**
   * Current user ID
   */
  userId: string;

  /**
   * Current user's name
   */
  userName: string;

  /**
   * Whether user is team captain
   */
  isCaptain?: boolean;

  /**
   * Initial votes data
   */
  votes?: Vote[];

  /**
   * Callback when votes are updated
   */
  onVotesUpdate?: (votes: Vote[]) => void;

  /**
   * Mock collaboration data
   */
  mockCollaboration?: {
    participants: Array<{ id: string; name: string; avatar?: string }>;
    cursors: Array<{
      userId: string;
      userName: string;
      x: number;
      y: number;
      action: "hover" | "click" | "typing";
      color: string;
    }>;
    isConnected: boolean;
  };
}

export const TeamVoteWidget: React.FC<TeamVoteWidgetProps> = ({
  widgetId,
  userRole,
  userId,
  userName,
  isCaptain = false,
  votes = [],
  onVotesUpdate,
  mockCollaboration,
}) => {
  const [localVotes, setLocalVotes] = useState<Vote[]>(votes);
  const [isCreatingVote, setIsCreatingVote] = useState(false);

  /**
   * Handle collaborative data changes
   */
  const handleCollaborativeDataChange = useCallback(
    (newData: Record<string, unknown>) => {
      if (newData.votes) {
        const updatedVotes = newData.votes as Vote[];
        setLocalVotes(updatedVotes);
        onVotesUpdate?.(updatedVotes);
      }
    },
    [onVotesUpdate]
  );

  /**
   * Cast a vote
   */
  const handleCastVote = useCallback(
    (voteId: string, optionId: string) => {
      const updatedVotes = localVotes.map((vote) => {
        if (vote.id !== voteId) return vote;

        // Check if user already voted and remove previous vote
        const updatedOptions = vote.options.map((option) => ({
          ...option,
          votes: option.voters.includes(userId)
            ? option.votes - 1
            : option.votes,
          voters: option.voters.filter((id) => id !== userId),
        }));

        // Add new vote
        return {
          ...vote,
          options: updatedOptions.map((option) =>
            option.id === optionId
              ? {
                  ...option,
                  votes: option.votes + 1,
                  voters: [...option.voters, userId],
                }
              : option
          ),
        };
      });

      setLocalVotes(updatedVotes);
      onVotesUpdate?.(updatedVotes);
    },
    [localVotes, userId, onVotesUpdate]
  );

  /**
   * Create a sample vote
   */
  const handleCreateVote = useCallback(() => {
    const newVote: Vote = {
      id: `vote-${Date.now()}`,
      title: "Practice Time Change",
      description: "Should we move practice from 4pm to 5pm on weekdays?",
      options: [
        { id: "opt-1", text: "Yes, move to 5pm", votes: 0, voters: [] },
        { id: "opt-2", text: "Keep at 4pm", votes: 0, voters: [] },
        { id: "opt-3", text: "Need more info", votes: 0, voters: [] },
      ],
      createdBy: userId,
      createdAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      isAnonymous: false,
      allowedVoters: "all",
      status: "active",
      multipleChoice: false,
    };

    const updatedVotes = [...localVotes, newVote];
    setLocalVotes(updatedVotes);
    onVotesUpdate?.(updatedVotes);
    setIsCreatingVote(false);
  }, [localVotes, userId, onVotesUpdate]);

  /**
   * Check if user can vote on this vote
   */
  const canUserVote = useCallback(
    (vote: Vote) => {
      if (vote.status !== "active") return false;

      switch (vote.allowedVoters) {
        case "all":
          return true;
        case "coaches":
          return userRole === "coach";
        case "players":
          return userRole === "player";
        case "captains":
          return userRole === "coach" || isCaptain;
        default:
          return false;
      }
    },
    [userRole, isCaptain]
  );

  /**
   * Check if user has voted
   */
  const hasUserVoted = useCallback(
    (vote: Vote) => {
      return vote.options.some((option) => option.voters.includes(userId));
    },
    [userId]
  );

  /**
   * Get total votes for a vote
   */
  const getTotalVotes = useCallback((vote: Vote) => {
    return vote.options.reduce((total, option) => total + option.votes, 0);
  }, []);

  /**
   * Calculate percentage for an option
   */
  const getOptionPercentage = useCallback(
    (vote: Vote, option: VoteOption) => {
      const total = getTotalVotes(vote);
      return total > 0 ? Math.round((option.votes / total) * 100) : 0;
    },
    [getTotalVotes]
  );

  /**
   * Get time remaining
   */
  const getTimeRemaining = useCallback((endsAt: string) => {
    const now = new Date().getTime();
    const end = new Date(endsAt).getTime();
    const diff = end - now;

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  }, []);

  const canCreateVote = userRole === "coach" || isCaptain;

  return (
    <CollaborativeWidget
      widgetId={widgetId}
      onDataChange={handleCollaborativeDataChange}
      className="team-vote-widget"
      mockCollaboration={mockCollaboration}
    >
      <Card className="h-full p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Typography variant="headline-sm" as="h3">
            Team Decisions
          </Typography>
          {canCreateVote && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreatingVote(true)}
            >
              <Icon name="plus" size="xs" />
              New Vote
            </Button>
          )}
        </div>

        {/* Active Votes */}
        <div className="space-y-4">
          {localVotes.length === 0 ? (
            <div className="text-center py-8">
              <Icon
                name="users"
                size="lg"
                className="mx-auto mb-2 text-text-muted"
              />
              <Typography variant="body-sm" color="muted">
                No active votes. Team decisions will appear here.
              </Typography>
              {canCreateVote && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => setIsCreatingVote(true)}
                >
                  Create First Vote
                </Button>
              )}
            </div>
          ) : (
            localVotes.map((vote) => {
              const totalVotes = getTotalVotes(vote);
              const userHasVoted = hasUserVoted(vote);
              const canVote = canUserVote(vote);

              return (
                <Card
                  key={vote.id}
                  className="p-4 border border-border-secondary"
                >
                  {/* Vote Header */}
                  <div className="mb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <Typography
                          variant="body-sm"
                          className="font-medium mb-1"
                        >
                          {vote.title}
                        </Typography>
                        <Typography variant="caption" color="muted">
                          {vote.description}
                        </Typography>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          vote.status === "active"
                            ? "bg-success/10 text-success"
                            : "bg-text-muted/10 text-text-muted"
                        }`}
                      >
                        {vote.status}
                      </span>
                    </div>

                    {/* Vote Info */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary">
                      <span>
                        <Icon name="users" size="xs" className="inline mr-1" />
                        {totalVotes} votes
                      </span>
                      <span>
                        <Icon name="clock" size="xs" className="inline mr-1" />
                        {getTimeRemaining(vote.endsAt)}
                      </span>
                      {vote.isAnonymous && (
                        <span>
                          <Icon
                            name="eye-off"
                            size="xs"
                            className="inline mr-1"
                          />
                          Anonymous
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Vote Options */}
                  <div className="space-y-2">
                    {vote.options.map((option) => {
                      const percentage = getOptionPercentage(vote, option);
                      const isSelected = option.voters.includes(userId);

                      return (
                        <div
                          key={option.id}
                          className={`relative p-3 rounded-lg border cursor-pointer transition-colors ${
                            canVote && !userHasVoted
                              ? "hover:bg-surface-secondary border-border-primary"
                              : "border-border-secondary"
                          } ${isSelected ? "bg-primary/5 border-primary" : ""}`}
                          onClick={
                            canVote && !userHasVoted
                              ? () => handleCastVote(vote.id, option.id)
                              : undefined
                          }
                        >
                          <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-2">
                              {isSelected && (
                                <Icon
                                  name="check"
                                  size="xs"
                                  className="text-primary"
                                />
                              )}
                              <Typography variant="body-sm">
                                {option.text}
                              </Typography>
                            </div>
                            <div className="flex items-center gap-2">
                              <Typography variant="caption" color="muted">
                                {option.votes} ({percentage}%)
                              </Typography>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          {totalVotes > 0 && (
                            <div className="absolute inset-0 rounded-lg overflow-hidden">
                              <div
                                className="h-full bg-primary/10 transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Vote Status */}
                  {userHasVoted && (
                    <div className="mt-3 flex items-center gap-2 text-success text-sm">
                      <Icon name="check-circle" size="xs" />
                      You voted{vote.isAnonymous ? "" : ` (${userName})`}
                    </div>
                  )}

                  {!canVote && vote.status === "active" && (
                    <div className="mt-3 flex items-center gap-2 text-text-muted text-sm">
                      <Icon name="info" size="xs" />
                      Only {vote.allowedVoters} can vote on this
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>

        {/* Create Vote Modal Placeholder */}
        {isCreatingVote && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-6 max-w-md w-full mx-4">
              <Typography variant="headline-sm" className="mb-4">
                Create Team Vote
              </Typography>
              <Typography variant="body-sm" color="muted" className="mb-4">
                This will create a sample vote for demonstration purposes.
              </Typography>
              <div className="flex gap-2">
                <Button variant="primary" onClick={handleCreateVote}>
                  Create Sample Vote
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setIsCreatingVote(false)}
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        )}
      </Card>
    </CollaborativeWidget>
  );
};
