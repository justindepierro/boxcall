/**
 * PlaybookSettingsModal - Comprehensive playbook settings
 *
 * Sections:
 * - General: Playbook name, description, default settings
 * - Display: Theme, grid density, view preferences
 * - Data Management: Export, import, duplicate, merge playbooks
 * - Danger Zone: Delete playbook
 */

import React, { useState, useEffect, useCallback } from "react";
import { Icon } from "../ui/Icon";
import { Button } from "../ui/Button/Button";
import { Typography } from "../design-system/Typography";
import { BottomSheet } from "../BottomSheet";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Dropdown } from "../ui/Dropdown";
import { triggerHapticFeedback } from "../../lib/hapticFeedback";
import { useIsMobile } from "../../hooks/useBreakpoint";
import { useToast } from "../../hooks/useToast";

// ============================================================================
// Types
// ============================================================================

interface PlaybookInfo {
  id: string;
  name: string;
  description?: string;
  play_count: number;
}

interface DisplaySettings {
  theme: "light" | "dark" | "auto";
  gridDensity: "comfortable" | "compact";
  defaultView: "grid" | "list";
  showComplexity: boolean;
  enableAutoTagging: boolean;
}

interface DefaultSettings {
  defaultPersonnel: string;
  defaultFormation: string;
  defaultPlayType: string;
}

interface PlaybookSettingsModalProps {
  isOpen?: boolean;
  onClose: () => void;
  playbook?: PlaybookInfo | null;
  playbooks?: PlaybookInfo[];
  displaySettings?: DisplaySettings;
  defaultSettings?: DefaultSettings;
  onSaveDisplaySettings?: (settings: DisplaySettings) => void;
  onSaveDefaultSettings?: (settings: DefaultSettings) => void;
  onRenamePlaybook?: (name: string, description?: string) => Promise<void>;
  onDuplicatePlaybook?: () => Promise<void>;
  onExportPlaybook?: (format: "json" | "csv") => void;
  onDeletePlaybook?: () => Promise<void>;
  onMergePlaybooks?: (sourcePlaybookIds: string[]) => Promise<void>;
  onOpenPersonnel?: () => void;
}

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  theme: "auto",
  gridDensity: "comfortable",
  defaultView: "grid",
  showComplexity: true,
  enableAutoTagging: true,
};

const DEFAULT_SETTINGS: DefaultSettings = {
  defaultPersonnel: "11",
  defaultFormation: "",
  defaultPlayType: "Pass",
};

// ============================================================================
// Sub-Components
// ============================================================================

// Section Header Component
const SectionHeader: React.FC<{
  icon: string;
  title: string;
  subtitle?: string;
  iconColor?: string;
}> = ({ icon, title, subtitle, iconColor = "text-brand-jade" }) => (
  <div className="flex items-start gap-3 mb-4">
    <div
      className={`w-10 h-10 rounded-xl bg-opacity-10 flex items-center justify-center flex-shrink-0 ${
        iconColor === "text-brand-jade"
          ? "bg-brand-jade/10"
          : iconColor === "text-error-500"
            ? "bg-error-500/10"
            : "bg-blue-500/10"
      }`}
    >
      <Icon name={icon as any} className={`w-5 h-5 ${iconColor}`} />
    </div>
    <div>
      <Typography variant="headline-sm" className="text-navy-900 dark:text-neutral-100">
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" className="mt-0.5 text-neutral-600 dark:text-neutral-400">
          {subtitle}
        </Typography>
      )}
    </div>
  </div>
);

