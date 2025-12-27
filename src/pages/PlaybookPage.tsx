import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PlaybookViewTabs } from "../components/playbook/page/PlaybookViewTabs";
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
import {
  useTeamAssetPrefetch,
  type PrefetchablePlayMedia,
} from "../hooks/useTeamAssetPrefetch";
import { MobilePlaybookView } from "../components/playbook/page/MobilePlaybookView";
import { DesktopPlaybookView } from "../components/playbook/page/DesktopPlaybookView";
import { useModalManager } from "../hooks/useModalManager";
import type { ModalOptions, ModalType } from "../hooks/useModalManager";
import { FullscreenDiagramViewer } from "../components/playbook/play-card/FullscreenDiagramViewer";
import { FormationLibraryModal } from "../components/playbook/modals/FormationLibraryModal";
import { PersonnelLibraryModal } from "../components/playbook/modals/PersonnelLibraryModal";
import { ConfirmationModal } from "../components/ui/ConfirmationModal/ConfirmationModal";
import { debug, logError } from "../utils/logger";
import type { Play } from "../types/play";
import { PlaysService } from "../services/playsService";
import { exportPlays } from "../services/exportService";
import { useToast } from "../hooks/useToast";

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

type MobileButtonSize = "sm" | "md" | "lg";

function normalizeMobileButtonSize(
  size: unknown,
  fallback: MobileButtonSize
): MobileButtonSize {
  return size === "sm" || size === "md" || size === "lg" ? size : fallback;
}

function buildExistingPlaysForModals(
  allPlaysForStats: unknown[],
  activePlaybookId: string | null
): Play[] {
  return allPlaysForStats.map((play) => {
    const rawPlay = play as any;

    const rawDiagram = rawPlay.diagram_data;
    const diagram_data: Play["diagram_data"] = (() => {
      if (typeof rawDiagram === "string") {
        try {
          const parsed = JSON.parse(rawDiagram);
          return Array.isArray(parsed)
            ? (parsed as unknown as Play["diagram_data"])
            : null;
        } catch {
          return null;
        }
      }
      return Array.isArray(rawDiagram)
        ? (rawDiagram as unknown as Play["diagram_data"])
        : null;
    })();

    return {
      ...rawPlay,
      playbook_id: String(rawPlay.playbook_id ?? activePlaybookId ?? ""),
      confidence_base: rawPlay.confidence_base ?? 3,
      times_called: rawPlay.times_called ?? 0,
      times_successful: rawPlay.times_successful ?? 0,
      created_by: String(rawPlay.created_by ?? ""),
      created_at: new Date(rawPlay.created_at ?? Date.now()),
      updated_at: new Date(rawPlay.updated_at ?? Date.now()),
      diagram_data,
    } as Play;
  });
}

function PlaybookPageHeader({
  state,
  teamPlaybooks,
  activePlaybookId,
  activeTeamId,
  refreshData,
  openModal,
  navigate,
  dispatch,
  handlePlaybookChange,
  handlers,
  onExportCSV,
}: {
  state: any;
  teamPlaybooks: any[];
  activePlaybookId: string | null;
  activeTeamId: string;
  refreshData: () => void;
  openModal: (type: Exclude<ModalType, null>, options?: ModalOptions) => void;
  navigate: (path: string) => void;
  dispatch: React.Dispatch<any>;
  handlePlaybookChange: (id: string) => void;
  handlers: any;
  onExportCSV?: () => void;
}) {
  return (
    <PlaybookViewTabs
      currentView={state.currentView}
      onViewChange={handlers.handleViewChange}
      currentTeamType={state.currentTeamType}
      onTeamTypeChange={handlers.handleTeamTypeChange}
      onOpenSettings={handlers.handleOpenSettings}
      onOpenBuilder={handlers.handleOpenBuilder}
      onOpenBulkQuickAdd={handlers.handleOpenBulkQuickAdd}
      onExportCSV={onExportCSV}
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
      activePlaybookId={activePlaybookId ?? undefined}
      onPlaybookChange={handlePlaybookChange}
      onPlaybookUpdated={refreshData}
      teamId={activeTeamId || ""}
      onCSVImportComplete={() => {
        refreshData();
        dispatch({ type: "INCREMENT_REFRESH" });
      }}
    />
  );
}

