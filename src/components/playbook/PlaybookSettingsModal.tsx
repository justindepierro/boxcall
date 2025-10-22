import React, { useState, useEffect } from "react";
import { Icon } from "../ui/Icon";
import { Button } from "../ui/Button/Button";
import { Typography } from "../design-system/Typography";
import { BottomSheet } from "../BottomSheet";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { triggerHapticFeedback } from "../../lib/hapticFeedback";
import { useIsMobile } from "../../hooks/useBreakpoint";

interface PersonnelSettings {
  personnelGrouping: string;
  personnelNaming: string;
  defaultPersonnel: string;
  defaultFormation: string;
  enableAutoTagging: boolean;
  showComplexity: boolean;
  theme: "light" | "dark" | "auto";
  gridDensity: "comfortable" | "compact";
  personnelConfigurations: any[]; // Keep for backward compatibility
  // Position names for all 11 players (legacy)
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
  const [activeSection, setActiveSection] = useState<"quick" | "advanced">(
    "quick"
  );

  // Mobile detection using centralized hook
  const isMobile = useIsMobile();

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    triggerHapticFeedback("success");
    onSave(localSettings);
    onClose();
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

  const sections = [
    { id: "quick" as const, label: "Quick Settings", icon: "zap" },
    { id: "advanced" as const, label: "Advanced", icon: "settings" },
  ];

