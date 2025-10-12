import React, { useState, useEffect } from "react";
import { Icon } from "../ui/Icon";
import { Button } from "../ui/Button/Button";
import { Typography } from "../design-system/Typography";
import { BottomSheet } from "../BottomSheet";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { triggerHapticFeedback } from "../../lib/hapticFeedback";

type PlayerPosition = "QB" | "RB" | "TE" | "WR";

interface PersonnelPlayer {
  id: string;
  label: string; // e.g., "QB", "RB1", "3"
  position: PlayerPosition;
  isWildcatQB?: boolean; // For QB position only - indicates wildcat formation
}

interface PersonnelLine {
  id: string;
  label: string; // e.g., "LT", "LG", "C", "1", "2"
}

export interface PersonnelConfiguration {
  id: string;
  name: string; // e.g., "11 Personnel"
  players: PersonnelPlayer[];
  line: PersonnelLine[];
}

interface PersonnelConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  configurations: PersonnelConfiguration[];
  onSave: (configurations: PersonnelConfiguration[]) => void;
}

export const PersonnelConfigurationModal: React.FC<
  PersonnelConfigurationModalProps
> = ({ isOpen, onClose, configurations, onSave }) => {
  const [localConfigurations, setLocalConfigurations] =
    useState<PersonnelConfiguration[]>(configurations);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setLocalConfigurations(configurations);
  }, [configurations]);

  const handleSave = () => {
    triggerHapticFeedback("success");
    onSave(localConfigurations);
    onClose();
  };

  const addPersonnelConfiguration = () => {
    const newConfig: PersonnelConfiguration = {
      id: Date.now().toString(),
      name: "11 Personnel",
      players: [
        { id: "p1", label: "QB", position: "QB", isWildcatQB: false },
        { id: "p2", label: "RB", position: "RB" },
        { id: "p3", label: "TE", position: "TE" },
        { id: "p4", label: "WR", position: "WR" },
        { id: "p5", label: "WR", position: "WR" },
        { id: "p6", label: "WR", position: "WR" },
      ],
      line: [
        { id: "l1", label: "LT" },
        { id: "l2", label: "LG" },
        { id: "l3", label: "C" },
        { id: "l4", label: "RG" },
        { id: "l5", label: "RT" },
      ],
    };
    setLocalConfigurations((prev) => [...prev, newConfig]);
  };

  const removePersonnelConfiguration = (configId: string) => {
    setLocalConfigurations((prev) => prev.filter((c) => c.id !== configId));
  };

  const updatePersonnelConfigName = (configId: string, name: string) => {
    setLocalConfigurations((prev) =>
      prev.map((config) =>
        config.id === configId ? { ...config, name } : config
      )
    );
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
    position: PlayerPosition
  ) => {
    setLocalConfigurations((prev) =>
      prev.map((config) =>
        config.id === configId
          ? {
              ...config,
              players: config.players.map((player) =>
                player.id === playerId ? { ...player, position } : player
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
                  ? { ...player, isWildcatQB: !player.isWildcatQB }
                  : player
              ),
            }
          : config
      )
    );
  };

  const updateLineLabel = (configId: string, lineId: string, label: string) => {
    const normalized = normalizeLabel(label);
    setLocalConfigurations((prev) =>
      prev.map((config) =>
        config.id === configId
          ? {
              ...config,
              line: config.line.map((linePos) =>
                linePos.id === lineId
                  ? { ...linePos, label: normalized }
                  : linePos
              ),
            }
          : config
      )
    );
  };

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
      <div className="space-y-4">
        {localConfigurations.map((config) => (
          <div
            key={config.id}
            className="p-4 rounded-xl border-2 border-border-default bg-surface-secondary"
          >
            {/* Configuration Header */}
            <div className="flex items-center justify-between mb-4">
              <Input
                value={config.name}
                onChange={(e) =>
                  updatePersonnelConfigName(config.id, e.target.value)
                }
                placeholder="11 Personnel"
                className="flex-1 mr-2 font-medium"
              />
              <Button
                onClick={() => {
                  triggerHapticFeedback("light");
                  removePersonnelConfiguration(config.id);
                }}
                variant="ghost"
                size="sm"
                className="text-error-500 hover:bg-error-50"
              >
                <Icon name="delete" className="w-4 h-4" />
              </Button>
            </div>

            {/* Two Column Layout: Players (Left) and Line (Right) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Skill Positions */}
              <div className="space-y-2">
                <Typography
                  variant="label-md"
                  className="flex items-center gap-2 mb-1"
                >
                  <Icon name="users" className="w-4 h-4 text-brand-jade" />
                  Skill Positions
                </Typography>

                {config.players.map((player) => (
                  <div key={player.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Input
                        value={player.label}
                        onChange={(e) =>
                          updatePlayerLabel(
                            config.id,
                            player.id,
                            e.target.value
                          )
                        }
                        placeholder="QB"
                        maxLength={3}
                        className="w-16 h-9 text-center font-mono font-bold uppercase text-sm"
                      />
                      <span className="text-text-tertiary text-sm">—</span>
                      <button
                        type="button"
                        onClick={() => {
                          // Cycle through positions: QB → RB → TE → WR → QB
                          const positions: PlayerPosition[] = ["QB", "RB", "TE", "WR"];
                          const currentIndex = positions.indexOf(player.position);
                          const nextPosition = positions[(currentIndex + 1) % positions.length];
                          updatePlayerPosition(config.id, player.id, nextPosition);
                        }}
                        className="flex-1 h-9 px-3 flex items-center justify-between rounded-lg border border-border-default bg-surface-secondary hover:bg-surface-tertiary transition-colors text-sm text-text-secondary font-medium group"
                      >
                        <span className="text-text-primary">{player.position}</span>
                        <Icon name="chevron-down" className="w-4 h-4 text-text-tertiary group-hover:text-text-secondary transition-colors" />
                      </button>
                    </div>
                    {/* Wildcat QB checkbox - only show for QB position */}
                    {player.position === "QB" && (
                      <label className="flex items-center gap-1.5 pl-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={player.isWildcatQB || false}
                          onChange={() =>
                            toggleWildcatQB(config.id, player.id)
                          }
                          className="w-3.5 h-3.5 rounded border-border-default text-brand-jade focus:ring-brand-jade focus:ring-offset-0"
                        />
                        <Typography
                          variant="caption"
                          className="text-text-tertiary text-xs"
                        >
                          Wildcat QB
                        </Typography>
                      </label>
                    )}
                  </div>
                ))}
              </div>

              {/* Right Column: Offensive Line */}
              <div className="space-y-2">
                <Typography
                  variant="label-md"
                  className="flex items-center gap-2 mb-1"
                >
                  <Icon name="shield" className="w-4 h-4 text-brand-jade" />
                  Offensive Line
                </Typography>

                {config.line.map((linePos, index) => (
                  <div key={linePos.id} className="flex items-center gap-2">
                    <span className="text-xs text-text-tertiary w-6 text-right">
                      {index + 1}.
                    </span>
                    <Input
                      value={linePos.label}
                      onChange={(e) =>
                        updateLineLabel(config.id, linePos.id, e.target.value)
                      }
                      placeholder={["LT", "LG", "C", "RG", "RT"][index]}
                      maxLength={3}
                      className="flex-1 h-9 text-center font-mono font-bold uppercase text-sm"
                    />
                  </div>
                ))}

                <Typography
                  variant="caption"
                  color="muted"
                  className="text-xs mt-2"
                >
                  Default: LT, LG, C, RG, RT (customize with up to 3 characters)
                </Typography>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {localConfigurations.length === 0 && (
          <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed border-border-default">
            <Icon
              name="users"
              className="w-12 h-12 mx-auto mb-3 text-text-tertiary"
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
      <div className="flex gap-3 pt-4 border-t border-border-default">
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
          Save Personnel
        </Button>
      </div>
    </div>
  );

  if (!isOpen) return null;

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
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-tertiary"
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