function PlaybookMainView({
  isMobileOrTablet,
  state,
  isModalOpen,
  openModal,
  closeModal,
  activeTeamId,
  activePlaybookId,
  teamsDataLoading,
  optimisticPlays,
  formationAudit,
  handlers,
  handleSavePlay,
  handleEnterFullscreen,
  dispatch,
  navigate,
  mobileButtonSize,
  mobileSecondaryButtonSize,
  playbookStats,
  suggestions,
}: {
  isMobileOrTablet: boolean;
  state: any;
  isModalOpen: (type: Exclude<ModalType, null>) => boolean;
  openModal: (type: Exclude<ModalType, null>, options?: ModalOptions) => void;
  closeModal: () => void;
  activeTeamId: string | null;
  activePlaybookId: string | null;
  teamsDataLoading: boolean;
  optimisticPlays: any[];
  formationAudit: any;
  handlers: any;
  handleSavePlay: any;
  handleEnterFullscreen: any;
  dispatch: React.Dispatch<any>;
  navigate: any;
  mobileButtonSize: "sm" | "md" | "lg";
  mobileSecondaryButtonSize: "sm" | "md" | "lg";
  playbookStats: any;
  suggestions: any;
}) {
  if (isMobileOrTablet) {
    return (
      <MobilePlaybookView
        state={state}
        showFiltersSheet={isModalOpen("filtersSheet")}
        showStatsSheet={isModalOpen("statsSheet")}
        activeTeamId={activeTeamId}
        activePlaybookId={activePlaybookId}
        isLoadingPlays={teamsDataLoading}
        optimisticPlays={optimisticPlays}
        formationAudit={formationAudit}
        setShowFiltersSheet={(show) =>
          show ? openModal("filtersSheet") : closeModal()
        }
        setShowStatsSheet={(show) =>
          show ? openModal("statsSheet") : closeModal()
        }
        handleSortChange={(sortBy) =>
          handlers.handleSortChange(sortBy, state.filters)
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
        mobileButtonSize={mobileButtonSize}
        mobileSecondaryButtonSize={mobileSecondaryButtonSize}
        suggestions={suggestions}
      />
    );
  }

  return (
    <DesktopPlaybookView
      state={state}
      activePlaybookId={activePlaybookId}
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
      handleOpenPracticeScriptBuilder={handlers.handleOpenPracticeScriptBuilder}
      handleFiltersChange={handlers.handleFiltersChange}
      handleClearSelection={handlers.handleClearSelection}
      handleBulkAction={handlers.handleBulkAction}
      handleEnterFullscreen={handleEnterFullscreen}
      handleSortChange={(sortBy) =>
        handlers.handleSortChange(sortBy, state.filters)
      }
      dispatch={dispatch}
      navigate={navigate}
      suggestions={suggestions}
      mobileButtonSize={mobileButtonSize}
    />
  );
}

function PracticeScriptModalLoader({
  show,
  editingScript,
  onClose,
  onSave,
}: {
  show: boolean;
  editingScript: any;
  onClose: () => void;
  onSave: (script: unknown) => void;
}) {
  if (!show) return null;

  return (
    <React.Suspense
      fallback={
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-modal">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <PracticeScriptModal
        editingScript={editingScript ?? undefined}
        onClose={onClose}
        onSave={onSave}
      />
    </React.Suspense>
  );
}

function PlaybookPageView({
  state,
  dispatch,
  navigate,
  activeTeamId,
  isMobileOrTablet,
  teamPlaybooks,
  activePlaybookId,
  refreshData,
  handlePlaybookChange,
  handlers,
  isModalOpen,
  openModal,
  closeModal,
  teamsDataLoading,
  optimisticPlays,
  formationAudit,
  handleSavePlay,
  handleEnterFullscreen,
  playbookStats,
  suggestions,
  diagramPlay,
  diagramMode,
  assignmentsPlay,
  editingScript,
  playToPost,
  setDiagramPlay,
  setAssignmentsPlay,
  setEditingScript,
  setPlayToPost,
  selectedPlaysForPractice,
  setSelectedPlaysForPractice,
  existingPlays,
  handleCreatePlay,
  fullscreenPlayIndex,
  fullscreenPlays,
  handleExitFullscreen,
  showPracticeScriptModal,
  setShowPracticeScriptModal,
  handleSavePracticeScript,
  showBulkDeleteConfirm,
  setShowBulkDeleteConfirm,
  mobileButtonSize,
  mobileSecondaryButtonSize,
}: {
  state: any;
  dispatch: React.Dispatch<any>;
  navigate: (path: string) => void;
  activeTeamId: string | null;
  isMobileOrTablet: boolean;
  teamPlaybooks: any[];
  activePlaybookId: string | null;
  refreshData: () => void;
  handlePlaybookChange: (id: string) => void;
  handlers: any;
  isModalOpen: (type: Exclude<ModalType, null>) => boolean;
  openModal: (type: Exclude<ModalType, null>, options?: ModalOptions) => void;
  closeModal: () => void;
  teamsDataLoading: boolean;
  optimisticPlays: any[];
  formationAudit: any;
  handleSavePlay: any;
  handleEnterFullscreen: any;
  playbookStats: any;
  suggestions: any;
  diagramPlay: any;
  diagramMode: any;
  assignmentsPlay: any;
  editingScript: any;
  playToPost: any;
  setDiagramPlay: (play: any) => void;
  setAssignmentsPlay: (play: any) => void;
  setEditingScript: (script: any) => void;
  setPlayToPost: (play: any) => void;
  selectedPlaysForPractice: any;
  setSelectedPlaysForPractice: (plays: any) => void;
  existingPlays: Play[];
  handleCreatePlay: any;
  fullscreenPlayIndex: number | null;
  fullscreenPlays: any[];
  handleExitFullscreen: () => void;
  showPracticeScriptModal: boolean;
  setShowPracticeScriptModal: (show: boolean) => void;
  handleSavePracticeScript: (script: any) => Promise<void>;
  showBulkDeleteConfirm: boolean;
  setShowBulkDeleteConfirm: (show: boolean) => void;
  mobileButtonSize: MobileButtonSize;
  mobileSecondaryButtonSize: MobileButtonSize;
}) {
  const toast = useToast();

  const handleExportCSV = useCallback(async () => {
    if (!activePlaybookId) {
      toast.warning("Select a playbook first");
      return;
    }

    try {
      const plays = await PlaysService.getPlaysByPlaybook(activePlaybookId);
      if (plays.length === 0) {
        toast.info("No plays to export");
        return;
      }

      const playbookName =
        teamPlaybooks?.find((p) => p?.id === activePlaybookId)?.name ||
        "playbook";
      const safeName = String(playbookName)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-_]/g, "");
      const date = new Date().toISOString().split("T")[0];

      exportPlays(plays, {
        format: "csv",
        filename: `boxcall-${safeName || "playbook"}-${date}.csv`,
        includeMetadata: true,
      });
      toast.success(`Exported ${plays.length} plays to CSV`);
    } catch (err) {
      logError("Playbook CSV export failed:", err);
      toast.error("Failed to export CSV");
    }
  }, [activePlaybookId, teamPlaybooks, toast]);

  return (
    <div className="min-h-screen">
      {/* Unified Header with Navigation */}
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

      <PlaybookPageOverlays
        state={state}
        dispatch={dispatch}
        isMobileOrTablet={isMobileOrTablet}
        isModalOpen={isModalOpen}
        openModal={openModal}
        closeModal={closeModal}
        handlers={handlers}
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
        existingPlays={existingPlays}
        handleCreatePlay={handleCreatePlay}
        handleSavePlay={handleSavePlay}
        fullscreenPlayIndex={fullscreenPlayIndex}
        fullscreenPlays={fullscreenPlays}
        handleExitFullscreen={handleExitFullscreen}
        showPracticeScriptModal={showPracticeScriptModal}
        setShowPracticeScriptModal={setShowPracticeScriptModal}
        handleSavePracticeScript={handleSavePracticeScript}
        showBulkDeleteConfirm={showBulkDeleteConfirm}
        setShowBulkDeleteConfirm={setShowBulkDeleteConfirm}
        mobileButtonSize={mobileButtonSize}
        mobileSecondaryButtonSize={mobileSecondaryButtonSize}
        teamPlaybooks={teamPlaybooks}
        onRefreshData={refreshData}
      />
    </div>
  );
}

