import React, { useState, useEffect } from "react";
import { Icon } from "../ui/Icon";
import { Button } from "../ui/Button/Button";
import { Typography } from "../design-system/Typography";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";

interface PersonnelSettings {
  personnelGrouping: string;
  personnelNaming: string;
  defaultPersonnel: string;
  defaultFormation: string;
  enableAutoTagging: boolean;
  showComplexity: boolean;
  theme: "light" | "dark" | "auto";
  gridDensity: "comfortable" | "compact";
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

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Playbook Settings">
      <div className="space-y-6">
        {/* Personnel Settings */}
        <div>
          <Typography variant="headline-md" className="mb-4">
            Personnel Settings
          </Typography>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Default Personnel
              </label>
              <Select
                options={[
                  { value: "11", label: "11 Personnel" },
                  { value: "12", label: "12 Personnel" },
                  { value: "13", label: "13 Personnel" },
                  { value: "21", label: "21 Personnel" },
                  { value: "22", label: "22 Personnel" },
                ]}
                value={localSettings.defaultPersonnel}
                onChange={(value) =>
                  updateSetting("defaultPersonnel", value as string)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Default Formation
              </label>
              <Select
                options={[
                  { value: "Shotgun", label: "Shotgun" },
                  { value: "Under Center", label: "Under Center" },
                  { value: "Pistol", label: "Pistol" },
                  { value: "Wildcat", label: "Wildcat" },
                ]}
                value={localSettings.defaultFormation}
                onChange={(value) =>
                  updateSetting("defaultFormation", value as string)
                }
              />
            </div>
          </div>
        </div>

        {/* Display Options */}
        <div>
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
              <label htmlFor="autoTagging" className="text-sm">
                Enable Auto Tagging
              </label>
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
              <label htmlFor="showComplexity" className="text-sm">
                Show Complexity Indicators
              </label>
            </div>
          </div>
        </div>

        {/* Interface Settings */}
        <div>
          <Typography variant="headline-md" className="mb-4">
            Interface Settings
          </Typography>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Theme</label>
              <Select
                options={[
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                  { value: "auto", label: "Auto" },
                ]}
                value={localSettings.theme}
                onChange={(value) =>
                  updateSetting("theme", value as "light" | "dark" | "auto")
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Grid Density
              </label>
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
