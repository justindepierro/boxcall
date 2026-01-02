/**
 * PlaybookPageHeader Component
 * Extracted from PlaybookPage.tsx for better maintainability
 */

import React from "react";
import { PlaybookViewTabs } from "../../../components/playbook/page/PlaybookViewTabs";
import type { ModalOptions, ModalType } from "../../../hooks/useModalManager";

interface PlaybookPageHeaderProps {
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
}

export function PlaybookPageHeader({
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
}: PlaybookPageHeaderProps) {
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
