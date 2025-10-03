import React, { useState, useEffect } from "react";
import { Icon } from "../ui/Icon";
import { Button } from "../ui/Button/Button";
import { Typography } from "../design-system/Typography";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { InlineEditableText } from "../ui/InlineEditableText";

interface PersonnelSettings {
  personnelGrouping: string;
  personnelNaming: string;
  defaultPersonnel: string;
  defaultFormation: string;
  enableAutoTagging: boolean;
  showComplexity: boolean;
  theme: "light" | "dark" | "auto";
  gridDensity: "comfortable" | "compact";
  // Multiple personnel configurations
  personnelConfigurations: PersonnelConfiguration[];
  // Position names for all 11 players (legacy - will be replaced by personnelConfigurations)
  positionNames: {
    QB: string;
    RB1: string;
    RB2: string;
    WR1: string;
    WR2: string;
    WR3: string;
    TE1: string;
    TE2: string;
    OL1: string;
    OL2: string;
    OL3: string;
    OL4: string;
    OL5: string;
  };
  // Bulk operations settings
  bulkOperations: {
    enableBulkFormationAdd: boolean;
    enableBulkPlayAdd: boolean;
    defaultBulkFormationCount: number;
    defaultBulkPlayCount: number;
  };
}

interface PersonnelConfiguration {
  id: string;
  name: string;
  isDefault: boolean;
  players: PlayerConfiguration[];
}

interface PlayerConfiguration {
  id: string;
  category: PlayerCategory;
  customName: string;
  count: number; // For categories that can have multiple (like WR, RB, TE)
}

type PlayerCategory =
  | "QB" // Quarterback (always 1)
  | "OL" // Offensive Line (always 5)
  | "TE" // Tight End
  | "HB" // Halfback
  | "TB" // Tailback
  | "RB" // Running Back
  | "WR" // Wide Receiver
  | "SE" // Split End
  | "SLOT" // Slot Receiver
  | "WIDEOUT"; // Wide Out Receiver;

interface PlaybookSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PersonnelSettings;
  onSave: (settings: PersonnelSettings) => void;
}

