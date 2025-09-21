import React from "react";
import { Icon } from "../../ui/Icon/Icon";
import { Button } from "../../ui/Button/Button";
import { Badge } from "../../ui/Badge";
import { AdvancedSearchBar } from "../../playbook/AdvancedSearchBar";
import type { ServerPlaybookViewPreset } from "../../../types/playbookViewPreset";

export type PlaybookActionsBarProps = {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onQuickNewPracticeScript: () => void;
  onQuickNewInstall: () => void;
  serverPresets: ServerPlaybookViewPreset[];
  filterPresets: { id: string; name: string }[];
  serverPresetsLoading: boolean;
  activeServerPresetId?: string;
  activePresetId?: string;
  onApplyPreset: (id: string) => void;
  onRenamePreset: (id: string) => void;
  onDeletePreset: (id: string) => void;
  onSavePreset: () => void;
  enableBulkOperations: boolean;
  onToggleBulk: () => void;
  onExportCSV: () => void;
  onExportScope?: (scope: "selected" | "current" | "all") => void; // new scoped export handler
  onOpenImport: () => void;
  playsCreated: number;
  onOpenBuilder: () => void;
  onOpenSettings: () => void;
  selectedCount: number;
  onClearSelection: () => void;
  /** Optional slot rendered on the left side (after default left controls). */
  extraLeft?: React.ReactNode;
  /** Optional slot rendered at far right end (after default right controls). */
  extraRight?: React.ReactNode;
  recentViews?: { id: string; scope: "server" | "local" }[];
};

