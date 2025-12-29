/**
 * TagsSection - Play tags and categorization
 *
 * Contains:
 * - Formation Tags (comma-separated)
 * - Play Tags (comma-separated)
 * - Variation Tags (array)
 * - Key Positions
 * - Key Players
 */

import React from "react";
import { Typography } from "../../../design-system/Typography";
import { Icon } from "../../../ui/Icon/Icon";
import {
  TagInput,
  KeyPositionSelector,
  KeyPlayerSelector,
} from "../components";
import { useRosterData } from "../../../../hooks/useRosterData";
import { usePersonnelConfigurations } from "../../../../hooks/usePersonnel";

interface TagsSectionProps {
  // Legacy comma-separated tags
  formationTags: string;
  playTags: string;
  onFormationTagsChange: (value: string) => void;
  onPlayTagsChange: (value: string) => void;

  // Array-based tags
  tags: string[];
  onTagsChange: (tags: string[]) => void;

  // Key positions/players
  keyPositions: string[];
  keyPlayers: string[];
  onKeyPositionsChange: (positions: string[]) => void;
  onKeyPlayersChange: (players: string[]) => void;

  // Context
  personnel?: string;
  playbookId?: string;
}

// Tag management hook
function useTagInput(tags: string[], onTagsChange: (tags: string[]) => void) {
  const [newTag, setNewTag] = React.useState("");

  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onTagsChange([...tags, trimmed]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    onTagsChange(tags.filter((t) => t !== tag));
  };

  return { newTag, setNewTag, handleAddTag, handleRemoveTag };
}

export const TagsSection: React.FC<TagsSectionProps> = ({
  formationTags,
  playTags,
  onFormationTagsChange,
  onPlayTagsChange,
  tags,
  onTagsChange,
  keyPositions,
  keyPlayers,
  onKeyPositionsChange,
  onKeyPlayersChange,
  personnel,
  playbookId,
}) => {
  // Hooks for tag management
  const tagInput = useTagInput(tags, onTagsChange);

  // Personnel configuration for position selector
  const { data: configurations } = usePersonnelConfigurations(playbookId);
  const personnelConfig = React.useMemo(() => {
    if (!configurations || !personnel) return null;
    return configurations.find((config) => config.name === personnel) || null;
  }, [configurations, personnel]);

  const availablePositions = React.useMemo(() => {
    if (!personnelConfig?.players) return [];
    return personnelConfig.players.map((p) => p.label);
  }, [personnelConfig]);

  // Roster data for player selector
  const { players: rosterPlayers } = useRosterData();

  return (
    <div className="space-y-md">
      {/* Section Header */}
      <div className="flex items-center gap-sm">
        <div className="p-xs bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-lg shadow-sm">
          <Icon name="tag" className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <Typography variant="label-lg" className="text-primary font-semibold">
            Tags & Organization
          </Typography>
          <Typography variant="caption" className="text-tertiary">
            Categorize for quick filtering
          </Typography>
        </div>
      </div>

      {/* Quick Tags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
        <div className="space-y-xs">
          <Typography variant="label-md" className="text-secondary">
            Formation Tags
          </Typography>
          <input
            type="text"
            value={formationTags}
            onChange={(e) => onFormationTagsChange(e.target.value)}
            placeholder="e.g., Twins, Trips, Bunch"
            className="w-full px-sm py-xs text-sm border border-neutral-200 rounded-xl bg-surface-muted/50 focus:ring-2 focus:ring-jade-500/30 focus:border-jade-400 focus:bg-white transition-all"
          />
        </div>

        <div className="space-y-xs">
          <Typography variant="label-md" className="text-secondary">
            Play Tags
          </Typography>
          <input
            type="text"
            value={playTags}
            onChange={(e) => onPlayTagsChange(e.target.value)}
            placeholder="e.g., Red Zone, 3rd&Short"
            className="w-full px-sm py-xs text-sm border border-neutral-200 rounded-xl bg-surface-muted/50 focus:ring-2 focus:ring-jade-500/30 focus:border-jade-400 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Variation Tags */}
      <TagInput
        label="Play Variations"
        tags={tags}
        newTagValue={tagInput.newTag}
        onNewTagChange={tagInput.setNewTag}
        onAddTag={tagInput.handleAddTag}
        onRemoveTag={tagInput.handleRemoveTag}
        placeholder="Add variation (e.g., IZ Bubble, IZ Read)"
        maxTags={10}
      />

      {/* Key Positions */}
      {availablePositions.length > 0 && (
        <KeyPositionSelector
          positions={keyPositions}
          personnelId={personnel}
          availablePositions={availablePositions}
          onAdd={(position: string) =>
            onKeyPositionsChange([...keyPositions, position])
          }
          onRemove={(index: number) =>
            onKeyPositionsChange(keyPositions.filter((_, i) => i !== index))
          }
        />
      )}

      {/* Key Players */}
      {rosterPlayers.length > 0 && (
        <KeyPlayerSelector
          selectedPlayerIds={keyPlayers}
          teamPlayers={rosterPlayers.map((p) => ({
            id: p.id,
            first_name: p.first_name || "",
            last_name: p.last_name || "",
            jersey_number: p.jersey_number || 0,
            position: p.position || "",
            is_active: p.is_active ?? true,
          }))}
          onAdd={(playerId: string) =>
            onKeyPlayersChange([...keyPlayers, playerId])
          }
          onRemove={(playerId: string) =>
            onKeyPlayersChange(keyPlayers.filter((p) => p !== playerId))
          }
        />
      )}
    </div>
  );
};
