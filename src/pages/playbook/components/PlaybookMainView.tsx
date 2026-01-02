/**
 * PlaybookMainView Component
 * Extracted from PlaybookPage.tsx - Handles mobile vs desktop layout switching
 */

import React from "react";
import { MobilePlaybookView } from "../../../components/playbook/page/MobilePlaybookView";
import { DesktopPlaybookView } from "../../../components/playbook/page/DesktopPlaybookView";
import type { ModalOptions, ModalType } from "../../../hooks/useModalManager";

type MobileButtonSize = "sm" | "md" | "lg";

interface PlaybookMainViewProps {
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
  mobileButtonSize: MobileButtonSize;
  mobileSecondaryButtonSize: MobileButtonSize;
  playbookStats: any;
  suggestions: any;
}

export function PlaybookMainView({
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
}: PlaybookMainViewProps) {
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
