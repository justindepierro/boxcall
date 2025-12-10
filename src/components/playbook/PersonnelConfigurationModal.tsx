import React, { useState, useEffect, useMemo } from "react";
import { Icon } from "../ui/Icon";
import { Button } from "../ui/Button/Button";
import { Typography } from "../design-system/Typography";
import { BottomSheet } from "../BottomSheet";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { FormSelect } from "../ui/FormSelect/FormSelect";
import { triggerHapticFeedback } from "../../lib/hapticFeedback";
import { useToast } from "../../hooks/useToast";
import { usePersonnelConfigurations } from "../../hooks/usePersonnel";
import { BadgeCustomizer } from "./BadgeCustomizer";
import { PersonnelBadge } from "./PersonnelBadge";
import type {
  BadgeCustomization,
  PersonnelConfiguration,
  PlayerPosition,
} from "../../types/personnel";
import { useIsMobile } from "../../hooks/useBreakpoint";

interface PersonnelConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  playbookId?: string;
  configurations?: PersonnelConfiguration[];
  onSave?: (configurations: PersonnelConfiguration[]) => void;
}

export const PersonnelConfigurationModal: React.FC<
  PersonnelConfigurationModalProps
> = ({
  isOpen,
  onClose,
  playbookId,
  configurations: configsProp,
  onSave = () => {},
}) => {
  // Fetch data from Supabase if playbookId provided
  const { data: fetchedConfigs, isLoading } =
    usePersonnelConfigurations(playbookId);

  // Use provided configurations or fetched ones (memoized to prevent effect re-runs)
  const configurations = useMemo(
    () => configsProp || fetchedConfigs || [],
    [configsProp, fetchedConfigs]
  );
  const [localConfigurations, setLocalConfigurations] =
    useState<PersonnelConfiguration[]>(configurations);
  const [expandedConfigIds, setExpandedConfigIds] = useState<Set<string>>(
    new Set()
  );
  const [customizerOpenIds, setCustomizerOpenIds] = useState<Set<string>>(
    new Set()
  );
  const [justSaved, setJustSaved] = useState(false);
  const toast = useToast();

  // Mobile detection using centralized hook
  const isMobile = useIsMobile();

  useEffect(() => {
    // Update local state when configurations change (e.g., when data loads from Supabase)
    setLocalConfigurations(configurations);

    // Expand the first configuration by default
    if (configurations.length > 0) {
      setExpandedConfigIds(new Set([configurations[0].id]));
    }
  }, [configurations]);

  const handleSave = () => {
    triggerHapticFeedback("success");
    onSave(localConfigurations);

    // Show success toast
    toast.success("Personnel configurations saved successfully!");

    // Show green check mark briefly
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);

    // Don't close the modal - let user continue editing
  };

  const addPersonnelConfiguration = () => {
    const timestamp = Date.now().toString();
    const newConfig: PersonnelConfiguration = {
      id: timestamp,
      playbook_id: playbookId || "",
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
    setLocalConfigurations((prev) => [...prev, newConfig]);
    // Expand the new config
    setExpandedConfigIds((prev) => new Set([...prev, newConfig.id]));
  };

  const toggleExpanded = (configId: string) => {
    setExpandedConfigIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(configId)) {
        newSet.delete(configId);
      } else {
        newSet.add(configId);
      }
      return newSet;
    });
  };

  const toggleDefault = (configId: string) => {
    setLocalConfigurations((prev) =>
      prev.map((config) => ({
        ...config,
        isDefault: config.id === configId,
      }))
    );
    triggerHapticFeedback("light");
  };

  const getPersonnelSummary = (config: PersonnelConfiguration): string => {
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
  };

  const updatePersonnelConfigName = (configId: string, name: string) => {
    setLocalConfigurations((prev) =>
      prev.map((config) =>
        config.id === configId ? { ...config, name } : config
      )
    );
  };

  const removePersonnelConfiguration = (configId: string) => {
    setLocalConfigurations((prev) => prev.filter((c) => c.id !== configId));
  };

  const addSkillPlayer = (configId: string) => {
    setLocalConfigurations((prev) =>
      prev.map((config) =>
        config.id === configId
          ? {
              ...config,
              players: [
                ...config.players,
                {
                  id: `p${Date.now()}`,
                  config_id: configId,
                  label: "",
                  player_position: "WR" as PlayerPosition,
                  sort_order: config.players.length,
                  is_wildcat_qb: false,
                  created_at: new Date().toISOString(),
                },
              ],
            }
          : config
      )
    );
    triggerHapticFeedback("light");
  };

  const removeSkillPlayer = (configId: string, playerId: string) => {
    setLocalConfigurations((prev) =>
      prev.map((config) =>
        config.id === configId
          ? {
              ...config,
              players: config.players.filter((p) => p.id !== playerId),
            }
          : config
      )
    );
    triggerHapticFeedback("light");
  };

  const updateBadgeCustomization = (
    configId: string,
    customization: BadgeCustomization
  ) => {
    setLocalConfigurations((prev) =>
      prev.map((config) =>
        config.id === configId
          ? { ...config, badgeCustomization: customization }
          : config
      )
    );
  };

  const toggleCustomizer = (configId: string) => {
    setCustomizerOpenIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(configId)) {
        newSet.delete(configId);
      } else {
        newSet.add(configId);
      }
      return newSet;
    });
    triggerHapticFeedback("light");
  };

  const normalizeLabel = (value: string): string => {
    // Limit to 3 characters, convert to uppercase, allow alphanumeric only
    return value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 3);
  };

  const updatePlayerLabel = (
    configId: string,
    playerId: string,
    label: string
  ) => {
    const normalized = normalizeLabel(label);
    setLocalConfigurations((prev) =>
      prev.map((config) =>
        config.id === configId
          ? {
              ...config,
              players: config.players.map((player) =>
                player.id === playerId
                  ? { ...player, label: normalized }
                  : player
              ),
            }
          : config
      )
    );
  };

  const updatePlayerPosition = (
    configId: string,
    playerId: string,
    player_position: PlayerPosition
  ) => {
    setLocalConfigurations((prev) =>
      prev.map((config) =>
        config.id === configId
          ? {
              ...config,
              players: config.players.map((player) =>
                player.id === playerId ? { ...player, player_position } : player
              ),
            }
          : config
      )
    );
  };

  const toggleWildcatQB = (configId: string, playerId: string) => {
    setLocalConfigurations((prev) =>
      prev.map((config) =>
        config.id === configId
          ? {
              ...config,
              players: config.players.map((player) =>
                player.id === playerId
                  ? { ...player, is_wildcat_qb: !player.is_wildcat_qb }
                  : player
              ),
            }
          : config
      )
    );
  };

  // Note: Offensive line configuration removed - not in database schema

  const renderContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="headline-sm">
            Personnel Configurations
          </Typography>
          <Typography variant="body-sm" color="muted" className="mt-1">
            Define your personnel groupings with custom labels
          </Typography>
        </div>
        <Button
          onClick={() => {
            triggerHapticFeedback("light");
            addPersonnelConfiguration();
          }}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Icon name="plus" className="w-4 h-4" />
          Add New
        </Button>
      </div>

      {/* Personnel Configurations List */}
      <div className="space-y-3">
        {localConfigurations.map((config) => {
          const isExpanded = expandedConfigIds.has(config.id);
          const summary = getPersonnelSummary(config);

          return (
            <div
              key={config.id}
              className="rounded-xl border-2 border-default bg-secondary overflow-hidden transition-all"
            >
              {/* Collapsed Header */}
              <div className="flex items-center gap-3 p-4">
                {/* Star button for default */}
                <button
                  onClick={() => toggleDefault(config.id)}
                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-tertiary transition-colors"
                  title={
                    config.isDefault ? "Default personnel" : "Set as default"
                  }
                >
                  <Icon
                    name="star"
                    className={`w-5 h-5 transition-colors ${
                      config.isDefault
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-tertiary"
                    }`}
                  />
                </button>

                {/* Config name and summary */}
                <button
                  onClick={() => toggleExpanded(config.id)}
                  className="flex-1 flex items-center justify-between text-left hover:bg-tertiary/50 rounded-lg p-2 -m-2 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-primary flex items-center gap-2">
                      {config.name || "Unnamed Personnel"}
                      {config.badgeCustomization && (
                        <PersonnelBadge
                          personnel={config.name || "Personnel"}
                          size="sm"
                          badgeCustomization={config.badgeCustomization}
                        />
                      )}
                      {justSaved && (
                        <Icon
                          name="check-circle"
                          className="inline-block w-4 h-4 text-success-600"
                        />
                      )}
                    </div>
                    <div className="text-sm text-tertiary mt-0.5">
                      {summary}
                    </div>
                  </div>
                  <Icon
                    name="chevron-down"
                    className={`w-5 h-5 text-tertiary transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Delete button */}
                <Button
                  onClick={() => {
                    triggerHapticFeedback("light");
                    removePersonnelConfiguration(config.id);
                  }}
                  variant="ghost"
                  size="sm"
                  className="flex-shrink-0 text-error-500 hover:bg-error-50"
                >
                  <Icon name="delete" className="w-4 h-4" />
                </Button>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-default pt-4">
                  {/* Name Input */}
                  <div>
                    <Typography variant="label-md" className="mb-2">
                      Personnel Name
                    </Typography>
                    <Input
                      value={config.name}
                      onChange={(e) =>
                        updatePersonnelConfigName(config.id, e.target.value)
                      }
                      placeholder="Personnel Name"
                      className="font-medium"
                    />
                  </div>

                  {/* Customize Badge Button */}
                  <div>
                    <Button
                      onClick={() => toggleCustomizer(config.id)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Icon
                        name={
                          customizerOpenIds.has(config.id)
                            ? "chevron-up"
                            : "star"
                        }
                        className="w-4 h-4 mr-2"
                      />
                      {customizerOpenIds.has(config.id)
                        ? "Hide Badge Customizer"
                        : "Customize Badge"}
                    </Button>
                  </div>

                  {/* Badge Customizer (Collapsible) */}
                  {customizerOpenIds.has(config.id) && (
                    <div className="animate-in slide-in-from-top-2">
                      <BadgeCustomizer
                        personnelName={config.name || "Personnel"}
                        customization={
                          config.badgeCustomization || {
                            style: "solid",
                            colorPresetId: "electric-blue",
                            fontFamily: "default",
                          }
                        }
                        onChange={(customization) =>
                          updateBadgeCustomization(config.id, customization)
                        }
                        onSave={() => toggleCustomizer(config.id)}
                      />
                    </div>
                  )}

                  {/* Two Column Layout: Players (Left) and Line (Right) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Skill Positions */}
                    <div className="space-y-2">
                      <Typography
                        variant="label-md"
                        className="flex items-center gap-2 mb-3"
                      >
                        <Icon
                          name="users"
                          className="w-4 h-4 text-brand-jade"
                        />
                        SKILL POSITIONS
                      </Typography>

                      {config.players.map((player, index) => (
                        <div
                          key={player.id}
                          className="flex items-center gap-2"
                        >
                          {/* Label Input */}
                          <Input
                            value={player.label}
                            onChange={(e) =>
                              updatePlayerLabel(
                                config.id,
                                player.id,
                                e.target.value
                              )
                            }
                            placeholder={index === 0 ? "Q" : "Label"}
                            maxLength={3}
                            className="w-16 h-9 text-center font-mono font-bold uppercase text-sm"
                          />

                          <span className="text-tertiary text-sm">—</span>

                          {/* QB Position - LOCKED at top, cannot be changed */}
                          {index === 0 ? (
                            <div className="flex-1 h-9 px-3 flex items-center justify-between rounded-lg border border-default bg-tertiary text-sm font-medium opacity-75 cursor-not-allowed">
                              <span className="text-primary">QB</span>
                              <Icon
                                name="lock"
                                className="w-4 h-4 text-tertiary"
                              />
                            </div>
                          ) : (
                            /* Other Positions - FormSelect dropdown */
                            <FormSelect
                              value={player.player_position}
                              onChange={(value) =>
                                updatePlayerPosition(
                                  config.id,
                                  player.id,
                                  value as PlayerPosition
                                )
                              }
                              options={[
                                { value: "RB", label: "RB (Running Back)" },
                                { value: "TE", label: "TE (Tight End)" },
                                { value: "WR", label: "WR (Wide Receiver)" },
                              ]}
                              className="flex-1"
                            />
                          )}

                          {/* Wildcat QB checkbox - only show for QB position (inline) */}
                          {player.player_position === "QB" && index === 0 && (
                            <label className="flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={player.is_wildcat_qb || false}
                                onChange={() =>
                                  toggleWildcatQB(config.id, player.id)
                                }
                                className="w-3.5 h-3.5 rounded border-default text-brand-jade focus:ring-brand-jade focus:ring-offset-0"
                              />
                              <Typography
                                variant="caption"
                                className="text-tertiary text-xs"
                              >
                                Wildcat QB
                              </Typography>
                            </label>
                          )}

                          {/* Delete button for non-QB players */}
                          {index !== 0 && (
                            <button
                              onClick={() =>
                                removeSkillPlayer(config.id, player.id)
                              }
                              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-error-500 hover:bg-error-50 transition-colors"
                              title="Remove player"
                            >
                              <Icon name="close" className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}

                      {/* Add Player Button */}
                      <button
                        onClick={() => addSkillPlayer(config.id)}
                        className="w-full mt-2 px-3 py-2 rounded-lg border-2 border-dashed border-default hover:border-brand-jade hover:bg-tertiary text-secondary hover:text-brand-jade transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <Icon name="plus" className="w-4 h-4" />
                        Add Player
                      </button>
                    </div>

                    {/* Right Column: Offensive Line */}
                    <div className="space-y-2">
                      <Typography
                        variant="label-md"
                        className="flex items-center gap-2 mb-3"
                      >
                        <Icon
                          name="shield"
                          className="w-4 h-4 text-brand-jade"
                        />
                        OFFENSIVE LINE
                      </Typography>

                      <Typography
                        variant="caption"
                        color="muted"
                        className="text-xs"
                      >
                        Offensive line positions are managed separately
                      </Typography>

                      <Typography
                        variant="caption"
                        color="muted"
                        className="text-xs mt-2"
                      >
                        Default: LT, LG, C, RG, RT (customize with up to 3
                        characters)
                      </Typography>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Empty State */}
        {localConfigurations.length === 0 && (
          <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed border-default">
            <Icon
              name="users"
              className="w-12 h-12 mx-auto mb-3 text-tertiary"
            />
            <Typography variant="body-md" color="muted" className="mb-2">
              No personnel configurations yet
            </Typography>
            <Typography variant="caption" color="muted" className="mb-4">
              Create your first personnel grouping to get started
            </Typography>
            <Button
              onClick={() => {
                triggerHapticFeedback("light");
                addPersonnelConfiguration();
              }}
              variant="outline"
              size="sm"
            >
              <Icon name="plus" className="w-4 h-4 mr-2" />
              Add Personnel Configuration
            </Button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-default">
        <Button
          onClick={() => {
            triggerHapticFeedback("light");
            onClose();
          }}
          variant="outline"
          className="flex-1 h-11"
        >
          Cancel
        </Button>
        <Button onClick={handleSave} variant="primary" className="flex-1 h-11">
          {justSaved ? (
            <>
              <Icon name="check-circle" className="w-4 h-4 mr-2" />
              Saved!
            </>
          ) : (
            "Save Personnel"
          )}
        </Button>
      </div>
    </div>
  );

  if (!isOpen) return null;

  // Show loading state while fetching data
  if (isLoading) {
    return isMobile ? (
      <BottomSheet snapPoints={[0.6]} initialSnapPoint={0} showHandle={true}>
        <div className="flex items-center justify-center p-8">
          <div className="text-text-secondary">Loading personnel data...</div>
        </div>
      </BottomSheet>
    ) : (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Personnel Configuration"
        size="lg"
      >
        <div className="flex items-center justify-center p-8">
          <div className="text-text-secondary">Loading personnel data...</div>
        </div>
      </Modal>
    );
  }

  // Mobile: BottomSheet
  if (isMobile) {
    return (
      <BottomSheet
        snapPoints={[0.15, 0.6, 0.95]}
        initialSnapPoint={2}
        showHandle={true}
        backdropOpacity={0.4}
      >
        <div className="px-4 pb-8 pt-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
                <Icon name="users" className="w-5 h-5 text-pink-600" />
              </div>
              <Typography variant="headline-md">Personnel</Typography>
            </div>
            <button
              onClick={() => {
                triggerHapticFeedback("light");
                onClose();
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-tertiary"
            >
              <Icon name="close" className="w-5 h-5" />
            </button>
          </div>

          {renderContent()}
        </div>
      </BottomSheet>
    );
  }

  // Desktop: Modal
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Personnel Configurations"
      size="lg"
    >
      <div className="p-6">{renderContent()}</div>
    </Modal>
  );
};
