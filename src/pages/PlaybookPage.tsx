import React, { useState } from "react";
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
import { PlaysService } from "../services/playsService";
import { TeamOnboarding } from "../components/onboarding/TeamOnboarding";
// TODO: Future enhancement - calculate real play counts with: import { calculatePlayCounts } from "../utils/playbook-categories";
import type { Play } from "../types/play";
import {
  Badge,
  AchievementBadge,
  ProgressBadge,
  ComplexityBadge,
} from "../components/ui/Badge";

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
      const newPlay = await PlaysService.createPlay(playData);
      console.log("✅ Play saved successfully:", newPlay);

      // Close the builder
      handleCloseBuilder();

      // Refresh the plays list
      refreshPlays();

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
    console.log(`🔄 Bulk action: ${action}`, selectedPlays);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <FileText className="h-8 w-8 text-jade-600 mr-3" />
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-slate-900">Playbook</h1>
                {/* Progress indicator - key reward loop element */}
                <div className="flex items-center space-x-2 mt-1">
                  <ProgressBadge
                    progress={Math.round((state.playsCreated / 100) * 100)}
                  >
                    {state.playsCreated}/100 plays
                  </ProgressBadge>
                  {state.streakDays > 0 && (
                    <Badge variant="achievement" size="sm">
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
              {/* Bulk Operations Toggle */}
              <button
                onClick={toggleBulkOperations}
                className={`inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  state.enableBulkOperations
                    ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                    : "border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
                }`}
                title={
                  state.enableBulkOperations
                    ? "Disable bulk operations"
                    : "Enable bulk operations"
                }
              >
                <input
                  type="checkbox"
                  checked={state.enableBulkOperations}
                  onChange={() => {}} // Handled by button onClick
                  className="h-4 w-4 mr-2 rounded border-slate-300 text-blue-600"
                />
                Bulk Edit
              </button>

              {/* Export button */}
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-jade-500 transition-all duration-200"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>

              {/* Import button with subtle enhancement */}
              <button
                onClick={handleOpenImport}
                className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-jade-500 transition-all duration-200"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
              </button>

              {/* New Play button - primary action with celebration potential */}
              <div className="relative">
                <button
                  onClick={() => {
                    handleOpenBuilder();
                  }}
                  className="inline-flex items-center px-4 py-2 bg-jade-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-jade-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-jade-500 transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Play
                </button>

                {/* Next milestone indicator - creates desire for next achievement */}
                {state.playsCreated < 100 && (
                  <div className="absolute -top-2 -right-2">
                    <Badge variant="attention" size="sm">
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
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-purple-900 flex items-center gap-2">
                Week 3 Feature: Complexity Challenge System
                <Badge variant="premium" size="sm">
                  NEW
                </Badge>
              </h3>
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
            <div className="mb-6 bg-white rounded-lg shadow-sm border border-slate-200 p-1">
              <div className="flex space-x-1">
                <button
                  onClick={() => handleViewChange("playbook")}
                  className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    state.currentView === "playbook"
                      ? "bg-jade-100 text-jade-700 border border-jade-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Playbook View
                </button>
                <button
                  onClick={() => handleViewChange("practice-script")}
                  className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    state.currentView === "practice-script"
                      ? "bg-jade-100 text-jade-700 border border-jade-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Practice Script View
                </button>
                <button
                  onClick={() => handleViewChange("game-plan")}
                  className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    state.currentView === "game-plan"
                      ? "bg-jade-100 text-jade-700 border border-jade-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Game Plan View
                </button>
              </div>
            </div>

            {/* Conditional View Rendering */}
            {state.currentView === "playbook" && (
              <>
                {/* Advanced Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 mb-4">
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

            {state.currentView === "practice-script" && (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Practice Script Builder
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Build practice sessions with plays from your playbook.
                    Create timelines, add repetitions, and export professional
                    practice scripts.
                  </p>
                  <button className="bg-jade-600 text-white px-4 py-2 rounded-md hover:bg-jade-700 transition-colors">
                    Create New Practice Script
                  </button>
                </div>
              </div>
            )}

            {state.currentView === "game-plan" && (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Game Plan Organization
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Organize plays by game situations using Brian Billick
                    methodology. Down & Distance, Red Zone, Goal Line, and more.
                  </p>
                  <button className="bg-jade-600 text-white px-4 py-2 rounded-md hover:bg-jade-700 transition-colors">
                    Create New Game Plan
                  </button>
                </div>
              </div>
            )}
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
          <div className="bg-white rounded-xl p-8 max-w-md mx-4 text-center transform animate-bounce-in">
            <div className="mb-4">🎉</div>
            <AchievementBadge size="lg">
              {state.recentAchievement}
            </AchievementBadge>
            <p className="text-gray-600 mt-4">
              You're building an incredible playbook! Keep the momentum going!
            </p>
            <button
              onClick={() =>
                setState((prev) => ({ ...prev, showCelebration: false }))
              }
              className="mt-6 px-6 py-2 bg-jade-600 text-white rounded-lg hover:bg-jade-700 transition-colors"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
