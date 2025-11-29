import React, { Suspense, lazy } from "react";
import { Modal } from "../../ui/Modal";
import type { Play } from "../../../types/play";
import type { ModalType } from "../../../hooks/useModalManager";

// Lazy load modal components for code splitting (~120KB savings)
const AddNewPlayModal = lazy(() =>
  import("../AddNewPlayModal").then((module) => ({
    default: module.AddNewPlayModal,
  }))
);
const PlaybookSettingsModal = lazy(() =>
  import("../PlaybookSettingsModal").then((module) => ({
    default: module.PlaybookSettingsModal,
  }))
);
const PersonnelConfigurationModal = lazy(() =>
  import("../PersonnelConfigurationModal").then((module) => ({
    default: module.PersonnelConfigurationModal,
  }))
);
const PlaybookHealthModal = lazy(() =>
  import("../PlaybookHealthModal").then((module) => ({
    default: module.PlaybookHealthModal,
  }))
);
const PlayAssignmentsModal = lazy(() =>
  import("../PlayAssignmentsModal").then((module) => ({
    default: module.PlayAssignmentsModal,
  }))
);
const KeyboardShortcutsGuide = lazy(() =>
  import("../KeyboardShortcutsGuide").then((module) => ({
    default: module.KeyboardShortcutsGuide,
  }))
);
const PracticeScriptBuilder = lazy(() =>
  import("../PracticeScriptBuilder").then((module) => ({
    default: module.PracticeScriptBuilder,
  }))
);

interface PlaybookModalsProps {
  // 🚀 PERFORMANCE: Centralized modal management (replaces 8 boolean props + 8 setters)
  isModalOpen: (modalType: Exclude<ModalType, null>) => boolean;
  closeModal: () => void;

  // Modal data
  diagramPlay: Play | null;
  diagramMode: "edit" | "quick-play";
  assignmentsPlay: Play | null;
  editingScript: any; // TODO: Type properly
  playToPost: Play | null;

  // Data setters
  setDiagramPlay: (play: Play | null) => void;
  setAssignmentsPlay: (play: Play | null) => void;
  setEditingScript: (script: any) => void;
  setPlayToPost: (play: Play | null) => void;

  // Other props
  activeTeamId: string | null;
  activePlaybookId: string;
  selectedPlaysForPractice: string[];
  setSelectedPlaysForPractice: (plays: string[]) => void;
  existingPlays: Play[];
  handleCreatePlay: (playData: Partial<Play>) => Promise<Play | void>;
  handleSavePlay: (play: Play) => Promise<void>;
  dispatch: any; // TODO: Type properly
}