// Toggle Switch Component
const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  icon?: string;
  isMobile?: boolean;
}> = ({ checked, onChange, label, description, icon, isMobile }) => (
  <label
    className={`flex items-center justify-between ${
      isMobile ? "p-4 min-h-[64px]" : "p-3"
    } rounded-xl bg-neutral-100 dark:bg-navy-800 hover:bg-neutral-200 dark:hover:bg-navy-700 transition-colors cursor-pointer border border-neutral-200 dark:border-navy-700`}
  >
    <div className="flex items-center gap-3">
      {icon && (
        <Icon
          name={icon as any}
          className={`${isMobile ? "w-5 h-5" : "w-4 h-4"} text-brand-jade`}
        />
      )}
      <div>
        <Typography variant="body-sm" className="font-medium text-navy-900 dark:text-neutral-100">
          {label}
        </Typography>
        {description && (
          <Typography variant="caption" className="text-neutral-600 dark:text-neutral-400">
            {description}
          </Typography>
        )}
      </div>
    </div>
    <div
      className={`relative ${isMobile ? "w-14 h-8" : "w-11 h-6"} rounded-full transition-colors ${
        checked ? "bg-brand-jade" : "bg-neutral-300 dark:bg-neutral-600"
      }`}
      onClick={(e) => {
        e.preventDefault();
        triggerHapticFeedback("light");
        onChange(!checked);
      }}
    >
      <div
        className={`absolute top-1 ${isMobile ? "w-6 h-6" : "w-4 h-4"} bg-white rounded-full shadow transition-transform ${
          checked
            ? isMobile
              ? "translate-x-7"
              : "translate-x-6"
            : "translate-x-1"
        }`}
      />
    </div>
  </label>
);

// Selection Card Component
const SelectionCard: React.FC<{
  selected: boolean;
  onClick: () => void;
  icon?: string;
  label: string;
  isMobile?: boolean;
}> = ({ selected, onClick, icon, label, isMobile }) => (
  <button
    onClick={() => {
      triggerHapticFeedback("light");
      onClick();
    }}
    className={`${
      isMobile ? "p-4 min-h-[56px]" : "p-3"
    } rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 bg-white dark:bg-navy-800 ${
      selected
        ? "border-brand-jade bg-brand-jade/10 shadow-sm"
        : "border-neutral-200 dark:border-navy-600 hover:border-neutral-300 dark:hover:border-navy-500"
    }`}
  >
    {icon && (
      <Icon
        name={icon as any}
        className={`${isMobile ? "w-6 h-6" : "w-5 h-5"} ${selected ? "text-brand-jade" : "text-neutral-600 dark:text-neutral-400"}`}
      />
    )}
    <Typography
      variant="caption"
      className={`capitalize text-center ${selected ? "text-brand-jade font-medium" : "text-neutral-700 dark:text-neutral-300"}`}
    >
      {label}
    </Typography>
  </button>
);

