import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Typography } from "../components/design-system/Typography";
import { Button } from "../components/ui/Button/Button";
import Card from "../components/ui/Card/Card";
import Input from "../components/ui/Input/Input";
import { Modal } from "../components/ui/Modal/Modal";
import Icon from "../components/ui/Icon/Icon";
import { PDFExportTrigger } from "../components/practice/LazyPDFExport";
import { PageLayout } from "../components/layout/PageLayout";
import { LoadingScreen } from "../components/ui/LoadingScreen";
import { AuroraTile } from "../components/ui/AuroraTile";
import { Aurora } from "../components/ui/Aurora";
import { useAuth } from "../app/auth-store";
import { useTeamMembershipRole } from "../hooks/useTeamMembershipRole";
import {
  usePracticeBlocks,
  usePracticeSchedule,
  usePracticeTemplates,
  usePracticeTimer,
} from "../hooks/usePractice";
import type {
  CreatePracticeBlockData,
  DragDropResult,
  PracticeBlock,
  PracticeTemplate,
} from "../types/practice";
import { PRACTICE_BLOCK_TYPES, QUICK_TIME_INTERVALS } from "../types/practice";
import { markFirstPracticeScheduled } from "../components/onboarding/activationHelpers";
export function PracticePlanner() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");
  const [isCreateBlockModalOpen, setIsCreateBlockModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isPDFExportOpen, setIsPDFExportOpen] = useState(false);
  const [currentBlocks, setCurrentBlocks] = useState<PracticeBlock[]>([]);
  const [practiceStarted, setPracticeStarted] = useState(false);
  const [lockedSchedule, setLockedSchedule] = useState(false);
  // Hooks
  const { user } = useAuth();
  const { data: teamRole } = useTeamMembershipRole(teamId, user?.id);
  const { schedules, loading } = usePracticeSchedule(teamId || "");
  const { addBlock, reorderBlocks, deleteBlock } =
    usePracticeBlocks(selectedScheduleId);
  const { templates } = usePracticeTemplates(teamId || "");
  const {
    startTimer,
    stopTimer,
    getTimeRemaining,
    getElapsedTime,
    formatTime,
  } = usePracticeTimer();
  // Select the first schedule if available
  useEffect(() => {
    if (schedules.length > 0 && !selectedScheduleId) {
      setSelectedScheduleId(schedules[0].id);
      setCurrentBlocks(schedules[0].blocks);
    }
  }, [schedules, selectedScheduleId]);
  // Update blocks when schedule changes
  useEffect(() => {
    const selectedSchedule = schedules.find((s) => s.id === selectedScheduleId);
    if (selectedSchedule) {
      setCurrentBlocks(selectedSchedule.blocks);
    }
  }, [selectedScheduleId, schedules]);
  const handleDragEnd = async (result: DragDropResult) => {
    if (!result.destination || lockedSchedule) return;
    const reorderedBlocks = Array.from(currentBlocks);
    const [removed] = reorderedBlocks.splice(result.source.index, 1);
    reorderedBlocks.splice(result.destination.index, 0, removed);
    // Update local state immediately for UI responsiveness
    setCurrentBlocks(reorderedBlocks);
    try {
      await reorderBlocks(reorderedBlocks);
    } catch (err) {
      // Revert on error
      setCurrentBlocks(currentBlocks);
      console.error("Failed to reorder blocks:", err);
    }
  };
  const handleQuickAddBlock = async (
    blockType: keyof typeof PRACTICE_BLOCK_TYPES,
    duration?: number
  ) => {
    const blockConfig = PRACTICE_BLOCK_TYPES[blockType];
    const blockData: CreatePracticeBlockData = {
      title: blockConfig.title,
      duration: duration || blockConfig.defaultDuration,
      description: `${blockConfig.title} - ${duration || blockConfig.defaultDuration} minutes`,
    };
    try {
      const newBlock = await addBlock(blockData);
      setCurrentBlocks((prev) => [...prev, newBlock]);
    } catch (err) {
      console.error("Failed to add block:", err);
    }
  };
  const handleDeleteBlock = async (blockId: string) => {
    if (lockedSchedule) return;
    try {
      await deleteBlock(blockId);
      setCurrentBlocks((prev) => prev.filter((block) => block.id !== blockId));
    } catch (error) {
      console.error("Failed to delete block:", error);
    }
  };
  const handleStartPractice = () => {
    setPracticeStarted(true);
    setLockedSchedule(true);
    startTimer();
    // Activation: mark first practice (using schedule id)
    if (selectedScheduleId) {
      markFirstPracticeScheduled(selectedScheduleId);
    } else {
      markFirstPracticeScheduled();
    }
  };
  const handleStopPractice = () => {
    setPracticeStarted(false);
    stopTimer();
  };
  const handleUnlockSchedule = () => {
    setLockedSchedule(false);
  };
  const selectedSchedule = schedules.find((s) => s.id === selectedScheduleId);
  const totalDurationMinutes = currentBlocks.reduce(
    (sum, block) => sum + block.duration,
    0
  );
  const scheduleDateLabel = selectedSchedule
    ? format(selectedSchedule.date, "EEE, MMM d")
    : "Select schedule";
  const scheduleLocationLabel = selectedSchedule?.location || "Location TBD";
  const practiceElapsed = practiceStarted ? formatTime(getElapsedTime()) : null;
  const finalBlockEnd =
    currentBlocks.length > 0
      ? currentBlocks[currentBlocks.length - 1].endTime
      : null;
  const practiceFinishEta =
    practiceStarted && finalBlockEnd instanceof Date
      ? formatTime(getTimeRemaining(finalBlockEnd))
      : null;
  const scrollToSection = (sectionId: string) => {
    if (typeof window === "undefined") return;
    const section = document.getElementById(sectionId);
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const heroTiles = [
    {
      key: "board",
      title: "Practice Board",
      description: "Manage blocks, scripts, and timing in one place.",
      icon: "clipboard-list" as const,
      accentOverlayClass: "bg-aurora-emerald",
      glowClassName: "glow-aurora-emerald",
      statusBadge: practiceStarted ? "Live" : "Plan",
      iconClassName: "text-emerald-600",
      footnote: practiceStarted ? "Timer running" : "Open board",
      onOpen: () => scrollToSection("practice-schedule-blocks"),
      body: (
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between text-text-secondary">
            <span>Total blocks</span>
            <span className="font-semibold text-text-primary">
              {currentBlocks.length}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Duration planned</span>
            <span className="font-semibold text-text-primary">
              {totalDurationMinutes} min
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "timer",
      title: "Live Timer",
      description: "Keep the tempo right for every period.",
      icon: "clock" as const,
      accentOverlayClass: "bg-aurora-indigo",
      glowClassName: "glow-aurora-indigo",
      statusBadge: practiceStarted ? "On Field" : "Ready",
      iconClassName: "text-sky-600",
      footnote: practiceStarted ? "Running" : "View controls",
      onOpen: () => scrollToSection("practice-controls"),
      body: (
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between text-text-secondary">
            <span>Elapsed</span>
            <span className="font-semibold text-text-primary">
              {practiceElapsed || "00:00"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Time to finish</span>
            <span className="font-semibold text-text-primary">
              {practiceFinishEta || "--:--"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "schedule",
      title: "Schedule Card",
      description: "Review date, location, and staff assignments.",
      icon: "calendar" as const,
      accentOverlayClass: "bg-aurora-violet",
      glowClassName: "glow-aurora-violet",
      statusBadge: "Logistics",
      iconClassName: "text-purple-600",
      footnote: "View schedule",
      onOpen: () => scrollToSection("practice-schedule-summary"),
      body: (
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between text-text-secondary">
            <span>Next session</span>
            <span className="font-semibold text-text-primary">
              {scheduleDateLabel}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Location</span>
            <span className="font-semibold text-text-primary">
              {scheduleLocationLabel}
            </span>
          </div>
        </div>
      ),
    },
  ];
  // Prepare practice data for PDF export
  const preparePracticeDataForPDF = () => {
    if (!selectedSchedule) return null;
    // Convert practice blocks to PDF format and categorize them
    const pdfBlocks = currentBlocks.map((block) => {
      // Infer category from title/description or default to 'meeting'
      let category:
        | "offense"
        | "defense"
        | "special-teams"
        | "meeting"
        | "weight-room"
        | "transition"
        | "break" = "meeting";
      const titleLower = block.title.toLowerCase();
      const descLower = (block.description || "").toLowerCase();
      const combined = `${titleLower} ${descLower}`;
      if (combined.includes("offense") || combined.includes("offensive")) {
        category = "offense";
      } else if (
        combined.includes("defense") ||
        combined.includes("defensive")
      ) {
        category = "defense";
      } else if (combined.includes("special") || combined.includes("st ")) {
        category = "special-teams";
      } else if (combined.includes("weight") || combined.includes("strength")) {
        category = "weight-room";
      } else if (
        combined.includes("transition") ||
        combined.includes("break")
      ) {
        category = "transition";
      }
      return {
        id: block.id,
        title: block.title,
        category,
        duration: block.duration,
        startTime: block.startTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        endTime: block.endTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        location: "",
        notes: block.notes || "",
        assignedCoach: "",
        scriptId: block.practiceScriptId,
        scriptTitle: block.practiceScriptId ? "Practice Script" : undefined,
      };
    });
    // Calculate category breakdown
    const categoryBreakdown: Record<string, number> = {};
    pdfBlocks.forEach((block) => {
      categoryBreakdown[block.category] =
        (categoryBreakdown[block.category] || 0) + block.duration;
    });
    return {
      title: selectedSchedule.title || "Practice Plan",
      date: format(selectedSchedule.date, "MMM d, yyyy"),
      duration: currentBlocks.reduce((sum, block) => sum + block.duration, 0),
      location: selectedSchedule.location,
      weather: undefined, // Could be added from weather data if available
      blocks: pdfBlocks,
      coaches: [
        // Mock coach data - in real app this would come from team data
        {
          id: "1",
          name: "Head Coach",
          role: "Head Coach",
          assignments: ["Overall direction"],
        },
        {
          id: "2",
          name: "Offensive Coordinator",
          role: "OC",
          assignments: ["Offense blocks"],
        },
        {
          id: "3",
          name: "Defensive Coordinator",
          role: "DC",
          assignments: ["Defense blocks"],
        },
        {
          id: "4",
          name: "Special Teams Coach",
          role: "STC",
          assignments: ["Special teams"],
        },
      ],
      equipment: [
        // Mock equipment data - could be extracted from block notes or separate equipment list
        { item: "Cones", quantity: 20, location: "Equipment shed" },
        { item: "Footballs", quantity: 10, location: "Equipment room" },
        { item: "Blocking pads", quantity: 8, location: "Field storage" },
      ],
      summary: {
        categoryBreakdown,
        objectives: [
          "Improve offensive line blocking",
          "Practice red zone defense",
          "Special teams coordination",
        ],
      },
    };
  };
  if (!teamId) {
    return (
      <div className="min-h-screen surface-app flex items-center justify-center">
        <Typography variant="body-lg" className="text-text-secondary">
          Team not found
        </Typography>
      </div>
    );
  }
  if (loading) {
    return (
      <LoadingScreen
        title="Loading Practice Planner"
        subtitle="Setting up your practice schedules and templates..."
      />
    );
  }
  return (
    <Aurora variant="field" fullHeight>
      <PageLayout
        title="Practice Schedule"
        subtitle="Plan and manage your team's practice sessions"
        variant="dashboard"
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate(`/team/${teamId}`)}
              className="text-text-secondary hover:text-text-primary"
            >
              ← Back to Team
            </Button>
            {selectedSchedule && (
              <div className="text-sm text-text-secondary">
                {format(selectedSchedule.date, "MMM d, yyyy")} •{" "}
                {selectedSchedule.location}
              </div>
            )}
            {practiceStarted && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-jade-100 text-jade-800 rounded-md">
                <div className="w-2 h-2 bg-jade-600 rounded-full animate-pulse"></div>
                <span className="font-mono text-sm">Practice Live</span>
              </div>
            )}
          </div>
        }
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="rounded-[36px] border border-slate-200/40 bg-aurora-shell p-5 shadow-md shadow-slate-200/40 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/80 dark:shadow-slate-900/40 sm:p-6 xl:p-7">
              <div className="mb-6">
                <Typography variant="headline-sm" className="text-text-primary">
                  Command your practice flow
                </Typography>
                <Typography
                  variant="body-sm"
                  className="text-text-secondary mt-1"
                >
                  Jump straight into blocks, timing, or logistics with a single
                  tap.
                </Typography>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
                {heroTiles.map((tile) => (
                  <AuroraTile
                    key={tile.key}
                    title={tile.title}
                    description={tile.description}
                    icon={tile.icon}
                    accentOverlayClass={tile.accentOverlayClass}
                    glowClassName={tile.glowClassName}
                    statusBadge={tile.statusBadge}
                    iconClassName={tile.iconClassName}
                    footnote={tile.footnote}
                    onOpen={tile.onOpen}
                  >
                    {tile.body}
                  </AuroraTile>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Practice Schedule */}
            <div className="lg:col-span-3" id="practice-schedule-blocks">
              <Card className="mb-6">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <Typography
                      variant="headline-md"
                      className="text-text-primary"
                    >
                      Practice Blocks
                    </Typography>
                    <div
                      className="flex items-center space-x-4"
                      id="practice-controls"
                    >
                      {/* PDF Export Button */}
                      <Button
                        onClick={() => setIsPDFExportOpen(true)}
                        variant="secondary"
                        className="surface-card border-subtle text-text-secondary hover:text-text-primary surface-subtle-hover flex items-center gap-2"
                        disabled={currentBlocks.length === 0}
                      >
                        <Icon name="pdf" size="sm" />
                        Print Practice to PDF
                      </Button>
                      {/* Add/Edit Season Schedule Button - Team Owners Only */}
                      {teamRole === "head_coach" && (
                        <Button
                          onClick={() =>
                            navigate(`/teams/${teamId}/season-schedule`)
                          }
                          variant="secondary"
                          className="surface-card border-subtle text-text-secondary hover:text-text-primary surface-subtle-hover flex items-center gap-2"
                        >
                          <Icon name="plus-circle" size="sm" />
                          Add/Edit Season Schedule
                        </Button>
                      )}
                      {/* Practice Controls */}
                      {!practiceStarted ? (
                        <Button
                          onClick={handleStartPractice}
                          variant="primary"
                          className="flex items-center gap-2"
                          disabled={currentBlocks.length === 0}
                        >
                          <Icon
                            name="play"
                            size="sm"
                            className="text-text-primary"
                          />
                          Start Practice
                        </Button>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={handleStopPractice}
                            variant="danger"
                            className="flex items-center gap-2"
                          >
                            <Icon
                              name="power"
                              size="sm"
                              className="text-text-error"
                            />
                            End Practice
                          </Button>
                          {lockedSchedule && (
                            <Button
                              onClick={handleUnlockSchedule}
                              variant="ghost"
                              size="sm"
                              className="text-xs flex items-center gap-1"
                            >
                              <Icon name="unlock" size="xs" />
                              Unlock Schedule
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Practice Schedule Timeline */}
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable
                      droppableId="practice-blocks"
                      direction="vertical"
                    >
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`space-y-3 min-h-[200px] p-4 rounded-lg placeholder-zone transition-colors ${
                            snapshot.isDraggingOver
                              ? "border-jade-400 surface-subtle"
                              : "border-subtle surface-subtle"
                          }`}
                        >
                          {currentBlocks.length === 0 ? (
                            <div className="text-center py-8">
                              <Typography
                                variant="body-lg"
                                className="text-text-muted mb-4"
                              >
                                No practice blocks yet
                              </Typography>
                              <Typography
                                variant="body-sm"
                                className="text-text-muted"
                              >
                                Add blocks using the quick actions or create
                                custom blocks
                              </Typography>
                            </div>
                          ) : (
                            currentBlocks.map((block, index) => (
                              <Draggable
                                key={block.id}
                                draggableId={block.id}
                                index={index}
                                isDragDisabled={lockedSchedule}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`surface-card border-subtle rounded-lg p-4 shadow-sm transition-shadow ${
                                      snapshot.isDragging
                                        ? "shadow-lg"
                                        : "hover:shadow-md"
                                    } ${lockedSchedule ? "opacity-75" : ""}`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-4">
                                        <div
                                          {...provided.dragHandleProps}
                                          className={`cursor-grab active:cursor-grabbing p-1 rounded ${
                                            lockedSchedule
                                              ? "cursor-not-allowed opacity-50"
                                              : ""
                                          }`}
                                        >
                                          ⋮⋮
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center space-x-3">
                                            <Typography
                                              variant="body-lg"
                                              className="font-semibold text-text-primary"
                                            >
                                              {block.title}
                                            </Typography>
                                            {block.isLocked && (
                                              <Icon
                                                name="lock"
                                                size="sm"
                                                className="text-text-warning"
                                              />
                                            )}
                                            <span className="px-2 py-1 surface-subtle text-text-secondary rounded text-sm font-mono">
                                              {block.duration}min
                                            </span>
                                            {practiceStarted && (
                                              <span className="px-2 py-1 bg-jade-100 text-jade-800 rounded text-sm font-mono">
                                                {formatTime(
                                                  getTimeRemaining(
                                                    block.endTime
                                                  )
                                                )}{" "}
                                                left
                                              </span>
                                            )}
                                          </div>
                                          {block.description && (
                                            <Typography
                                              variant="body-sm"
                                              className="text-text-secondary mt-1"
                                            >
                                              {block.description}
                                            </Typography>
                                          )}
                                          {block.practiceScriptId && (
                                            <div className="mt-2">
                                              <Button
                                                variant="brandLink"
                                                size="sm"
                                                className="p-0 h-auto flex items-center"
                                              >
                                                <Icon
                                                  name="file"
                                                  size="sm"
                                                  className="mr-1"
                                                />
                                                Practice Script Attached
                                              </Button>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            // Open edit modal
                                          }}
                                          disabled={lockedSchedule}
                                        >
                                          <Icon name="edit" size="sm" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleDeleteBlock(block.id)
                                          }
                                          disabled={lockedSchedule}
                                          className="text-text-error hover:text-text-error hover:surface-subtle"
                                        >
                                          <Icon name="delete" size="sm" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              </Card>
            </div>
            {/* Sidebar - Quick Actions */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Quick Time Intervals */}
                <Card>
                  <div className="p-4">
                    <Typography
                      variant="headline-sm"
                      className="text-text-primary mb-4"
                    >
                      Quick Add Blocks
                    </Typography>
                    <div className="space-y-3">
                      {Object.entries(PRACTICE_BLOCK_TYPES).map(
                        ([key, config]) => (
                          <div key={key} className="space-y-2">
                            <Typography
                              variant="body-sm"
                              className="font-medium text-text-secondary"
                            >
                              {config.title}
                            </Typography>
                            <div className="flex flex-wrap gap-1">
                              {Object.values(QUICK_TIME_INTERVALS).map(
                                (interval) => (
                                  <Button
                                    key={interval.duration}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleQuickAddBlock(
                                        key as keyof typeof PRACTICE_BLOCK_TYPES,
                                        interval.duration
                                      )
                                    }
                                    disabled={lockedSchedule}
                                    className="text-xs"
                                  >
                                    {interval.label}
                                  </Button>
                                )
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </Card>
                {/* Custom Block */}
                <Card>
                  <div className="p-4">
                    <Typography
                      variant="headline-sm"
                      className="text-text-primary mb-4"
                    >
                      Custom Block
                    </Typography>
                    <Button
                      onClick={() => setIsCreateBlockModalOpen(true)}
                      variant="primary"
                      className="w-full"
                      disabled={lockedSchedule}
                    >
                      + Create Custom Block
                    </Button>
                  </div>
                </Card>
                {/* Templates */}
                <Card>
                  <div className="p-4">
                    <Typography
                      variant="headline-sm"
                      className="text-text-primary mb-4"
                    >
                      Practice Templates
                    </Typography>
                    <div className="space-y-2">
                      {templates.slice(0, 3).map((template) => (
                        <Button
                          key={template.id}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-left"
                          disabled={lockedSchedule}
                        >
                          <Icon name="file" size="sm" className="mr-2" />
                          {template.name}
                        </Button>
                      ))}
                      <Button
                        variant="brandLink"
                        size="sm"
                        onClick={() => setIsTemplateModalOpen(true)}
                        className="w-full"
                      >
                        View All Templates →
                      </Button>
                    </div>
                  </div>
                </Card>
                {/* Practice Info */}
                {selectedSchedule && (
                  <Card id="practice-schedule-summary">
                    <div className="p-4">
                      <Typography
                        variant="headline-sm"
                        className="text-text-primary mb-4"
                      >
                        Practice Info
                      </Typography>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="font-medium text-text-secondary">
                            Date:
                          </span>
                          <span className="ml-2">
                            {format(selectedSchedule.date, "MMM d, yyyy")}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-text-secondary">
                            Time:
                          </span>
                          <span className="ml-2">
                            {format(selectedSchedule.startTime, "h:mm a")} -{" "}
                            {format(selectedSchedule.endTime, "h:mm a")}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-text-secondary">
                            Location:
                          </span>
                          <span className="ml-2">
                            {selectedSchedule.location}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-text-secondary">
                            Field:
                          </span>
                          <span className="ml-2 capitalize">
                            {selectedSchedule.fieldType}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-text-secondary">
                            Total Duration:
                          </span>
                          <span className="ml-2 font-mono">
                            {currentBlocks.reduce(
                              (total, block) => total + block.duration,
                              0
                            )}{" "}
                            min
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Create Block Modal */}
        <CreateBlockModal
          isOpen={isCreateBlockModalOpen}
          onClose={() => setIsCreateBlockModalOpen(false)}
          onSave={async (blockData) => {
            await handleQuickAddBlock("CUSTOM", blockData.duration);
            setIsCreateBlockModalOpen(false);
          }}
        />
        {/* Templates Modal */}
        <TemplatesModal
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          templates={templates}
          onSelectTemplate={async () => {
            // Handle template selection
            setIsTemplateModalOpen(false);
          }}
        />
        {/* PDF Export with Lazy Loading */}
        {selectedSchedule && (
          <PDFExportTrigger
            isOpen={isPDFExportOpen}
            onClose={() => setIsPDFExportOpen(false)}
            practiceData={preparePracticeDataForPDF() || {}}
            triggerElement={null} // Programmatically controlled
          />
        )}
      </PageLayout>
    </Aurora>
  );
}
// Create Block Modal Component
interface CreateBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (blockData: CreatePracticeBlockData) => Promise<void>;
}
function CreateBlockModal({ isOpen, onClose, onSave }: CreateBlockModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(15);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      title,
      description,
      duration,
    });
    // Reset form
    setTitle("");
    setDescription("");
    setDuration(15);
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <Typography variant="headline-md" className="text-text-primary mb-6">
          Create Custom Practice Block
        </Typography>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Typography
              variant="body-sm"
              as="label"
              className="block font-medium text-text-secondary mb-2"
            >
              Block Title
            </Typography>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Offensive Line Drills"
              required
            />
          </div>
          <div>
            <Typography
              variant="body-sm"
              as="label"
              className="block font-medium text-text-secondary mb-2"
            >
              Description
            </Typography>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the practice block..."
              className="w-full p-3 border border-subtle rounded-md focus:ring-jade-500 focus:border-jade-500"
              rows={3}
            />
          </div>
          <div>
            <Typography
              variant="body-sm"
              as="label"
              className="block font-medium text-text-secondary mb-2"
            >
              Duration (minutes)
            </Typography>
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min={1}
              max={120}
              required
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Block
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
// Templates Modal Component
interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: PracticeTemplate[];
  onSelectTemplate: (templateId: string) => Promise<void>;
}
function TemplatesModal({
  isOpen,
  onClose,
  templates,
  onSelectTemplate,
}: TemplatesModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <Typography variant="headline-md" className="text-text-primary mb-6">
          Practice Templates
        </Typography>
        <div className="space-y-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="border-subtle rounded-lg p-4 surface-subtle-hover"
            >
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body-lg" className="font-medium">
                    {template.name}
                  </Typography>
                  <Typography variant="body-sm" className="text-text-secondary">
                    {template.duration} min • {template.blocks.length} blocks
                  </Typography>
                </div>
                <Button
                  size="sm"
                  onClick={() => onSelectTemplate(template.id)}
                  variant="primary"
                >
                  Use Template
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-4">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
export default PracticePlanner;
