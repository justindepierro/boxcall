import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PlaybookViewTabs } from "../components/playbook/page/PlaybookViewTabs";
import { BulkActionsToolbar } from "../components/playbook/BulkActionsToolbar";
import { usePlaybook } from "../contexts/PlaybookContext";
import { useActiveTeamStore } from "../stores/activeTeamStore";
import { useTeamsData } from "../hooks/useTeamsData";
import { useIsMobileOrTablet } from "../hooks/useBreakpoint";
import { useMobileButtonProps } from "../hooks/useMobileButtonProps";
import { useFormationAudit } from "../hooks/useFormationAudit";
import { useOptimisticPlays } from "../hooks/useOptimisticPlays";
import { usePlaybookStats } from "../hooks/usePlaybookStats";
import {
  useTeamAssetPrefetch,
  type PrefetchablePlayMedia,
} from "../hooks/useTeamAssetPrefetch";
import { MobilePlaybookView } from "../components/playbook/page/MobilePlaybookView";
import { DesktopPlaybookView } from "../components/playbook/page/DesktopPlaybookView";
import { useModalManager } from "../hooks/useModalManager";
import { FullscreenDiagramViewer } from "../components/playbook/play-card/FullscreenDiagramViewer";
import { FormationLibraryModal } from "../components/playbook/modals/FormationLibraryModal";
import { PersonnelLibraryModal } from "../components/playbook/modals/PersonnelLibraryModal";
import { ConfirmationModal } from "../components/ui/ConfirmationModal/ConfirmationModal";
import { debug } from "../utils/logger";
import type { Play } from "../types/play";

// Extracted components
import { MobileFiltersBottomSheet } from "./playbook";
import { PlaybookModals } from "../components/playbook/page/PlaybookModals";

// Extracted hooks
import {
  usePlaybookHandlers,
  usePlaybookState,
  usePlaybookEffects,
  usePlaybookModalState,
  usePracticeScriptHandlers,
} from "./playbook/hooks";

// Lazy load modal components
const PracticeScriptModal = React.lazy(() =>
  import("../components/practice/PracticeScriptModal").then((module) => ({
    default: module.PracticeScriptModal,
  }))
);