// Action Button Component
const ActionButton: React.FC<{
  onClick: () => void;
  icon: string;
  label: string;
  description: string;
  variant?: "default" | "danger";
  disabled?: boolean;
  isMobile?: boolean;
}> = ({
  onClick,
  icon,
  label,
  description,
  variant = "default",
  disabled,
  isMobile,
}) => (
  <button
    onClick={() => {
      if (!disabled) {
        triggerHapticFeedback("medium");
        onClick();
      }
    }}
    disabled={disabled}
    className={`w-full flex items-center gap-4 ${isMobile ? "p-4" : "p-3"} rounded-xl transition-all border ${
      disabled
        ? "opacity-50 cursor-not-allowed bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
        : variant === "danger"
          ? "bg-error-50 dark:bg-error-900/20 hover:bg-error-100 dark:hover:bg-error-900/30 border-error-200 dark:border-error-800"
          : "bg-white dark:bg-navy-800 hover:bg-neutral-50 dark:hover:bg-navy-700 border-neutral-200 dark:border-navy-600"
    }`}
  >
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
        variant === "danger"
          ? "bg-error-100 dark:bg-error-900/30"
          : "bg-brand-jade/10"
      }`}
    >
      <Icon
        name={icon as any}
        className={`w-5 h-5 ${variant === "danger" ? "text-error-600" : "text-brand-jade"}`}
      />
    </div>
    <div className="flex-1 text-left">
      <Typography
        variant="body-sm"
        className={`font-medium ${variant === "danger" ? "text-error-700 dark:text-error-400" : "text-navy-900 dark:text-neutral-100"}`}
      >
        {label}
      </Typography>
      <Typography variant="caption" className="text-neutral-600 dark:text-neutral-400">
        {description}
      </Typography>
    </div>
    <Icon name="chevron-right" className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
  </button>
);

// ============================================================================
// Main Component
// ============================================================================

export const PlaybookSettingsModal: React.FC<PlaybookSettingsModalProps> = ({
  isOpen = true,
  onClose,
  playbook,
  playbooks = [],
  displaySettings = DEFAULT_DISPLAY_SETTINGS,
  defaultSettings = DEFAULT_SETTINGS,
  onSaveDisplaySettings,
  onSaveDefaultSettings,
  onRenamePlaybook,
  onDuplicatePlaybook,
  onExportPlaybook,
  onDeletePlaybook,
  onMergePlaybooks,
  onOpenPersonnel,
}) => {
  // State
  const [activeSection, setActiveSection] = useState<
    "general" | "display" | "data" | "danger"
  >("general");
  const [localDisplaySettings, setLocalDisplaySettings] =
    useState<DisplaySettings>(displaySettings);
  const [localDefaultSettings, setLocalDefaultSettings] =
    useState<DefaultSettings>(defaultSettings);
  const [playbookName, setPlaybookName] = useState(playbook?.name || "");
  const [playbookDescription, setPlaybookDescription] = useState(
    playbook?.description || ""
  );
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [selectedMergePlaybooks, setSelectedMergePlaybooks] = useState<
    string[]
  >([]);

  const isMobile = useIsMobile();
  const toast = useToast();

  // Sync with props
  useEffect(() => {
    setLocalDisplaySettings(displaySettings);
  }, [displaySettings]);

  useEffect(() => {
    setLocalDefaultSettings(defaultSettings);
  }, [defaultSettings]);

  useEffect(() => {
    setPlaybookName(playbook?.name || "");
    setPlaybookDescription(playbook?.description || "");
  }, [playbook]);

  // Handlers
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      // Save display settings
      if (onSaveDisplaySettings) {
        onSaveDisplaySettings(localDisplaySettings);
      }

      // Save default settings
      if (onSaveDefaultSettings) {
        onSaveDefaultSettings(localDefaultSettings);
      }

      // Save playbook name/description if changed
      if (
        onRenamePlaybook &&
        (playbookName !== playbook?.name ||
          playbookDescription !== playbook?.description)
      ) {
        await onRenamePlaybook(playbookName, playbookDescription);
      }

      triggerHapticFeedback("success");
      toast.success("Settings saved");
      onClose();
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }, [
    localDisplaySettings,
    localDefaultSettings,
    playbookName,
    playbookDescription,
    playbook,
    onSaveDisplaySettings,
    onSaveDefaultSettings,
    onRenamePlaybook,
    onClose,
    toast,
  ]);

  const handleDuplicate = useCallback(async () => {
    if (!onDuplicatePlaybook) return;
    try {
      await onDuplicatePlaybook();
      toast.success("Playbook duplicated");
      onClose();
    } catch {
      toast.error("Failed to duplicate playbook");
    }
  }, [onDuplicatePlaybook, toast, onClose]);

  const handleDelete = useCallback(async () => {
    if (!onDeletePlaybook) return;
    try {
      await onDeletePlaybook();
      toast.success("Playbook deleted");
      onClose();
    } catch {
      toast.error("Failed to delete playbook");
    }
  }, [onDeletePlaybook, toast, onClose]);

  const handleMerge = useCallback(async () => {
    if (!onMergePlaybooks || selectedMergePlaybooks.length === 0) return;
    try {
      await onMergePlaybooks(selectedMergePlaybooks);
      toast.success(
        `Merged ${selectedMergePlaybooks.length} playbook(s) into this one`
      );
      setShowMergeModal(false);
      setSelectedMergePlaybooks([]);
    } catch {
      toast.error("Failed to merge playbooks");
    }
  }, [onMergePlaybooks, selectedMergePlaybooks, toast]);

  // Section navigation
  const sections = [
    { id: "general" as const, label: "General", icon: "settings" },
    { id: "display" as const, label: "Display", icon: "monitor" },
    { id: "data" as const, label: "Data", icon: "database" },
    { id: "danger" as const, label: "Danger", icon: "alert-triangle" },
  ];

  // ============================================================================
  // Render Sections
  // ============================================================================

  const renderGeneralSection = () => (
    <div className="space-y-6">
      <SectionHeader
        icon="book"
        title="Playbook Details"
        subtitle="Basic information about your playbook"
      />

      {/* Playbook Name */}
      <div className="space-y-2">
        <Typography variant="label-md" className="text-navy-900 dark:text-neutral-100">Playbook Name</Typography>
        <Input
          value={playbookName}
          onChange={(e) => setPlaybookName(e.target.value)}
          placeholder="My Playbook"
          className={`w-full ${isMobile ? "h-12" : ""}`}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Typography variant="label-md" className="text-navy-900 dark:text-neutral-100">Description</Typography>
        <textarea
          value={playbookDescription}
          onChange={(e) => setPlaybookDescription(e.target.value)}
          placeholder="Optional description..."
          className={`w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-navy-600 bg-white dark:bg-navy-800 text-navy-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 resize-none focus:outline-none focus:ring-2 focus:ring-brand-jade focus:border-brand-jade ${
            isMobile ? "min-h-[100px]" : "min-h-[80px]"
          }`}
        />
      </div>

      {/* Stats */}
      {playbook && (
        <div className="p-4 rounded-xl bg-brand-jade/5 border border-brand-jade/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-jade/10 flex items-center justify-center">
                <Icon
                  name="clipboard-list"
                  className="w-5 h-5 text-brand-jade"
                />
              </div>
              <div>
                <Typography variant="headline-md" className="text-brand-jade">
                  {playbook.play_count}
                </Typography>
                <Typography variant="caption" color="muted">
                  Total Plays
                </Typography>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Default Settings */}
      <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <Typography variant="label-lg" className="text-navy-900 dark:text-neutral-100 font-semibold">
          Default Values for New Plays
        </Typography>

        <div className="space-y-3">
          <div className="space-y-1">
            <Typography variant="label-md" className="text-navy-800 dark:text-neutral-200">Default Personnel</Typography>
            <Dropdown
              value={localDefaultSettings.defaultPersonnel}
              onChange={(value) =>
                setLocalDefaultSettings((prev) => ({
                  ...prev,
                  defaultPersonnel: value,
                }))
              }
              options={[
                { value: "11", label: "11 Personnel (1 RB, 1 TE, 3 WR)" },
                { value: "12", label: "12 Personnel (1 RB, 2 TE, 2 WR)" },
                { value: "21", label: "21 Personnel (2 RB, 1 TE, 2 WR)" },
                { value: "22", label: "22 Personnel (2 RB, 2 TE, 1 WR)" },
                { value: "10", label: "10 Personnel (1 RB, 0 TE, 4 WR)" },
                { value: "20", label: "20 Personnel (2 RB, 0 TE, 3 WR)" },
                { value: "13", label: "13 Personnel (1 RB, 3 TE, 1 WR)" },
              ]}
              className={isMobile ? "h-12" : ""}
            />
          </div>

          <div className="space-y-1">
            <Typography variant="label-md" className="text-navy-800 dark:text-neutral-200">Default Formation</Typography>
            <Input
              value={localDefaultSettings.defaultFormation}
              onChange={(e) =>
                setLocalDefaultSettings((prev) => ({
                  ...prev,
                  defaultFormation: e.target.value,
                }))
              }
              placeholder="e.g., Spread, I-Form, Shotgun"
              className={`w-full ${isMobile ? "h-12" : ""}`}
            />
          </div>

          <div className="space-y-1">
            <Typography variant="label-md" className="text-navy-800 dark:text-neutral-200">Default Play Type</Typography>
            <Dropdown
              value={localDefaultSettings.defaultPlayType}
              onChange={(value) =>
                setLocalDefaultSettings((prev) => ({
                  ...prev,
                  defaultPlayType: value,
                }))
              }
              options={[
                { value: "Pass", label: "Pass" },
                { value: "Run", label: "Run" },
                { value: "RPO", label: "RPO" },
                { value: "Play Action", label: "Play Action" },
              ]}
              className={isMobile ? "h-12" : ""}
            />
          </div>
        </div>
      </div>

      {/* Personnel Builder Link */}
      {onOpenPersonnel && (
        <Button
          onClick={() => {
            triggerHapticFeedback("medium");
            onOpenPersonnel();
          }}
          variant="outline"
          className="w-full"
        >
          <Icon name="users" className="h-4 w-4 mr-2" />
          Configure Personnel Builder
        </Button>
      )}
    </div>
  );

  const renderDisplaySection = () => (
    <div className="space-y-6">
      <SectionHeader
        icon="monitor"
        title="Display Settings"
        subtitle="Customize how your playbook looks"
      />

      {/* Theme */}
      <div className="space-y-2">
        <Typography variant="label-md" className="text-navy-900 dark:text-neutral-100">Theme</Typography>
        <div className="grid grid-cols-3 gap-2">
          {(["light", "dark", "auto"] as const).map((theme) => (
            <SelectionCard
              key={theme}
              selected={localDisplaySettings.theme === theme}
              onClick={() =>
                setLocalDisplaySettings((prev) => ({ ...prev, theme }))
              }
              icon={
                theme === "light"
                  ? "sun"
                  : theme === "dark"
                    ? "moon"
                    : "monitor"
              }
              label={theme}
              isMobile={isMobile}
            />
          ))}
        </div>
      </div>

      {/* Grid Density */}
      <div className="space-y-2">
        <Typography variant="label-md" className="text-navy-900 dark:text-neutral-100">Grid Density</Typography>
        <div className="grid grid-cols-2 gap-2">
          {(["comfortable", "compact"] as const).map((density) => (
            <SelectionCard
              key={density}
              selected={localDisplaySettings.gridDensity === density}
              onClick={() =>
                setLocalDisplaySettings((prev) => ({
                  ...prev,
                  gridDensity: density,
                }))
              }
              icon={density === "comfortable" ? "maximize" : "minus"}
              label={density}
              isMobile={isMobile}
            />
          ))}
        </div>
      </div>

      {/* Default View */}
      <div className="space-y-2">
        <Typography variant="label-md" className="text-navy-900 dark:text-neutral-100">Default View</Typography>
        <div className="grid grid-cols-2 gap-2">
          {(["grid", "list"] as const).map((view) => (
            <SelectionCard
              key={view}
              selected={localDisplaySettings.defaultView === view}
              onClick={() =>
                setLocalDisplaySettings((prev) => ({
                  ...prev,
                  defaultView: view,
                }))
              }
              icon={view === "grid" ? "grid" : "list"}
              label={`${view} View`}
              isMobile={isMobile}
            />
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <ToggleSwitch
          checked={localDisplaySettings.showComplexity}
          onChange={(checked) =>
            setLocalDisplaySettings((prev) => ({
              ...prev,
              showComplexity: checked,
            }))
          }
          label="Show Complexity Ratings"
          description="Display play complexity indicators"
          icon="bar-chart"
          isMobile={isMobile}
        />

        <ToggleSwitch
          checked={localDisplaySettings.enableAutoTagging}
          onChange={(checked) =>
            setLocalDisplaySettings((prev) => ({
              ...prev,
              enableAutoTagging: checked,
            }))
          }
          label="Auto-Tagging"
          description="Automatically tag plays based on properties"
          icon="tag"
          isMobile={isMobile}
        />
      </div>
    </div>
  );

  const renderDataSection = () => (
    <div className="space-y-6">
      <SectionHeader
        icon="database"
        title="Data Management"
        subtitle="Export, import, and manage your playbook data"
      />

      <div className="space-y-3">
        {/* Export */}
        <ActionButton
          onClick={() => onExportPlaybook?.("json")}
          icon="download"
          label="Export Playbook"
          description="Download all plays as JSON or CSV"
          disabled={!onExportPlaybook}
          isMobile={isMobile}
        />

        {/* Duplicate */}
        <ActionButton
          onClick={handleDuplicate}
          icon="copy"
          label="Duplicate Playbook"
          description="Create a copy of this entire playbook"
          disabled={!onDuplicatePlaybook}
          isMobile={isMobile}
        />

        {/* Merge */}
        <ActionButton
          onClick={() => setShowMergeModal(true)}
          icon="folder"
          label="Merge Playbooks"
          description="Import plays from other playbooks into this one"
          disabled={!onMergePlaybooks || playbooks.length <= 1}
          isMobile={isMobile}
        />
      </div>

      {/* Merge Modal */}
      {showMergeModal && (
        <div className="fixed inset-0 z-modal bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <Typography variant="headline-md" className="text-navy-900 dark:text-neutral-100">
                Select Playbooks to Merge
              </Typography>
              <button
                onClick={() => {
                  setShowMergeModal(false);
                  setSelectedMergePlaybooks([]);
                }}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-navy-800 rounded-full transition-colors"
              >
                <Icon name="close" className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              </button>
            </div>

            <Typography variant="body-sm" className="mb-4 text-neutral-600 dark:text-neutral-400">
              Select one or more playbooks to merge into{" "}
              <strong className="text-navy-900 dark:text-neutral-100">{playbook?.name}</strong>. All plays will be copied
              (originals won&apos;t be deleted).
            </Typography>

            <div className="space-y-2 mb-6">
              {playbooks
                .filter((pb) => pb.id !== playbook?.id)
                .map((pb) => (
                  <label
                    key={pb.id}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                      selectedMergePlaybooks.includes(pb.id)
                        ? "bg-brand-jade/10 border-2 border-brand-jade"
                        : "bg-neutral-50 dark:bg-navy-800 hover:bg-neutral-100 dark:hover:bg-navy-700 border-2 border-transparent"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMergePlaybooks.includes(pb.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMergePlaybooks((prev) => [...prev, pb.id]);
                        } else {
                          setSelectedMergePlaybooks((prev) =>
                            prev.filter((id) => id !== pb.id)
                          );
                        }
                      }}
                      className="w-5 h-5 rounded border-neutral-300 dark:border-navy-600 accent-brand-jade"
                    />
                    <div className="flex-1">
                      <Typography variant="body-sm" className="font-medium text-navy-900 dark:text-neutral-100">
                        {pb.name}
                      </Typography>
                      <Typography variant="caption" className="text-neutral-600 dark:text-neutral-400">
                        {pb.play_count} plays
                      </Typography>
                    </div>
                  </label>
                ))}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowMergeModal(false);
                  setSelectedMergePlaybooks([]);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleMerge}
                variant="primary"
                className="flex-1"
                disabled={selectedMergePlaybooks.length === 0}
              >
                Merge{" "}
                {selectedMergePlaybooks.length > 0 &&
                  `(${selectedMergePlaybooks.length})`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDangerSection = () => (
    <div className="space-y-6">
      <SectionHeader
        icon="alert-triangle"
        title="Danger Zone"
        subtitle="Irreversible actions - proceed with caution"
        iconColor="text-error-500"
      />

      <div className="p-4 rounded-xl border-2 border-error-200 dark:border-error-800 bg-error-50 dark:bg-error-900/10">
        <div className="space-y-4">
          <div>
            <Typography
              variant="body-sm"
              className="font-semibold text-error-700 dark:text-error-400"
            >
              Delete This Playbook
            </Typography>
            <Typography variant="caption" color="muted" className="mt-1">
              Permanently delete &quot;{playbook?.name}&quot; and all{" "}
              {playbook?.play_count || 0} plays. This cannot be undone.
            </Typography>
          </div>

          {!showDeleteConfirm ? (
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="danger"
              className="w-full"
              disabled={!onDeletePlaybook}
            >
              <Icon name="trash-2" className="w-4 h-4 mr-2" />
              Delete Playbook
            </Button>
          ) : (
            <div className="space-y-3">
              <Typography
                variant="body-sm"
                className="text-error-600 font-medium"
              >
                Are you absolutely sure?
              </Typography>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="danger"
                  className="flex-1"
                >
                  Yes, Delete Forever
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // Main Content
  // ============================================================================

  const renderContent = () => (
    <div className="space-y-6">
      {/* Section Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => {
              triggerHapticFeedback("light");
              setActiveSection(section.id);
            }}
            className={`flex items-center gap-2 ${
              isMobile ? "px-4 py-3 min-h-[44px]" : "px-3 py-2"
            } rounded-full whitespace-nowrap transition-all ${
              activeSection === section.id
                ? section.id === "danger"
                  ? "bg-error-500 text-white shadow-md"
                  : "bg-brand-jade text-white shadow-md"
                : "bg-neutral-100 dark:bg-navy-800 text-navy-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-navy-700"
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

      {/* Section Content */}
      <div className="min-h-72">
        {activeSection === "general" && renderGeneralSection()}
        {activeSection === "display" && renderDisplaySection()}
        {activeSection === "data" && renderDataSection()}
        {activeSection === "danger" && renderDangerSection()}
      </div>

      {/* Action Buttons */}
      {activeSection !== "danger" && (
        <div
          className={`flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700 ${
            isMobile ? "sticky bottom-0 bg-white dark:bg-navy-900 pb-safe -mx-4 px-4" : ""
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
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      )}
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
              <div>
                <Typography variant="headline-md" className="text-navy-900 dark:text-neutral-100">Playbook Settings</Typography>
                {playbook && (
                  <Typography variant="caption" className="text-neutral-600 dark:text-neutral-400">
                    {playbook.name}
                  </Typography>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                triggerHapticFeedback("light");
                onClose();
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-tertiary"
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
