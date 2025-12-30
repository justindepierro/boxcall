/**
 * PlaybookSettingsModal - Streamlined playbook configuration
 *
 * Clean, focused settings modal with:
 * - Playbook details (name, description)
 * - Default values for new plays
 * - Quick actions (export, duplicate, libraries)
 * - Danger zone (delete)
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Icon, type IconName } from "../ui/Icon";
import { Button } from "../ui/Button/Button";
import { Typography } from "../design-system/Typography";
import { BottomSheet } from "../BottomSheet";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Dropdown } from "../ui/Dropdown";
import { triggerHapticFeedback } from "../../lib/hapticFeedback";
import { useIsMobile } from "../../hooks/useBreakpoint";
import { useToast } from "../../hooks/useToast";
import type { Play } from "../../types/play";

// ============================================================================
// Types
// ============================================================================

interface PlaybookInfo {
  id: string;
  name: string;
  description?: string;
  play_count: number;
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
  plays?: Play[];
  defaultSettings?: DefaultSettings;
  onSaveDefaultSettings?: (settings: DefaultSettings) => void;
  onRenamePlaybook?: (name: string, description?: string) => Promise<void>;
  onDuplicatePlaybook?: () => Promise<void>;
  onExportPlaybook?: (format: "json" | "csv") => void;
  onDeletePlaybook?: () => Promise<void>;
  onOpenPersonnel?: () => void;
  onOpenFormationLibrary?: () => void;
  onOpenMergePlaybooks?: () => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate the most frequently used value from an array of plays
 */
function getMostUsedValue<K extends keyof Play>(
  plays: Play[],
  field: K,
  fallback: string
): string {
  if (!plays || plays.length === 0) return fallback;

  const counts = new Map<string, number>();

  plays.forEach((play) => {
    const value = play[field];
    if (value && typeof value === "string" && value.trim()) {
      const normalized = value.trim();
      counts.set(normalized, (counts.get(normalized) || 0) + 1);
    }
  });

  if (counts.size === 0) return fallback;

  let mostUsed = fallback;
  let maxCount = 0;

  counts.forEach((count, value) => {
    if (count > maxCount) {
      maxCount = count;
      mostUsed = value;
    }
  });

  return mostUsed;
}

/**
 * Calculate suggested defaults based on playbook usage patterns
 */
function calculateSuggestedDefaults(plays: Play[]): DefaultSettings {
  return {
    defaultPersonnel: getMostUsedValue(plays, "personnel", "11"),
    defaultFormation: getMostUsedValue(plays, "formation", ""),
    defaultPlayType: getMostUsedValue(plays, "p_type", "Pass"),
  };
}

// ============================================================================
// Sub-Components
// ============================================================================

/** Quick action tile for navigation */
const QuickActionTile: React.FC<{
  icon: IconName;
  label: string;
  description: string;
  onClick: () => void;
  isMobile?: boolean;
}> = ({ icon, label, description, onClick, isMobile }) => (
  <button
    onClick={() => {
      triggerHapticFeedback("light");
      onClick();
    }}
    className={`group w-full flex items-center gap-4 ${isMobile ? "p-4" : "p-3"} rounded-xl bg-neutral-50 dark:bg-navy-800/50 hover:bg-neutral-100 dark:hover:bg-navy-800 border border-neutral-200 dark:border-navy-700 hover:border-brand-jade/50 transition-all`}
  >
    <div className="w-10 h-10 rounded-xl bg-brand-jade/10 group-hover:bg-brand-jade/20 flex items-center justify-center flex-shrink-0 transition-colors">
      <Icon name={icon} className="w-5 h-5 text-brand-jade" />
    </div>
    <div className="flex-1 text-left">
      <Typography
        variant="body-sm"
        className="font-medium text-navy-900 dark:text-neutral-100"
      >
        {label}
      </Typography>
      <Typography
        variant="caption"
        className="text-neutral-500 dark:text-neutral-400"
      >
        {description}
      </Typography>
    </div>
    <Icon
      name="chevron-right"
      className="w-4 h-4 text-neutral-400 group-hover:text-brand-jade transition-colors"
    />
  </button>
);

/** Stats display card */
const StatsCard: React.FC<{
  count: number;
  label: string;
}> = ({ count, label }) => (
  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-brand-jade/10 to-brand-jade/5 border border-brand-jade/20">
    <div className="w-12 h-12 rounded-full bg-brand-jade/20 flex items-center justify-center">
      <Icon name="clipboard-list" className="w-6 h-6 text-brand-jade" />
    </div>
    <div>
      <Typography variant="headline-lg" className="text-brand-jade font-bold">
        {count}
      </Typography>
      <Typography
        variant="caption"
        className="text-neutral-600 dark:text-neutral-400"
      >
        {label}
      </Typography>
    </div>
  </div>
);

