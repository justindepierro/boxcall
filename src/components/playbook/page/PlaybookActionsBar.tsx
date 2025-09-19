import React from "react";
import { Icon } from "../../ui/Icon";
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
  onOpenQuickPlayForm: () => void;
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
  onOpenQuickPlayForm,
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
    <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          {/* Main Actions Row */}
          <div className="flex items-center justify-between gap-4 mb-4">
            {/* Left side - Search and Quick Actions */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {searchQuery !== undefined && onSearchChange && (
                <div className="w-full max-w-md">
                  <AdvancedSearchBar
                    plays={[]}
                    searchQuery={searchQuery}
                    onSearchChange={onSearchChange}
                    placeholder="Search plays, formations, or tags..."
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button
                  onClick={onQuickNewPracticeScript}
                  variant="secondary"
                  size="sm"
                  className="whitespace-nowrap"
                >
                  <Icon name="plus" className="h-4 w-4 mr-2" />
                  Practice Script
                </Button>
                <Button
                  onClick={onQuickNewInstall}
                  variant="ghost"
                  size="sm"
                  className="whitespace-nowrap"
                >
                  <Icon name="plus" className="h-4 w-4 mr-2" />
                  Install
                </Button>
              </div>

              {extraLeft}
            </div>

            {/* Right side - Primary Actions */}
            <div className="flex items-center gap-3">
              {/* Export/Import Group */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={onOpenImport}
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap"
                >
                  <Icon name="upload" className="h-4 w-4 mr-2" />
                  Import CSV
                </Button>

                <div className="relative group">
                  <Button
                    onClick={() =>
                      onExportScope ? onExportScope("selected") : onExportCSV()
                    }
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap pr-3"
                    aria-haspopup="menu"
                    aria-expanded="false"
                  >
                    <Icon name="download" className="h-4 w-4 mr-2" />
                    Export
                    <Icon name="chevron-down" className="h-3 w-3 ml-2" />
                  </Button>

                  {/* Dropdown Menu */}
                  <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all pointer-events-none group-hover:pointer-events-auto absolute right-0 mt-2 min-w-[160px] bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-40">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start px-3 py-2 text-sm"
                      onClick={() => onExportScope && onExportScope("selected")}
                    >
                      Selected Plays
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start px-3 py-2 text-sm"
                      onClick={() => onExportScope && onExportScope("current")}
                    >
                      Current View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start px-3 py-2 text-sm"
                      onClick={() => onExportScope && onExportScope("all")}
                    >
                      All Plays
                    </Button>
                  </div>
                </div>
              </div>

              {/* New Play Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={onOpenQuickPlayForm}
                  variant="primary"
                  size="sm"
                  className="whitespace-nowrap font-medium"
                >
                  <Icon name="plus" className="h-4 w-4 mr-2" />
                  New Play
                  {playsCreated < 100 && (
                    <Badge variant="warning" size="sm" className="ml-2 text-xs">
                      {100 - playsCreated} left
                    </Badge>
                  )}
                </Button>
                <Button
                  onClick={onOpenBuilder}
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap"
                  title="Create play diagram"
                >
                  <Icon name="edit" className="h-4 w-4 mr-2" />
                  Diagram
                </Button>
              </div>
            </div>
          </div>

          {/* Secondary Actions Row */}
          <div className="flex items-center justify-between gap-4">
            {/* Left side - Presets and Filters */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-600 font-medium">
                  View:
                </label>
                <select
                  value={activeServerPresetId || activePresetId || ""}
                  onChange={(e) => onApplyPreset(e.target.value)}
                  className="text-sm border border-slate-300 rounded-md px-3 py-1.5 min-w-[200px] bg-white"
                  disabled={serverPresetsLoading}
                  aria-busy={serverPresetsLoading}
                >
                  <option value="" disabled={serverPresetsLoading}>
                    {serverPresetsLoading ? "Loading presets…" : "Choose view…"}
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
                          {p.name} (recent)
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
                          {p.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>

                {(activeServerPresetId || activePresetId) && (
                  <div className="flex items-center gap-1">
                    <Button
                      onClick={() =>
                        activeServerPresetId
                          ? onRenamePreset(activeServerPresetId)
                          : onRenamePreset(activePresetId!)
                      }
                      variant="ghost"
                      size="xs"
                      className="px-2 text-xs"
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
                      className="px-2 text-xs"
                      title="Delete preset"
                      disabled={serverPresetsLoading}
                    >
                      ✕
                    </Button>
                  </div>
                )}

                <Button
                  onClick={onSavePreset}
                  variant="ghost"
                  size="sm"
                  className="text-sm"
                >
                  Save View
                </Button>
              </div>
            </div>

            {/* Right side - Bulk Operations */}
            <div className="flex items-center gap-3">
              <Button
                onClick={onToggleBulk}
                variant={enableBulkOperations ? "primary" : "ghost"}
                size="sm"
                className="whitespace-nowrap"
              >
                <input
                  type="checkbox"
                  checked={enableBulkOperations}
                  onChange={() => {}}
                  className="h-4 w-4 mr-2 rounded border-slate-300 text-blue-600"
                />
                Bulk Edit
              </Button>

              {enableBulkOperations && (
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <span>
                    <strong>{selectedCount}</strong> selected
                  </span>
                  {selectedCount > 0 && (
                    <Button
                      onClick={onClearSelection}
                      variant="ghost"
                      size="xs"
                      className="text-xs"
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
