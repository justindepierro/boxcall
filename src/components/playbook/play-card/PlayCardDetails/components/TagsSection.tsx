/**
 * TagsSection Component
 *
 * Displays and edits play tags & roles (positions, players, flags).
 */

import React, { useState, useMemo } from 'react';
import { Typography } from '../../../../design-system/Typography';
import { Button } from '../../../../ui/Button/Button';
import { FormSelect } from '../../../../ui';
import {
  addFlag,
  removeFlag,
  POSITION_OPTIONS,
} from '../../../../../utils/localPlayFlags';
import type { TagsSectionProps } from '../types';

export const TagsSection: React.FC<TagsSectionProps> = ({
  playId,
  flags,
  setFlags,
}) => {
  const [showTagsEditor, setShowTagsEditor] = useState(false);
  const [newFlag, setNewFlag] = useState('');
  const [newPlayer, setNewPlayer] = useState('');
  const [newPosition, setNewPosition] = useState('');

  const totalFlagsCount = useMemo(
    () => flags.positions.length + flags.players.length + flags.flags.length,
    [flags.flags.length, flags.players.length, flags.positions.length]
  );

  const summaryChips = useMemo(
    () => [
      ...flags.positions.map((x: string) => `Position:${x}`),
      ...flags.players.map((x: string) => `Player:${x}`),
      ...flags.flags.map((x: string) => `Flag:${x}`),
    ],
    [flags.flags, flags.players, flags.positions]
  );

  return (
    <div className="bg-subtle rounded-lg p-sm">
      <div className="flex items-center justify-between">
        <Typography
          variant="label-lg"
          as="h4"
          className="text-primary mb-xs"
        >
          Tags & Roles
        </Typography>
        <Button
          size="xs"
          variant="ghost"
          onClick={() => setShowTagsEditor((s) => !s)}
          aria-expanded={showTagsEditor}
        >
          {showTagsEditor ? 'Hide' : 'Edit'}
        </Button>
      </div>

      {/* Summary chips */}
      <div className="mt-xs flex flex-wrap gap-xs">
        {summaryChips.slice(0, 8).map((chip) => (
          <span
            key={chip}
            className="px-xs py-xs text-xs rounded-lg bg-secondary text-primary"
          >
            {chip}
          </span>
        ))}
        {totalFlagsCount > 8 && (
          <span className="text-xs text-secondary">
            +{totalFlagsCount - 8} more
          </span>
        )}
      </div>

      {/* Tags editor */}
      {showTagsEditor && (
        <div className="mt-sm grid grid-cols-1 md:grid-cols-3 gap-sm">
          {/* Positions */}
          <div>
            <div className="text-xs text-secondary mb-xs">Positions</div>
            <div className="flex flex-wrap gap-xs">
              {flags.positions.map((pos: string) => (
                <Button
                  key={pos}
                  size="xs"
                  variant="subtle"
                  className="!h-auto px-xs py-xs text-xs"
                  onClick={() =>
                    setFlags(removeFlag(playId, 'positions', pos))
                  }
                  title="Remove"
                >
                  {pos} ×
                </Button>
              ))}
            </div>
            <div className="mt-xs flex items-center gap-xs">
              <FormSelect
                value={newPosition}
                onChange={(value: string) => setNewPosition(value)}
                placeholder="Select…"
                options={POSITION_OPTIONS.map((opt: string) => ({
                  value: opt,
                  label: opt,
                }))}
                className="flex-1"
              />
              <Button
                size="xs"
                variant="secondary"
                onClick={() => {
                  if (!newPosition) return;
                  const next = addFlag(playId, 'positions', newPosition);
                  setFlags(next);
                  setNewPosition('');
                }}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Players */}
          <div>
            <div className="text-xs text-secondary mb-xs">Players</div>
            <div className="flex flex-wrap gap-xs">
              {flags.players.map((pl: string) => (
                <Button
                  key={pl}
                  size="xs"
                  variant="subtle"
                  className="!h-auto px-xs py-xs text-xs"
                  onClick={() => setFlags(removeFlag(playId, 'players', pl))}
                  title="Remove"
                >
                  {pl} ×
                </Button>
              ))}
            </div>
            <div className="mt-xs flex items-center gap-xs">
              <input
                value={newPlayer}
                onChange={(e) => setNewPlayer(e.target.value)}
                placeholder="Add player (e.g., Z, WR1)"
                className="border-muted rounded-lg px-2 py-1 text-xs flex-1"
              />
              <Button
                size="xs"
                variant="secondary"
                onClick={() => {
                  if (!newPlayer.trim()) return;
                  const next = addFlag(playId, 'players', newPlayer.trim());
                  setFlags(next);
                  setNewPlayer('');
                }}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Flags */}
          <div>
            <div className="text-xs text-secondary mb-xs">Flags</div>
            <div className="flex flex-wrap gap-xs">
              {flags.flags.map((fl: string) => (
                <Button
                  key={fl}
                  size="xs"
                  variant="subtle"
                  className="!h-auto px-xs py-xs text-xs"
                  onClick={() => setFlags(removeFlag(playId, 'flags', fl))}
                  title="Remove"
                >
                  {fl} ×
                </Button>
              ))}
            </div>
            <div className="mt-xs flex items-center gap-xs">
              <input
                value={newFlag}
                onChange={(e) => setNewFlag(e.target.value)}
                placeholder="Add flag (e.g., Red Zone, 3rd&Short)"
                className="border-muted rounded-lg px-2 py-1 text-xs flex-1"
              />
              <Button
                size="xs"
                variant="secondary"
                onClick={() => {
                  if (!newFlag.trim()) return;
                  const next = addFlag(playId, 'flags', newFlag.trim());
                  setFlags(next);
                  setNewFlag('');
                }}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