/** Form field wrapper */
const FormField: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <div className="space-y-2">
    <Typography
      variant="label-md"
      className="text-navy-800 dark:text-neutral-200 font-medium"
    >
      {label}
    </Typography>
    {children}
  </div>
);

/** Section header with icon */
const SectionTitle: React.FC<{
  icon: IconName;
  title: string;
  subtitle?: string;
  iconColor?: string;
}> = ({ icon, title, subtitle, iconColor = "text-brand-jade" }) => (
  <div className="space-y-0.5">
    <div className="flex items-center gap-2">
      <Icon name={icon} className={`w-5 h-5 ${iconColor}`} />
      <Typography
        variant="label-lg"
        className="text-navy-900 dark:text-neutral-100 font-semibold"
      >
        {title}
      </Typography>
    </div>
    {subtitle && (
      <Typography
        variant="caption"
        className="text-neutral-500 dark:text-neutral-400 pl-7"
      >
        {subtitle}
      </Typography>
    )}
  </div>
);

// ============================================================================
// Main Component
// ============================================================================

/* eslint-disable max-lines-per-function, complexity -- Settings modal with rich form sections and responsive layout */
export const PlaybookSettingsModal: React.FC<PlaybookSettingsModalProps> = ({
  isOpen = true,
  onClose,
  playbook,
  plays = [],
  defaultSettings,
  onSaveDefaultSettings,
  onRenamePlaybook,
  onDuplicatePlaybook,
  onExportPlaybook,
  onDeletePlaybook,
  onOpenPersonnel,
  onOpenFormationLibrary,
  onOpenMergePlaybooks,
}) => {
  // Calculate suggested defaults from playbook usage
  const suggestedDefaults = useMemo(
    () => calculateSuggestedDefaults(plays),
    [plays]
  );

  const effectiveDefaults = defaultSettings ?? suggestedDefaults;

  // State
  const [localDefaultSettings, setLocalDefaultSettings] =
    useState<DefaultSettings>(effectiveDefaults);
  const [playbookName, setPlaybookName] = useState(playbook?.name || "");
  const [playbookDescription, setPlaybookDescription] = useState(
    playbook?.description || ""
  );
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDangerZone, setShowDangerZone] = useState(false);

  const isMobile = useIsMobile();
  const toast = useToast();

  // Sync with props
  useEffect(() => {
    setLocalDefaultSettings(effectiveDefaults);
  }, [effectiveDefaults]);

  useEffect(() => {
    setPlaybookName(playbook?.name || "");
    setPlaybookDescription(playbook?.description || "");
  }, [playbook]);

  // Handlers
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      if (onSaveDefaultSettings) {
        onSaveDefaultSettings(localDefaultSettings);
      }

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
    localDefaultSettings,
    playbookName,
    playbookDescription,
    playbook,
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

  // ============================================================================
  // Main Content
  // ============================================================================

  const renderContent = () => (
    <div className="space-y-6">
      {/* Playbook Stats */}
      {playbook && (
        <StatsCard count={playbook.play_count} label="Total Plays" />
      )}

      {/* Playbook Details */}
      <div className="space-y-4">
        <SectionTitle icon="book" title="Playbook Details" />

        <FormField label="Name">
          <Input
            value={playbookName}
            onChange={(e) => setPlaybookName(e.target.value)}
            placeholder="My Playbook"
            className={`w-full ${isMobile ? "h-12" : ""}`}
          />
        </FormField>

        <FormField label="Description">
          <textarea
            value={playbookDescription}
            onChange={(e) => setPlaybookDescription(e.target.value)}
            placeholder="Optional description..."
            className={`w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-navy-600 bg-white dark:bg-navy-800 text-navy-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 resize-none focus:outline-none focus:ring-2 focus:ring-brand-jade/50 focus:border-brand-jade transition-all ${
              isMobile ? "min-h-[100px]" : "min-h-[80px]"
            }`}
          />
        </FormField>
      </div>

      {/* Default Values */}
      <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-navy-700">
        <SectionTitle
          icon="settings"
          title="Default Values"
          subtitle="Pre-fill these values when creating new plays"
        />

        <div className="grid gap-3">
          <FormField label="Personnel">
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
          </FormField>

          <FormField label="Formation">
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
          </FormField>

          <FormField label="Play Type">
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
          </FormField>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-navy-700">
        <SectionTitle icon="zap" title="Quick Actions" />

        <div className="space-y-2">
          {onOpenPersonnel && (
            <QuickActionTile
              icon="users"
              label="Personnel Builder"
              description="Configure custom personnel groupings"
              onClick={onOpenPersonnel}
              isMobile={isMobile}
            />
          )}

          {onOpenFormationLibrary && (
            <QuickActionTile
              icon="grid"
              label="Formation Library"
              description="Manage team formations and templates"
              onClick={onOpenFormationLibrary}
              isMobile={isMobile}
            />
          )}

          {onExportPlaybook && (
            <QuickActionTile
              icon="download"
              label="Export Playbook"
              description="Download plays as JSON or CSV"
              onClick={() => onExportPlaybook("json")}
              isMobile={isMobile}
            />
          )}

          {onDuplicatePlaybook && (
            <QuickActionTile
              icon="copy"
              label="Duplicate Playbook"
              description="Create a copy with all plays"
              onClick={handleDuplicate}
              isMobile={isMobile}
            />
          )}

          {onOpenMergePlaybooks && (
            <QuickActionTile
              icon="copy"
              label="Merge Playbooks"
              description="Combine multiple playbooks into one"
              onClick={onOpenMergePlaybooks}
              isMobile={isMobile}
            />
          )}
        </div>
      </div>

      {/* Danger Zone Toggle */}
      <div className="pt-4 border-t border-neutral-200 dark:border-navy-700">
        <button
          onClick={() => {
            triggerHapticFeedback("light");
            setShowDangerZone(!showDangerZone);
          }}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-error-50 dark:hover:bg-error-900/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Icon name="alert-triangle" className="w-5 h-5 text-error-500" />
            <Typography
              variant="label-md"
              className="text-error-600 dark:text-error-400 font-medium"
            >
              Danger Zone
            </Typography>
          </div>
          <Icon
            name={showDangerZone ? "chevron-up" : "chevron-down"}
            className="w-4 h-4 text-error-400"
          />
        </button>

        {showDangerZone && (
          <div className="mt-3 p-4 rounded-xl border-2 border-error-200 dark:border-error-800 bg-error-50/50 dark:bg-error-900/10">
            <div className="space-y-3">
              <div>
                <Typography
                  variant="body-sm"
                  className="font-semibold text-error-700 dark:text-error-400"
                >
                  Delete Playbook
                </Typography>
                <Typography
                  variant="caption"
                  className="text-error-600/80 dark:text-error-400/80 mt-0.5"
                >
                  Permanently delete &quot;{playbook?.name}&quot; and all{" "}
                  {playbook?.play_count || 0} plays.
                </Typography>
              </div>

              {!showDeleteConfirm ? (
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="danger"
                  size={isMobile ? "lg" : "md"}
                  className="w-full"
                  disabled={!onDeletePlaybook}
                >
                  <Icon name="trash-2" className="w-4 h-4 mr-2" />
                  Delete Playbook
                </Button>
              ) : (
                <div className="space-y-3 pt-2 border-t border-error-200 dark:border-error-800">
                  <Typography
                    variant="body-sm"
                    className="text-error-600 dark:text-error-400 font-medium text-center"
                  >
                    This cannot be undone. Are you sure?
                  </Typography>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowDeleteConfirm(false)}
                      variant="outline"
                      size={isMobile ? "lg" : "md"}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDelete}
                      variant="danger"
                      size={isMobile ? "lg" : "md"}
                      className="flex-1"
                    >
                      Yes, Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Save Actions */}
      <div
        className={`flex gap-3 pt-4 border-t border-neutral-200 dark:border-navy-700 ${
          isMobile
            ? "sticky bottom-0 bg-white dark:bg-navy-900 pb-safe -mx-4 px-4 pt-4"
            : ""
        }`}
      >
        <Button
          onClick={() => {
            triggerHapticFeedback("light");
            onClose();
          }}
          variant="outline"
          size={isMobile ? "lg" : "md"}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="primary"
          size={isMobile ? "lg" : "md"}
          className="flex-1"
          disabled={saving}
        >
          {saving ? (
            <>
              <Icon name="loader" className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
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
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-jade to-brand-jade/80 flex items-center justify-center shadow-lg shadow-brand-jade/20">
                <Icon name="settings" className="w-6 h-6 text-white" />
              </div>
              <div>
                <Typography
                  variant="headline-md"
                  className="text-navy-900 dark:text-neutral-100"
                >
                  Settings
                </Typography>
                {playbook && (
                  <Typography
                    variant="caption"
                    className="text-neutral-500 dark:text-neutral-400"
                  >
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
              className="w-10 h-10 rounded-full flex items-center justify-center bg-neutral-100 dark:bg-navy-800 hover:bg-neutral-200 dark:hover:bg-navy-700 transition-colors"
            >
              <Icon
                name="close"
                className="w-5 h-5 text-neutral-600 dark:text-neutral-400"
              />
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
      size="md"
    >
      <div className="p-6">{renderContent()}</div>
    </Modal>
  );
};
/* eslint-enable max-lines-per-function, complexity */
