import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BulkActionsToolbar } from "../components/playbook/BulkActionsToolbar";
import { usePlaybook } from "../contexts/PlaybookContext";
import { useActiveTeamStore } from "../stores/activeTeamStore";
import { useTeamsData } from "../hooks/useTeamsData";
import { usePlaybookData } from "../hooks/usePlaybookData";
import { useFilteredPlays } from "../hooks/useFilteredPlays";
import { useIsMobileOrTablet } from "../hooks/useBreakpoint";
import { useMobileButtonProps } from "../hooks/useMobileButtonProps";
import { useFormationAudit } from "../hooks/useFormationAudit";
import { useOptimisticPlays } from "../hooks/useOptimisticPlays";
import { usePlaybookStats } from "../hooks/usePlaybookStats";
import { useFavoritePlays } from "../hooks/useFavoritePlays";
import type { Play } from "../types/play";
import {
  useTeamAssetPrefetch,
  type PrefetchablePlayMedia,
} from "../hooks/useTeamAssetPrefetch";
import { useModalManager } from "../hooks/useModalManager";
import { FullscreenDiagramViewer } from "../components/playbook/play-card/FullscreenDiagramViewer";
import { FormationLibraryModal } from "../components/playbook/modals/FormationLibraryModal";
import { PersonnelLibraryModal } from "../components/playbook/modals/PersonnelLibraryModal";
import { ConfirmationModal } from "../components/ui/ConfirmationModal/ConfirmationModal";
import { debug } from "../utils/logger";

// Extracted components
import { MobileFiltersBottomSheet } from "./playbook";
import { PlaybookModals } from "../components/playbook/page/PlaybookModals";
import {
  PlaybookPageHeader,
  PlaybookMainView,
  PracticeScriptModalLoader,
} from "./playbook/components";

// Extracted hooks
import {
  usePlaybookHandlers,
  usePlaybookState,
  usePlaybookEffects,
  usePlaybookModalState,
  usePracticeScriptHandlers,
  useCSVExport,
  useMergePlaybooks,
} from "./playbook/hooks";

