/**
 * PersonnelConfigurationModal Types
 */

import type {
  BadgeCustomization,
  PersonnelConfiguration,
  PlayerPosition,
} from "../../../types/personnel";

/**
 * Props for the main modal component
 */
export interface PersonnelConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  playbookId?: string;
  configurations?: PersonnelConfiguration[];
  onSave?: (configurations: PersonnelConfiguration[]) => void;
}

/**
 * Props for the configuration header
 */
export interface ConfigurationHeaderProps {
  onAddConfiguration: () => void;
}

/**
 * Props for configuration list
 */
export interface ConfigurationListProps {
  configurations: PersonnelConfiguration[];
  expandedConfigIds: Set<string>;
  customizerOpenIds: Set<string>;
  justSaved: boolean;
  onToggleExpanded: (configId: string) => void;
  onToggleDefault: (configId: string) => void;
  onRemoveConfiguration: (configId: string) => void;
  onUpdateName: (configId: string, name: string) => void;
  onToggleCustomizer: (configId: string) => void;
  onUpdateBadgeCustomization: (
    configId: string,
    customization: BadgeCustomization
  ) => void;
  onAddPlayer: (configId: string) => void;
  onRemovePlayer: (configId: string, playerId: string) => void;
  onUpdatePlayerLabel: (
    configId: string,
    playerId: string,
    label: string
  ) => void;
  onUpdatePlayerPosition: (
    configId: string,
    playerId: string,
    position: PlayerPosition
  ) => void;
  onToggleWildcatQB: (configId: string, playerId: string) => void;
  getPersonnelSummary: (config: PersonnelConfiguration) => string;
}

/**
 * Props for individual configuration item
 */
export interface ConfigurationItemProps {
  config: PersonnelConfiguration;
  isExpanded: boolean;
  isCustomizerOpen: boolean;
  justSaved: boolean;
  summary: string;
  onToggleExpanded: () => void;
  onToggleDefault: () => void;
  onRemove: () => void;
  onUpdateName: (name: string) => void;
  onToggleCustomizer: () => void;
  onUpdateBadgeCustomization: (customization: BadgeCustomization) => void;
  onAddPlayer: () => void;
  onRemovePlayer: (playerId: string) => void;
  onUpdatePlayerLabel: (playerId: string, label: string) => void;
  onUpdatePlayerPosition: (playerId: string, position: PlayerPosition) => void;
  onToggleWildcatQB: (playerId: string) => void;
}

/**
 * Props for empty state
 */
export interface EmptyStateProps {
  onAddConfiguration: () => void;
}

/**
 * Props for action buttons
 */
export interface ActionButtonsProps {
  justSaved: boolean;
  onCancel: () => void;
  onSave: () => void;
}

/**
 * Props for loading state
 */
export interface LoadingStateProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

/**
 * Helper to normalize player label
 */
export function normalizeLabel(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 3);
}

/**
 * Get personnel summary string
 */
export function getPersonnelSummary(config: PersonnelConfiguration): string {
  const counts = config.players.reduce(
    (acc, player) => {
      if (player.player_position === "RB") acc.rb++;
      else if (player.player_position === "TE") acc.te++;
      else if (player.player_position === "WR") acc.wr++;
      return acc;
    },
    { rb: 0, te: 0, wr: 0 }
  );

  const parts = [];
  if (counts.rb > 0) parts.push(`${counts.rb} RB`);
  if (counts.te > 0) parts.push(`${counts.te} TE`);
  if (counts.wr > 0) parts.push(`${counts.wr} WR`);

  return parts.join(", ");
}

/**
 * Create a new personnel configuration with default players
 */
export function createDefaultConfiguration(
  playbookId: string
): PersonnelConfiguration {
  const timestamp = Date.now().toString();
  return {
    id: timestamp,
    playbook_id: playbookId,
    name: "New Personnel",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    players: [
      {
        id: "p1",
        config_id: timestamp,
        label: "Q",
        player_position: "QB",
        sort_order: 0,
        is_wildcat_qb: false,
        created_at: new Date().toISOString(),
      },
      {
        id: "p2",
        config_id: timestamp,
        label: "R",
        player_position: "RB",
        sort_order: 1,
        is_wildcat_qb: false,
        created_at: new Date().toISOString(),
      },
      {
        id: "p3",
        config_id: timestamp,
        label: "T",
        player_position: "TE",
        sort_order: 2,
        is_wildcat_qb: false,
        created_at: new Date().toISOString(),
      },
      {
        id: "p4",
        config_id: timestamp,
        label: "X",
        player_position: "WR",
        sort_order: 3,
        is_wildcat_qb: false,
        created_at: new Date().toISOString(),
      },
      {
        id: "p5",
        config_id: timestamp,
        label: "Y",
        player_position: "WR",
        sort_order: 4,
        is_wildcat_qb: false,
        created_at: new Date().toISOString(),
      },
      {
        id: "p6",
        config_id: timestamp,
        label: "Z",
        player_position: "WR",
        sort_order: 5,
        is_wildcat_qb: false,
        created_at: new Date().toISOString(),
      },
    ],
  };
}
