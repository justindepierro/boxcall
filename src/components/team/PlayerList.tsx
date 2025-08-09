import React, { useState } from "react";
import type { TeamPlayer } from "../../types/team-management";
import { TEAM_LEVELS } from "../../types/team-management";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Icon } from "../ui/Icon/Icon";
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full bg-jade-500/10 text-jade-600 dark:text-jade-400">
            <Icon name="users" size="lg" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Players Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
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
            <Button variant="outline" className="sm:w-auto">
              <Icon name="upload" className="w-4 h-4 mr-2" /> Import CSV
            </Button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      {/* Search and Filters */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xs shadow-sm focus:ring-jade-500 focus:border-jade-500 dark:bg-gray-700 dark:text-white font-sans"
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xs shadow-sm focus:ring-jade-500 focus:border-jade-500 dark:bg-gray-700 dark:text-white font-sans"
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
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredPlayers.length} of {players.length} players
          </p>
          <div className="space-x-2">
            <Button onClick={onAddPlayer} variant="primary" size="sm">
              <Icon name="user-plus" className="w-4 h-4 mr-2" /> Add Player
            </Button>
            <Button variant="outline" size="sm">
              <Icon name="upload" className="w-4 h-4 mr-2" /> Import CSV
            </Button>
            <Button variant="outline" size="sm">
              <Icon name="download" className="w-4 h-4 mr-2" /> Export Roster
            </Button>
          </div>
        </div>
      </div>
      {/* Player Grid */}
      <div className="p-6">
        {filteredPlayers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              No players match your search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlayers.map((player) => (
              <div
                key={player.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* Player Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {/* Jersey Number */}
                    <div className="w-12 h-12 bg-jade-500 rounded-md flex items-center justify-center text-white font-display font-bold">
                      {player.jersey_number || "?"}
                    </div>
                    {/* Name and Level */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {player.first_name} {player.last_name}
                      </h3>
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full text-white bg-${getTeamLevelColor(player.team_level)}-600`}
                      >
                        {getTeamLevelLabel(player.team_level)}
                      </span>
                    </div>
                  </div>
                  {/* Actions Menu */}
                  <div className="flex space-x-1">
                    <button
                      onClick={() => onEditPlayer(player)}
                      className="p-1 text-gray-400 hover:text-jade-600 transition-colors"
                      title="Edit Player"
                    >
                      <Icon name="edit" size="sm" />
                    </button>
                    <button
                      onClick={() => onDeletePlayer(player.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Remove Player"
                    >
                      <Icon name="delete" size="sm" />
                    </button>
                  </div>
                </div>
                {/* Positions */}
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {player.positions.map((position) => (
                      <span
                        key={position}
                        className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded"
                      >
                        #{position}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Physical Stats */}
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                  {player.height && (
                    <div>
                      <span className="font-medium">Height:</span>{" "}
                      {player.height}
                    </div>
                  )}
                  {player.weight && (
                    <div>
                      <span className="font-medium">Weight:</span>{" "}
                      {player.weight} lbs
                    </div>
                  )}
                  {player.graduation_year && (
                    <div className="col-span-2">
                      <span className="font-medium">Class:</span>{" "}
                      {player.graduation_year}
                    </div>
                  )}
                </div>
                {/* Contact Info */}
                {(player.email || player.phone) && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    {player.email && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                        <Icon name="mail" size="xs" /> {player.email}
                      </div>
                    )}
                    {player.phone && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Icon name="phone" size="xs" />
                        {player.phone}
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
