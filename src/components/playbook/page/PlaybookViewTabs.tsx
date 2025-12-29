/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */

import React, { useState } from "react";
import { Icon } from "../../ui/Icon/Icon";
import { Button } from "../../ui/Button/Button";
import { Badge, ProgressBadge } from "../../ui/Badge";
import { Typography } from "../../design-system/Typography";
import { TeamTypeToggle, type TeamType } from "../TeamTypeToggle";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";
import { PlaybookSelector } from "../PlaybookSelector";
import { CSVImportModal } from "../CSVImport/CSVImportModal";

export type CoachingView =
  | "playbook"
  | "practice-script"
  | "game-plan"
  | "analytics";

interface Playbook {
  id: string;
  team_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  play_count: number;
  created_at: string;
  updated_at: string;
}

export type PlaybookViewTabsProps = {
  currentView: CoachingView;
  onViewChange: (view: CoachingView) => void;
  currentTeamType?: TeamType;
  onTeamTypeChange?: (type: TeamType) => void;
  onOpenSettings?: () => void;
  onOpenBuilder?: () => void;
  onOpenBulkQuickAdd?: () => void;
  onExportCSV?: () => void;
  onOpenPersonnel?: () => void;
  onOpenHealth?: () => void;
  onNavigate?: (path: string) => void; // For breadcrumb navigation
  // Header content props
  title?: string;
  playsCreated: number;
  diagramCoverage: number;
  streakDays: number;
  // Playbook selector props
  playbooks?: Playbook[];
  activePlaybookId?: string;
  onPlaybookChange?: (playbookId: string) => void;
  onPlaybookUpdated?: () => void;
  teamId?: string;
  onCSVImportComplete?: () => void;
};

