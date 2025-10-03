import React, { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { Button } from "../ui/Button/Button";
import { Icon } from "../ui/Icon";
import { Typography } from "../design-system/Typography";
import Input from "../ui/Input/Input";
import Textarea from "../ui/TextArea/TextArea";
import { Badge } from "../ui/Badge";
import { Modal } from "../ui/Modal";
import { PracticeScriptService, type PracticeScript } from "@services";
import type { Play } from "../../types/play";
import { PlaySelectorModal } from "./PlaySelectorModal";
import { PracticeScriptPlayItem } from "./PracticeScriptPlayItem";
import { useToast } from "../../hooks/useToast";
import { PDFExportService } from "../../services/pdfExportService";

interface PracticeScriptBuilderProps {
  script?: PracticeScript;
  teamId: string;
  onSave?: (script: PracticeScript) => void;
  onCancel?: () => void;
  isOpen: boolean;
}

export const PracticeScriptBuilder: React.FC<PracticeScriptBuilderProps> = ({
  script,
  teamId,
  onSave,
  onCancel,
  isOpen,
}) => {
  const [currentScript, setCurrentScript] = useState<PracticeScript | null>(script || null);
  const [isEditing, setIsEditing] = useState(!script);
  const [scriptName, setScriptName] = useState(script?.name || "");
  const [scriptDescription, setScriptDescription] = useState(script?.description || "");
  const [isSaving, setIsSaving] = useState(false);
  const [showPlaySelector, setShowPlaySelector] = useState(false);
  const toast = useToast();

  // Initialize script if creating new
  useEffect(() => {
    if (!script && isOpen) {
      setCurrentScript(null);
      setIsEditing(true);
      setScriptName("");
      setScriptDescription("");
    } else if (script) {
      setCurrentScript(script);
      setIsEditing(false);
      setScriptName(script.name);
      setScriptDescription(script.description || "");
    }
  }, [script, isOpen]);

  const handleSave = useCallback(async () => {
    if (!scriptName.trim()) {
      toast.error("Script name is required");
      return;
    }

    setIsSaving(true);
    try {
      let savedScript: PracticeScript;

      if (currentScript) {
        // Update existing script
        const updatedScript = {
          ...currentScript,
          name: scriptName.trim(),
          description: scriptDescription.trim(),
          updatedAt: new Date(),
        };
        // For now, just update local state - in real implementation, call API
        savedScript = updatedScript;
        setCurrentScript(updatedScript);
      } else {
        // Create new script
        savedScript = await PracticeScriptService.createPracticeScript({
          name: scriptName.trim(),
          description: scriptDescription.trim(),
          teamId,
        });
        setCurrentScript(savedScript);
      }

      setIsEditing(false);
      onSave?.(savedScript);
      toast.success(`Practice script "${savedScript.name}" saved successfully`);
    } catch (error) {
      console.error("Failed to save practice script:", error);
      toast.error("Failed to save practice script", "Please try again");
    } finally {
      setIsSaving(false);
    }
  }, [scriptName, scriptDescription, currentScript, teamId, onSave, toast]);

  const handleAddPlay = useCallback(async (play: Play) => {
    if (!currentScript) return;

    try {
      const updatedScript = await PracticeScriptService.addPlayToScript(
        {
          scriptId: currentScript.id,
          playId: play.id,
          repetitions: 5,
          estimatedTime: 3,
        },
        play
      );

      setCurrentScript(updatedScript);
      setShowPlaySelector(false);
      toast.success(`Added "${play.play_name}" to script`);
    } catch (error) {
      console.error("Failed to add play to script:", error);
      toast.error("Failed to add play", "Please try again");
    }
  }, [currentScript, toast]);

  const handleRemovePlay = useCallback(async (playId: string) => {
    if (!currentScript) return;

    try {
      const updatedPlays = currentScript.plays.filter(p => p.id !== playId);
      const updatedScript = {
        ...currentScript,
        plays: updatedPlays,
        duration: updatedPlays.reduce((total, play) => total + play.estimatedTime, 0),
        updatedAt: new Date(),
      };

      setCurrentScript(updatedScript);
      toast.success("Play removed from script");
    } catch (error) {
      console.error("Failed to remove play from script:", error);
      toast.error("Failed to remove play", "Please try again");
    }
  }, [currentScript, toast]);

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!currentScript || !result.destination) return;

    const { source, destination } = result;

    if (source.index === destination.index) return;

    const reorderedPlays = Array.from(currentScript.plays);
    const [removed] = reorderedPlays.splice(source.index, 1);
    reorderedPlays.splice(destination.index, 0, removed);

    // Update order numbers
    const updatedPlays = reorderedPlays.map((play, index) => ({
      ...play,
      order: index + 1,
    }));

    const updatedScript = {
      ...currentScript,
      plays: updatedPlays,
      updatedAt: new Date(),
    };

    setCurrentScript(updatedScript);
  }, [currentScript]);

  const handleUpdatePlayNotes = useCallback((playId: string, notes: string) => {
    if (!currentScript) return;

    const updatedPlays = currentScript.plays.map(play =>
      play.id === playId ? { ...play, notes } : play
    );

    setCurrentScript({
      ...currentScript,
      plays: updatedPlays,
      updatedAt: new Date(),
    });
  }, [currentScript]);

  const handleUpdatePlayRepetitions = useCallback((playId: string, repetitions: number) => {
    if (!currentScript) return;

    const updatedPlays = currentScript.plays.map(play =>
      play.id === playId ? { ...play, repetitions } : play
    );

    const updatedDuration = updatedPlays.reduce((total, play) => total + (play.estimatedTime * play.repetitions), 0);

    setCurrentScript({
      ...currentScript,
      plays: updatedPlays,
      duration: updatedDuration,
      updatedAt: new Date(),
    });
  }, [currentScript]);

  const handleExportPDF = useCallback(async () => {
    if (!currentScript) return;

    try {
      await PDFExportService.exportPracticeScript(currentScript);
      toast.success("PDF exported successfully");
    } catch (error) {
      console.error("Failed to export PDF:", error);
      toast.error("Failed to export PDF", "Please try again");
    }
  }, [currentScript, toast]);

  const totalDuration = currentScript?.plays.reduce((total, play) => total + (play.estimatedTime * play.repetitions), 0) || 0;
  const totalPlays = currentScript?.plays.length || 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel || (() => {})}
      size="xl"
      type="default"
      headerContent={
        <div className="flex items-center justify-between w-full">
          <Typography variant="headline-sm" as="h3" className="text-text-primary">
            {currentScript ? "Edit Practice Script" : "Create Practice Script"}
          </Typography>
          <div className="flex items-center space-x-2">
            {currentScript && (
              <Badge variant="neutral" className="text-xs">
                {totalPlays} plays • {totalDuration} min
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !scriptName.trim()}
            >
              {isSaving ? "Saving..." : "Save Script"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Script Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Script Name *
            </label>
            {isEditing ? (
              <Input
                value={scriptName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setScriptName(e.target.value)}
                placeholder="e.g., Week 1 - Passing Fundamentals"
                className="w-full"
              />
            ) : (
              <Typography variant="headline-sm" className="text-text-primary">
                {scriptName}
              </Typography>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Description
            </label>
            {isEditing ? (
              <Textarea
                value={scriptDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setScriptDescription(e.target.value)}
                placeholder="Describe the focus and goals of this practice script..."
                rows={3}
                className="w-full"
              />
            ) : (
              <Typography variant="body-sm" className="text-text-secondary">
                {scriptDescription || "No description provided"}
              </Typography>
            )}
          </div>

          {currentScript && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Icon name="edit" className="h-4 w-4 mr-2" />
              Edit Details
            </Button>
          )}
        </div>

        {/* Plays Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Typography variant="headline-sm" as="h4" className="text-text-primary">
              Practice Plays
            </Typography>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowPlaySelector(true)}
            >
              <Icon name="plus" className="h-4 w-4 mr-2" />
              Add Play
            </Button>
          </div>

          {!currentScript?.plays.length ? (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
              <Icon name="file" className="h-16 w-16 text-text-muted mx-auto mb-4" />
              <Typography variant="headline-sm" className="text-text-secondary mb-2">
                No plays added yet
              </Typography>
              <Typography variant="body-sm" className="text-text-muted mb-6">
                Add plays from your playbook to create a structured practice session.
              </Typography>
              <Button
                variant="primary"
                onClick={() => setShowPlaySelector(true)}
              >
                <Icon name="plus" className="h-4 w-4 mr-2" />
                Add Your First Play
              </Button>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="practice-plays">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3"
                  >
                    {currentScript.plays.map((scriptPlay, index) => (
                      <Draggable
                        key={scriptPlay.id}
                        draggableId={scriptPlay.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`${
                              snapshot.isDragging
                                ? "shadow-lg rotate-2"
                                : ""
                            }`}
                          >
                            <PracticeScriptPlayItem
                              scriptPlay={scriptPlay}
                              index={index}
                              onRemove={() => handleRemovePlay(scriptPlay.id)}
                              onUpdateNotes={(notes: string) => handleUpdatePlayNotes(scriptPlay.id, notes)}
                              onUpdateRepetitions={(reps: number) => handleUpdatePlayRepetitions(scriptPlay.id, reps)}
                              dragHandleProps={provided.dragHandleProps}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>

        {/* Summary */}
        {currentScript && currentScript.plays.length > 0 && (
          <div className="bg-surface-secondary rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body-sm" className="text-text-secondary">
                  Total Plays: {totalPlays}
                </Typography>
                <Typography variant="body-sm" className="text-text-secondary">
                  Estimated Duration: {totalDuration} minutes
                </Typography>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleExportPDF}>
                  <Icon name="download" className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline" size="sm">
                  <Icon name="file" className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Play Selector Modal */}
      <PlaySelectorModal
        isOpen={showPlaySelector}
        onClose={() => setShowPlaySelector(false)}
        onSelectPlay={handleAddPlay}
        teamId={teamId}
      />
    </Modal>
  );
};