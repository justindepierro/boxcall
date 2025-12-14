import React from "react";
import { Button } from "../../ui/Button/Button";
import { Typography } from "../../design-system/Typography";
import { Badge } from "../../ui/Badge";
import { Modal } from "../../ui/Modal";
import { PlaySelectorModal } from "../PlaySelectorModal";
import { TemplateManagementModal } from "../TemplateManagementModal";
import { useIsMobile } from "@hooks/useBreakpoint";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";
import { debug } from "../../../utils/logger";
import type { PracticeScript } from "@services";

import {
  usePracticeScriptState,
  usePracticeScriptHandlers,
  useTemplateHandlers,
} from "./hooks";
import {
  ScriptDetailsForm,
  ScriptSummary,
  PlaysListSection,
} from "./components";

interface PracticeScriptBuilderProps {
  script?: PracticeScript;
  teamId: string;
  selectedPlayIds?: string[];
  onSave?: (script: PracticeScript) => void;
  onCancel?: () => void;
  isOpen: boolean;
}

export const PracticeScriptBuilder: React.FC<PracticeScriptBuilderProps> = ({
  script,
  teamId,
  selectedPlayIds = [],
  onSave,
  onCancel,
  isOpen,
}) => {
  const isMobile = useIsMobile();

  // State management hook
  const state = usePracticeScriptState({
    script,
    isOpen,
    selectedPlayIds,
    teamId,
  });

  // Handlers hook
  const handlers = usePracticeScriptHandlers({
    currentScript: state.currentScript,
    setCurrentScript: state.setCurrentScript,
    scriptName: state.scriptName,
    scriptDescription: state.scriptDescription,
    setIsSaving: state.setIsSaving,
    setIsEditing: state.setIsEditing,
    setShowPlaySelector: state.setShowPlaySelector,
    teamId,
    onSave,
    onCancel,
  });

  // Template handlers hook
  const templateHandlers = useTemplateHandlers({
    currentScript: state.currentScript,
    setCurrentScript: state.setCurrentScript,
    setScriptName: state.setScriptName,
    setScriptDescription: state.setScriptDescription,
    setIsEditing: state.setIsEditing,
    setShowTemplateModal: state.setShowTemplateModal,
    teamId,
  });

  debug("🔍 [PracticeScriptBuilder] Render state:", {
    isEditing: state.isEditing,
    hasCurrentScript: !!state.currentScript,
    currentScriptId: state.currentScript?.id,
    scriptName: state.scriptName,
    shouldShowSaveButton: state.isEditing || !!state.currentScript,
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel || (() => {})}
      size={isMobile ? "fullscreen" : "xl"}
      type="default"
      headerContent={
        <div className="flex items-center justify-between w-full">
          <Typography variant="headline-sm" as="h3" className="text-primary">
            {state.currentScript
              ? "Edit Practice Script"
              : "Create Practice Script"}
          </Typography>
          <div className="flex items-center space-x-2">
            {state.currentScript && (
              <Badge variant="neutral" className="text-xs">
                {state.totalPlays} {state.totalPlays === 1 ? "play" : "plays"}
              </Badge>
            )}
            <Button
              variant="ghost"
              size={isMobile ? "md" : "sm"}
              onClick={() => {
                if (isMobile) triggerHapticFeedback("light");
                onCancel?.();
              }}
              disabled={state.isSaving}
            >
              Cancel
            </Button>
            {(state.isEditing || state.currentScript) && (
              <Button
                variant="primary"
                size={isMobile ? "md" : "sm"}
                onClick={() => {
                  if (isMobile) triggerHapticFeedback("medium");
                  handlers.handleSave();
                }}
                disabled={state.isSaving || !state.scriptName.trim()}
              >
                {state.isSaving ? "Saving..." : "Save Script"}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Script Details */}
        <ScriptDetailsForm
          isEditing={state.isEditing}
          scriptName={state.scriptName}
          setScriptName={state.setScriptName}
          scriptDescription={state.scriptDescription}
          setScriptDescription={state.setScriptDescription}
          onEditClick={() => state.setIsEditing(true)}
          showEditButton={!!state.currentScript && !state.isEditing}
        />

        {/* Plays Section */}
        <PlaysListSection
          currentScript={state.currentScript}
          isLoadingPlays={state.isLoadingPlays}
          isMobile={isMobile}
          onAddPlayClick={() => state.setShowPlaySelector(true)}
          onDragEnd={handlers.handleDragEnd}
          onRemovePlay={handlers.handleRemovePlay}
          onUpdateNotes={handlers.handleUpdatePlayNotes}
          onUpdateRepetitions={handlers.handleUpdatePlayRepetitions}
          onUpdateScenario={handlers.handleUpdatePlayScenario}
        />

        {/* Summary */}
        {state.currentScript &&
          state.currentScript.plays &&
          state.currentScript.plays.length > 0 && (
            <ScriptSummary
              currentScript={state.currentScript}
              totalPlays={state.totalPlays}
              isMobile={isMobile}
              onExportPDF={handlers.handleExportPDF}
              onSaveAsTemplate={() => {
                state.setTemplateAction("save");
                state.setShowTemplateModal(true);
              }}
              onLoadFromTemplate={() => {
                state.setTemplateAction("load");
                state.setShowTemplateModal(true);
              }}
            />
          )}
      </div>

      {/* Play Selector Modal */}
      <PlaySelectorModal
        isOpen={state.showPlaySelector}
        onClose={() => state.setShowPlaySelector(false)}
        onSelectPlay={handlers.handleAddPlay}
      />

      {/* Template Management Modal */}
      <TemplateManagementModal
        isOpen={state.showTemplateModal}
        onClose={() => state.setShowTemplateModal(false)}
        mode={state.templateAction}
        teamId={teamId}
        onSaveTemplate={templateHandlers.handleSaveAsTemplate}
        onLoadTemplate={templateHandlers.handleLoadFromTemplate}
      />
    </Modal>
  );
};
