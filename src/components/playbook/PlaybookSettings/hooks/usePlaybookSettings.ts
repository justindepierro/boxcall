import { useState, useEffect } from "react";
import type {
  PersonnelGrouping,
  PersonnelSettings,
  PersonnelNamingPreset as _PersonnelNamingPreset,
} from "../../../../types/personnel";
import { PERSONNEL_NAMING_PRESETS as _PERSONNEL_NAMING_PRESETS } from "../../../../types/personnel";

export const usePlaybookSettings = (initialSettings: PersonnelSettings) => {
  const [localSettings, setLocalSettings] =
    useState<PersonnelSettings>(initialSettings);
  const [newGroupingName, setNewGroupingName] = useState("");

  useEffect(() => {
    setLocalSettings(initialSettings);
  }, [initialSettings]);

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

  const handleUpdateGroupingName = (groupingId: string, newName: string) => {
    setLocalSettings((prev) => ({
      ...prev,
      groupings: prev.groupings.map((grouping) =>
        grouping.id === groupingId
          ? { ...grouping, name: newName, updatedAt: new Date() }
          : grouping
      ),
    }));
  };

  const handleTogglePositionLock = (groupingId: string, positionId: string) => {
    setLocalSettings((prev) => ({
      ...prev,
      groupings: prev.groupings.map((grouping) =>
        grouping.id === groupingId
          ? {
              ...grouping,
              positions: grouping.positions.map((pos) =>
                pos.id === positionId
                  ? { ...pos, isLocked: !pos.isLocked }
                  : pos
              ),
              updatedAt: new Date(),
            }
          : grouping
      ),
    }));
  };

  const handleApplyNamingPreset = (preset: _PersonnelNamingPreset) => {
    const presetLabels = _PERSONNEL_NAMING_PRESETS[preset];
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

  return {
    localSettings,
    newGroupingName,
    setNewGroupingName,
    handleCreateGrouping,
    handleDeleteGrouping,
    handleSetActiveGrouping,
    handleUpdatePositionLabel,
    handleApplyNamingPreset,
    handleUpdateGroupingName,
    handleTogglePositionLock,
  };
};
