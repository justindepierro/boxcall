// Clean consolidated PlaybookPage implementation (legacy duplicated fragments removed)
import React from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Users } from "lucide-react";
import { PlayGrid } from "../components/playbook/PlayGrid";
import { PlaybookGlossary } from "../components/playbook/PlaybookGlossary";
import { AdvancedFilters } from "../components/playbook/AdvancedFilters";
import MobileDrawer from "../components/mobile/MobileDrawer";
import { PlayFilters } from "../components/playbook/PlayFilters";
import { BulkActionsToolbar } from "../components/playbook/BulkActionsToolbar";
import { PlayBuilderCore } from "../components/playbook/PlayBuilder";
import { CSVImportModal } from "../components/playbook/CSVImport/CSVImportModal";
import { PracticeScriptService } from "../services/practiceScriptService";
import { CSVService } from "../services/csv";
import { PlaysService } from "../services/playsService";
import { PlaysDomainService } from "../domain/playsDomainService";
import { Icon } from "../components/ui/Icon/Icon";
import { Typography } from "../components/design-system/Typography";
import { markFirstPlayCreated } from "../components/onboarding/activationHelpers";
// telemetry already imported above in original file; avoid duplicate import (cleanup)
import {
  listPresets,
  createPreset,
  deletePreset,
  applyPreset,
  updatePreset,
} from "../utils/playbookFilterPresets";
import {
  listServerPresets,
  createServerPreset,
  updateServerPreset,
  deleteServerPreset,
} from "../utils/serverPlaybookViewPresets";
import type { Play } from "../types/play";
import { AchievementBadge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button/Button";
import { PlaybookHeader } from "../components/playbook/page/PlaybookHeader";
import { PlaybookActionsBar } from "../components/playbook/page/PlaybookActionsBar";
import ActiveFilterChips from "../components/playbook/page/ActiveFilterChips";
import BulkTaggingModal from "../components/playbook/BulkTaggingModal";
import { PlaybookViewTabs } from "../components/playbook/page/PlaybookViewTabs";
import { PlaybookProvider, usePlaybook } from "../contexts/PlaybookContext";
import { useConfirm } from "../contexts/ConfirmContext";
import { useUndoQueue } from "../contexts/UndoQueueContext";
import { useToast } from "../hooks/useToast";
import { mapError } from "../domain/errors/domainErrorMapper";
import { telemetry } from "../telemetry/dispatcher";
import { TelemetryEventTypes } from "../telemetry/events";
import {
  getPlayCategory,
  playMatchesSubcategory,
} from "../utils/playbook-categories";
import { getPlayFlags } from "@utils/localPlayFlags";

const PlaybookPageInner: React.FC = () => {
  const { state, dispatch } = usePlaybook();
  const navigate = useNavigate();
  const {
    success: toastSuccess,
    error: toastError,
    info: toastInfo,
  } = useToast();
  const confirmDialog = useConfirm();
  const { pushUndo } = useUndoQueue();

  // Bulk Tagging Modal state
  const [showBulkTagging, setShowBulkTagging] = React.useState(false);

  // Achievement handling
  const achievementTitles: Record<number, string> = {
    1: "First Play Created!",
    10: "Play Designer",
    25: "Playbook Builder",
    50: "Master Strategist",
    100: "Coaching Legend",
  };
  const handlePlayCreated = () => {
    const newCount = state.playsCreated + 1;
    dispatch({ type: "SET_PLAYS_CREATED", count: newCount });
    if (achievementTitles[newCount]) {
      dispatch({
        type: "TRIGGER_CELEBRATION",
        achievement: achievementTitles[newCount],
      });
      setTimeout(() => dispatch({ type: "HIDE_CELEBRATION" }), 3000);
    }
  };

  const refreshPlays = () => dispatch({ type: "INCREMENT_REFRESH" });

  // Play creation
  const handleSavePlay = async (playData: Partial<Play>) => {
    try {
      const { play: newPlay } = await PlaysDomainService.createPlay(playData);
      if (newPlay?.id) {
        markFirstPlayCreated(newPlay.id);
        telemetry.enqueue({
          type: TelemetryEventTypes.PlayCreate,
          data: { playId: newPlay.id, source: "builder", hasDiagram: false },
        });
      } else {
        markFirstPlayCreated();
      }
      handleCloseBuilder();
      refreshPlays();
      // Placeholder diagram coverage update
      dispatch({
        type: "SET_DIAGRAM_COVERAGE",
        coverage: Math.min(
          100,
          Math.round(((state.playsCreated + 1) / (state.playsCreated + 1)) * 50)
        ),
      });
      handlePlayCreated();
      toastSuccess(`Play "${playData.play_name}" saved!`);
    } catch (e) {
      const mapped = mapError(e);
      console.error("Play save failed", e);
      toastError(mapped.userMessage);
      telemetry.enqueue({
        type: TelemetryEventTypes.ErrorBoundary,
        data: {
          code: mapped.code,
          area: "play.save",
          retryable: mapped.retryable,
        },
      });
    }
  };

  // Workflow actions
  const handleAddToPracticeScript = async (play: Play) => {
    try {
      const script =
        await PracticeScriptService.getOrCreateQuickAddsScript("demo-team-1");
      await PracticeScriptService.addPlayToScript(
        {
          scriptId: script.id,
          playId: play.id,
          notes: "Added from playbook workflow",
          repetitions: 5,
          estimatedTime: 3,
        },
        play
      );
      toastSuccess(`Added to practice script: ${script.name}`);
    } catch (e) {
      const mapped = mapError(e);
      toastError(mapped.userMessage);
      telemetry.enqueue({
        type: TelemetryEventTypes.ErrorBoundary,
        data: { code: mapped.code, area: "practiceScript.add" },
      });
    }
  };
  const handleAddToGamePlan = (play: Play) =>
    toastInfo(`"${play.play_name}" added to game plan (placeholder)`);
  // Legacy single export kept for fallback (now replaced by scoped export submenu)
  const handleExportCSV = () => handleExportScope("selected");

  const handleExportScope = async (scope: "selected" | "current" | "all") => {
    try {
      let plays: Play[] = [];
      // Optional helper (not all environments may expose ensureUserHasPlaybook)
      const ensureUserHasPlaybook: (() => Promise<string>) | undefined = (
        PlaysService as unknown as {
          ensureUserHasPlaybook?: () => Promise<string>;
        }
      ).ensureUserHasPlaybook;
      if (scope === "selected") {
        if (state.selectedPlayIds.size === 0) {
          toastInfo("No selected plays to export.");
          return;
        }
        for (const id of state.selectedPlayIds) {
          const p = await PlaysService.getPlay(id);
          if (p) plays.push(p);
        }
      } else if (scope === "current") {
        // Fetch all then client-filter (future: push down to server)
        const playbookId = ensureUserHasPlaybook
          ? await ensureUserHasPlaybook()
          : undefined;
        if (playbookId) {
          const all = await PlaysService.getPlaysByPlaybook(playbookId);
          const {
            selectedFilters,
            searchQuery,
            selectedCategory,
            selectedSubcategory,
          } = state;
          plays = all.filter((play) => {
            // Search query logic mirrors PlayGrid (name, formation, notes, flags fallback)
            if (searchQuery) {
              const q = searchQuery.toLowerCase();
              const matchesName = play.play_name.toLowerCase().includes(q);
              const matchesFormation = play.formation.toLowerCase().includes(q);
              const matchesNotes = play.notes?.toLowerCase().includes(q);
              if (!matchesName && !matchesFormation && !matchesNotes) {
                const flags = getPlayFlags(play.id);
                const haystack = [
                  ...flags.positions,
                  ...flags.players,
                  ...flags.flags,
                ]
                  .join("\n")
                  .toLowerCase();
                if (!haystack.includes(q)) return false;
              }
            }
            // Category filtering via helper utilities (same as PlayGrid)
            if (selectedCategory) {
              const categories = getPlayCategory(play);
              if (!categories.includes(selectedCategory)) return false;
              if (
                selectedSubcategory &&
                !playMatchesSubcategory(play, selectedSubcategory)
              )
                return false;
            }
            if (
              selectedFilters.formation &&
              play.formation !== selectedFilters.formation
            )
              return false;
            if (
              selectedFilters.playType &&
              play.p_type !== selectedFilters.playType
            )
              return false;
            return true;
          });
        }
      } else {
        const playbookId = ensureUserHasPlaybook
          ? await ensureUserHasPlaybook()
          : undefined;
        if (playbookId)
          plays = await PlaysService.getPlaysByPlaybook(playbookId);
      }
      if (!plays.length) {
        toastInfo("No plays found for export.");
        return;
      }
      const csvContent = CSVService.exportPlaysToCSV(plays, {
        includePrivateNotes: true,
        formatForCoach: true,
      });
      const stamp = new Date()
        .toISOString()
        .slice(0, 16)
        .replace(/[-:T]/g, "")
        .slice(0, 12); // YYYYMMDDHHMM
      CSVService.downloadCSV(csvContent, `plays-export-${scope}-${stamp}.csv`);
      toastSuccess(`Exported ${plays.length} plays (${scope}).`);
      // Telemetry for export scope
      telemetry.enqueue({
        type: TelemetryEventTypes.ExportScope,
        data: {
          scope,
          count: plays.length,
          selectedCount: state.selectedPlayIds.size,
          hadFilters:
            !!state.searchQuery ||
            !!state.selectedCategory ||
            !!state.selectedSubcategory ||
            Object.values(state.selectedFilters).some(Boolean),
        },
      });
    } catch (e) {
      const mapped = mapError(e);
      toastError(mapped.userMessage || "Export failed");
      telemetry.enqueue({
        type: TelemetryEventTypes.ErrorBoundary,
        data: { code: mapped.code, area: "export.scoped" },
      });
    }
  };
  const handleQuickNewPracticeScript = async () => {
    try {
      const script = await PracticeScriptService.createPracticeScript({
        name: `Practice Script ${new Date().toLocaleDateString()}`,
        description: "Quick create",
        teamId: "demo-team-1",
        tags: ["quick-create"],
      });
      toastSuccess(`Created practice script: ${script.name}`);
      dispatch({ type: "SET_VIEW", view: "practice-script" });
    } catch (e) {
      const mapped = mapError(e);
      toastError(mapped.userMessage);
      telemetry.enqueue({
        type: TelemetryEventTypes.ErrorBoundary,
        data: { code: mapped.code, area: "practiceScript.create" },
      });
    }
  };
  const handleQuickNewInstall = () => {
    telemetry.enqueue({
      type: TelemetryEventTypes.UIAction,
      data: { area: "playbook_header", action: "quick_new_install" },
    });
    toastInfo("Install creation coming soon");
  };

  // UI state handlers
  const handleSearch = (q: string) =>
    dispatch({ type: "SET_SEARCH", query: q });
  const handleOpenBuilder = () =>
    dispatch({ type: "SET_SHOW_BUILDER", value: true });
  const handleCloseBuilder = () =>
    dispatch({ type: "SET_SHOW_BUILDER", value: false });
  const handleOpenImport = () =>
    dispatch({ type: "SET_SHOW_IMPORT", value: true });
  const handleCloseImport = () =>
    dispatch({ type: "SET_SHOW_IMPORT", value: false });
  const handleAdvancedFiltersChange = (filters: typeof state.advancedFilters) =>
    dispatch({ type: "SET_ADVANCED_FILTERS", filters });
  const handleCategorySelect = (categoryId: string, subcategory?: string) =>
    dispatch({ type: "SET_CATEGORY", category: categoryId, subcategory });
  type PlaybookView = "playbook" | "practice-script" | "game-plan";
  const handleViewChange = (view: PlaybookView) =>
    dispatch({ type: "SET_VIEW", view });
  const toggleBulkOperations = () => dispatch({ type: "TOGGLE_BULK" });
  const handlePlaySelectionChange = (playIds: Set<string>) =>
    dispatch({ type: "SET_SELECTION", selection: playIds });
  const handleClearSelection = () => dispatch({ type: "CLEAR_SELECTION" });

  // Preset handlers
  const handleSavePreset = async () => {
    const name = prompt("Preset name?");
    if (!name) return;
    const filters = {
      searchQuery: state.searchQuery,
      formation: state.selectedFilters.formation,
      playType: state.selectedFilters.playType,
      category: state.selectedCategory,
      subcategory: state.selectedSubcategory,
    };
    try {
      const created = await createServerPreset({ name, filters });
      dispatch({
        type: "SET_SERVER_PRESETS",
        presets: [created, ...state.serverPresets],
      });
      dispatch({ type: "SET_ACTIVE_SERVER_PRESET", id: created.id });
      telemetry.enqueue({
        type: TelemetryEventTypes.ViewSavedServerCreate,
        data: { id: created.id },
      });
    } catch {
      const preset = createPreset({ name, filters });
      telemetry.enqueue({
        type: TelemetryEventTypes.ViewSavedApply,
        data: { viewId: preset.id, action: "create_local_fallback" },
      });
      dispatch({ type: "SET_PRESETS", presets: listPresets() });
      dispatch({ type: "SET_ACTIVE_PRESET", id: preset.id });
    }
  };
  const handleApplyPreset = async (id: string) => {
    const server = state.serverPresets.find((p) => p.id === id);
    if (server) {
      const f = server.filters;
      dispatch({ type: "SET_SEARCH", query: f.searchQuery || "" });
      dispatch({
        type: "SET_SELECTED_FILTERS",
        filters: {
          ...state.selectedFilters,
          formation: f.formation,
          playType: f.playType,
        },
      });
      dispatch({
        type: "SET_CATEGORY",
        category: f.category,
        subcategory: f.subcategory,
      });
      dispatch({ type: "SET_ACTIVE_SERVER_PRESET", id });
      dispatch({ type: "ADD_RECENT_VIEW", id, scope: "server" });
      telemetry.enqueue({
        type: TelemetryEventTypes.ViewSavedServerApply,
        data: { id, origin: "server" },
      });
      return;
    }
    const preset = listPresets().find((p) => p.id === id);
    if (!preset) return;
    const f = applyPreset(preset);
    dispatch({ type: "SET_SEARCH", query: f.searchQuery || "" });
    dispatch({
      type: "SET_SELECTED_FILTERS",
      filters: {
        ...state.selectedFilters,
        formation: f.formation,
        playType: f.playType,
      },
    });
    dispatch({
      type: "SET_CATEGORY",
      category: f.category,
      subcategory: f.subcategory,
    });
    dispatch({ type: "SET_ACTIVE_PRESET", id });
    dispatch({ type: "ADD_RECENT_VIEW", id, scope: "local" });
    telemetry.enqueue({
      type: TelemetryEventTypes.ViewSavedApply,
      data: { viewId: id, action: "apply_local", origin: "local" },
    });
  };
  const handleDeletePreset = async (id: string) => {
    const confirmed = await confirmDialog({
      title: "Delete Preset",
      message:
        "Are you sure you want to delete this preset? This cannot be undone.",
      tone: "danger",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;
    const server = state.serverPresets.find((p) => p.id === id);
    if (server) {
      try {
        await deleteServerPreset(id);
        dispatch({
          type: "SET_SERVER_PRESETS",
          presets: state.serverPresets.filter((sp) => sp.id !== id),
        });
        if (state.activeServerPresetId === id)
          dispatch({ type: "SET_ACTIVE_SERVER_PRESET", id: undefined });
        telemetry.enqueue({
          type: TelemetryEventTypes.ViewSavedServerDelete,
          data: { id },
        });
        return;
      } catch {
        // fallback to local
      }
    }
    deletePreset(id);
    dispatch({ type: "SET_PRESETS", presets: listPresets() });
    if (state.activePresetId === id)
      dispatch({ type: "SET_ACTIVE_PRESET", id: undefined });
  };
  const handleRenamePreset = async (id: string) => {
    const newName = prompt("New name?");
    if (!newName) return;
    const server = state.serverPresets.find((p) => p.id === id);
    if (server) {
      try {
        const updated = await updateServerPreset({ id, name: newName });
        dispatch({
          type: "SET_SERVER_PRESETS",
          presets: state.serverPresets.map((sp) =>
            sp.id === id ? updated : sp
          ),
        });
        telemetry.enqueue({
          type: TelemetryEventTypes.ViewSavedServerRename,
          data: { id },
        });
        return;
      } catch {
        // fallback
      }
    }
    updatePreset(id, { name: newName });
    dispatch({ type: "SET_PRESETS", presets: listPresets() });
  };

  // Initial server presets load + local import migration
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        dispatch({ type: "SET_SERVER_PRESETS_LOADING", loading: true });
        const presets = await listServerPresets();
        if (cancelled) return;
        if (presets.length === 0) {
          const local = listPresets();
          if (local.length) {
            for (const lp of local) {
              try {
                await createServerPreset({
                  name: lp.name,
                  filters: lp.filters,
                });
              } catch {
                /* ignore */
              }
            }
            const refreshed = await listServerPresets();
            if (!cancelled) {
              dispatch({ type: "SET_SERVER_PRESETS", presets: refreshed });
              dispatch({ type: "SET_IMPORTED_LOCAL_PRESETS", value: true });
            }
            telemetry.enqueue({
              type: TelemetryEventTypes.ViewSavedServerImport,
              data: { count: local.length },
            });
            return;
          }
        }
        dispatch({ type: "SET_SERVER_PRESETS", presets });
      } catch {
        if (!cancelled)
          dispatch({
            type: "SET_SERVER_PRESETS_ERROR",
            error: "Failed to load presets",
          });
      } finally {
        if (!cancelled)
          dispatch({ type: "SET_SERVER_PRESETS_LOADING", loading: false });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return (
    <div className="min-h-screen surface-app decorative-gradient bg-gradient-to-br from-slate-50 to-slate-100">
      <PlaybookHeader
        playsCreated={state.playsCreated}
        diagramCoverage={state.diagramCoverage}
        streakDays={state.streakDays}
      />
      <PlaybookActionsBar
        searchQuery={state.searchQuery}
        onSearchChange={handleSearch}
        onQuickNewPracticeScript={handleQuickNewPracticeScript}
        onQuickNewInstall={handleQuickNewInstall}
        serverPresets={state.serverPresets}
        filterPresets={state.filterPresets}
        serverPresetsLoading={state.serverPresetsLoading}
        activeServerPresetId={state.activeServerPresetId}
        activePresetId={state.activePresetId}
        onApplyPreset={handleApplyPreset}
        onRenamePreset={handleRenamePreset}
        onDeletePreset={handleDeletePreset}
        onSavePreset={handleSavePreset}
        enableBulkOperations={state.enableBulkOperations}
        onToggleBulk={toggleBulkOperations}
        onExportCSV={handleExportCSV}
        onExportScope={handleExportScope}
        onOpenImport={handleOpenImport}
        playsCreated={state.playsCreated}
        onOpenBuilder={handleOpenBuilder}
        selectedCount={state.selectedPlayIds.size}
        onClearSelection={handleClearSelection}
        recentViews={state.recentViews}
        extraLeft={
          <div className="hidden lg:block max-w-sm">
            <ActiveFilterChips
              searchQuery={state.searchQuery}
              selectedFilters={state.selectedFilters}
              selectedCategory={state.selectedCategory}
              selectedSubcategory={state.selectedSubcategory}
              advancedFilters={state.advancedFilters}
              onChange={(partial) => {
                if (partial.searchQuery !== undefined)
                  dispatch({ type: "SET_SEARCH", query: partial.searchQuery });
                if (partial.selectedFilters !== undefined)
                  dispatch({
                    type: "SET_SELECTED_FILTERS",
                    filters: partial.selectedFilters,
                  });
                if (
                  partial.selectedCategory !== undefined ||
                  partial.selectedSubcategory !== undefined
                )
                  dispatch({
                    type: "SET_CATEGORY",
                    category: partial.selectedCategory,
                    subcategory: partial.selectedSubcategory,
                  });
                if (partial.advancedFilters !== undefined)
                  dispatch({
                    type: "SET_ADVANCED_FILTERS",
                    filters: partial.advancedFilters,
                  });
                dispatch({ type: "INCREMENT_REFRESH" });
              }}
            />
          </div>
        }
        extraRight={
          <div className="flex items-center gap-2">
            {/* Future extension buttons */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Navigate to free-draw diagram builder (same experience as play card button)
                // Opens route-based VisualPlayBuilder; when no playId provided it's a blank canvas.
                navigate("/playbook/diagram");
              }}
              title="Open Diagram Builder"
            >
              Diagram
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toastInfo("PDF export coming soon")}
              title="Export PDF"
            >
              PDF
            </Button>
          </div>
        }
      />
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PlaybookViewTabs
            currentView={state.currentView}
            onViewChange={handleViewChange}
          />
          {/* Playbook Panel */}
          <div
            id="panel-playbook"
            role="tabpanel"
            aria-labelledby="tab-playbook"
            hidden={state.currentView !== "playbook"}
          >
            {state.currentView === "playbook" && (
              <>
                <div className="surface-card rounded-lg shadow-sm border-subtle p-3 mb-4">
                  <div className="hidden md:block">
                    <AdvancedFilters
                      activeFilters={state.advancedFilters}
                      onFiltersChange={handleAdvancedFiltersChange}
                    />
                  </div>
                  <div className="md:hidden text-xs text-slate-500">
                    Use the Filters drawer to refine results
                  </div>
                </div>
                {state.enableBulkOperations &&
                  state.selectedPlayIds.size > 0 && (
                    <BulkActionsToolbar
                      selectedCount={state.selectedPlayIds.size}
                      onClearSelection={handleClearSelection}
                      onBulkAction={async (action) => {
                        const selectedPlays = Array.from(state.selectedPlayIds);
                        try {
                          switch (action) {
                            case "delete": {
                              const confirmed = await confirmDialog({
                                title: "Delete Plays",
                                message: `Delete ${selectedPlays.length} selected play${selectedPlays.length === 1 ? "" : "s"}? You can undo for a few seconds.`,
                                tone: "danger",
                                confirmLabel: "Delete",
                              });
                              if (confirmed) {
                                const ids = [...selectedPlays];
                                await PlaysService.deletePlays(ids);
                                pushUndo({
                                  label: `${ids.length} play${ids.length === 1 ? "" : "s"} deleted`,
                                  payload: { ids },
                                  apply: () => {},
                                  restore: async ({
                                    ids,
                                  }: {
                                    ids: string[];
                                  }) => {
                                    try {
                                      await PlaysService.restorePlays(ids);
                                      toastSuccess(
                                        `Restored ${ids.length} play${ids.length === 1 ? "" : "s"}`
                                      );
                                    } catch (e) {
                                      console.error("Undo restore failed", e);
                                      toastError("Failed to restore plays");
                                    } finally {
                                      refreshPlays();
                                    }
                                  },
                                });
                                toastSuccess(
                                  `${ids.length} play${ids.length === 1 ? "" : "s"} deleted`
                                );
                                refreshPlays();
                                handleClearSelection();
                              }
                              break;
                            }
                            case "export": {
                              if (!selectedPlays.length) {
                                toastInfo("No plays selected to export.");
                                return;
                              }
                              const fetched: Play[] = [];
                              for (const id of selectedPlays) {
                                const p = await PlaysService.getPlay(id);
                                if (p) fetched.push(p);
                              }
                              if (!fetched.length) {
                                toastError(
                                  "Unable to load selected plays to export."
                                );
                                return;
                              }
                              const csvContent = CSVService.exportPlaysToCSV(
                                fetched,
                                {
                                  includePrivateNotes: true,
                                  formatForCoach: true,
                                }
                              );
                              const ts = new Date()
                                .toISOString()
                                .replace(/[:T]/g, "-")
                                .split(".")[0];
                              CSVService.downloadCSV(
                                csvContent,
                                `plays-export-${fetched.length}-${ts}.csv`
                              );
                              toastSuccess(
                                `Exported ${fetched.length} plays to CSV.`
                              );
                              break;
                            }
                            case "add-to-practice":
                              toastInfo(
                                `Adding ${selectedPlays.length} plays to practice script...`
                              );
                              break;
                            case "add-tags": {
                              setShowBulkTagging(true);
                              break;
                            }
                            case "duplicate":
                              toastInfo(
                                `Duplicating ${selectedPlays.length} plays...`
                              );
                              break;
                            case "batch-edit":
                              toastInfo(
                                `Batch editing ${selectedPlays.length} plays...`
                              );
                              break;
                            default:
                              console.warn(`Unknown bulk action: ${action}`);
                          }
                        } catch (error) {
                          console.error(
                            `Error performing bulk action ${action}:`,
                            error
                          );
                          toastError(
                            `Bulk action failed: ${error instanceof Error ? error.message : "Unknown error"}`
                          );
                        }
                      }}
                    />
                  )}
                <PlayGrid
                  searchQuery={state.searchQuery}
                  filters={state.selectedFilters}
                  selectedCategory={state.selectedCategory}
                  selectedSubcategory={state.selectedSubcategory}
                  onAddToPracticeScript={handleAddToPracticeScript}
                  onAddToGamePlan={handleAddToGamePlan}
                  refreshTrigger={state.refreshTrigger}
                  enableBulkOperations={state.enableBulkOperations}
                  selectedPlayIds={state.selectedPlayIds}
                  onPlaySelectionChange={handlePlaySelectionChange}
                  onPlayCountChange={(count) =>
                    dispatch({ type: "SET_PLAYS_CREATED", count })
                  }
                />
              </>
            )}
          </div>
          {/* Practice Script Panel */}
          <div
            id="panel-practice-script"
            role="tabpanel"
            aria-labelledby="tab-practice-script"
            hidden={state.currentView !== "practice-script"}
          >
            {state.currentView === "practice-script" && (
              <div className="surface-card rounded-lg shadow-sm border-subtle p-6">
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <Typography
                    variant="headline-sm"
                    as="h3"
                    className="text-slate-900 mb-2"
                  >
                    Practice Script Builder
                  </Typography>
                  <p className="text-slate-600 mb-6">
                    Build practice sessions with plays from your playbook.
                    Create timelines, add repetitions, and export professional
                    practice scripts.
                  </p>
                  <Button variant="primary" size="sm">
                    Create New Practice Script
                  </Button>
                </div>
              </div>
            )}
          </div>
          {/* Game Plan Panel */}
          <div
            id="panel-game-plan"
            role="tabpanel"
            aria-labelledby="tab-game-plan"
            hidden={state.currentView !== "game-plan"}
          >
            {state.currentView === "game-plan" && (
              <div className="surface-card rounded-lg shadow-sm border-subtle p-6">
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <Typography
                    variant="headline-sm"
                    as="h3"
                    className="text-slate-900 mb-2"
                  >
                    Game Plan Organization
                  </Typography>
                  <p className="text-slate-600 mb-6">
                    Organize plays by game situations using Brian Billick
                    methodology. Down & Distance, Red Zone, Goal Line, and more.
                  </p>
                  <Button variant="primary" size="sm">
                    Create New Game Plan
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      {state.showBuilder && (
        <PlayBuilderCore
          isOpen={state.showBuilder}
          onClose={handleCloseBuilder}
          onSave={handleSavePlay}
        />
      )}
      {state.showImport && (
        <CSVImportModal
          isOpen={state.showImport}
          onClose={handleCloseImport}
          playbookId=""
          onImportComplete={(result) => {
            if (result.success && result.importedPlays > 0) {
              refreshPlays();
            }
            handleCloseImport();
          }}
        />
      )}
      {showBulkTagging && (
        <BulkTaggingModal
          isOpen={showBulkTagging}
          onClose={() => setShowBulkTagging(false)}
          playIds={Array.from(state.selectedPlayIds)}
          onApply={async (tags) => {
            // Placeholder: In future, call service to append tags for each play.
            toastInfo(
              `Queued adding ${tags.length} tag${tags.length === 1 ? "" : "s"} to ${state.selectedPlayIds.size} plays (simulation).`
            );
            setShowBulkTagging(false);
          }}
        />
      )}
      <MobileDrawer
        title="Glossary"
        isOpen={state.showMobileGlossary}
        onClose={() => dispatch({ type: "SET_MOBILE_GLOSSARY", value: false })}
        side="left"
      >
        <PlaybookGlossary
          onCategorySelect={(cat, sub) => {
            handleCategorySelect(cat, sub);
            dispatch({ type: "SET_MOBILE_GLOSSARY", value: false });
          }}
          selectedCategory={state.selectedCategory}
          selectedSubcategory={state.selectedSubcategory}
        />
      </MobileDrawer>
      <MobileDrawer
        title="Filters"
        isOpen={state.showMobileFilters}
        onClose={() => dispatch({ type: "SET_MOBILE_FILTERS", value: false })}
        side="right"
      >
        <PlayFilters
          selectedFilters={state.selectedFilters}
          onFilterChange={(f) =>
            dispatch({ type: "SET_SELECTED_FILTERS", filters: f })
          }
        />
        <div className="mt-4">
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            onClick={() =>
              dispatch({ type: "SET_MOBILE_FILTERS", value: false })
            }
          >
            Apply
          </Button>
        </div>
      </MobileDrawer>
      {state.showCelebration && state.recentAchievement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="surface-card elevation-modal rounded-md p-8 max-w-md mx-4 text-center transform animate-bounce-in">
            <div className="mb-4">
              <Icon name="trophy" />
            </div>
            <AchievementBadge size="lg">
              {state.recentAchievement}
            </AchievementBadge>
            <p className="text-text-secondary mt-4">
              You're building an incredible playbook! Keep the momentum going!
            </p>
            <Button
              onClick={() => dispatch({ type: "HIDE_CELEBRATION" })}
              variant="primary"
              size="sm"
              className="mt-6"
            >
              Awesome!
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export const PlaybookPage: React.FC = () => (
  <PlaybookProvider>
    <PlaybookPageInner />
  </PlaybookProvider>
);