export const PlaybookActionsBar: React.FC<PlaybookActionsBarProps> = ({
  searchQuery,
  onSearchChange,
  onQuickNewPracticeScript,
  onQuickNewInstall,
  serverPresets,
  filterPresets,
  serverPresetsLoading,
  activeServerPresetId,
  activePresetId,
  onApplyPreset,
  onRenamePreset,
  onDeletePreset,
  onSavePreset,
  enableBulkOperations,
  onToggleBulk,
  onExportCSV,
  onExportScope,
  onOpenImport,
  playsCreated,
  onOpenBuilder,
  onOpenSettings,
  selectedCount,
  onClearSelection,
  extraLeft,
  extraRight,
  recentViews = [],
}) => {
  // Derive grouped options
  const recentServer = recentViews
    .filter((v) => v.scope === "server")
    .map((v) => serverPresets.find((p) => p.id === v.id))
    .filter(Boolean) as ServerPlaybookViewPreset[];
  const recentLocal = recentViews
    .filter((v) => v.scope === "local")
    .map((v) => filterPresets.find((p) => p.id === v.id))
    .filter(Boolean) as { id: string; name: string }[];
  return (
    <div className="surface-subtle border-b border-subtle sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {searchQuery !== undefined && onSearchChange && (
                <div className="w-full max-w-lg">
                  <AdvancedSearchBar
                    plays={[]}
                    searchQuery={searchQuery}
                    onSearchChange={onSearchChange}
                    placeholder="Search plays, formations, or tags..."
                  />
                </div>
              )}
              <Button
                onClick={onQuickNewPracticeScript}
                variant="secondary"
                size="xs"
                className="shrink-0"
              >
                <Icon name="plus" className="h-3 w-3 mr-1" /> New Practice
                Script
              </Button>
              <Button
                onClick={onQuickNewInstall}
                variant="ghost"
                size="xs"
                className="shrink-0"
              >
                <Icon name="plus" className="h-3 w-3 mr-1" /> New Install
              </Button>
              {extraLeft}
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <div className="flex items-center space-x-1">
                <select
                  value={activeServerPresetId || activePresetId || ""}
                  onChange={(e) => onApplyPreset(e.target.value)}
                  className="text-sm border-slate-300 rounded px-2 py-1 min-w-[240px]"
                  disabled={serverPresetsLoading}
                  aria-busy={serverPresetsLoading}
                >
                  <option value="" disabled={serverPresetsLoading}>
                    {serverPresetsLoading ? "Loading presets…" : "Presets…"}
                  </option>
                  {(recentServer.length > 0 || recentLocal.length > 0) && (
                    <optgroup label="Recent">
                      {recentServer.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ☁ (recent)
                        </option>
                      ))}
                      {recentLocal.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (local recent)
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {serverPresets.length > 0 && (
                    <optgroup label="Cloud">
                      {serverPresets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ☁
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {filterPresets.length > 0 && (
                    <optgroup label="Local">
                      {filterPresets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (local)
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
                {(activeServerPresetId || activePresetId) && (
                  <div className="flex items-center space-x-1">
                    <Button
                      onClick={() =>
                        activeServerPresetId
                          ? onRenamePreset(activeServerPresetId)
                          : onRenamePreset(activePresetId!)
                      }
                      variant="ghost"
                      size="xs"
                      className="px-2"
                      title="Rename preset"
                      disabled={serverPresetsLoading}
                    >
                      Rename
                    </Button>
                    <Button
                      onClick={() =>
                        activeServerPresetId
                          ? onDeletePreset(activeServerPresetId)
                          : onDeletePreset(activePresetId!)
                      }
                      variant="ghost"
                      size="xs"
                      className="px-2"
                      title="Delete preset"
                      disabled={serverPresetsLoading}
                    >
                      ✕
                    </Button>
                  </div>
                )}
              </div>
              <Button
                onClick={onSavePreset}
                variant="ghost"
                size="sm"
                className="px-3"
              >
                Save Preset
              </Button>
              <Button
                onClick={onToggleBulk}
                variant={enableBulkOperations ? "primary" : "ghost"}
                size="sm"
                title={
                  enableBulkOperations
                    ? "Disable bulk operations"
                    : "Enable bulk operations"
                }
                className="px-4 py-2"
              >
                <input
                  type="checkbox"
                  checked={enableBulkOperations}
                  onChange={() => {}}
                  className="h-4 w-4 mr-2 rounded border-slate-300 text-blue-600"
                />
                Bulk Edit
              </Button>
              <div className="relative group">
                <Button
                  onClick={() =>
                    onExportScope ? onExportScope("selected") : onExportCSV()
                  }
                  variant="subtle"
                  size="sm"
                  className="px-3 py-2 pr-2 flex items-center"
                  aria-haspopup="menu"
                  aria-expanded="false"
                >
                  <Icon name="download" className="h-4 w-4 mr-2" /> Export
                  <Icon
                    name="chevron-down"
                    className="h-3 w-3 ml-1 text-slate-500"
                  />
                </Button>
                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition pointer-events-none group-hover:pointer-events-auto absolute right-0 mt-1 min-w-[180px] surface-popover rounded-md shadow-lg border border-subtle py-1 z-40">
                  <Button
                    variant="ghost"
                    size="xs"
                    className="w-full justify-start !px-3 !py-1.5 text-xs"
                    onClick={() => onExportScope && onExportScope("selected")}
                  >
                    Selected Plays
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    className="w-full justify-start !px-3 !py-1.5 text-xs"
                    onClick={() => onExportScope && onExportScope("current")}
                  >
                    Current View
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    className="w-full justify-start !px-3 !py-1.5 text-xs"
                    onClick={() => onExportScope && onExportScope("all")}
                  >
                    All Plays
                  </Button>
                </div>
              </div>
              <Button
                onClick={onOpenImport}
                variant="subtle"
                size="sm"
                className="px-4 py-2"
              >
                <Icon name="upload" className="h-4 w-4 mr-2" /> Import CSV
              </Button>
              <Button
                onClick={onOpenSettings}
                variant="ghost"
                size="sm"
                className="px-4 py-2"
                title="Playbook Settings"
              >
                <Icon name="settings" className="h-4 w-4 mr-2" /> Settings
              </Button>
              <div className="relative">
                <Button
                  onClick={onOpenBuilder}
                  variant="primary"
                  size="sm"
                  className="px-4 py-2"
                >
                  <Icon name="plus" className="h-4 w-4 mr-2" /> New Play
                </Button>
                {playsCreated < 100 && (
                  <div className="absolute -top-2 -right-2">
                    <Badge variant="warning" size="sm">
                      {100 - playsCreated} to go!
                    </Badge>
                  </div>
                )}
              </div>
              {enableBulkOperations && (
                <div className="text-xs text-slate-600 flex items-center gap-3 ml-2">
                  <span>
                    Selected: <strong>{selectedCount}</strong>
                  </span>
                  <span className="text-slate-400">
                    (persists across searches)
                  </span>
                  {selectedCount > 0 && (
                    <Button
                      onClick={onClearSelection}
                      variant="ghost"
                      size="xs"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              )}
              {extraRight}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
