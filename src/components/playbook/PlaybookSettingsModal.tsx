import React, { useState, useEffect } from "react";
import { Icon } from "../ui/Icon";
import { Button } from "../ui/Button/Button";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import type {
  PersonnelGrouping,
  PersonnelSettings,
  PersonnelNamingPreset,
} from "../../types/personnel";
import { PERSONNEL_NAMING_PRESETS } from "../../types/personnel";

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
  const [newGroupingName, setNewGroupingName] = useState("");

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleCreateGrouping = () => {
    if (!newGroupingName.trim()) return;

    const defaultGrouping = localSettings.groupings.find((g) => g.isDefault);
    if (!defaultGrouping) return;

    const newGrouping: PersonnelGrouping = {
      id: `grouping-${Date.now()}`,
      name: newGroupingName.trim(),
      positions: defaultGrouping.positions.map((pos) => ({
        ...pos,
        id: `${pos.id}-copy`,
      })),
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setLocalSettings((prev) => ({
      ...prev,
      groupings: [...prev.groupings, newGrouping],
    }));
    setNewGroupingName("");
  };

  const handleDeleteGrouping = (groupingId: string) => {
    const grouping = localSettings.groupings.find((g) => g.id === groupingId);
    if (grouping?.isDefault) return; // Can't delete default

    setLocalSettings((prev) => ({
      ...prev,
      groupings: prev.groupings.filter((g) => g.id !== groupingId),
      activeGroupingId:
        prev.activeGroupingId === groupingId
          ? prev.groupings.find((g) => g.isDefault)?.id ||
            prev.groupings[0]?.id ||
            ""
          : prev.activeGroupingId,
    }));
  };

  const handleSetActiveGrouping = (groupingId: string) => {
    setLocalSettings((prev) => ({
      ...prev,
      activeGroupingId: groupingId,
    }));
  };

  const handleUpdatePositionLabel = (
    groupingId: string,
    positionId: string,
    newLabel: string
  ) => {
    setLocalSettings((prev) => ({
      ...prev,
      groupings: prev.groupings.map((grouping) =>
        grouping.id === groupingId
          ? {
              ...grouping,
              positions: grouping.positions.map((pos) =>
                pos.id === positionId ? { ...pos, label: newLabel } : pos
              ),
              updatedAt: new Date(),
            }
          : grouping
      ),
    }));
  };

  const handleApplyNamingPreset = (preset: PersonnelNamingPreset) => {
    const presetLabels = PERSONNEL_NAMING_PRESETS[preset];
    const activeGrouping = localSettings.groupings.find(
      (g) => g.id === localSettings.activeGroupingId
    );
    if (!activeGrouping) return;

    const updatedPositions = activeGrouping.positions.map((pos) => {
      const positionType = pos.position.toLowerCase();
      let newLabel = pos.label;

      if (positionType.includes("quarterback")) {
        newLabel = presetLabels.QB;
      } else if (positionType.includes("tight end")) {
        newLabel = presetLabels.TE;
      } else if (positionType.includes("running back")) {
        newLabel = presetLabels.RB;
      } else if (positionType.includes("wide receiver")) {
        newLabel = presetLabels.WR;
      }
      // Linemen keep their standard abbreviations

      return { ...pos, label: newLabel };
    });

    setLocalSettings((prev) => ({
      ...prev,
      groupings: prev.groupings.map((grouping) =>
        grouping.id === activeGrouping.id
          ? { ...grouping, positions: updatedPositions, updatedAt: new Date() }
          : grouping
      ),
    }));
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const activeGrouping = localSettings.groupings.find(
    (g) => g.id === localSettings.activeGroupingId
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Customize Your Playbook"
      size="xl 2xl:4xl"
      forceLandscapeOnMobile={true}
    >
      <div className="space-y-6">
        {/* Grouping Selector */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Personnel Groupings</h3>
          <div className="space-y-2">
            {localSettings.groupings.map((grouping) => (
              <div
                key={grouping.id}
                className="flex items-center justify-between p-3 border rounded"
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    checked={localSettings.activeGroupingId === grouping.id}
                    onChange={() => handleSetActiveGrouping(grouping.id)}
                    className="text-blue-600"
                  />
                  <span className="font-medium">
                    {grouping.name}
                    {grouping.isDefault && (
                      <span className="text-sm text-text-muted ml-2">
                        (Default)
                      </span>
                    )}
                  </span>
                </div>
                {!grouping.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteGrouping(grouping.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Icon name="delete" size="sm" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Create New Grouping */}
          <div className="flex space-x-2 mt-3">
            <Input
              placeholder="New grouping name..."
              value={newGroupingName}
              onChange={(e) => setNewGroupingName(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleCreateGrouping}
              disabled={!newGroupingName.trim()}
            >
              Create
            </Button>
          </div>
        </div>

        {/* Position Editor */}
        {activeGrouping && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">
                Edit Positions - {activeGrouping.name}
              </h3>
              <Select
                value=""
                onChange={(value) =>
                  handleApplyNamingPreset(value as PersonnelNamingPreset)
                }
                options={[
                  { value: "", label: "Apply Naming Preset..." },
                  { value: "traditional", label: "Traditional (WR1, WR2, TE)" },
                  { value: "xy", label: "X/Y (X, Y, QB)" },
                  { value: "lr", label: "L/R (L, R, QB)" },
                  { value: "numbers", label: "Numbers (WR1, WR2, WR3)" },
                ]}
                className="w-48"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeGrouping.positions.map((position) => (
                <div
                  key={position.id}
                  className="flex items-center space-x-3 p-3 border rounded"
                >
                  <div className="flex-1">
                    <div className="text-sm text-text-muted">
                      {position.position}
                    </div>
                    <Input
                      value={position.label}
                      onChange={(e) =>
                        handleUpdatePositionLabel(
                          activeGrouping.id,
                          position.id,
                          e.target.value
                        )
                      }
                      disabled={position.isLocked}
                      className="mt-1"
                    />
                  </div>
                  {position.isLocked && (
                    <Icon name="lock" size="sm" className="text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

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