const PlaybookPage = () => {
  const { state, dispatch } = usePlaybook();
  const navigate = useNavigate();
  const { activeTeamId } = useActiveTeamStore();
  const isMobileOrTablet = useIsMobileOrTablet();

  // Mobile-optimized button sizes
  const mobileButtonSize = useMobileButtonProps("md", true).size;
  const mobileSecondaryButtonSize = useMobileButtonProps("md", false).size;

  // Get playbooks for this team
  const {
    playbooks,
    refreshData,
    plays: allPlaysForStats = [],
    formations: allFormations = [],
    loading: teamsDataLoading,
    error: teamsDataError,
  } = useTeamsData();

  debug("📚 PlaybookPage - useTeamsData result:", {
    playbooksCount: playbooks.length,
    playsCount: allPlaysForStats.length,
    loading: teamsDataLoading,
    error: teamsDataError,
  });

  // Memoize filtered playbooks
  const teamPlaybooks = useMemo(
    () => playbooks.filter((pb) => pb.team_id === activeTeamId && pb.is_active),
    [playbooks, activeTeamId]
  );

  // Modal manager
  const { openModal, closeModal, closeAllModals, isModalOpen } =
    useModalManager();

  // Modal state hook
  const modalState = usePlaybookModalState();
  const {
    diagramPlay,
    setDiagramPlay,
    diagramMode,
    setDiagramMode,
    assignmentsPlay,
    setAssignmentsPlay,
    editingScript,
    setEditingScript,
    showPracticeScriptModal,
    setShowPracticeScriptModal,
    selectedPlaysForPractice,
    setSelectedPlaysForPractice,
    playToPost,
    setPlayToPost,
    showBulkDeleteConfirm,
    setShowBulkDeleteConfirm,
    mobileListExpanded,
    setMobileListExpanded,
    fullscreenPlayIndex,
    fullscreenPlays,
    handleEnterFullscreen,
    handleExitFullscreen,
  } = modalState;

  // State management hook
  const playbookState = usePlaybookState({
    activeTeamId,
    teamPlaybooks,
    allPlaysForStats,
    dispatch,
  });
  const {
    handlePlaybookChange,
    activePlaybookId,
    playsForActiveTeam,
    recentActivities,
    refreshActivities,
    suggestions,
  } = playbookState;

  // Asset prefetch
  useTeamAssetPrefetch({
    teamId: activeTeamId,
    formations: allFormations,
    playbooks: teamPlaybooks,
    plays: playsForActiveTeam as PrefetchablePlayMedia[],
  });

  // Optimistic plays
  const { optimisticPlays, handleCreatePlay, handleSavePlay } =
    useOptimisticPlays(activePlaybookId, () =>
      dispatch({ type: "INCREMENT_REFRESH" })
    );

  // Stats and audit hooks
  const formationAudit = useFormationAudit(activePlaybookId || null);
  const playbookStats = usePlaybookStats(
    allPlaysForStats as unknown as Play[],
    allFormations,
    recentActivities,
    (formationAudit.plays || []) as unknown as Play[]
  );
  const formationAuditSummary = playbookStats.formationAudit;

  // Handlers hook
  const handlers = usePlaybookHandlers({
    activeTeamId,
    state,
    dispatch,
    openModal,
    closeAllModals,
    setDiagramPlay,
    setDiagramMode,
    setEditingScript,
    setShowPracticeScriptModal,
    setShowBulkDeleteConfirm,
    setPlayToPost,
    refreshActivities,
  });

  // Practice script handlers
  const { handleSavePracticeScript } = usePracticeScriptHandlers({
    activeTeamId,
    setShowPracticeScriptModal,
    setEditingScript,
  });

  // Effects hook (keyboard shortcuts, preloading)
  usePlaybookEffects({
    handleOpenBuilder: handlers.handleOpenBuilder,
    handleQuickNewPracticeScript: handlers.handleQuickNewPracticeScript,
    handleQuickNewGamePlan: handlers.handleQuickNewGamePlan,
    closeAllModals,
  });

  // Search query (no debouncing for instant search)
  const debouncedSearchQuery = state.searchQuery;
  const selectedFiltersKey = JSON.stringify(state.selectedFilters ?? {});

  // Reset mobile list expansion on filter/search change
  useEffect(() => {
    if (!isMobileOrTablet) return;
    setMobileListExpanded(false);
  }, [
    isMobileOrTablet,
    debouncedSearchQuery,
    selectedFiltersKey,
    setMobileListExpanded,
  ]);

  return (
    <div className="min-h-screen">
      {/* Unified Header with Navigation */}
      <PlaybookViewTabs
        currentView={state.currentView}
        onViewChange={handlers.handleViewChange}
        currentTeamType={state.currentTeamType}
        onTeamTypeChange={handlers.handleTeamTypeChange}
        onOpenSettings={handlers.handleOpenSettings}
        onOpenBuilder={handlers.handleOpenBuilder}
        onOpenPersonnel={handlers.handleOpenPersonnel}
        onOpenHealth={() => openModal("playbookHealth")}
        onNavigate={(path) => {
          if (path === "/playbook/formations") {
            openModal("formationLibrary");
          } else if (path === "/playbook/personnel") {
            openModal("personnelLibrary");
          } else {
            navigate(path);
          }
        }}
        title="Playbook"
        playsCreated={state.playsCreated}
        diagramCoverage={state.diagramCoverage}
        streakDays={state.streakDays}
        playbooks={teamPlaybooks}
        activePlaybookId={activePlaybookId}
        onPlaybookChange={handlePlaybookChange}
        onPlaybookUpdated={refreshData}
        teamId={activeTeamId || ""}
        onCSVImportComplete={() => {
          refreshData();
          dispatch({ type: "INCREMENT_REFRESH" });
        }}
      />

      {/* Mobile/Tablet-First Layout */}
      {isMobileOrTablet ? (
        <MobilePlaybookView
          state={state}
          mobileListExpanded={mobileListExpanded}
          showFiltersSheet={isModalOpen("filtersSheet")}
          showStatsSheet={isModalOpen("statsSheet")}
          activeTeamId={activeTeamId}
          isLoadingPlays={teamsDataLoading}
          debouncedSearchQuery={debouncedSearchQuery}
          optimisticPlays={optimisticPlays}
          formationAudit={formationAudit}
          formationAuditSummary={formationAuditSummary}
          setMobileListExpanded={setMobileListExpanded}
          setShowFiltersSheet={(show) =>
            show ? openModal("filtersSheet") : closeModal()
          }
          setShowStatsSheet={(show) =>
            show ? openModal("statsSheet") : closeModal()
          }
          handleOpenQuickCreate={handlers.handleOpenQuickCreate}
          handleOpenPersonnel={handlers.handleOpenPersonnel}
          handleOpenSettings={handlers.handleOpenSettings}
          handleEditPlay={handlers.handleEditPlay}
          handleQuickNewPracticeScript={handlers.handleQuickNewPracticeScript}
          handleQuickNewGamePlan={handlers.handleQuickNewGamePlan}
          handleOpenKeyboardShortcuts={handlers.handleOpenKeyboardShortcuts}
          handlePullRefresh={handlers.handlePullRefresh}
          handleSavePlay={handleSavePlay}
          handleDuplicatePlay={handlers.handleDuplicatePlay}
          handleOpenBuilder={handlers.handleOpenBuilder}
          handleOpenAssignments={handlers.handleOpenAssignments}
          handlePostToTeamBulletin={handlers.handlePostToTeamBulletin}
          handleAddToPracticeScript={handlers.handleAddToPracticeScript}
          handleAddToGamePlan={handlers.handleAddToGamePlan}
          handlePlayCountChange={handlers.handlePlayCountChange}
          handleViewChange={handlers.handleViewChange}
          handleOpenPracticeScriptBuilder={
            handlers.handleOpenPracticeScriptBuilder
          }
          dispatch={dispatch}
          navigate={navigate}
          mobileButtonSize={mobileButtonSize}
          mobileSecondaryButtonSize={mobileSecondaryButtonSize}
          suggestions={suggestions}
        />
      ) : (
        <DesktopPlaybookView
          state={state}
          debouncedSearchQuery={debouncedSearchQuery}
          optimisticPlays={optimisticPlays}
          formationAudit={formationAudit}
          playbookStats={playbookStats}
          activeTeamId={activeTeamId}
          handleEditPlay={handlers.handleEditPlay}
          handleSavePlay={handleSavePlay}
          handleOpenBuilder={handlers.handleOpenBuilder}
          handleQuickNewGamePlan={handlers.handleQuickNewGamePlan}
          handleDuplicatePlay={handlers.handleDuplicatePlay}
          handleOpenAssignments={handlers.handleOpenAssignments}
          handlePostToTeamBulletin={handlers.handlePostToTeamBulletin}
          handleAddToPracticeScript={handlers.handleAddToPracticeScript}
          handleAddToGamePlan={handlers.handleAddToGamePlan}
          handlePlayCountChange={handlers.handlePlayCountChange}
          handleOpenPracticeScriptBuilder={
            handlers.handleOpenPracticeScriptBuilder
          }
          handleFiltersChange={handlers.handleFiltersChange}
          handleClearSelection={handlers.handleClearSelection}
          handleBulkAction={handlers.handleBulkAction}
          handleEnterFullscreen={handleEnterFullscreen}
          dispatch={dispatch}
          navigate={navigate}
          suggestions={suggestions}
          mobileButtonSize={mobileButtonSize}
        />
      )}

      {/* Modals */}
      <PlaybookModals
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        diagramPlay={diagramPlay}
        diagramMode={diagramMode}
        assignmentsPlay={assignmentsPlay}
        editingScript={editingScript}
        playToPost={playToPost}
        setDiagramPlay={setDiagramPlay}
        setAssignmentsPlay={setAssignmentsPlay}
        setEditingScript={setEditingScript}
        setPlayToPost={setPlayToPost}
        activeTeamId={activeTeamId}
        activePlaybookId={activePlaybookId}
        selectedPlaysForPractice={selectedPlaysForPractice}
        setSelectedPlaysForPractice={setSelectedPlaysForPractice}
        existingPlays={allPlaysForStats.map((play) => ({
          ...play,
          confidence_base: play.confidence_base ?? 3,
          times_called: play.times_called ?? 0,
          times_successful: play.times_successful ?? 0,
          created_by: "",
          created_at: new Date(play.created_at),
          updated_at: new Date(play.updated_at),
          diagram_data:
            typeof play.diagram_data === "string"
              ? JSON.parse(play.diagram_data)
              : play.diagram_data,
        }))}
        handleCreatePlay={handleCreatePlay}
        handleSavePlay={handleSavePlay}
        dispatch={dispatch}
      />

      {/* Mobile/Tablet Filters Bottom Sheet */}
      {isMobileOrTablet && (
        <MobileFiltersBottomSheet
          isOpen={isModalOpen("filtersSheet")}
          onClose={closeModal}
          advancedFilters={state.advancedFilters}
          onFiltersChange={handlers.handleFiltersChange}
          onClearAll={() => {
            dispatch({ type: "SET_ADVANCED_FILTERS", filters: [] });
            closeModal();
          }}
          mobileButtonSize={mobileButtonSize}
          mobileSecondaryButtonSize={mobileSecondaryButtonSize}
        />
      )}

      {/* Bulk Actions Floating Toolbar */}
      <BulkActionsToolbar
        selectedCount={state.selectedPlayIds?.size || 0}
        onClearSelection={() => dispatch({ type: "CLEAR_SELECTION" })}
        onBulkAction={handlers.handleBulkAction}
      />

      {/* Fullscreen Diagram Viewer */}
      {fullscreenPlayIndex !== null && fullscreenPlays.length > 0 && (
        <FullscreenDiagramViewer
          plays={fullscreenPlays}
          initialPlayIndex={fullscreenPlayIndex}
          onClose={handleExitFullscreen}
        />
      )}

      {/* Formation Library Modal */}
      <FormationLibraryModal
        isOpen={isModalOpen("formationLibrary")}
        onClose={closeModal}
        playbookId={activePlaybookId}
      />

      {/* Personnel Library Modal */}
      <PersonnelLibraryModal
        isOpen={isModalOpen("personnelLibrary")}
        onClose={closeModal}
        playbookId={activePlaybookId}
      />

      {/* Practice Script Modal */}
      {showPracticeScriptModal && (
        <React.Suspense
          fallback={
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-modal">
              <div className="text-white">Loading...</div>
            </div>
          }
        >
          <PracticeScriptModal
            editingScript={editingScript}
            onClose={() => {
              setShowPracticeScriptModal(false);
              setEditingScript(null);
            }}
            onSave={handleSavePracticeScript}
          />
        </React.Suspense>
      )}

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handlers.confirmBulkDelete}
        title="Delete Plays"
        message={`Are you sure you want to delete ${state.selectedPlayIds?.size || 0} ${(state.selectedPlayIds?.size || 0) === 1 ? "play" : "plays"}?`}
        variant="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

PlaybookPage.displayName = "PlaybookPage";

export default React.memo(PlaybookPage);
