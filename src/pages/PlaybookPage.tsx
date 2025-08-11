import React, { useState } from "react";
// Removed unused RefreshCw import
import { FileText, Plus, Upload, Download, Clock, Users } from "lucide-react";
import { PlayGrid } from "../components/playbook/PlayGrid";
import { PlaybookGlossary } from "../components/playbook/PlaybookGlossary";
import { AdvancedFilters } from "../components/playbook/AdvancedFilters";
import { BulkActionsToolbar } from "../components/playbook/BulkActionsToolbar";
import { PlayBuilderCore } from "../components/playbook/PlayBuilder";
import { CSVImportModal } from "../components/playbook/CSVImport/CSVImportModal";
import { AdvancedSearchBar } from "../components/playbook/AdvancedSearchBar";
import { PracticeScriptService } from "../services/practiceScriptService";
import { CSVService } from "../services/csv";
import { PlaysService } from "../services/playsService"; // legacy direct service (will be phased out)
import { PlaysDomainService } from "../domain/playsDomainService";
import { Icon } from "../components/ui/Icon/Icon";
import { TeamOnboarding } from "../components/onboarding/TeamOnboarding";
import { Typography } from "../components/design-system/Typography";
import { markFirstPlayCreated } from "../components/onboarding/activationHelpers";
import { telemetry } from "../telemetry/dispatcher";
import { TelemetryEventTypes } from "../telemetry/events";
import { listPresets, createPreset, deletePreset, applyPreset } from "../utils/playbookFilterPresets";
// TODO: Future enhancement - calculate real play counts with: import { calculatePlayCounts } from "../utils/playbook-categories";
import type { Play } from "../types/play";
import {
  Badge,
  AchievementBadge,
  ProgressBadge,
  ComplexityBadge,
} from "../components/ui/Badge";
import { Button } from "../components/ui/Button/Button";

interface ActiveFilter {
  id: string;
  field: string;
  operator: "equals" | "contains" | "in";
  value: string | string[];
  label: string;
}
type CoachingView = "playbook" | "practice-script" | "game-plan";