export const PlaybookSettingsModal: React.FC<PlaybookSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [localSettings, setLocalSettings] =
    useState<PersonnelSettings>(settings);
  const [activeTab, setActiveTab] = useState<"personnel" | "bulk" | "display">(
    "personnel"
  );

  const [hasInitializedDefaults, setHasInitializedDefaults] = useState(false);

  // Initialize with default personnel configuration if none exists
  useEffect(() => {
    if (
      !hasInitializedDefaults &&
      (!localSettings.personnelConfigurations ||
        localSettings.personnelConfigurations.length === 0)
    ) {
      const defaultConfig: PersonnelConfiguration = {
        id: "default",
        name: "11 Personnel",
        isDefault: true,
        players: [
          { id: "qb", category: "QB", customName: "QB", count: 1 },
          { id: "ol1", category: "OL", customName: "LT", count: 1 },
          { id: "ol2", category: "OL", customName: "LG", count: 1 },
          { id: "ol3", category: "OL", customName: "C", count: 1 },
          { id: "ol4", category: "OL", customName: "RG", count: 1 },
          { id: "ol5", category: "OL", customName: "RT", count: 1 },
          { id: "rb1", category: "RB", customName: "RB1", count: 1 },
          { id: "te1", category: "TE", customName: "TE", count: 1 },
          { id: "wr1", category: "WR", customName: "WR1", count: 1 },
          { id: "wr2", category: "WR", customName: "WR2", count: 1 },
          { id: "wr3", category: "WR", customName: "WR3", count: 1 },
        ],
      };

      setLocalSettings((prev) => ({
        ...prev,
        personnelConfigurations: [defaultConfig],
      }));
      setHasInitializedDefaults(true);
    }
  }, [hasInitializedDefaults, localSettings.personnelConfigurations]);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSave(localSettings);
  };

  const updateSetting = <K extends keyof PersonnelSettings>(
    key: K,
    value: PersonnelSettings[K]
  ) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateBulkSetting = <
    K extends keyof PersonnelSettings["bulkOperations"],
  >(
    key: K,
    value: PersonnelSettings["bulkOperations"][K]
  ) => {
    setLocalSettings((prev) => ({
      ...prev,
      bulkOperations: {
        ...prev.bulkOperations,
        [key]: value,
      },
    }));
  };

  // Personnel configuration helpers
  const addPersonnelConfiguration = () => {
    const defaultConfig = localSettings.personnelConfigurations?.find(
      (c) => c.isDefault
    );
    if (!defaultConfig) return;

    const newConfig: PersonnelConfiguration = {
      id: `personnel-${Date.now()}`,
      name: `Personnel ${localSettings.personnelConfigurations.length + 1}`,
      isDefault: false,
      players: defaultConfig.players.map((player) => ({
        ...player,
        id: `${player.id}-${Date.now()}`,
      })),
    };

    setLocalSettings((prev) => ({
      ...prev,
      personnelConfigurations: [
        ...(prev.personnelConfigurations || []),
        newConfig,
      ],
    }));
  };

  const updatePersonnelConfiguration = (
    configId: string,
    updates: Partial<PersonnelConfiguration>
  ) => {
    setLocalSettings((prev) => ({
      ...prev,
      personnelConfigurations:
        prev.personnelConfigurations?.map((config) =>
          config.id === configId ? { ...config, ...updates } : config
        ) || [],
    }));
  };

  const updatePlayerConfiguration = (
    configId: string,
    playerId: string,
    updates: Partial<PlayerConfiguration>
  ) => {
    setLocalSettings((prev) => ({
      ...prev,
      personnelConfigurations:
        prev.personnelConfigurations?.map((config) =>
          config.id === configId
            ? {
                ...config,
                players: config.players.map((player) =>
                  player.id === playerId ? { ...player, ...updates } : player
                ),
              }
            : config
        ) || [],
    }));
  };

  const removePersonnelConfiguration = (configId: string) => {
    setLocalSettings((prev) => ({
      ...prev,
      personnelConfigurations:
        prev.personnelConfigurations?.filter(
          (config) => config.id !== configId
        ) || [],
    }));
  };

  const setDefaultPersonnel = (configId: string) => {
    setLocalSettings((prev) => ({
      ...prev,
      personnelConfigurations:
        prev.personnelConfigurations?.map((config) => ({
          ...config,
          isDefault: config.id === configId,
        })) || [],
    }));
  };

  // Helper functions for player categories
  const getPlayerCategoryLabel = (category: PlayerCategory): string => {
    const labels: Record<PlayerCategory, string> = {
      QB: "Quarterback",
      OL: "Offensive Line",
      TE: "Tight End",
      HB: "Halfback",
      TB: "Tailback",
      RB: "Running Back",
      WR: "Wide Receiver",
      SE: "Split End",
      SLOT: "Slot Receiver",
      WIDEOUT: "Wide Out",
    };
    return labels[category] || category;
  };

  const getPlayerCategoryOptions = () => [
    { value: "QB", label: "Quarterback" },
    { value: "OL", label: "Offensive Line" },
    { value: "TE", label: "Tight End" },
    { value: "HB", label: "Halfback" },
    { value: "TB", label: "Tailback" },
    { value: "RB", label: "Running Back" },
    { value: "WR", label: "Wide Receiver" },
    { value: "SE", label: "Split End" },
    { value: "SLOT", label: "Slot Receiver" },
    { value: "WIDEOUT", label: "Wide Out" },
  ];

  const getDefaultNameForCategory = (category: PlayerCategory): string => {
    const defaults: Record<PlayerCategory, string> = {
      QB: "QB",
      OL: "OL",
      TE: "TE",
      HB: "HB",
      TB: "TB",
      RB: "RB",
      WR: "WR",
      SE: "SE",
      SLOT: "SLOT",
      WIDEOUT: "WO",
    };
    return defaults[category] || category;
  };

  const canHaveMultiple = (category: PlayerCategory): boolean => {
    // QB and OL have fixed counts, others can have multiple
    return !["QB", "OL"].includes(category);
  };

  const tabs = [
    { id: "personnel" as const, label: "Personnel", icon: "users" },
    { id: "bulk" as const, label: "Bulk Operations", icon: "plus-circle" },
    { id: "display" as const, label: "Display", icon: "settings" },
  ];

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Playbook Settings"
      size="xl"
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="border-b border-border">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium ${
                  activeTab === tab.id
                    ? "border-text-info text-text-info"
                    : "border-surface-primary/0 text-text-secondary hover:text-text-primary hover:border-border-light"
                }`}
              >
                <Icon name={tab.icon as any} size="sm" className="mr-2" />
                <Typography variant="body-sm" className="inline">
                  {tab.label}
                </Typography>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === "personnel" && (
            <div className="space-y-6">
              <Typography variant="headline-md" className="mb-4">
                Personnel Management
              </Typography>
              <Typography variant="body-sm" color="muted" className="mb-6">
                Configure your team's personnel groupings and position naming
                conventions.
              </Typography>

              {/* Personnel Configurations */}
              <div className="space-y-6">
                {localSettings.personnelConfigurations?.map((config) => (
                  <div key={config.id} className="rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <InlineEditableText
                          value={config.name}
                          onChange={(value) =>
                            updatePersonnelConfiguration(config.id, {
                              name: value,
                            })
                          }
                          placeholder="Personnel Name"
                          size="lg"
                          className="font-semibold"
                        />
                        {config.isDefault && (
                          <Typography
                            variant="caption"
                            className="px-2 py-1 bg-surface-info text-text-info rounded-full"
                          >
                            Default
                          </Typography>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!config.isDefault && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDefaultPersonnel(config.id)}
                            >
                              Set as Default
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                removePersonnelConfiguration(config.id)
                              }
                              className="text-text-error hover:text-text-error"
                            >
                              <Icon name="delete" size="sm" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Players Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {config.players.map((player) => (
                        <div key={player.id} className="space-y-2">
                          <Typography variant="label-md" className="block">
                            {getPlayerCategoryLabel(player.category)}
                          </Typography>

                          {/* Category Dropdown */}
                          <Select
                            value={player.category}
                            onChange={(value) =>
                              updatePlayerConfiguration(config.id, player.id, {
                                category: value as PlayerCategory,
                              })
                            }
                            options={getPlayerCategoryOptions()}
                            size="sm"
                          />

                          {/* Custom Name Input */}
                          <InlineEditableText
                            value={player.customName}
                            onChange={(value) =>
                              updatePlayerConfiguration(config.id, player.id, {
                                customName: value,
                              })
                            }
                            placeholder={getDefaultNameForCategory(
                              player.category
                            )}
                            maxRecommendedLength={2}
                            showLengthWarnings={true}
                            allowSymbols={true}
                            size="sm"
                            showValidation={true}
                          />

                          {/* Count for multi-position categories */}
                          {canHaveMultiple(player.category) && (
                            <div className="flex items-center gap-2">
                              <Typography variant="caption" color="muted">
                                Count:
                              </Typography>
                              <Typography variant="caption" className="flex-1">
                                <input
                                  type="number"
                                  min="1"
                                  max="5"
                                  value={player.count}
                                  onChange={(e) =>
                                    updatePlayerConfiguration(
                                      config.id,
                                      player.id,
                                      { count: parseInt(e.target.value) || 1 }
                                    )
                                  }
                                  className="w-16 px-2 py-1 rounded"
                                />
                              </Typography>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Add New Personnel Button */}
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={addPersonnelConfiguration}
                    className="flex items-center gap-2"
                  >
                    <Icon name="plus" size="sm" />
                    Add Personnel Configuration
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "bulk" && (
            <div className="space-y-6">
              <Typography variant="headline-md" className="mb-4">
                Bulk Operations
              </Typography>
              <Typography variant="body-sm" color="muted" className="mb-4">
                Configure bulk operations for efficiently adding multiple
                formations and plays at once.
              </Typography>

              {/* Bulk Formation Operations */}
              <div>
                <Typography
                  variant="headline-sm"
                  className="mb-3 text-text-secondary"
                >
                  Bulk Formation Operations
                </Typography>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableBulkFormationAdd"
                      checked={
                        localSettings.bulkOperations.enableBulkFormationAdd
                      }
                      onChange={(e) =>
                        updateBulkSetting(
                          "enableBulkFormationAdd",
                          e.target.checked
                        )
                      }
                      className="mr-2"
                    />
                    <Typography variant="body-sm" className="inline">
                      Enable Bulk Formation Add
                    </Typography>
                  </div>

                  <div>
                    <Typography variant="label-md" className="block mb-2">
                      Default Formation Count
                    </Typography>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={
                        localSettings.bulkOperations.defaultBulkFormationCount
                      }
                      onChange={(e) =>
                        updateBulkSetting(
                          "defaultBulkFormationCount",
                          parseInt(e.target.value) || 1
                        )
                      }
                      disabled={
                        !localSettings.bulkOperations.enableBulkFormationAdd
                      }
                    />
                    <Typography
                      variant="caption"
                      color="muted"
                      className="mt-1"
                    >
                      Number of formations to add when using bulk operations
                    </Typography>
                  </div>
                </div>
              </div>

              {/* Bulk Play Operations */}
              <div>
                <Typography
                  variant="headline-sm"
                  className="mb-3 text-text-secondary"
                >
                  Bulk Play Operations
                </Typography>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableBulkPlayAdd"
                      checked={localSettings.bulkOperations.enableBulkPlayAdd}
                      onChange={(e) =>
                        updateBulkSetting("enableBulkPlayAdd", e.target.checked)
                      }
                      className="mr-2"
                    />
                    <Typography variant="body-sm" className="inline">
                      Enable Bulk Play Add
                    </Typography>
                  </div>

                  <div>
                    <Typography variant="label-md" className="block mb-2">
                      Default Play Count
                    </Typography>
                    <Input
                      type="number"
                      min="1"
                      max="50"
                      value={localSettings.bulkOperations.defaultBulkPlayCount}
                      onChange={(e) =>
                        updateBulkSetting(
                          "defaultBulkPlayCount",
                          parseInt(e.target.value) || 1
                        )
                      }
                      disabled={!localSettings.bulkOperations.enableBulkPlayAdd}
                    />
                    <Typography
                      variant="caption"
                      color="muted"
                      className="mt-1"
                    >
                      Number of plays to add when using bulk operations
                    </Typography>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-4 border-t">
                <Typography
                  variant="headline-sm"
                  className="mb-3 text-text-secondary"
                >
                  Quick Actions
                </Typography>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      // TODO: Implement bulk formation add
                      console.log("Bulk formation add clicked");
                    }}
                    disabled={
                      !localSettings.bulkOperations.enableBulkFormationAdd
                    }
                  >
                    <Icon name="plus-circle" size="sm" className="mr-2" />
                    Add {
                      localSettings.bulkOperations.defaultBulkFormationCount
                    }{" "}
                    Formations
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      // TODO: Implement bulk play add
                      console.log("Bulk play add clicked");
                    }}
                    disabled={!localSettings.bulkOperations.enableBulkPlayAdd}
                  >
                    <Icon name="plus-circle" size="sm" className="mr-2" />
                    Add {localSettings.bulkOperations.defaultBulkPlayCount}{" "}
                    Plays
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "display" && (
            <div className="space-y-6">
              <Typography variant="headline-md" className="mb-4">
                Display Options
              </Typography>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoTagging"
                    checked={localSettings.enableAutoTagging}
                    onChange={(e) =>
                      updateSetting("enableAutoTagging", e.target.checked)
                    }
                    className="mr-2"
                  />
                  <Typography variant="body-sm" className="inline">
                    Enable Auto Tagging
                  </Typography>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showComplexity"
                    checked={localSettings.showComplexity}
                    onChange={(e) =>
                      updateSetting("showComplexity", e.target.checked)
                    }
                    className="mr-2"
                  />
                  <Typography variant="body-sm" className="inline">
                    Show Complexity Indicators
                  </Typography>
                </div>
              </div>

              {/* Interface Settings */}
              <div>
                <Typography variant="headline-md" className="mb-4">
                  Interface Settings
                </Typography>
                <div className="space-y-4">
                  <div>
                    <Typography variant="label-md" className="block mb-2">
                      Theme
                    </Typography>
                    <Select
                      options={[
                        { value: "light", label: "Light" },
                        { value: "dark", label: "Dark" },
                        { value: "auto", label: "Auto" },
                      ]}
                      value={localSettings.theme}
                      onChange={(value) =>
                        updateSetting(
                          "theme",
                          value as "light" | "dark" | "auto"
                        )
                      }
                    />
                  </div>

                  <div>
                    <Typography variant="label-md" className="block mb-2">
                      Grid Density
                    </Typography>
                    <Select
                      options={[
                        { value: "comfortable", label: "Comfortable" },
                        { value: "compact", label: "Compact" },
                      ]}
                      value={localSettings.gridDensity}
                      onChange={(value) =>
                        updateSetting(
                          "gridDensity",
                          value as "comfortable" | "compact"
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </div>
    </Modal>
  );
};