function PlaybookPageOverlays({
  state,
  dispatch,
  isMobileOrTablet,
  isModalOpen,
  closeModal,
  handlers,
  diagramPlay,
  diagramMode,
  assignmentsPlay,
  editingScript,
  playToPost,
  setDiagramPlay,
  setAssignmentsPlay,
  setEditingScript,
  setPlayToPost,
  activeTeamId,
  activePlaybookId,
  selectedPlaysForPractice,
  setSelectedPlaysForPractice,
  existingPlays,
  handleCreatePlay,
  handleSavePlay,
  fullscreenPlayIndex,
  fullscreenPlays,
  handleExitFullscreen,
  showPracticeScriptModal,
  setShowPracticeScriptModal,
  handleSavePracticeScript,
  showBulkDeleteConfirm,
  setShowBulkDeleteConfirm,
  mobileButtonSize,
  mobileSecondaryButtonSize,
  teamPlaybooks,
  onRefreshData,
  openModal,
}: {
  state: any;
  dispatch: React.Dispatch<any>;
  isMobileOrTablet: boolean;
  isModalOpen: (type: Exclude<ModalType, null>) => boolean;
  openModal: (type: Exclude<ModalType, null>, options?: ModalOptions) => void;
  closeModal: () => void;
  handlers: any;
  diagramPlay: any;
  diagramMode: any;
  assignmentsPlay: any;
  editingScript: any;
  playToPost: any;
  setDiagramPlay: (play: any) => void;
  setAssignmentsPlay: (play: any) => void;
  setEditingScript: (script: any) => void;
  setPlayToPost: (play: any) => void;
  activeTeamId: string | null;
  activePlaybookId: string | null;
  selectedPlaysForPractice: any;
  setSelectedPlaysForPractice: (plays: any) => void;
  existingPlays: Play[];
  handleCreatePlay: any;
  handleSavePlay: any;
  fullscreenPlayIndex: number | null;
  fullscreenPlays: any[];
  handleExitFullscreen: () => void;
  showPracticeScriptModal: boolean;
  setShowPracticeScriptModal: (show: boolean) => void;
  handleSavePracticeScript: (script: any) => Promise<void>;
  showBulkDeleteConfirm: boolean;
  setShowBulkDeleteConfirm: (show: boolean) => void;
  mobileButtonSize: MobileButtonSize;
  mobileSecondaryButtonSize: MobileButtonSize;
  teamPlaybooks: any[];
  onRefreshData?: () => void;
}) {
  // Handle merge playbooks
  const handleMergePlaybooks = useCallback(
    async (
      sourcePlaybookIds: string[],
      newPlaybookName: string,
      newPlaybookDescription?: string
    ) => {
      try {
        await PlaysService.mergePlaybooks(
          sourcePlaybookIds,
          newPlaybookName,
          newPlaybookDescription,
          activeTeamId || undefined
        );
        // Refresh playbooks list after merge
        onRefreshData?.();
      } catch (error) {
        logError("Failed to merge playbooks:", error);
        throw error;
      }
    },
    [activeTeamId, onRefreshData]
  );

  return (
    <>
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
    </>
  );
}

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
    <PlaybookPageView
      state={state}
      dispatch={dispatch}
      navigate={navigate}
      activeTeamId={activeTeamId}
      isMobileOrTablet={isMobileOrTablet}
      teamPlaybooks={teamPlaybooks}
      activePlaybookId={activePlaybookId}
      refreshData={refreshData}
      handlePlaybookChange={handlePlaybookChange}
      handlers={handlers}
      isModalOpen={isModalOpen}
      openModal={openModal}
      closeModal={closeModal}
      teamsDataLoading={teamsDataLoading}
      optimisticPlays={optimisticPlays}
      formationAudit={formationAudit}
      handleSavePlay={handleSavePlay}
      handleEnterFullscreen={handleEnterFullscreen}
      playbookStats={playbookStats}
      suggestions={suggestions}
      diagramPlay={diagramPlay}
      diagramMode={diagramMode}
      assignmentsPlay={assignmentsPlay}
      editingScript={editingScript}
      playToPost={playToPost}
      setDiagramPlay={setDiagramPlay}
      setAssignmentsPlay={setAssignmentsPlay}
      setEditingScript={setEditingScript}
      setPlayToPost={setPlayToPost}
      selectedPlaysForPractice={selectedPlaysForPractice}
      setSelectedPlaysForPractice={setSelectedPlaysForPractice}
      existingPlays={existingPlays}
      handleCreatePlay={handleCreatePlay}
      fullscreenPlayIndex={fullscreenPlayIndex}
      fullscreenPlays={fullscreenPlays}
      handleExitFullscreen={handleExitFullscreen}
      showPracticeScriptModal={showPracticeScriptModal}
      setShowPracticeScriptModal={setShowPracticeScriptModal}
      handleSavePracticeScript={handleSavePracticeScript}
      showBulkDeleteConfirm={showBulkDeleteConfirm}
      setShowBulkDeleteConfirm={setShowBulkDeleteConfirm}
      mobileButtonSize={mobileButtonSize}
      mobileSecondaryButtonSize={mobileSecondaryButtonSize}
    />
  );
};

PlaybookPage.displayName = "PlaybookPage";

export default React.memo(PlaybookPage);