interface PlaybookPageState {
  searchQuery: string;
  activeFilters: string[]; // Quick filter IDs (red-zone, goal-line, etc.)
  advancedFilters: ActiveFilter[]; // Advanced filters
  showBuilder: boolean;
  showImport: boolean;
  currentView: CoachingView;
  selectedFilters: {
    formation?: string;
    playType?: string;
    down?: string;
    distance?: string;
    tags?: string[];
  };
  // Playbook Glossary State
  selectedCategory?: string;
  selectedSubcategory?: string;
  // Bulk Operations State
  enableBulkOperations: boolean;
  selectedPlayIds: Set<string>;
  // Reward Loop State
  playsCreated: number;
  recentAchievement: string | null;
  showCelebration: boolean;
  streakDays: number;
  lastPlayCreated: Date | null;
  // Data refresh trigger
  refreshTrigger: number;
  filterPresets: ReturnType<typeof listPresets>;
  activePresetId?: string;
  diagramCoverage: number; // % of plays with a diagram (placeholder)
}
export const PlaybookPage: React.FC = () => {
  const [state, setState] = useState<PlaybookPageState>({
    searchQuery: "",
    activeFilters: [],
    advancedFilters: [],
    showBuilder: false,
    showImport: false,
    currentView: "playbook",
    selectedFilters: {},
    // Playbook Glossary Initial State
    selectedCategory: undefined,
    selectedSubcategory: undefined,
    // Bulk Operations Initial State
    enableBulkOperations: false,
    selectedPlayIds: new Set(),
    // Reward Loop Initial State
    playsCreated: 0,
    recentAchievement: null,
    showCelebration: false,
    streakDays: 0,
    lastPlayCreated: null,
    // Data refresh trigger
    refreshTrigger: 0,
  filterPresets: [],
  activePresetId: undefined,
  diagramCoverage: 0,
  });

  // Achievement system - the heart of reward loop psychology
  const checkAchievements = (newPlayCount: number) => {
    const milestones = [
      {
        count: 1,
        title: "First Play Created!",
        description: "Welcome to coaching!",
      },
      {
        count: 10,
        title: "Play Designer",
        description: "10 plays and counting",
      },
      {
        count: 25,
        title: "Playbook Builder",
        description: "25 strategic plays",
      },
      {
        count: 50,
        title: "Master Strategist",
        description: "50 plays - you're a pro!",
      },
      {
        count: 100,
        title: "Coaching Legend",
        description: "100 plays! Incredible!",
      },
    ];

    const achievement = milestones.find((m) => m.count === newPlayCount);
    if (achievement) {
      setState((prev) => ({
        ...prev,
        recentAchievement: achievement.title,
        showCelebration: true,
      }));

      // Auto-hide celebration after 3 seconds
      setTimeout(() => {
        setState((prev) => ({ ...prev, showCelebration: false }));
      }, 3000);
    }
  };

  // Micro-celebration for play creation
  const handlePlayCreated = () => {
    const newCount = state.playsCreated + 1;
    setState((prev) => ({
      ...prev,
      playsCreated: newCount,
      streakDays: prev.streakDays, // Keep current streak
    }));

    // Check for achievements
    checkAchievements(newCount);
  };

  // Trigger data refresh
  const refreshPlays = () => {
    setState((prev) => ({
      ...prev,
      refreshTrigger: prev.refreshTrigger + 1,
    }));
  };

  // Handle glossary category selection
  const handleCategorySelect = (categoryId: string, subcategory?: string) => {
    console.log("📚 Category selected:", { categoryId, subcategory });
    setState((prev) => ({
      ...prev,
      selectedCategory: categoryId,
      selectedSubcategory: subcategory,
    }));
  };

  // Handle saving a new play
  const handleSavePlay = async (playData: Partial<Play>) => {
    try {
      console.log("💾 Saving play to database:", playData);

      // Save to Supabase database
      // Route through domain service (canonicalization + future duplicate_key)
      const { play: newPlay } = await PlaysDomainService.createPlay(playData);
      console.log("✅ Play saved successfully:", newPlay);

      // Activation: record first play creation (id may be undefined if service didn't return yet)
      if (newPlay?.id) {
        markFirstPlayCreated(newPlay.id);
        telemetry.enqueue({
          type: TelemetryEventTypes.PlayCreate,
          data: { playId: newPlay.id, source: "builder", hasDiagram: false },
        });
      } else {
        // Fallback still mark without id (ensures event fires once)
        markFirstPlayCreated();
      }

      // Close the builder
      handleCloseBuilder();

      // Refresh the plays list
      refreshPlays();
      // Update diagram coverage placeholder (future: compute real diagrams)
      setState((prev) => ({
        ...prev,
        diagramCoverage: Math.min(100, Math.round(((prev.playsCreated + 1) / (prev.playsCreated + 1)) * 50)),
      }));

      // Trigger celebration
      handlePlayCreated();

      // Show success message (optional)
      // You could add a toast notification here if you have one
      alert(`Play "${playData.play_name}" has been saved to your playbook!`);
    } catch (error) {
      console.error("❌ Error saving play:", error);
      alert(
        `Failed to save play: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  // 3-Part Workflow Handlers - Week 3 Feature
  const handleAddToPracticeScript = async (play: Play) => {
    try {
      // For demo purposes, use a mock team ID
      const teamId = "demo-team-1";

      // Get or create the "Quick Adds" script for easy workflow
      const script =
        await PracticeScriptService.getOrCreateQuickAddsScript(teamId);

      // Add the play to the script
      await PracticeScriptService.addPlayToScript(
        {
          scriptId: script.id,
          playId: play.id,
          notes: `Added from playbook workflow`,
          repetitions: 5,
          estimatedTime: 3,
        },
        play
      );

      // Show success message with workflow context
      alert(
        `"${play.play_name}" added to practice script "${script.name}"!\n\nNavigate to Calendar > Practice Planning to build your full practice session.`
      );

      // Note: Don't increment play count for workflow actions - only for actual play creation
    } catch (error) {
      console.error("Error adding play to practice script:", error);
      alert("Failed to add play to practice script. Please try again.");
    }
  };

  const handleAddToGamePlan = (play: Play) => {
    // TODO: Implement game plan integration
    console.log("Adding play to game plan:", play.play_name);
    // For now, just show a success message
    alert(`"${play.play_name}" added to game plan!`);
  };

  const handleExportCSV = () => {
    try {
      // TODO: Get current plays from Supabase/real data
      const plays: Play[] = []; // Empty for now until database integration

      if (plays.length === 0) {
        alert("No plays to export. Create some plays first!");
        return;
      }

      // Export to CSV
      const csvContent = CSVService.exportPlaysToCSV(plays, {
        includePrivateNotes: true,
        formatForCoach: true,
      });

      // Download the file
      const timestamp = new Date().toISOString().split("T")[0];
      CSVService.downloadCSV(csvContent, `playbook-export-${timestamp}.csv`);

      // Note: Don't increment play count for exports - only for actual play creation
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Failed to export playbook. Please try again.");
    }
  };
  const handleSearch = (query: string) => {
    setState((prev) => ({ ...prev, searchQuery: query }));
  };

  const handleOpenBuilder = () => {
    setState((prev) => ({ ...prev, showBuilder: true }));
  };
  const handleCloseBuilder = () => {
    setState((prev) => ({ ...prev, showBuilder: false }));
  };
  const handleOpenImport = () => {
    setState((prev) => ({ ...prev, showImport: true }));
  };
  const handleCloseImport = () => {
    setState((prev) => ({ ...prev, showImport: false }));
  };

  // Advanced filters handler
  const handleAdvancedFiltersChange = (
    filters: typeof state.advancedFilters
  ) => {
    setState((prev) => ({ ...prev, advancedFilters: filters }));
  };

  // Preset Management
  const refreshPresets = () => {
    setState((prev) => ({ ...prev, filterPresets: listPresets() }));
  };
  const handleSavePreset = () => {
    const name = prompt("Preset name?");
    if (!name) return;
    createPreset({
      name,
      filters: {
        searchQuery: state.searchQuery,
        formation: state.selectedFilters.formation,
        playType: state.selectedFilters.playType,
        category: state.selectedCategory,
        subcategory: state.selectedSubcategory,
      },
    });
    refreshPresets();
  };
  const handleApplyPreset = (id: string) => {
    const preset = listPresets().find((p) => p.id === id);
    if (!preset) return;
    const f = applyPreset(preset);
    setState((prev) => ({
      ...prev,
      searchQuery: f.searchQuery || "",
      selectedFilters: {
        ...prev.selectedFilters,
        formation: f.formation,
        playType: f.playType,
      },
      selectedCategory: f.category,
      selectedSubcategory: f.subcategory,
      activePresetId: id,
    }));
    telemetry.enqueue({
      type: TelemetryEventTypes.ViewSavedApply,
      data: { viewId: id },
    });
  };
  const handleDeletePreset = (id: string) => {
    if (!confirm("Delete preset?")) return;
    deletePreset(id);
    refreshPresets();
    setState((prev) => ({ ...prev, activePresetId: prev.activePresetId === id ? undefined : prev.activePresetId }));
  };

  const handleViewChange = (view: CoachingView) => {
    setState((prev) => ({ ...prev, currentView: view }));
  };

  // Bulk Operations Handlers
  const toggleBulkOperations = () => {
    setState((prev) => ({
      ...prev,
      enableBulkOperations: !prev.enableBulkOperations,
      selectedPlayIds: new Set(), // Clear selection when toggling
    }));
  };

  const handlePlaySelectionChange = (playIds: Set<string>) => {
    setState((prev) => ({ ...prev, selectedPlayIds: playIds }));
  };

  const handleClearSelection = () => {
    setState((prev) => ({ ...prev, selectedPlayIds: new Set() }));
  };

  const handleBulkAction = async (action: string) => {
    const selectedPlays = Array.from(state.selectedPlayIds);
    console.log(`Bulk action: ${action}`, selectedPlays);

    try {
      switch (action) {
        case "delete":
          if (
            confirm(
              `Delete ${selectedPlays.length} selected plays? This cannot be undone.`
            )
          ) {
            // TODO: Implement bulk delete
            for (const playId of selectedPlays) {
              await PlaysService.deletePlay(playId);
            }
            alert(`${selectedPlays.length} plays deleted successfully`);
            refreshPlays();
            handleClearSelection();
          }
          break;

        case "export":
          // TODO: Implement bulk export using CSVService
          alert(`Exporting ${selectedPlays.length} plays...`);
          break;

        case "add-to-practice":
          // TODO: Implement bulk add to practice
          alert(`Adding ${selectedPlays.length} plays to practice script...`);
          break;

        case "add-tags": {
          // TODO: Implement bulk tag editor
          const tag = prompt("Enter tag to add to selected plays:");
          if (tag) {
            alert(`Adding tag "${tag}" to ${selectedPlays.length} plays...`);
          }
          break;
        }

        case "duplicate":
          // TODO: Implement bulk duplicate
          alert(`Duplicating ${selectedPlays.length} plays...`);
          break;

        case "batch-edit":
          // TODO: Implement batch edit modal
          alert(`Batch editing ${selectedPlays.length} plays...`);
          break;

        default:
          console.warn(`Unknown bulk action: ${action}`);
      }
    } catch (error) {
      console.error(`Error performing bulk action ${action}:`, error);
      alert(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  return (
    <div className="min-h-screen surface-app decorative-gradient bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="surface-subtle shadow-sm border-b border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <FileText className="h-8 w-8 text-jade-600 mr-3" />
              <div className="flex flex-col">
                <Typography
                  variant="headline-md"
                  as="h1"
                  className="text-slate-900"
                >
                  Playbook
                </Typography>
                {/* Progress indicator - key reward loop element */}
                <div className="flex items-center space-x-2 mt-1">
                  <ProgressBadge
                    progress={Math.round((state.playsCreated / 100) * 100)}
                  >
                    {state.playsCreated}/100 plays
                  </ProgressBadge>
                  <Badge variant="info" size="sm">
                    Diagram {state.diagramCoverage}%
                  </Badge>
                  {state.streakDays > 0 && (
                    <Badge variant="success" size="sm">
                      {state.streakDays} day streak!
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {/* Advanced Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <AdvancedSearchBar
                plays={[]} // TODO: Get actual plays from Supabase/PlayGrid
                searchQuery={state.searchQuery}
                onSearchChange={handleSearch}
                placeholder="Search plays, formations, or tags..."
              />
            </div>
            {/* Action Buttons with Reward Loop Psychology */}
            <div className="flex items-center space-x-3">
              {/* Preset Dropdown */}
              <div className="flex items-center space-x-1">
                <select
                  value={state.activePresetId || ""}
                  onChange={(e) => handleApplyPreset(e.target.value)}
                  className="text-sm border-slate-300 rounded px-2 py-1"
                >
                  <option value="">Presets...</option>
                  {state.filterPresets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {state.activePresetId && (
                  <Button
                    onClick={() => handleDeletePreset(state.activePresetId!)}
                    variant="ghost"
                    size="xs"
                    className="px-2"
                  >
                    ✕
                  </Button>
                )}
              </div>
              <Button
                onClick={handleSavePreset}
                variant="ghost"
                size="sm"
                className="px-3"
              >
                Save Preset
              </Button>
              {/* Bulk Operations Toggle */}
              <Button
                onClick={toggleBulkOperations}
                variant={state.enableBulkOperations ? "primary" : "ghost"}
                size="sm"
                title={
                  state.enableBulkOperations
                    ? "Disable bulk operations"
                    : "Enable bulk operations"
                }
                className="px-4 py-2 hover:scale-105 transition-transform"
              >
                <input
                  type="checkbox"
                  checked={state.enableBulkOperations}
                  onChange={() => {}}
                  className="h-4 w-4 mr-2 rounded border-slate-300 text-blue-600"
                />
                Bulk Edit
              </Button>

              {/* Export button */}
              <Button
                onClick={handleExportCSV}
                variant="subtle"
                size="sm"
                className="px-4 py-2 hover:scale-105 transition-transform"
              >
                <Download className="h-4 w-4 mr-2" /> Export CSV
              </Button>

              {/* Import button with subtle enhancement */}
              <Button
                onClick={handleOpenImport}
                variant="subtle"
                size="sm"
                className="px-4 py-2 hover:scale-105 transition-transform"
              >
                <Upload className="h-4 w-4 mr-2" /> Import CSV
              </Button>

              {/* New Play button - primary action with celebration potential */}
              <div className="relative">
                <Button
                  onClick={() => {
                    handleOpenBuilder();
                  }}
                  variant="primary"
                  size="sm"
                  className="px-4 py-2 hover:scale-105 transition-transform"
                >
                  <Plus className="h-4 w-4 mr-2" /> New Play
                </Button>

                {/* Next milestone indicator - creates desire for next achievement */}
                {state.playsCreated < 100 && (
                  <div className="absolute -top-2 -right-2">
                    <Badge variant="warning" size="sm">
                      {100 - state.playsCreated} to go!
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Team Onboarding - Shows for users without teams */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <TeamOnboarding context="playbook" />
      </div>

      {/* Week 3 Feature: Complexity Challenge System Demo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="surface-card decorative-gradient bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-subtle">
          <div className="flex items-center justify-between">
            <div>
              <Typography
                variant="label-lg"
                as="h3"
                className="text-purple-900 flex items-center gap-2"
              >
                Week 3 Feature: Complexity Challenge System
                <Badge variant="premium" size="sm">
                  NEW
                </Badge>
              </Typography>
              <p className="text-sm text-purple-700 mt-1">
                Your plays are now analyzed for complexity and rewarded with
                achievement badges!
              </p>
            </div>
            <div className="flex gap-2">
              {/* Demo complexity badges for different play types */}
              <ComplexityBadge
                metrics={{
                  routeCount: 12,
                  formationComplexity: 10,
                  personnelVariety: 15,
                  conceptDifficulty: 8,
                  totalScore: 45,
                  badge: "intermediate",
                }}
                size="sm"
              />
              <ComplexityBadge
                metrics={{
                  routeCount: 25,
                  formationComplexity: 20,
                  personnelVariety: 20,
                  conceptDifficulty: 15,
                  totalScore: 80,
                  badge: "expert",
                }}
                size="sm"
              />
              <ComplexityBadge
                metrics={{
                  routeCount: 30,
                  formationComplexity: 20,
                  personnelVariety: 25,
                  conceptDifficulty: 20,
                  totalScore: 95,
                  badge: "innovative",
                }}
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex gap-6">
          {/* Reduced from gap-8 to gap-6 */}
          {/* Smart Playbook Glossary */}
          <aside className="w-80 flex-shrink-0">
            <PlaybookGlossary
              onCategorySelect={handleCategorySelect}
              selectedCategory={state.selectedCategory}
              selectedSubcategory={state.selectedSubcategory}
            />
          </aside>
          {/* Play Grid */}
          <main className="flex-1">
            {/* 3-View System Toggle */}
            <div className="mb-6 surface-subtle rounded-lg shadow-sm border-subtle p-1" role="tablist" aria-label="Playbook views">
              <div className="flex space-x-1">
                <Button
                  id="tab-playbook"
                  role="tab"
                  aria-controls="panel-playbook"
                  aria-selected={state.currentView === "playbook"}
                  tabIndex={state.currentView === "playbook" ? 0 : -1}
                  onClick={() => handleViewChange("playbook")}
                  variant={state.currentView === "playbook" ? "primary" : "ghost"}
                  size="sm"
                  className="flex-1 flex items-center justify-center"
                >
                  <FileText className="h-4 w-4 mr-2" /> Playbook View
                </Button>
                <Button
                  id="tab-practice-script"
                  role="tab"
                  aria-controls="panel-practice-script"
                  aria-selected={state.currentView === "practice-script"}
                  tabIndex={state.currentView === "practice-script" ? 0 : -1}
                  onClick={() => handleViewChange("practice-script")}
                  variant={state.currentView === "practice-script" ? "primary" : "ghost"}
                  size="sm"
                  className="flex-1 flex items-center justify-center"
                >
                  <Clock className="h-4 w-4 mr-2" /> Practice Script View
                </Button>
                <Button
                  id="tab-game-plan"
                  role="tab"
                  aria-controls="panel-game-plan"
                  aria-selected={state.currentView === "game-plan"}
                  tabIndex={state.currentView === "game-plan" ? 0 : -1}
                  onClick={() => handleViewChange("game-plan")}
                  variant={state.currentView === "game-plan" ? "primary" : "ghost"}
                  size="sm"
                  className="flex-1 flex items-center justify-center"
                >
                  <Users className="h-4 w-4 mr-2" /> Game Plan View
                </Button>
              </div>
            </div>

            {/* Conditional View Rendering */}
            <div
              id="panel-playbook"
              role="tabpanel"
              aria-labelledby="tab-playbook"
              hidden={state.currentView !== "playbook"}
            >
              {state.currentView === "playbook" && (
                <>
                {/* Advanced Filters */}
                <div className="surface-card rounded-lg shadow-sm border-subtle p-3 mb-4">
                  <AdvancedFilters
                    activeFilters={state.advancedFilters}
                    onFiltersChange={handleAdvancedFiltersChange}
                  />
                </div>

                {/* Bulk Actions Toolbar */}
                {state.enableBulkOperations &&
                  state.selectedPlayIds.size > 0 && (
                    <BulkActionsToolbar
                      selectedCount={state.selectedPlayIds.size}
                      onClearSelection={() =>
                        setState((prev) => ({
                          ...prev,
                          selectedPlayIds: new Set(),
                        }))
                      }
                      onBulkAction={handleBulkAction}
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
                  onPlayCountChange={(count) => {
                    setState((prev) => ({
                      ...prev,
                      playsCreated: count,
                    }));
                  }}
                />
                </>
              )}
            </div>

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
          </main>
        </div>
      </div>
      {/* Modals */}
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
          playbookId="" // Let CSVImportModal auto-detect/create the playbook
          onImportComplete={(result) => {
            console.log("Import completed:", result);
            if (result.success && result.importedPlays > 0) {
              console.log(
                `✅ Successfully imported ${result.importedPlays} plays, refreshing play grid...`
              );
              refreshPlays(); // Trigger PlayGrid refresh to show new plays
            }
            handleCloseImport();
          }}
        />
      )}

      {/* Achievement Celebration Overlay - The reward loop climax */}
      {state.showCelebration && state.recentAchievement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="surface-card elevation-modal rounded-md p-8 max-w-md mx-4 text-center transform animate-bounce-in">
            {/* Replaced raw emoji with Icon component per lint governance */}
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
              onClick={() =>
                setState((prev) => ({ ...prev, showCelebration: false }))
              }
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
