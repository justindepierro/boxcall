import { Suspense, lazy } from "react";
import { Modal } from "../../ui/Modal";
import type { Play } from "../../../types/play";
import type { ModalType } from "../../../hooks/useModalManager";
import type { PlaybookAction } from "../../../contexts/PlaybookContext";
import type { PracticeScript } from "../../../services/practiceService";

// Lazy load modal components for code splitting (~120KB savings)
const AddNewPlayModal = lazy(() =>
  import("../AddNewPlayModal").then((module) => ({
    default: module.AddNewPlayModal,
  }))
);
const BulkQuickAddPlaysModal = lazy(() =>
  import("../BulkQuickAddPlaysModal").then((module) => ({
    default: module.BulkQuickAddPlaysModal,
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
const MergePlaybooksModal = lazy(() =>
  import("../MergePlaybooksModal").then((module) => ({
    default: module.MergePlaybooksModal,
  }))
);

interface Playbook {
  id: string;
  name: string;
  description?: string;
  play_count: number;
}

interface PlaybookModalsProps {
  // 🚀 PERFORMANCE: Centralized modal management (replaces 8 boolean props + 8 setters)
  isModalOpen: (modalType: Exclude<ModalType, null>) => boolean;
  openModal: (modalType: Exclude<ModalType, null>) => void;
  closeModal: () => void;

  // Modal data
  diagramPlay: Play | null;
  diagramMode: "edit" | "quick-play";
  assignmentsPlay: Play | null;
  editingScript: PracticeScript | null;
  playToPost: Play | null;

  // Data setters
  setDiagramPlay: (play: Play | null) => void;
  setAssignmentsPlay: (play: Play | null) => void;
  setEditingScript: (script: PracticeScript | null) => void;
  setPlayToPost: (play: Play | null) => void;

  // Other props
  activeTeamId: string | null;
  activePlaybookId: string;
  selectedPlaysForPractice: string[];
  setSelectedPlaysForPractice: (plays: string[]) => void;
  existingPlays: Play[];
  handleCreatePlay: (playData: Partial<Play>) => Promise<Play | void>;
  handleSavePlay: (play: Play) => Promise<void>;
  dispatch: React.Dispatch<PlaybookAction>;

  // Merge playbooks
  teamPlaybooks?: Playbook[];
  onMergePlaybooks?: (
    sourcePlaybookIds: string[],
    newPlaybookName: string,
    newPlaybookDescription?: string
  ) => Promise<void>;
}

export function PlaybookModals({
  isModalOpen,
  openModal,
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
  teamPlaybooks,
  onMergePlaybooks,
}: PlaybookModalsProps) {
  return (
    <>
      {/* Add New Play Modal */}
      {isModalOpen("addNewPlay") && (
        <Suspense fallback={<div>Loading...</div>}>
          <AddNewPlayModal
            isOpen={isModalOpen("addNewPlay")}
            onClose={() => closeModal()}
            onCreatePlay={handleCreatePlay}
            playbookId={activePlaybookId}
            existingPlays={existingPlays}
          />
        </Suspense>
      )}

      {/* Bulk Quick Add Plays */}
      {isModalOpen("bulkQuickAddPlays") && (
        <Suspense fallback={<div>Loading...</div>}>
          <BulkQuickAddPlaysModal
            isOpen={isModalOpen("bulkQuickAddPlays")}
            onClose={() => closeModal()}
            playbookId={activePlaybookId}
            existingPlays={existingPlays}
            onCreated={() => {
              dispatch({ type: "INCREMENT_REFRESH" });
            }}
          />
        </Suspense>
      )}

      {/* Playbook Settings Modal */}
      {isModalOpen("playbookSettings") && (
        <Suspense fallback={<div>Loading...</div>}>
          <PlaybookSettingsModal
            isOpen={isModalOpen("playbookSettings")}
            onClose={() => closeModal()}
            plays={existingPlays}
            onOpenPersonnel={() => {
              closeModal();
              openModal("personnel");
            }}
            onOpenMergePlaybooks={
              teamPlaybooks && teamPlaybooks.length >= 2
                ? () => {
                    closeModal();
                    openModal("mergePlaybooks");
                  }
                : undefined
            }
          />
        </Suspense>
      )}

      {/* Personnel Configuration Modal */}
      {isModalOpen("personnel") && (
        <Suspense fallback={<div>Loading...</div>}>
          <PersonnelConfigurationModal
            isOpen={isModalOpen("personnel")}
            onClose={() => closeModal()}
            playbookId={activePlaybookId}
          />
        </Suspense>
      )}

      {/* Play Assignments Modal */}
      {isModalOpen("assignments") && assignmentsPlay && (
        <Suspense fallback={<div>Loading...</div>}>
          <PlayAssignmentsModal
            play={assignmentsPlay}
            isOpen={isModalOpen("assignments")}
            onClose={() => {
              closeModal();
              setAssignmentsPlay(null);
            }}
          />
        </Suspense>
      )}

      {/* Keyboard Shortcuts Guide */}
      {isModalOpen("keyboardShortcuts") && (
        <Suspense fallback={<div>Loading...</div>}>
          <KeyboardShortcutsGuide
            isOpen={isModalOpen("keyboardShortcuts")}
            onClose={() => closeModal()}
          />
        </Suspense>
      )}

      {/* Practice Script Builder Modal */}
      {isModalOpen("practiceScriptBuilder") && (
        <Suspense fallback={<div>Loading practice script builder...</div>}>
          <PracticeScriptBuilder
            isOpen={isModalOpen("practiceScriptBuilder")}
            teamId={activeTeamId || ""}
            script={editingScript ?? undefined}
            selectedPlayIds={selectedPlaysForPractice}
            onCancel={() => {
              closeModal();
              setEditingScript(null);
              setSelectedPlaysForPractice([]);
            }}
            onSave={() => {
              closeModal();
              setEditingScript(null);
              setSelectedPlaysForPractice([]);
              dispatch({ type: "INCREMENT_REFRESH" });
            }}
          />
        </Suspense>
      )}

      {/* Post to Team Bulletin Modal */}
      {isModalOpen("postToBulletin") && playToPost && (
        <Modal
          isOpen={isModalOpen("postToBulletin")}
          onClose={() => {
            closeModal();
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

      {/* Merge Playbooks Modal */}
      {isModalOpen("mergePlaybooks") && teamPlaybooks && onMergePlaybooks && (
        <Suspense fallback={<div>Loading...</div>}>
          <MergePlaybooksModal
            isOpen={isModalOpen("mergePlaybooks")}
            onClose={() => closeModal()}
            playbooks={teamPlaybooks}
            onMerge={onMergePlaybooks}
          />
        </Suspense>
      )}
    </>
  );
}