export function PlaybookModals({
  isModalOpen,
  closeModal,
  diagramPlay: _diagramPlay,
  diagramMode: _diagramMode,
  assignmentsPlay,
  editingScript,
  playToPost,
  setDiagramPlay: _setDiagramPlay,
  setAssignmentsPlay,
  setEditingScript,
  setPlayToPost,
  activeTeamId,
  activePlaybookId,
  selectedPlaysForPractice,
  setSelectedPlaysForPractice,
  existingPlays,
  handleCreatePlay,
  handleSavePlay: _handleSavePlay,
  dispatch,
}: PlaybookModalsProps) {
  return (
    <>
      {/* Add New Play Modal */}
      {isModalOpen("addNewPlay") && (
        <Suspense fallback={<div>Loading...</div>}>
          <AddNewPlayModal
            isOpen={isModalOpen("addNewPlay")}
            onClose={() => closeModal("addNewPlay")}
            onCreatePlay={handleCreatePlay}
            playbookId={activePlaybookId}
            existingPlays={existingPlays}
          />
        </Suspense>
      )}

      {/* Playbook Settings Modal */}
      {isModalOpen("playbookSettings") && (
        <Suspense fallback={<div>Loading...</div>}>
          <PlaybookSettingsModal
            isOpen={isModalOpen("playbookSettings")}
            onClose={() => closeModal("playbookSettings")}
            onOpenPersonnel={() => {
              closeModal("playbookSettings");
              // Note: This requires openModal to be passed or personnel modal to open separately
            }}
          />
        </Suspense>
      )}

      {/* Personnel Configuration Modal */}
      {isModalOpen("personnel") && (
        <Suspense fallback={<div>Loading...</div>}>
          <PersonnelConfigurationModal
            isOpen={isModalOpen("personnel")}
            onClose={() => closeModal("personnel")}
            playbookId={activePlaybookId}
          />
        </Suspense>
      )}

      {/* Playbook Health Modal */}
      {isModalOpen("playbookHealth") && (
        <Suspense fallback={<div>Loading...</div>}>
          <PlaybookHealthModal
            isOpen={isModalOpen("playbookHealth")}
            onClose={() => closeModal("playbookHealth")}
            playbookId={activePlaybookId}
          />
        </Suspense>
      )}

      {/* Play Assignments Modal */}
      {isModalOpen("assignments") && assignmentsPlay && (
        <Modal
          isOpen={isModalOpen("assignments")}
          onClose={() => {
            closeModal("assignments");
            setAssignmentsPlay(null);
          }}
          title={`Assignments - ${assignmentsPlay.name}`}
          size="lg"
        >
          <Suspense fallback={<div>Loading...</div>}>
            <PlayAssignmentsModal
              play={assignmentsPlay}
              onClose={() => {
                closeModal("assignments");
                setAssignmentsPlay(null);
              }}
            />
          </Suspense>
        </Modal>
      )}

      {/* Keyboard Shortcuts Guide */}
      {isModalOpen("keyboardShortcuts") && (
        <Modal
          isOpen={isModalOpen("keyboardShortcuts")}
          onClose={() => closeModal("keyboardShortcuts")}
          title="Keyboard Shortcuts"
          size="md"
        >
          <Suspense fallback={<div>Loading...</div>}>
            <KeyboardShortcutsGuide
              isOpen={isModalOpen("keyboardShortcuts")}
              onClose={() => closeModal("keyboardShortcuts")}
            />
          </Suspense>
        </Modal>
      )}

      {/* Practice Script Builder Modal */}
      {isModalOpen("practiceScriptBuilder") && (
        <Modal
          isOpen={isModalOpen("practiceScriptBuilder")}
          onClose={() => {
            closeModal("practiceScriptBuilder");
            setEditingScript(null);
          }}
          title={
            editingScript ? "Edit Practice Script" : "Create Practice Script"
          }
          size="xl"
          fullScreen
        >
          <Suspense fallback={<div>Loading practice script builder...</div>}>
            <PracticeScriptBuilder
              teamId={activeTeamId || ""}
              editingScript={editingScript}
              selectedPlays={selectedPlaysForPractice}
              onClose={() => {
                closeModal("practiceScriptBuilder");
                setEditingScript(null);
                setSelectedPlaysForPractice([]);
              }}
              onSave={() => {
                closeModal("practiceScriptBuilder");
                setEditingScript(null);
                setSelectedPlaysForPractice([]);
                dispatch({ type: "REFRESH" });
              }}
            />
          </Suspense>
        </Modal>
      )}

      {/* Post to Team Bulletin Modal */}
      {isModalOpen("postToBulletin") && playToPost && (
        <Modal
          isOpen={isModalOpen("postToBulletin")}
          onClose={() => {
            closeModal("postToBulletin");
            setPlayToPost(null);
          }}
          title="Post to Team Bulletin"
          size="md"
        >
          <Suspense fallback={<div>Loading...</div>}>
            {/* TODO: Import and use PostToTeamBulletinModal */}
            <div>Post to Team Bulletin Modal Component Here</div>
          </Suspense>
        </Modal>
      )}
    </>
  );
}
