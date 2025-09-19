import React, { useState } from "react";
import { Button } from "../../ui/Button/Button";
import { Modal } from "../../ui/Modal";
import type { PersonnelSettings } from "../../../types/personnel";
import { usePlaybookSettings } from "./hooks/usePlaybookSettings";
import { GroupingSelector } from "./components/GroupingSelector";
import { PositionEditor } from "./components/PositionEditor";

interface PlaybookSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PersonnelSettings;
  onSave: (settings: PersonnelSettings) => void;
}

export type { PlaybookSettingsModalProps };

type TabType = "personnel" | "layout" | "themes";

export const PlaybookSettingsModal: React.FC<PlaybookSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("personnel");

  const {
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
  } = usePlaybookSettings(settings);

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const activeGrouping = localSettings.groupings.find(
    (g) => g.id === localSettings.activeGroupingId
  );

  const tabs = [
    { id: "personnel" as TabType, label: "Personnel", available: true },
    { id: "layout" as TabType, label: "Layout", available: false },
    { id: "themes" as TabType, label: "Themes", available: false },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Customize Your Playbook"
      size="xl 2xl:4xl"
      forceLandscapeOnMobile={true}
      className="max-h-[90vh]"
    >
      <div className="flex flex-col h-full max-h-[calc(90vh-8rem)]">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-4 flex-shrink-0">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                onClick={() => tab.available && setActiveTab(tab.id)}
                variant={activeTab === tab.id ? "primary" : "ghost"}
                size="sm"
                className={`rounded-t-md rounded-b-none border-b-2 ${
                  activeTab === tab.id
                    ? "border-blue-500"
                    : "border-transparent"
                } ${!tab.available ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={!tab.available}
              >
                {tab.label}
                {!tab.available && (
                  <span className="ml-1 text-xs">(Coming Soon)</span>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto min-h-0 relative z-0">
          <div className="pb-4 pr-2">
            {activeTab === "personnel" && (
              <div className="space-y-6 relative z-0">
                <GroupingSelector
                  groupings={localSettings.groupings}
                  activeGroupingId={localSettings.activeGroupingId}
                  newGroupingName={newGroupingName}
                  onNewGroupingNameChange={setNewGroupingName}
                  onCreateGrouping={handleCreateGrouping}
                  onDeleteGrouping={handleDeleteGrouping}
                  onSetActiveGrouping={handleSetActiveGrouping}
                  onUpdateGroupingName={handleUpdateGroupingName}
                />

                <PositionEditor
                  activeGrouping={activeGrouping}
                  onUpdatePositionLabel={handleUpdatePositionLabel}
                  onApplyNamingPreset={handleApplyNamingPreset}
                  onTogglePositionLock={handleTogglePositionLock}
                />
              </div>
            )}

            {activeTab === "layout" && (
              <div className="text-center py-8 text-text-muted">
                Layout customization coming soon...
              </div>
            )}

            {activeTab === "themes" && (
              <div className="text-center py-8 text-text-muted">
                Theme customization coming soon...
              </div>
            )}
          </div>
        </div>

        {/* Fixed Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t bg-white dark:bg-gray-900 mt-4 flex-shrink-0">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </div>
    </Modal>
  );
};
