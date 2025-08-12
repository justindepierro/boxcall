// Clean consolidated PlaybookPage implementation (legacy duplicated fragments removed)
import React from "react";
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
import { telemetry } from "../telemetry/dispatcher";
import { TelemetryEventTypes } from "../telemetry/events";
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
import { PlaybookViewTabs } from "../components/playbook/page/PlaybookViewTabs";
import { PlaybookProvider, usePlaybook } from "../contexts/PlaybookContext";
import { useConfirm } from "../contexts/ConfirmContext";
import { useUndoQueue } from "../contexts/UndoQueueContext";
import { useToast } from "../hooks/useToast";

const PlaybookPageInner: React.FC = () => {
  const { state, dispatch } = usePlaybook();
  const {
    success: toastSuccess,
    error: toastError,
    info: toastInfo,
  } = useToast();
  const confirmDialog = useConfirm();
  const { pushUndo } = useUndoQueue();

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
      console.error(e);
      toastError("Failed to save play");
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
    } catch {
      toastError("Failed to add to script");
    }
  };
  const handleAddToGamePlan = (play: Play) =>
    toastInfo(`"${play.play_name}" added to game plan (placeholder)`);
  const handleExportCSV = () => {
    try {
      const plays: Play[] = []; // TODO: supply real list
      if (!plays.length) {
        toastInfo("No plays to export yet.");
        return;
      }
      const csv = CSVService.exportPlaysToCSV(plays, {
        includePrivateNotes: true,
        formatForCoach: true,
      });
      const ts = new Date().toISOString().split("T")[0];
      CSVService.downloadCSV(csv, `playbook-export-${ts}.csv`);
    } catch {
      toastError("Failed export");
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
    } catch {
      toastError("Failed to create practice script");
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
      telemetry.enqueue({
        type: TelemetryEventTypes.ViewSavedServerApply,
        data: { id },
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
    telemetry.enqueue({
      type: TelemetryEventTypes.ViewSavedApply,
      data: { viewId: id, action: "apply_local" },
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
        onOpenImport={handleOpenImport}
        playsCreated={state.playsCreated}
        onOpenBuilder={handleOpenBuilder}
        selectedCount={state.selectedPlayIds.size}
        onClearSelection={handleClearSelection}
        extraLeft={null}
        extraRight={
          <div className="flex items-center gap-2">
            {/* Future extension buttons */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toastInfo("Diagram maker coming soon")}
              title="Open Diagram Maker"
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
                              const tag = prompt(
                                "Enter tag to add to selected plays:"
                              );
                              if (tag)
                                toastInfo(
                                  `Adding tag "${tag}" to ${selectedPlays.length} plays...`
                                );
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