// Extracted utilities
import {
  normalizeMobileButtonSize,
  buildExistingPlaysForModals,
} from "./playbook/utils/playbookHelpers";
// eslint-disable-next-line max-lines-per-function
const PlaybookPage = () => {
  const { state, dispatch } = usePlaybook();
  const navigate = useNavigate();
  const activeTeamId = useActiveTeamStore((s) => s.activeTeamId);
  const isMobileOrTablet = useIsMobileOrTablet();

  // Mobile-optimized button sizes
  const rawMobileButtonSize = useMobileButtonProps("md", true).size;
  const rawMobileSecondaryButtonSize = useMobileButtonProps("md", false).size;

  const mobileButtonSize = normalizeMobileButtonSize(rawMobileButtonSize, "md");
  const mobileSecondaryButtonSize = normalizeMobileButtonSize(
    rawMobileSecondaryButtonSize,
    "md"
  );

  // Get playbooks for this team
  // NOTE: Don't pass playbookId here - PlayList handles playbook-scoped fetching
  // This fetch gets all playbooks/plays for filtering and stats calculation
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
  const { favoriteIds } = useFavoritePlays();

  // SINGLE SOURCE OF TRUTH: usePlaybookData provides plays scoped to playbook
  const { plays: playbookPlays, totalCount: dbTotalCount } =
    usePlaybookData(activePlaybookId);

  // DEBUG: Trace what activePlaybookId is being used
  debug(
    "🔍 PlaybookPage activePlaybookId:",
    activePlaybookId,
    "playbookPlays.length:",
    playbookPlays.length
  );

  // Merge optimistic plays with database plays
  const allPlaysForPlaybook = useMemo(() => {
    const dbPlayIds = new Set(playbookPlays.map((p) => p.id));
    const uniqueOptimisticPlays = optimisticPlays.filter(
      (p) => !dbPlayIds.has(p.id)
    );
    return [...uniqueOptimisticPlays, ...playbookPlays];
  }, [playbookPlays, optimisticPlays]);

  // PHASE 4: Use unified filters from context and apply filtering
  // Stats now reflect what user sees (filtered plays)
  const { filteredPlays: filteredPlaysForStats } = useFilteredPlays(
    allPlaysForPlaybook,
    state.filters,
    favoriteIds
  );

  const scopedFormationsForStats = useMemo(() => {
    if (!activePlaybookId) return allFormations;
    return (allFormations as any[]).filter(
      (f) => String((f as any).playbook_id ?? "") === String(activePlaybookId)
    ) as any;
  }, [allFormations, activePlaybookId]);

  // Stats now calculated from FILTERED plays - always matches what user sees!
  const playbookStats = usePlaybookStats(
    filteredPlaysForStats,
    scopedFormationsForStats,
    recentActivities,
    (formationAudit.plays || []) as unknown as Play[],
    dbTotalCount // Pass DB total for accurate count during pagination
  );

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

  // CSV export handler
  const { handleExportCSV } = useCSVExport(activePlaybookId, teamPlaybooks);

  // Merge playbooks handler
  const { handleMergePlaybooks } = useMergePlaybooks(activeTeamId, refreshData);

  // Effects hook (keyboard shortcuts, preloading)
  usePlaybookEffects({
    handleOpenBuilder: handlers.handleOpenBuilder,
    handleQuickNewPracticeScript: handlers.handleQuickNewPracticeScript,
    handleQuickNewGamePlan: handlers.handleQuickNewGamePlan,
    closeAllModals,
  });

  const existingPlays = useMemo(
    () => buildExistingPlaysForModals(allPlaysForStats, activePlaybookId),
    [allPlaysForStats, activePlaybookId]
  );

  return (
    <div className="min-h-screen">
      {/* Unified Header with Navigation - Hidden on mobile (MobilePlaybookView has its own header) */}
      {!isMobileOrTablet && (
        <PlaybookPageHeader
          state={state}
          teamPlaybooks={teamPlaybooks}
          activePlaybookId={activePlaybookId}
          activeTeamId={activeTeamId || ""}
          refreshData={refreshData}
          openModal={openModal}
          navigate={navigate}
          dispatch={dispatch}
          handlePlaybookChange={handlePlaybookChange}
          handlers={handlers}
          onExportCSV={handleExportCSV}
        />
      )}

      {/* Mobile/Tablet-First Layout */}
      <PlaybookMainView
        isMobileOrTablet={isMobileOrTablet}
        state={state}
        isModalOpen={isModalOpen}
        openModal={openModal}
        closeModal={closeModal}
        activeTeamId={activeTeamId}
        activePlaybookId={activePlaybookId}
        teamsDataLoading={teamsDataLoading}
        optimisticPlays={optimisticPlays}
        formationAudit={formationAudit}
        handlers={handlers}
        handleSavePlay={handleSavePlay}
        handleEnterFullscreen={handleEnterFullscreen}
        dispatch={dispatch}
        navigate={navigate}
        mobileButtonSize={mobileButtonSize}
        mobileSecondaryButtonSize={mobileSecondaryButtonSize}
        playbookStats={playbookStats}
        suggestions={suggestions}
      />

      {/* Modals */}
      <PlaybookModals
        isModalOpen={isModalOpen}
        openModal={openModal}
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
        activePlaybookId={activePlaybookId ?? ""}
        selectedPlaysForPractice={selectedPlaysForPractice}
        setSelectedPlaysForPractice={setSelectedPlaysForPractice}
        existingPlays={existingPlays}
        handleCreatePlay={handleCreatePlay}
        handleSavePlay={handleSavePlay}
        dispatch={dispatch}
        teamPlaybooks={teamPlaybooks}
        onMergePlaybooks={handleMergePlaybooks}
      />

      {/* Mobile/Tablet Filters Bottom Sheet */}
      {isMobileOrTablet && (
        <MobileFiltersBottomSheet
          isOpen={isModalOpen("filtersSheet")}
          onClose={closeModal}
          filters={state.filters}
          onFiltersChange={handlers.handleFiltersChange}
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
        playbookId={activePlaybookId ?? ""}
      />

      {/* Personnel Library Modal */}
      <PersonnelLibraryModal
        isOpen={isModalOpen("personnelLibrary")}
        onClose={closeModal}
        playbookId={activePlaybookId ?? ""}
      />

      <PracticeScriptModalLoader
        show={showPracticeScriptModal}
        editingScript={editingScript}
        onClose={() => {
          setShowPracticeScriptModal(false);
          setEditingScript(null);
        }}
        onSave={(script) => {
          void handleSavePracticeScript(script as any);
        }}
      />

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