export const PlaybookViewTabs: React.FC<PlaybookViewTabsProps> = ({
  currentView,
  onViewChange,
  currentTeamType,
  onTeamTypeChange,
  onOpenSettings,
  onOpenBuilder,
  onOpenBulkQuickAdd,
  onExportCSV,
  onOpenPersonnel: _onOpenPersonnel,
  onOpenHealth,
  onNavigate,
  title,
  playsCreated,
  diagramCoverage,
  streakDays,
  playbooks,
  activePlaybookId,
  onPlaybookChange,
  onPlaybookUpdated,
  teamId,
  onCSVImportComplete,
}) => {
  // CSV Import state
  const [showCSVImport, setShowCSVImport] = useState(false);
  const playsTarget = 100;
  const completionPercent = Math.min(
    100,
    Math.round(((playsCreated || 0) / Math.max(playsTarget, 1)) * 100)
  );
  const hasPlaybookSelector =
    Array.isArray(playbooks) &&
    playbooks.length > 0 &&
    Boolean(activePlaybookId) &&
    Boolean(onPlaybookChange) &&
    Boolean(teamId);
  return (
    <div className="bg-white dark:bg-navy-900 border-b border-neutral-200 dark:border-navy-700 sticky top-0 z-30 backdrop-blur-md bg-white/95 dark:bg-navy-900/95">
      <div className="container-page px-6">
        {/* Breadcrumb */}
        <div className="pt-4 pb-2">
          <Typography variant="body-sm" className="text-neutral-500 dark:text-neutral-400">
            <span
              onClick={() => onNavigate?.("/dashboard")}
              className="hover:text-primary cursor-pointer transition-colors font-medium"
            >
              Dashboard
            </span>
            <span className="mx-2 text-neutral-300 dark:text-navy-600">/</span>
            <span className="text-primary font-semibold">Playbook</span>
          </Typography>
        </div>

        {/* Top row: Title, stats, team type selector, and search */}
        <div className="flex flex-col gap-4 py-3 overflow-visible md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-start gap-4 overflow-visible">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm overflow-visible">
              <Icon name="file" className="h-6 w-6" />
            </div>
            <div className="flex min-w-0 flex-col">
              <Typography
                variant="headline-md"
                as="h1"
                className="text-neutral-900 dark:text-white font-bold leading-tight line-clamp-2 md:line-clamp-1 tracking-tight"
              >
                {title || "Playbook"}
              </Typography>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 overflow-visible">
                <ProgressBadge progress={completionPercent}>
                  {playsCreated}/100 plays
                </ProgressBadge>
                <Badge variant="info" size="sm" className="bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                  Diagram {diagramCoverage}%
                </Badge>
                {streakDays > 0 && (
                  <Badge variant="success" size="sm" className="bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800">
                    🔥 {streakDays} day streak
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {currentTeamType && onTeamTypeChange && (
            <div className="w-full md:ml-6 md:w-auto">
              <TeamTypeToggle
                currentType={currentTeamType}
                onTypeChange={onTeamTypeChange}
              />
            </div>
          )}
        </div>

        {/* Bottom row: Navigation tabs and actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-0">
          {/* View Tabs - Left side */}
          <div className="flex flex-wrap items-center gap-1 -mb-px">
            <Button
              id="tab-playbook"
              role="tab"
              aria-controls="panel-playbook"
              aria-selected={currentView === "playbook"}
              tabIndex={currentView === "playbook" ? 0 : -1}
              onClick={() => onViewChange("playbook")}
              variant="ghost"
              size="sm"
              className={`px-4 py-3 rounded-t-lg rounded-b-none border-b-2 transition-all duration-200 ${
                currentView === "playbook"
                  ? "border-primary text-primary bg-primary/5 font-semibold"
                  : "border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-navy-800"
              }`}
              icon={
                <Icon
                  name="file"
                  className={
                    currentView === "playbook"
                      ? "text-primary"
                      : "text-neutral-400 group-hover:text-neutral-500"
                  }
                />
              }
              iconPosition="left"
            >
              <span className="hidden md:inline">Playbook</span>
            </Button>
            <Button
              id="tab-practice-script"
              role="tab"
              aria-controls="panel-practice-script"
              aria-selected={currentView === "practice-script"}
              tabIndex={currentView === "practice-script" ? 0 : -1}
              onClick={() => onViewChange("practice-script")}
              variant="ghost"
              size="sm"
              className={`px-4 py-3 rounded-t-lg rounded-b-none border-b-2 transition-all duration-200 ${
                currentView === "practice-script"
                  ? "border-primary text-primary bg-primary/5 font-semibold"
                  : "border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-navy-800"
              }`}
              icon={
                <Icon
                  name="clock"
                  className={
                    currentView === "practice-script"
                      ? "text-primary"
                      : "text-neutral-400 group-hover:text-neutral-500"
                  }
                />
              }
              iconPosition="left"
            >
              <span className="hidden md:inline">Practice Scripts</span>
            </Button>
            <Button
              id="tab-game-plan"
              role="tab"
              aria-controls="panel-game-plan"
              aria-selected={currentView === "game-plan"}
              tabIndex={currentView === "game-plan" ? 0 : -1}
              onClick={() => onViewChange("game-plan")}
              variant="ghost"
              size="sm"
              className={`px-4 py-3 rounded-t-lg rounded-b-none border-b-2 transition-all duration-200 ${
                currentView === "game-plan"
                  ? "border-primary text-primary bg-primary/5 font-semibold"
                  : "border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-navy-800"
              }`}
              icon={
                <Icon
                  name="users"
                  className={
                    currentView === "game-plan"
                      ? "text-primary"
                      : "text-neutral-400 group-hover:text-neutral-500"
                  }
                />
              }
              iconPosition="left"
            >
              <span className="hidden md:inline">Game Plans</span>
            </Button>
            <Button
              id="tab-analytics"
              role="tab"
              aria-controls="panel-analytics"
              aria-selected={currentView === "analytics"}
              tabIndex={currentView === "analytics" ? 0 : -1}
              onClick={() => onViewChange("analytics")}
              variant="ghost"
              size="sm"
              className={`px-4 py-3 rounded-t-lg rounded-b-none border-b-2 transition-all duration-200 ${
                currentView === "analytics"
                  ? "border-primary text-primary bg-primary/5 font-semibold"
                  : "border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-navy-800"
              }`}
              icon={
                <Icon
                  name="bar-chart"
                  className={
                    currentView === "analytics"
                      ? "text-primary"
                      : "text-neutral-400 group-hover:text-neutral-500"
                  }
                />
              }
              iconPosition="left"
            >
              <span className="hidden md:inline">Analytics</span>
            </Button>
          </div>

          {/* Action Buttons - Right side */}
          <div className="flex w-full flex-wrap items-center gap-2 overflow-visible md:w-auto">
            {/* Formation Library Button */}
            <Button
              onClick={() => {
                triggerHapticFeedback("medium");
                onNavigate?.("/playbook/formations");
              }}
              variant="primary"
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
              icon={<Icon name="grid" className="h-4 w-4" />}
              iconPosition="left"
            >
              <span className="hidden lg:inline">Formation Library</span>
              <span className="lg:hidden">Formations</span>
            </Button>

            {/* Personnel Library Button */}
            <Button
              onClick={() => {
                triggerHapticFeedback("medium");
                onNavigate?.("/playbook/personnel");
              }}
              variant="primary"
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
              icon={<Icon name="users" className="h-4 w-4" />}
              iconPosition="left"
            >
              <span className="hidden lg:inline">Personnel Library</span>
              <span className="lg:hidden">Personnel</span>
            </Button>

            {/* Playbook Selector - Compact inline version */}
            {hasPlaybookSelector && (
              <div className="min-w-56 flex-1 sm:flex-none">
                <PlaybookSelector
                  playbooks={playbooks}
                  activePlaybookId={activePlaybookId as string}
                  onPlaybookChange={onPlaybookChange as (id: string) => void}
                  onPlaybookUpdated={onPlaybookUpdated}
                  teamId={teamId as string}
                />
              </div>
            )}

            {/* Playbook Health */}
            {onOpenHealth && (
              <Button
                onClick={() => {
                  triggerHapticFeedback("light");
                  onOpenHealth();
                }}
                variant="ghost"
                size="sm"
                className="w-11 h-11 !p-0 flex items-center justify-center bg-accent-50 hover:bg-accent-100 dark:bg-accent-900/20 dark:hover:bg-accent-900/30 text-accent-600 dark:text-accent-500 rounded-xl transition-all duration-200 overflow-visible"
                title="Playbook Health & Data Quality"
              >
                <Icon name="activity" className="h-5 w-5" />
              </Button>
            )}

            {/* Settings */}
            {onOpenSettings && (
              <Button
                onClick={() => {
                  triggerHapticFeedback("light");
                  onOpenSettings();
                }}
                variant="ghost"
                size="sm"
                className="h-11 px-4 !py-0 flex items-center gap-2 bg-status-info-bg/80 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-xl transition-all duration-200"
                title="Playbook Settings"
              >
                <Icon name="settings" className="h-5 w-5" />
                <span className="hidden lg:inline">Settings</span>
              </Button>
            )}

            {/* New Play */}
            {onOpenBuilder && (
              <Button
                onClick={() => {
                  triggerHapticFeedback("light");
                  onOpenBuilder();
                }}
                variant="primary"
                size="sm"
                className="h-11 px-4 !py-0 flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-jade-600 hover:from-emerald-700 hover:to-jade-700 text-white rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200"
                title="New Play"
              >
                <Icon name="plus" className="h-5 w-5" />
                <span className="hidden lg:inline">New Play</span>
              </Button>
            )}

            {/* CSV Import */}
            {activePlaybookId && (
              <div className="relative">
                {onOpenBulkQuickAdd && (
                  <Button
                    onClick={() => {
                      triggerHapticFeedback("light");
                      onOpenBulkQuickAdd();
                    }}
                    variant="secondary"
                    size="sm"
                    className="h-11 px-4 !py-0 flex items-center gap-2 bg-neutral-50 hover:bg-neutral-100 dark:bg-navy-900/20 dark:hover:bg-navy-900/30 text-navy-900 dark:text-neutral-200 rounded-xl transition-all duration-200 mr-2"
                    title="Bulk quick add plays"
                  >
                    <Icon name="plus" className="h-5 w-5" />
                    <span className="hidden lg:inline">Bulk Quick Add</span>
                  </Button>
                )}

                {onExportCSV && (
                  <Button
                    onClick={() => {
                      triggerHapticFeedback("light");
                      onExportCSV();
                    }}
                    variant="secondary"
                    size="sm"
                    className="h-11 px-4 !py-0 flex items-center gap-2 bg-neutral-50 hover:bg-neutral-100 dark:bg-navy-900/20 dark:hover:bg-navy-900/30 text-navy-900 dark:text-neutral-200 rounded-xl transition-all duration-200 mr-2"
                    title="Export playbook plays to CSV"
                  >
                    <Icon name="download" className="h-5 w-5" />
                    <span className="hidden lg:inline">Export CSV</span>
                  </Button>
                )}

                <Button
                  onClick={() => {
                    triggerHapticFeedback("light");
                    setShowCSVImport(true);
                  }}
                  variant="secondary"
                  size="sm"
                  className="h-11 px-4 !py-0 flex items-center gap-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-xl transition-all duration-200"
                  title="Import plays from CSV"
                >
                  <Icon name="upload" className="h-5 w-5" />
                  <span className="hidden lg:inline">Import CSV</span>
                </Button>

                {/* CSV Import Modal */}
                {showCSVImport && (
                  <CSVImportModal
                    isOpen={showCSVImport}
                    onClose={() => setShowCSVImport(false)}
                    playbookId={activePlaybookId}
                    onImportComplete={() => {
                      setShowCSVImport(false);
                      onCSVImportComplete?.();
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