  const renderContent = () => (
    <div className="space-y-6">
      {/* Section Pills - Larger on Mobile */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => {
              triggerHapticFeedback("light");
              setActiveSection(section.id);
            }}
            className={`flex items-center gap-2 ${
              isMobile ? "px-5 py-3 min-h-[44px]" : "px-4 py-2"
            } rounded-full whitespace-nowrap transition-all ${
              activeSection === section.id
                ? "bg-brand-jade text-white shadow-md"
                : "bg-surface-secondary text-text-secondary hover:bg-surface-tertiary"
            }`}
          >
            <Icon
              name={section.icon as any}
              className={isMobile ? "w-5 h-5" : "w-4 h-4"}
            />
            <span
              className={
                isMobile ? "text-base font-medium" : "text-sm font-medium"
              }
            >
              {section.label}
            </span>
          </button>
        ))}
      </div>

      {/* Content based on active section */}
      <div className="space-y-4">
        {activeSection === "quick" && (
          <>
            <Typography variant="headline-sm" className="mb-4">
              Quick Settings
            </Typography>

            {/* Theme */}
            <div className="space-y-2">
              <Typography variant="label-md">Theme</Typography>
              <div className="grid grid-cols-3 gap-2">
                {["light", "dark", "auto"].map((theme) => (
                  <button
                    key={theme}
                    onClick={() => {
                      triggerHapticFeedback("light");
                      updateSetting("theme", theme as any);
                    }}
                    className={`${
                      isMobile ? "p-4 min-h-[56px]" : "p-3"
                    } rounded-xl border-2 transition-all ${
                      localSettings.theme === theme
                        ? "border-brand-jade bg-brand-jade/10"
                        : "border-border-default hover:border-border-medium"
                    }`}
                  >
                    <Icon
                      name={
                        theme === "light"
                          ? "sun"
                          : theme === "dark"
                            ? "moon"
                            : "monitor"
                      }
                      className={`${isMobile ? "w-6 h-6" : "w-5 h-5"} mx-auto mb-1`}
                    />
                    <Typography
                      variant="caption"
                      className="capitalize text-center"
                    >
                      {theme}
                    </Typography>
                  </button>
                ))}
              </div>
            </div>

            {/* Grid Density */}
            <div className="space-y-2">
              <Typography variant="label-md">Grid Density</Typography>
              <div className="grid grid-cols-2 gap-2">
                {["comfortable", "compact"].map((density) => (
                  <button
                    key={density}
                    onClick={() => {
                      triggerHapticFeedback("light");
                      updateSetting("gridDensity", density as any);
                    }}
                    className={`${
                      isMobile ? "p-4 min-h-[56px]" : "p-3"
                    } rounded-xl border-2 transition-all ${
                      localSettings.gridDensity === density
                        ? "border-brand-jade bg-brand-jade/10"
                        : "border-border-default hover:border-border-medium"
                    }`}
                  >
                    <Typography
                      variant="body-sm"
                      className="capitalize text-center"
                    >
                      {density}
                    </Typography>
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3 pt-2">
              <label
                className={`flex items-center justify-between ${
                  isMobile ? "p-4 min-h-[64px]" : "p-3"
                } rounded-xl bg-surface-secondary`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    name="tag"
                    className={`${isMobile ? "w-6 h-6" : "w-5 h-5"} text-brand-jade`}
                  />
                  <div>
                    <Typography variant="body-sm" className="font-medium">
                      Auto-Tagging
                    </Typography>
                    <Typography variant="caption" color="muted">
                      Automatically tag plays
                    </Typography>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.enableAutoTagging}
                  onChange={(e) => {
                    triggerHapticFeedback("light");
                    updateSetting("enableAutoTagging", e.target.checked);
                  }}
                  className={
                    isMobile ? "w-14 h-8 rounded-full" : "w-12 h-6 rounded-full"
                  }
                />
              </label>

              <label
                className={`flex items-center justify-between ${
                  isMobile ? "p-4 min-h-[64px]" : "p-3"
                } rounded-xl bg-surface-secondary`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    name="bar-chart"
                    className={`${isMobile ? "w-6 h-6" : "w-5 h-5"} text-brand-jade`}
                  />
                  <div>
                    <Typography variant="body-sm" className="font-medium">
                      Show Complexity
                    </Typography>
                    <Typography variant="caption" color="muted">
                      Display play complexity ratings
                    </Typography>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.showComplexity}
                  onChange={(e) => {
                    triggerHapticFeedback("light");
                    updateSetting("showComplexity", e.target.checked);
                  }}
                  className={
                    isMobile ? "w-14 h-8 rounded-full" : "w-12 h-6 rounded-full"
                  }
                />
              </label>
            </div>
          </>
        )}

        {activeSection === "advanced" && (
          <>
            <Typography variant="headline-sm" className="mb-4">
              Advanced Settings
            </Typography>

            {/* Bulk Operations */}
            <div
              className={`space-y-4 ${isMobile ? "p-5" : "p-4"} rounded-xl bg-surface-secondary`}
            >
              <Typography
                variant="label-md"
                className="flex items-center gap-2"
              >
                <Icon
                  name="plus-circle"
                  className={isMobile ? "w-5 h-5" : "w-4 h-4"}
                />
                Bulk Operations
              </Typography>

              <div className="space-y-3">
                <label
                  className={`flex items-center justify-between ${isMobile ? "min-h-[48px]" : ""}`}
                >
                  <Typography variant="body-sm">
                    Enable Bulk Formation Add
                  </Typography>
                  <input
                    type="checkbox"
                    checked={
                      localSettings.bulkOperations.enableBulkFormationAdd
                    }
                    onChange={(e) => {
                      triggerHapticFeedback("light");
                      updateBulkSetting(
                        "enableBulkFormationAdd",
                        e.target.checked
                      );
                    }}
                    className={
                      isMobile
                        ? "w-14 h-8 rounded-full"
                        : "w-12 h-6 rounded-full"
                    }
                  />
                </label>

                <label
                  className={`flex items-center justify-between ${isMobile ? "min-h-[48px]" : ""}`}
                >
                  <Typography variant="body-sm">
                    Enable Bulk Play Add
                  </Typography>
                  <input
                    type="checkbox"
                    checked={localSettings.bulkOperations.enableBulkPlayAdd}
                    onChange={(e) => {
                      triggerHapticFeedback("light");
                      updateBulkSetting("enableBulkPlayAdd", e.target.checked);
                    }}
                    className={
                      isMobile
                        ? "w-14 h-8 rounded-full"
                        : "w-12 h-6 rounded-full"
                    }
                  />
                </label>

                <div className="space-y-1">
                  <Typography variant="label-md">
                    Default Formation Count
                  </Typography>
                  <Input
                    type="number"
                    value={
                      localSettings.bulkOperations.defaultBulkFormationCount
                    }
                    onChange={(e) =>
                      updateBulkSetting(
                        "defaultBulkFormationCount",
                        parseInt(e.target.value) || 5
                      )
                    }
                    min={1}
                    max={20}
                    className={`w-full ${isMobile ? "h-12" : ""}`}
                  />
                </div>

                <div className="space-y-1">
                  <Typography variant="label-md">Default Play Count</Typography>
                  <Input
                    type="number"
                    value={localSettings.bulkOperations.defaultBulkPlayCount}
                    onChange={(e) =>
                      updateBulkSetting(
                        "defaultBulkPlayCount",
                        parseInt(e.target.value) || 10
                      )
                    }
                    min={1}
                    max={50}
                    className={`w-full ${isMobile ? "h-12" : ""}`}
                  />
                </div>
              </div>
            </div>

            {/* Personnel Settings */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Typography variant="label-md">Personnel Grouping</Typography>
                <Select
                  value={localSettings.personnelGrouping}
                  onChange={(value) =>
                    updateSetting("personnelGrouping", value as string)
                  }
                  options={[
                    { value: "11", label: "11 Personnel (1 RB, 1 TE, 3 WR)" },
                    { value: "12", label: "12 Personnel (1 RB, 2 TE, 2 WR)" },
                    { value: "21", label: "21 Personnel (2 RB, 1 TE, 2 WR)" },
                    { value: "22", label: "22 Personnel (2 RB, 2 TE, 1 WR)" },
                  ]}
                  className={`w-full ${isMobile ? "h-12" : ""}`}
                />
              </div>

              <div className="space-y-1">
                <Typography variant="label-md">Default Formation</Typography>
                <Input
                  value={localSettings.defaultFormation}
                  onChange={(e) =>
                    updateSetting("defaultFormation", e.target.value)
                  }
                  placeholder="I-Form, Spread, etc."
                  className={`w-full ${isMobile ? "h-12" : ""}`}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Action Buttons - Sticky on Mobile */}
      <div
        className={`flex gap-3 pt-4 border-t border-border-default ${
          isMobile
            ? "sticky bottom-0 bg-surface-primary pb-safe -mx-4 px-4"
            : ""
        }`}
      >
        <Button
          onClick={() => {
            triggerHapticFeedback("light");
            onClose();
          }}
          variant="outline"
          className={`flex-1 ${isMobile ? "h-12 text-base" : ""}`}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="primary"
          className={`flex-1 ${isMobile ? "h-12 text-base" : ""}`}
        >
          Save Settings
        </Button>
      </div>
    </div>
  );

  if (!isOpen) return null;

  // Mobile: BottomSheet
  if (isMobile) {
    return (
      <BottomSheet
        snapPoints={[0.15, 0.5, 0.92]}
        initialSnapPoint={2}
        showHandle={true}
        backdropOpacity={0.4}
      >
        <div className="px-4 pb-8 pt-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-jade/10 flex items-center justify-center">
                <Icon name="settings" className="w-5 h-5 text-brand-jade" />
              </div>
              <Typography variant="headline-md">Playbook Settings</Typography>
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
      title="Playbook Settings"
      size="lg"
    >
      <div className="p-6">{renderContent()}</div>
    </Modal>
  );
};
