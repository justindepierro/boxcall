import React, { useState } from "react";

import { TEAM_LEVELS } from "../../types/team-management";
import { Typography } from "../design-system/Typography";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon/Icon";
import { Input } from "../ui/Input";
import { UserAvatar } from "../ui/UserAvatar";
import { Tooltip } from "../ui/Tooltip/Tooltip";

import type { TeamPlayer } from "../../types/team-management";

interface PlayerListProps {
  players: TeamPlayer[];
  onEditPlayer: (player: TeamPlayer) => void;
  onDeletePlayer: (playerId: string) => void;
  onAddPlayer: () => void;
}
/**
 * PlayerList Component
 *
 * Displays team roster with search, filter, and management capabilities.
 */
export const PlayerList: React.FC<PlayerListProps> = ({
  players,
  onEditPlayer,
  onDeletePlayer,
  onAddPlayer,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [filterPosition, setFilterPosition] = useState<string>("all");
  // Get unique positions from all players
  const allPositions = [...new Set(players.flatMap((p) => p.positions))].sort();
  // Filter players based on search and filters
  const filteredPlayers = players.filter((player) => {
    const matchesSearch =
      player.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.positions.some((pos) =>
        pos.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      (player.jersey_number &&
        player.jersey_number.toString().includes(searchTerm));
    const matchesLevel =
      filterLevel === "all" || player.team_level === filterLevel;
    const matchesPosition =
      filterPosition === "all" || player.positions.includes(filterPosition);
    return matchesSearch && matchesLevel && matchesPosition;
  });
  const getTeamLevelColor = (level: string) => {
    const teamLevel = TEAM_LEVELS.find((tl) => tl.value === level);
    return teamLevel?.color || "gray";
  };
  const getTeamLevelLabel = (level: string) => {
    const teamLevel = TEAM_LEVELS.find((tl) => tl.value === level);
    return teamLevel?.label || level;
  };
  if (players.length === 0) {
    return (
      <div className="surface-card rounded-lg shadow-sm p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full surface-subtle0/10 text-jade-600 dark:text-jade-400">
            <Icon name="users" size="lg" />
          </div>
          <Typography
            variant="headline-sm"
            as="h3"
            className="text-text-primary mb-2"
          >
            No Players Yet
          </Typography>
          <p className="text-text-secondary mb-6">
            Start building your roster by adding players manually or importing
            from CSV.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={onAddPlayer}
              variant="primary"
              className="sm:w-auto"
            >
              <Icon name="user-plus" className="w-4 h-4 mr-2" /> Add First
              Player
            </Button>
            <Button variant="secondary" className="sm:w-auto">
              <Icon name="upload" className="w-4 h-4 mr-2" /> Import CSV
            </Button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="surface-card rounded-lg shadow-sm">
      {/* Search and Filters */}
      <div className="bc-card-padding">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <Input
              type="text"
              placeholder="Search players, positions, or jersey numbers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          {/* Team Level Filter */}
          <div>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="w-full px-3 py-2 border border-border-medium dark:border-border-medium rounded-lg shadow-sm focus:ring-jade-500 focus:border-jade-500 surface-subtle text-text-primary font-sans"
            >
              <option value="all">All Levels</option>
              {TEAM_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
          {/* Position Filter */}
          <div>
            <select
              value={filterPosition}
              onChange={(e) => setFilterPosition(e.target.value)}
              className="w-full px-3 py-2 border border-border-medium dark:border-border-medium rounded-lg shadow-sm focus:ring-jade-500 focus:border-jade-500 surface-subtle text-text-primary font-sans"
            >
              <option value="all">All Positions</option>
              {allPositions.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* Results Summary */}
        <div className="mt-4 flex items-center justify-between">
          <Typography variant="body-sm" color="muted">
            Showing {filteredPlayers.length} of {players.length} players
          </Typography>
          <div className="space-x-2">
            <Button onClick={onAddPlayer} variant="primary" size="sm">
              <Icon name="user-plus" className="w-4 h-4 mr-2" /> Add Player
            </Button>
            <Button variant="secondary" size="sm">
              <Icon name="upload" className="w-4 h-4 mr-2" /> Import CSV
            </Button>
            <Button variant="secondary" size="sm">
              <Icon name="download" className="w-4 h-4 mr-2" /> Export Roster
            </Button>
          </div>
        </div>
      </div>
      {/* Player Grid */}
      <div className="bc-card-padding">
        {filteredPlayers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-text-muted">
              No players match your search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 bc-grid-gap">
            {filteredPlayers.map((player) => (
              <div
                key={player.id}
                className="border border-subtle dark:border-border-medium rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* Player Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {/* Jersey Number */}
                    <div className="w-12 h-12 surface-subtle0 rounded-md flex items-center justify-center text-text-inverse font-display font-bold">
                      {player.jersey_number || "?"}
                    </div>
                    {/* Name and Level with UserAvatar */}
                    <div>
                      {player.user_id ? (
                        <UserAvatar
                          userId={player.user_id}
                          name={`${player.first_name} ${player.last_name}`}
                          role="player"
                          size="sm"
                          showName={true}
                          showPopover={true}
                          showOnHover={true}
                          placement="bottom"
                        />
                      ) : (
                        <Typography variant="headline-sm" as="h3">
                          {player.first_name} {player.last_name}
                        </Typography>
                      )}
                      <span
                        className={`inline-block px-2 py-1 font-medium rounded-full text-text-inverse bg-${getTeamLevelColor(player.team_level)}-600 mt-1`}
                      >
                        <Typography variant="caption" as="span">
                          {getTeamLevelLabel(player.team_level)}
                        </Typography>
                      </span>
                    </div>
                  </div>
                  {/* Actions Menu */}
                  <div className="flex space-x-1">
                    <Tooltip content="Edit player">
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => onEditPlayer(player)}
                        aria-label="Edit Player"
                        className="p-1 h-auto w-auto text-text-secondary hover:text-brand-jade"
                      >
                        <Icon name="edit" size="sm" />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Remove player">
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => onDeletePlayer(player.id)}
                        aria-label="Remove Player"
                        className="p-1 h-auto w-auto text-text-secondary hover:text-text-error"
                      >
                        <Icon name="delete" size="sm" />
                      </Button>
                    </Tooltip>
                  </div>
                </div>
                {/* Positions */}
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {player.positions.map((position) => (
                      <span
                        key={position}
                        className="inline-block px-2 py-1 font-medium surface-subtle text-text-secondary rounded-lg"
                      >
                        <Typography variant="caption" as="span">
                          #{position}
                        </Typography>
                      </span>
                    ))}
                  </div>
                </div>
                {/* Physical Stats */}
                <div className="grid grid-cols-2 gap-2">
                  {player.height && (
                    <Typography variant="body-sm" color="muted">
                      <span className="font-medium">Height:</span>{" "}
                      {player.height}
                    </Typography>
                  )}
                  {player.weight && (
                    <Typography variant="body-sm" color="muted">
                      <span className="font-medium">Weight:</span>{" "}
                      {player.weight} lbs
                    </Typography>
                  )}
                  {player.graduation_year && (
                    <Typography
                      variant="body-sm"
                      color="muted"
                      className="col-span-2"
                    >
                      <span className="font-medium">Class:</span>{" "}
                      {player.graduation_year}
                    </Typography>
                  )}
                </div>
                {/* Contact Info */}
                {(player.email || player.phone) && (
                  <div className="mt-3 pt-3">
                    {player.email && (
                      <div className="truncate flex items-center gap-1">
                        <Icon name="mail" size="xs" />
                        <Typography variant="caption" color="muted" as="span">
                          {player.email}
                        </Typography>
                      </div>
                    )}
                    {player.phone && (
                      <div className="flex items-center gap-1">
                        <Icon name="phone" size="xs" />
                        <Typography variant="caption" color="muted" as="span">
                          {player.phone}
                        </Typography>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
