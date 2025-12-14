/**
 * SearchStep Component
 *
 * Step for searching and finding teams to join
 */

import React from "react";
import { Typography } from "../../../components/design-system";
import Icon from "../../../components/ui/Icon/Icon";
import { Button } from "../../../components/ui/Button/Button";
import { Tag } from "../../../components/ui/Tag";
import type { SearchStepProps } from "../types";

export const SearchStep: React.FC<SearchStepProps> = ({
  searchQuery,
  searchResults,
  isLoading,
  onSearchQueryChange,
  onSearch,
  onJoinTeam,
  onSwitchToInviteCode,
}) => {
  return (
    <div>
      <div className="text-center mb-8">
        <Icon
          name="search"
          size="xl"
          color="primary"
          className="mx-auto mb-4"
        />
        <Typography variant="headline-lg" className="mb-4">
          Find Your Team
        </Typography>
        <Typography variant="body-md" color="muted">
          Search for your team by school name or team name
        </Typography>
      </div>

      <div className="container-content mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Search by school or team name..."
            className="flex-1 px-4 py-3 border border-secondary rounded-lg focus:ring-2 focus:ring-interaction-focus focus:border-interaction-focus"
            onKeyPress={(e) => e.key === "Enter" && onSearch()}
          />
          <Button
            onClick={onSearch}
            disabled={!searchQuery.trim() || isLoading}
            variant="primary"
            size="md"
          >
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="content-narrow">
          <Typography variant="headline-md" className="mb-4">
            Found {searchResults.length} team
            {searchResults.length !== 1 ? "s" : ""}
          </Typography>
          <div className="space-y-4">
            {searchResults.map((team) => (
              <div
                key={team.id}
                className="border border-muted dark:border-text-tertiary rounded-lg p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Typography variant="headline-sm">{team.name}</Typography>
                      {!team.isPublic && (
                        <Tag variant="warning" size="sm">
                          Private
                        </Tag>
                      )}
                    </div>
                    <Typography
                      variant="body-sm"
                      color="muted"
                      className="mb-2"
                    >
                      {team.school} • {team.sport} • {team.level}
                    </Typography>
                    <div className="flex items-center gap-4 text-sm text-secondary">
                      <span>{team.memberCount} members</span>
                      <span>Coach: {team.coachName}</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => onJoinTeam(team)}
                  >
                    {team.requiresApproval ? "Request to Join" : "Join Team"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {searchQuery && searchResults.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <Icon
            name="search"
            size="xl"
            color="secondary"
            className="mx-auto mb-4"
          />
          <Typography variant="headline-md" className="mb-2">
            No teams found
          </Typography>
          <Typography variant="body-md" color="muted" className="mb-4">
            We couldn't find any teams matching "{searchQuery}". Try a different
            search term or contact your coach for an invite code.
          </Typography>
          <Button
            type="button"
            variant="brandLink"
            onClick={onSwitchToInviteCode}
          >
            Use an invite code instead
          </Button>
        </div>
      )}
    </div>
  );
};

SearchStep.displayName = "SearchStep";
