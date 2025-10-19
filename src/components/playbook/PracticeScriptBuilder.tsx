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
import { useToast } from "../../hooks/useToast";
import { PDFExportService } from "../../services/pdfExportService";

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
  const toast = useToast();

  // Initialize script if creating new or load selected plays
  useEffect(() => {
    console.log("🔄 [PracticeScriptBuilder] useEffect triggered:", {
      hasScript: !!script,
      isOpen,
      scriptId: script?.id,
      scriptName: script?.name,
      scriptTitle: script?.title,
      selectedPlayIds: selectedPlayIds.length,
    });

    if (!script && isOpen) {
      console.log("📝 [PracticeScriptBuilder] Creating new script");
      setCurrentScript(null);
      setIsEditing(true);
      setScriptName("");
      setScriptDescription("");

      // If we have selectedPlayIds, fetch and initialize with those plays
      if (selectedPlayIds.length > 0) {
        console.log(
          "[PracticeScriptBuilder] Initializing with selected plays:",
          selectedPlayIds
        );
        setIsLoadingPlays(true);

        // Fetch plays from Supabase
        supabase
          .from("plays")
          .select("*")
          .in("id", selectedPlayIds)
          .then(
            ({ data, error }: { data: Play[] | null; error: Error | null }) => {
              if (error) {
                console.error("Failed to fetch plays:", error);
                toast.error("Failed to load selected plays");
                setIsLoadingPlays(false);
                return;
              }

              if (data && data.length > 0) {
                // Create initial script structure with selected plays
                const initialScript: Partial<PracticeScript> = {
                  id: "", // Will be set on save
                  name: "",
                  description: "",
                  teamId,
                  plays: data.map((play: Play, index: number) => ({
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

                console.log(
                  "[PracticeScriptBuilder] Initialized script with plays:",
                  initialScript
                );
                setCurrentScript(initialScript as PracticeScript);
              }
              setIsLoadingPlays(false);
            }
          );
      }
    } else if (script) {
      // Loading an existing script for editing
      console.log("✏️ [PracticeScriptBuilder] Loading existing script:", {
        id: script.id,
        name: script.name,
        title: script.title,
        playsCount: script.plays?.length,
      });
      
      setCurrentScript(script);
      setIsEditing(true); // Allow full editing of existing scripts
      
      // Try both 'name' and 'title' properties (API inconsistency)
      const displayName = script.name || script.title || "";
      console.log("✏️ [PracticeScriptBuilder] Setting script name to:", displayName);
      setScriptName(displayName);
      setScriptDescription(script.description || "");
    }
  }, [script, isOpen, selectedPlayIds, teamId, toast]);

  const handleSave = useCallback(async () => {
    console.log("🚨 [PracticeScriptBuilder] SAVE BUTTON CLICKED!");
    console.log("🚨 [PracticeScriptBuilder] scriptName:", scriptName);
    console.log("🚨 [PracticeScriptBuilder] currentScript:", currentScript);
    
    if (!scriptName.trim()) {
      console.log("🚨 [PracticeScriptBuilder] ERROR: Script name is empty");
      toast.error("Script name is required");
      return;
    }

    if (!currentScript?.plays || currentScript.plays.length === 0) {
      console.log("🚨 [PracticeScriptBuilder] ERROR: No plays in script");
      toast.error("Please add at least one play to the script");
      return;
    }

    console.log("🚨 [PracticeScriptBuilder] Starting save process...");
    setIsSaving(true);
    try {
      let savedScript: PracticeScript;

      if (currentScript.id && currentScript.id !== "") {
        // Update existing script
        console.log(
          "[PracticeScriptBuilder] Updating existing script:",
          currentScript.id
        );

        // Step 1: Update script metadata
        console.log("[PracticeScriptBuilder] Calling updatePracticeScript with:", {
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
          console.log("[PracticeScriptBuilder] Script metadata updated successfully:", savedScript);
        } catch (error) {
          console.error("[PracticeScriptBuilder] ERROR updating script metadata:", error);
          throw error; // Re-throw to be caught by outer catch
        }

        // Step 2: Update all play configurations (defensive settings, reps, etc.)
        console.log("[PracticeScriptBuilder] Updating play configurations...");
        console.log("[PracticeScriptBuilder] Current plays:", currentScript.plays);
        
        for (const scriptPlay of currentScript.plays || []) {
          console.log("[PracticeScriptBuilder] Processing play:", {
            id: scriptPlay.id,
            playId: scriptPlay.playId,
            defensiveFront: scriptPlay.defensiveFront,
            coverage: scriptPlay.coverage,
            blitz: scriptPlay.blitz,
            hash: scriptPlay.hash,
            downDistance: scriptPlay.downDistance,
            fieldPosition: scriptPlay.fieldPosition,
          });
          
          if (scriptPlay.id && !scriptPlay.id.startsWith("temp-")) {
            // Only update plays that have real database IDs
            console.log("[PracticeScriptBuilder] Updating play in DB:", scriptPlay.id);
            await PracticeScriptService.updateScriptPlay(scriptPlay.id, {
              repetitions: scriptPlay.repetitions,
              notes: scriptPlay.notes,
              hash: scriptPlay.hash,
              downDistance: scriptPlay.downDistance,
              fieldPosition: scriptPlay.fieldPosition,
              defensiveFront: scriptPlay.defensiveFront,
              coverage: scriptPlay.coverage,
              blitz: scriptPlay.blitz,
            });
            console.log("[PracticeScriptBuilder] Play updated successfully");
          } else {
            console.log("[PracticeScriptBuilder] Skipping temp play:", scriptPlay.id);
          }
        }

        // Step 3: Reload the script to get fresh data
        const reloadedScript = await PracticeScriptService.getPracticeScript(currentScript.id);
        if (reloadedScript) {
          savedScript = reloadedScript;
        }

        console.log("[PracticeScriptBuilder] Script and plays updated successfully");
        setCurrentScript(savedScript);
      } else {
        // Create new script with plays
        console.log(
          "[PracticeScriptBuilder] Creating new script with plays:",
          currentScript.plays
        );

        // Step 1: Create the script
        savedScript = await PracticeScriptService.createPracticeScript({
          name: scriptName.trim(),
          description: scriptDescription.trim(),
          teamId,
        });

        console.log("[PracticeScriptBuilder] Script created:", savedScript.id);

        // Step 2: Add all plays to the script
        for (const scriptPlay of currentScript.plays) {
          console.log("[PracticeScriptBuilder] Adding play to script:", {
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

        console.log("[PracticeScriptBuilder] All plays added successfully");
        setCurrentScript(savedScript);
      }

      setIsEditing(false);
      onSave?.(savedScript);
      toast.success(
        `Practice script "${savedScript.name || savedScript.title}" saved successfully`
      );

      // Close the modal after successful save
      if (onCancel) {
        setTimeout(() => {
          onCancel();
        }, 500); // Small delay to show the success toast
      }
    } catch (error) {
      console.error("Failed to save practice script:", error);
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
        console.error("Failed to add play to script:", error);
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
        console.error("Failed to remove play from script:", error);
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
      console.error("Failed to export PDF:", error);
      toast.error("Failed to export PDF", "Please try again");
    }
  }, [currentScript, toast]);

  const totalPlays = currentScript?.plays?.length || 0;

  // DEBUG: Log the state values
  console.log("🔍 [PracticeScriptBuilder] Render state:", {
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
      size="xl"
      type="default"
      headerContent={
        <div className="flex items-center justify-between w-full">
          <Typography
            variant="headline-sm"
            as="h3"
            className="text-text-primary"
          >
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
              size="sm"
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            {/* Always show Save button for existing scripts (play configs can change) */}
            {(isEditing || currentScript) && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
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
            <label className="block text-sm font-medium text-text-primary mb-2">
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
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setScriptDescription(e.target.value)
                }
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
            <Typography
              variant="headline-sm"
              as="h4"
              className="text-text-primary"
            >
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

          {isLoadingPlays ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
              <Typography variant="body-sm" className="text-text-muted">
                Loading selected plays...
              </Typography>
            </div>
          ) : !currentScript?.plays?.length ? (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
              <Icon
                name="file"
                className="h-16 w-16 text-text-muted mx-auto mb-4"
              />
              <Typography
                variant="headline-sm"
                className="text-text-secondary mb-2"
              >
                No plays added yet
              </Typography>
              <Typography variant="body-sm" className="text-text-muted mb-6">
                Add plays from your playbook to create a structured practice
                session.
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
            <div className="bg-surface-secondary rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body-sm" className="text-text-secondary">
                    Total Plays: {totalPlays}
                  </Typography>
                  <Typography variant="body-sm" className="text-text-secondary">
                    Total Reps:{" "}
                    {currentScript.plays.reduce(
                      (sum, play) => sum + play.repetitions,
                      0
                    )}
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
