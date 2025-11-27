import React, { Suspense, lazy } from "react";
import { Modal } from "../../ui/Modal";
import type { Play } from "../../../types/play";

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
  // Modal states
  showAddNewPlayModal: boolean;
  showPlaybookSettingsModal: boolean;
  showPersonnelModal: boolean;
  showPlaybookHealthModal: boolean;
  showAssignmentsModal: boolean;
  showKeyboardShortcutsModal: boolean;
  showPracticeScriptBuilder: boolean;
  showPostToBulletinModal: boolean;

  // Modal data
  diagramPlay: Play | null;
  diagramMode: "edit" | "quick-play";
  assignmentsPlay: Play | null;
  editingScript: any; // TODO: Type properly
  playToPost: Play | null;

  // Modal handlers
  setShowAddNewPlayModal: (show: boolean) => void;
  setShowPlaybookSettingsModal: (show: boolean) => void;
  setShowPersonnelModal: (show: boolean) => void;
  setShowPlaybookHealthModal: (show: boolean) => void;
  setShowAssignmentsModal: (show: boolean) => void;
  setShowKeyboardShortcutsModal: (show: boolean) => void;
  setShowPracticeScriptBuilder: (show: boolean) => void;
  setShowPostToBulletinModal: (show: boolean) => void;

  // Data setters
  setDiagramPlay: (play: Play | null) => void;
  setAssignmentsPlay: (play: Play | null) => void;
  setEditingScript: (script: any) => void;
  setPlayToPost: (play: Play | null) => void;

  // Other props
  activeTeamId: string | null;
  selectedPlaysForPractice: string[];
  setSelectedPlaysForPractice: (plays: string[]) => void;
  handleSavePlay: (play: Play) => Promise<void>;
  dispatch: any; // TODO: Type properly
}

export function PlaybookModals({
  showAddNewPlayModal,
  showPlaybookSettingsModal,
  showPersonnelModal,
  showPlaybookHealthModal,
  showAssignmentsModal,
  showKeyboardShortcutsModal,
  showPracticeScriptBuilder,
  showPostToBulletinModal,
  diagramPlay,
  diagramMode,
  assignmentsPlay,
  editingScript,
  playToPost,
  setShowAddNewPlayModal,
  setShowPlaybookSettingsModal,
  setShowPersonnelModal,
  setShowPlaybookHealthModal,
  setShowAssignmentsModal,
  setShowKeyboardShortcutsModal,
  setShowPracticeScriptBuilder,
  setShowPostToBulletinModal,
  setDiagramPlay,
  setAssignmentsPlay,
  setEditingScript,
  setPlayToPost,
  activeTeamId,
  selectedPlaysForPractice,
  setSelectedPlaysForPractice,
  handleSavePlay,
  dispatch,
}: PlaybookModalsProps) {
  return (
    <>
      {/* Add New Play Modal */}
      {showAddNewPlayModal && (
        <Modal
          isOpen={showAddNewPlayModal}
          onClose={() => setShowAddNewPlayModal(false)}
          title="Create New Play"
          size="lg"
        >
          <Suspense fallback={<div>Loading...</div>}>
            <AddNewPlayModal
              onClose={() => setShowAddNewPlayModal(false)}
              onSave={handleSavePlay}
              teamId={activeTeamId || ""}
            />
          </Suspense>
        </Modal>
      )}

      {/* Playbook Settings Modal */}
      {showPlaybookSettingsModal && (
        <Modal
          isOpen={showPlaybookSettingsModal}
          onClose={() => setShowPlaybookSettingsModal(false)}
          title="Playbook Settings"
          size="md"
        >
          <Suspense fallback={<div>Loading...</div>}>
            <PlaybookSettingsModal
              onClose={() => setShowPlaybookSettingsModal(false)}
            />
          </Suspense>
        </Modal>
      )}

      {/* Personnel Configuration Modal */}
      {showPersonnelModal && (
        <Modal
          isOpen={showPersonnelModal}
          onClose={() => setShowPersonnelModal(false)}
          title="Personnel Configuration"
          size="lg"
        >
          <Suspense fallback={<div>Loading...</div>}>
            <PersonnelConfigurationModal
              onClose={() => setShowPersonnelModal(false)}
            />
          </Suspense>
        </Modal>
      )}

      {/* Playbook Health Modal */}
      {showPlaybookHealthModal && (
        <Modal
          isOpen={showPlaybookHealthModal}
          onClose={() => setShowPlaybookHealthModal(false)}
          title="Playbook Health"
          size="lg"
        >
          <Suspense fallback={<div>Loading...</div>}>
            <PlaybookHealthModal
              onClose={() => setShowPlaybookHealthModal(false)}
            />
          </Suspense>
        </Modal>
      )}

      {/* Play Assignments Modal */}
      {showAssignmentsModal && assignmentsPlay && (
        <Modal
          isOpen={showAssignmentsModal}
          onClose={() => {
            setShowAssignmentsModal(false);
            setAssignmentsPlay(null);
          }}
          title={`Assignments - ${assignmentsPlay.name}`}
          size="lg"
        >
          <Suspense fallback={<div>Loading...</div>}>
            <PlayAssignmentsModal
              play={assignmentsPlay}
              onClose={() => {
                setShowAssignmentsModal(false);
                setAssignmentsPlay(null);
              }}
            />
          </Suspense>
        </Modal>
      )}

      {/* Keyboard Shortcuts Guide */}
      {showKeyboardShortcutsModal && (
        <Modal
          isOpen={showKeyboardShortcutsModal}
          onClose={() => setShowKeyboardShortcutsModal(false)}
          title="Keyboard Shortcuts"
          size="md"
        >
          <Suspense fallback={<div>Loading...</div>}>
            <KeyboardShortcutsGuide
              onClose={() => setShowKeyboardShortcutsModal(false)}
            />
          </Suspense>
        </Modal>
      )}

      {/* Practice Script Builder Modal */}
      {showPracticeScriptBuilder && (
        <Modal
          isOpen={showPracticeScriptBuilder}
          onClose={() => {
            setShowPracticeScriptBuilder(false);
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
                setShowPracticeScriptBuilder(false);
                setEditingScript(null);
                setSelectedPlaysForPractice([]);
              }}
              onSave={() => {
                setShowPracticeScriptBuilder(false);
                setEditingScript(null);
                setSelectedPlaysForPractice([]);
                dispatch({ type: "REFRESH" });
              }}
            />
          </Suspense>
        </Modal>
      )}

      {/* Post to Team Bulletin Modal */}
      {showPostToBulletinModal && playToPost && (
        <Modal
          isOpen={showPostToBulletinModal}
          onClose={() => {
            setShowPostToBulletinModal(false);
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
