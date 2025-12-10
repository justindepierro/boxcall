import React, { useState, useEffect, useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Button } from "../ui/Button/Button";
import { Icon } from "../ui/Icon";
import { Typography } from "../design-system/Typography";
import Input from "../ui/Input/Input";
import Textarea from "../ui/TextArea/TextArea";
import { Badge } from "../ui/Badge";
import { Modal } from "../ui/Modal";
import { PracticeScriptService, type PracticeScript } from "@services";
import type { Play } from "../../types/play";
import { supabase } from "../../lib/supabase";
import { PlaySelectorModal } from "./PlaySelectorModal";
import { PracticeScriptPlayItem } from "./PracticeScriptPlayItem";
import { TemplateManagementModal } from "./TemplateManagementModal";
import { useToast } from "../../hooks/useToast";
import { PDFExportService } from "../../services/pdfExportService";
import { useIsMobile } from "@hooks/useBreakpoint";
import { triggerHapticFeedback } from "../../lib/hapticFeedback";
import { debug, error as logError } from "../../utils/logger";

interface PracticeScriptBuilderProps {
  script?: PracticeScript;
  teamId: string;
  selectedPlayIds?: string[]; // NEW: Pre-selected plays from bulk action
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
  const [currentScript, setCurrentScript] = useState<PracticeScript | null>(
    script || null
  );
  const [isEditing, setIsEditing] = useState(!script);
  const [scriptName, setScriptName] = useState(script?.name || "");
  const [scriptDescription, setScriptDescription] = useState(
    script?.description || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showPlaySelector, setShowPlaySelector] = useState(false);
  const [isLoadingPlays, setIsLoadingPlays] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateAction, setTemplateAction] = useState<"save" | "load">("save");
  const toast = useToast();
  const isMobile = useIsMobile();

  // Initialize script if creating new or load selected plays
  useEffect(() => {
    debug("🔄 [PracticeScriptBuilder] useEffect triggered:", {
      hasScript: !!script,
      isOpen,
      scriptId: script?.id,
      scriptName: script?.name,
      scriptTitle: script?.title,
      selectedPlayIds: selectedPlayIds.length,
    });

    if (!script && isOpen) {
      debug("📝 [PracticeScriptBuilder] Creating new script");
      setCurrentScript(null);
      setIsEditing(true);
      setScriptName("");
      setScriptDescription("");

      // If we have selectedPlayIds, fetch and initialize with those plays
      if (selectedPlayIds.length > 0) {
        debug(
          "[PracticeScriptBuilder] Initializing with selected plays:",
          selectedPlayIds
        );
        setIsLoadingPlays(true);

        // Fetch plays from Supabase
        supabase
          .from("plays")
          .select("*")
          .in("id", selectedPlayIds)
          .then(({ data, error }) => {
            if (error) {
              logError("Failed to fetch plays:", error);
              toast.error("Failed to load selected plays");
              setIsLoadingPlays(false);
              return;
            }

            if (data && data.length > 0) {
              // Create initial script structure with selected plays
              const plays = data as unknown as Play[];
              const initialScript: Partial<PracticeScript> = {
                id: "", // Will be set on save
                name: "",
                description: "",
                teamId,
                plays: plays.map((play, index) => ({
                  id: `temp-${play.id}-${index}`, // Temporary ID
                  playId: play.id,
                  play: play,
                  order: index,
                  repetitions: 5, // Default reps
                  // Default game scenario
                  hash: "middle" as const,
                  downDistance: "1st & 10",
                  fieldPosition: "plus_territory" as const,
                  defensiveFront: "base" as const,
                  coverage: "cover_2" as const,
                  blitz: "none" as const,
                  addedAt: new Date(),
                })),
                duration: data.length * 5, // Total reps
                createdAt: new Date(),
                updatedAt: new Date(),
              };

              debug(
                "[PracticeScriptBuilder] Initialized script with plays:",
                initialScript
              );
              setCurrentScript(initialScript as PracticeScript);
            }
            setIsLoadingPlays(false);
          });
      }
    } else if (script) {
      // Loading an existing script for editing
      debug("✏️ [PracticeScriptBuilder] Loading existing script:", {
        id: script.id,
        name: script.name,
        title: script.title,
        playsCount: script.plays?.length,
      });

      setCurrentScript(script);
      setIsEditing(true); // Allow full editing of existing scripts

      // Try both 'name' and 'title' properties (API inconsistency)
      const displayName = script.name || script.title || "";
      debug("✏️ [PracticeScriptBuilder] Setting script name to:", displayName);
      setScriptName(displayName);
      setScriptDescription(script.description || "");
    }
  }, [script, isOpen, selectedPlayIds, teamId, toast]);

  const handleSave = useCallback(async () => {
    debug("🚨 [PracticeScriptBuilder] SAVE BUTTON CLICKED!");
    debug("🚨 [PracticeScriptBuilder] scriptName:", scriptName);
    debug("🚨 [PracticeScriptBuilder] currentScript:", currentScript);

    if (!scriptName.trim()) {
      debug("🚨 [PracticeScriptBuilder] ERROR: Script name is empty");
      toast.error("Script name is required");
      return;
    }

    if (!currentScript?.plays || currentScript.plays.length === 0) {
      debug("🚨 [PracticeScriptBuilder] ERROR: No plays in script");
      toast.error("Please add at least one play to the script");
      return;
    }

    debug("🚨 [PracticeScriptBuilder] Starting save process...");

    // OPTIMISTIC UPDATE: Show success immediately for better UX
    toast.success("Saving practice script...");
    setIsSaving(true);

    try {
      let savedScript: PracticeScript;

      if (currentScript.id && currentScript.id !== "") {
        // Update existing script
        debug(
          "[PracticeScriptBuilder] Updating existing script:",
          currentScript.id
        );

        // Step 1: Update script metadata
        debug("[PracticeScriptBuilder] Calling updatePracticeScript with:", {
          scriptId: currentScript.id,
          name: scriptName.trim(),
          description: scriptDescription.trim(),
          tags: currentScript.tags,
        });

        try {
          savedScript = await PracticeScriptService.updatePracticeScript(
            currentScript.id,
            {
              name: scriptName.trim(),
              description: scriptDescription.trim(),
              tags: currentScript.tags,
            }
          );
          debug(
            "[PracticeScriptBuilder] Script metadata updated successfully:",
            savedScript
          );
        } catch (error) {
          logError(
            "[PracticeScriptBuilder] ERROR updating script metadata:",
            error
          );
          throw error; // Re-throw to be caught by outer catch
        }

        // Step 2: Update all play configurations (defensive settings, reps, etc.)
        // OPTIMIZED: Use batch update instead of sequential updates
        debug("[PracticeScriptBuilder] Preparing batch play updates...");
        debug("[PracticeScriptBuilder] Current plays:", currentScript.plays);

        const batchUpdates = (currentScript.plays || [])
          .filter(
            (scriptPlay) => scriptPlay.id && !scriptPlay.id.startsWith("temp-")
          )
          .map((scriptPlay) => ({
            scriptPlayId: scriptPlay.id!,
            data: {
              repetitions: scriptPlay.repetitions,
              notes: scriptPlay.notes,
              hash: scriptPlay.hash,
              downDistance: scriptPlay.downDistance,
              fieldPosition: scriptPlay.fieldPosition,
              defensiveFront: scriptPlay.defensiveFront,
              coverage: scriptPlay.coverage,
              blitz: scriptPlay.blitz,
            },
          }));

        if (batchUpdates.length > 0) {
          debug(
            `[PracticeScriptBuilder] Batch updating ${batchUpdates.length} plays...`
          );
          await PracticeScriptService.batchUpdateScriptPlays(batchUpdates);
          debug("[PracticeScriptBuilder] Batch update completed");
        }

        // Step 3: Get fresh data from cache (should be fast)
        const reloadedScript = await PracticeScriptService.getPracticeScript(
          currentScript.id
        );
        if (reloadedScript) {
          savedScript = reloadedScript;
        }

        debug("[PracticeScriptBuilder] Script and plays updated successfully");
        setCurrentScript(savedScript);
      } else {
        // Create new script with plays
        debug(
          "[PracticeScriptBuilder] Creating new script with plays:",
          currentScript.plays
        );

        // Step 1: Create the script
        savedScript = await PracticeScriptService.createPracticeScript({
          name: scriptName.trim(),
          description: scriptDescription.trim(),
          teamId,
        });

        debug("[PracticeScriptBuilder] Script created:", savedScript.id);

        // Step 2: Add all plays to the script
        for (const scriptPlay of currentScript.plays) {
          debug("[PracticeScriptBuilder] Adding play to script:", {
            playId: scriptPlay.playId,
            repetitions: scriptPlay.repetitions,
            order: scriptPlay.order,
            scenario: {
              hash: scriptPlay.hash,
              downDistance: scriptPlay.downDistance,
              fieldPosition: scriptPlay.fieldPosition,
              defensiveFront: scriptPlay.defensiveFront,
              coverage: scriptPlay.coverage,
              blitz: scriptPlay.blitz,
            },
          });

          await PracticeScriptService.addPlayToScript(
            {
              scriptId: savedScript.id,
              playId: scriptPlay.playId,
              orderIndex: scriptPlay.order,
              notes: scriptPlay.notes,
              repetitions: scriptPlay.repetitions,
              // Game scenario configuration
              hash: scriptPlay.hash,
              downDistance: scriptPlay.downDistance,
              fieldPosition: scriptPlay.fieldPosition,
              defensiveFront: scriptPlay.defensiveFront,
              coverage: scriptPlay.coverage,
              blitz: scriptPlay.blitz,
            },
            scriptPlay.play
          );
        }

        debug("[PracticeScriptBuilder] All plays added successfully");
        setCurrentScript(savedScript);
      }

      setIsEditing(false);
      onSave?.(savedScript);

      // Close modal immediately for snappy UX
      if (onCancel) {
        onCancel();
      }

      // Show success toast after closing (feels faster)
      toast.success(
        `Practice script "${savedScript.name || savedScript.title}" saved successfully`
      );
    } catch (error) {
      logError("Failed to save practice script:", error);
      toast.error("Failed to save practice script", "Please try again");
    } finally {
      setIsSaving(false);
    }
  }, [
    scriptName,
    scriptDescription,
    currentScript,
    teamId,
    onSave,
    onCancel,
    toast,
  ]);

  const handleAddPlay = useCallback(
    async (play: Play) => {
      if (!currentScript) return;

      try {
        const updatedScript = await PracticeScriptService.addPlayToScript(
          {
            scriptId: currentScript.id,
            playId: play.id,
            repetitions: 5,
            // Default scenario configuration
            hash: "middle",
            downDistance: "1st & 10",
            fieldPosition: "plus_territory",
            defensiveFront: "base",
            coverage: "cover_2",
            blitz: "none",
          },
          play
        );

        setCurrentScript(updatedScript);
        setShowPlaySelector(false);
        toast.success(`Added "${play.play_name}" to script`);
      } catch (error) {
        logError("Failed to add play to script:", error);
        toast.error("Failed to add play", "Please try again");
      }
    },
    [currentScript, toast]
  );

  const handleRemovePlay = useCallback(
    async (playId: string) => {
      if (!currentScript) return;

      try {
        const updatedPlays =
          currentScript.plays?.filter((p) => p.id !== playId) || [];
        const updatedScript = {
          ...currentScript,
          plays: updatedPlays,
          updatedAt: new Date(),
        };

        setCurrentScript(updatedScript);
        toast.success("Play removed from script");
      } catch (error) {
        logError("Failed to remove play from script:", error);
        toast.error("Failed to remove play", "Please try again");
      }
    },
    [currentScript, toast]
  );

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!currentScript || !result.destination) return;

      const { source, destination } = result;

      if (source.index === destination.index) return;

      // Haptic feedback on successful reorder
      triggerHapticFeedback("medium");

      const reorderedPlays = Array.from(currentScript.plays || []);
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
    },
    [currentScript]
  );

  const handleUpdatePlayNotes = useCallback(
    (playId: string, notes: string) => {
      if (!currentScript) return;

      const updatedPlays =
        currentScript.plays?.map((play) =>
          play.id === playId ? { ...play, notes } : play
        ) || [];

      setCurrentScript({
        ...currentScript,
        plays: updatedPlays,
        updatedAt: new Date(),
      });
    },
    [currentScript]
  );

  const handleUpdatePlayRepetitions = useCallback(
    (playId: string, repetitions: number) => {
      if (!currentScript) return;

      const updatedPlays =
        currentScript.plays?.map((play) =>
          play.id === playId ? { ...play, repetitions } : play
        ) || [];

      setCurrentScript({
        ...currentScript,
        plays: updatedPlays,
        updatedAt: new Date(),
      });
    },
    [currentScript]
  );

  const handleUpdatePlayScenario = useCallback(
    (
      playId: string,
      scenario: {
        hash?: "left" | "middle" | "right";
        downDistance?: string;
        fieldPosition?:
          | "plus_territory"
          | "red_zone"
          | "backed_up"
          | "midfield";
        defensiveFront?:
          | "base"
          | "4-3"
          | "3-4"
          | "nickel"
          | "dime"
          | "bear"
          | "tite";
        coverage?:
          | "cover_0"
          | "cover_1"
          | "cover_2"
          | "cover_3"
          | "cover_4"
          | "cover_6"
          | "quarters"
          | "man";
        blitz?:
          | "none"
          | "edge"
          | "a_gap"
          | "b_gap"
          | "sim_pressure"
          | "zone_blitz"
          | "all_out";
      }
    ) => {
      if (!currentScript) return;

      const updatedPlays =
        currentScript.plays?.map((play) =>
          play.id === playId ? { ...play, ...scenario } : play
        ) || [];

      setCurrentScript({
        ...currentScript,
        plays: updatedPlays,
        updatedAt: new Date(),
      });
    },
    [currentScript]
  );

  const handleExportPDF = useCallback(async () => {
    if (!currentScript) return;

    try {
      await PDFExportService.exportPracticeScript(currentScript);
      toast.success("PDF exported successfully");
    } catch (error) {
      logError("Failed to export PDF:", error);
      toast.error("Failed to export PDF", "Please try again");
    }
  }, [currentScript, toast]);

  const handleSaveAsTemplate = useCallback(
    async (templateName: string, description?: string) => {
      if (!currentScript?.id) {
        toast.error("Please save the script first before creating a template");
        return;
      }

      try {
        await PracticeScriptService.createTemplateFromScript(currentScript.id, {
          name: templateName,
          description: description,
          teamId,
          duration: currentScript.duration,
          isPublic: false,
        });
        toast.success(`Template "${templateName}" created successfully`);
        setShowTemplateModal(false);
      } catch (error) {
        logError("Failed to create template:", error);
        toast.error("Failed to create template", "Please try again");
      }
    },
    [currentScript, teamId, toast]
  );

  const handleLoadFromTemplate = useCallback(
    async (templateId: string, scriptName: string) => {
      try {
        const newScript = await PracticeScriptService.createScriptFromTemplate(
          templateId,
          scriptName
        );
        setCurrentScript(newScript);
        setScriptName(newScript.title || newScript.name || "");
        setScriptDescription(newScript.description || "");
        setIsEditing(true);
        toast.success(`Script created from template`);
        setShowTemplateModal(false);
      } catch (error) {
        logError("Failed to load template:", error);
        toast.error("Failed to load template", "Please try again");
      }
    },
    [toast]
  );

  const totalPlays = currentScript?.plays?.length || 0;

  // DEBUG: Log the state values
  debug("🔍 [PracticeScriptBuilder] Render state:", {
    isEditing,
    hasCurrentScript: !!currentScript,
    currentScriptId: currentScript?.id,
    scriptName,
    shouldShowSaveButton: isEditing || !!currentScript,
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
            {currentScript ? "Edit Practice Script" : "Create Practice Script"}
          </Typography>
          <div className="flex items-center space-x-2">
            {currentScript && (
              <Badge variant="neutral" className="text-xs">
                {totalPlays} {totalPlays === 1 ? "play" : "plays"}
              </Badge>
            )}
            <Button
              variant="ghost"
              size={isMobile ? "md" : "sm"}
              onClick={() => {
                if (isMobile) triggerHapticFeedback("light");
                onCancel?.();
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            {/* Always show Save button for existing scripts (play configs can change) */}
            {(isEditing || currentScript) && (
              <Button
                variant="primary"
                size={isMobile ? "md" : "sm"}
                onClick={() => {
                  if (isMobile) triggerHapticFeedback("medium");
                  handleSave();
                }}
                disabled={isSaving || !scriptName.trim()}
              >
                {isSaving ? "Saving..." : "Save Script"}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Script Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Script Name *
            </label>
            {isEditing ? (
              <Input
                value={scriptName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setScriptName(e.target.value)
                }
                placeholder="e.g., Week 1 - Passing Fundamentals"
                className="w-full"
              />
            ) : (
              <Typography variant="headline-sm" className="text-primary">
                {scriptName}
              </Typography>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Description
            </label>
            {isEditing ? (
              <Textarea
                value={scriptDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setScriptDescription(e.target.value)
                }
                placeholder="Describe the focus and goals of this practice script..."
                rows={3}
                className="w-full"
              />
            ) : (
              <Typography variant="body-sm" className="text-secondary">
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
            <Typography variant="headline-sm" as="h4" className="text-primary">
              Practice Plays
            </Typography>
            <Button
              variant="primary"
              size={isMobile ? "md" : "sm"}
              onClick={() => {
                if (isMobile) triggerHapticFeedback("light");
                setShowPlaySelector(true);
              }}
            >
              <Icon name="plus" className="h-4 w-4 mr-2" />
              Add Play
            </Button>
          </div>

          {isLoadingPlays ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
              <Typography variant="body-sm" className="text-muted">
                Loading selected plays...
              </Typography>
            </div>
          ) : !currentScript?.plays?.length ? (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
              <Icon name="file" className="h-16 w-16 text-muted mx-auto mb-4" />
              <Typography variant="headline-sm" className="text-secondary mb-2">
                No plays added yet
              </Typography>
              <Typography variant="body-sm" className="text-muted mb-6">
                Add plays from your playbook to create a structured practice
                session.
              </Typography>
              <Button
                variant="primary"
                size={isMobile ? "lg" : "md"}
                onClick={() => {
                  if (isMobile) triggerHapticFeedback("light");
                  setShowPlaySelector(true);
                }}
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
                    {currentScript.plays?.map((scriptPlay, index) => (
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
                              snapshot.isDragging ? "shadow-lg rotate-2" : ""
                            }`}
                          >
                            <PracticeScriptPlayItem
                              scriptPlay={scriptPlay}
                              index={index}
                              onRemove={() => handleRemovePlay(scriptPlay.id)}
                              onUpdateNotes={(notes: string) =>
                                handleUpdatePlayNotes(scriptPlay.id, notes)
                              }
                              onUpdateRepetitions={(reps: number) =>
                                handleUpdatePlayRepetitions(scriptPlay.id, reps)
                              }
                              onUpdateScenario={(scenario) =>
                                handleUpdatePlayScenario(
                                  scriptPlay.id,
                                  scenario
                                )
                              }
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
        {currentScript &&
          currentScript.plays &&
          currentScript.plays.length > 0 && (
            <div className="bg-secondary rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body-sm" className="text-secondary">
                    Total Plays: {totalPlays}
                  </Typography>
                  <Typography variant="body-sm" className="text-secondary">
                    Total Reps:{" "}
                    {currentScript.plays.reduce(
                      (sum, play) => sum + play.repetitions,
                      0
                    )}
                  </Typography>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleExportPDF}
                    className="btn-action"
                  >
                    <Icon name="download" className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (isMobile) triggerHapticFeedback("light");
                      setTemplateAction("save");
                      setShowTemplateModal(true);
                    }}
                    disabled={!currentScript?.id}
                    title={
                      !currentScript?.id
                        ? "Save script first"
                        : "Save as reusable template"
                    }
                    className="btn-action"
                  >
                    <Icon name="save" className="h-4 w-4 mr-2" />
                    Save as Template
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (isMobile) triggerHapticFeedback("light");
                      setTemplateAction("load");
                      setShowTemplateModal(true);
                    }}
                    className="btn-action"
                  >
                    <Icon name="folder" className="h-4 w-4 mr-2" />
                    Load from Template
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
      />

      {/* Template Management Modal */}
      <TemplateManagementModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        mode={templateAction}
        teamId={teamId}
        onSaveTemplate={handleSaveAsTemplate}
        onLoadTemplate={handleLoadFromTemplate}
      />
    </Modal>
  );
};
