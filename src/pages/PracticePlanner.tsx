import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { lazy, Suspense } from "react";
import { format } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import { Typography } from "../components/design-system/Typography";
import { Button } from "../components/ui/Button/Button";
import Card from "../components/ui/Card/Card";
import Icon from "../components/ui/Icon/Icon";
import { PDFExportTrigger } from "../components/practice/LazyPDFExport";
import { PageLayout } from "../components/layout/PageLayout";
import { LoadingScreen } from "../components/ui/LoadingScreen";
import { Aurora } from "../components/ui/Aurora";
import { useAuth } from "../app/auth-store";
import { useTeamMembershipRole } from "../hooks/useTeamMembershipRole";
import {
  usePracticeBlocks,
  usePracticeSchedule,
  usePracticeTemplates,
  usePracticeTimer,
} from "../hooks/usePractice";
import { PRACTICE_BLOCK_TYPES, QUICK_TIME_INTERVALS } from "../types/practice";
import {
  usePracticePlannerState,
  usePracticePlannerHandlers,
  usePracticePlannerComputed,
  usePracticePDFData,
} from "./PracticePlanner/hooks";
import { PracticeHero } from "./PracticePlanner/sections";
const CreateBlockModal = lazy(() =>
  import("./PracticePlanner/components").then((module) => ({
    default: module.CreateBlockModal,
  }))
);
const TemplatesModal = lazy(() =>
  import("./PracticePlanner/components").then((module) => ({
    default: module.TemplatesModal,
  }))
);

export function PracticePlanner() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();

  // Auth and permissions
  const { user } = useAuth();
  const { data: teamRole } = useTeamMembershipRole(teamId, user?.id);

  // Data fetching hooks
  const { schedules, loading } = usePracticeSchedule(teamId || "");
  const { templates } = usePracticeTemplates(teamId || "");

  // Custom state management hook
  const state = usePracticePlannerState({ schedules });
  const {
    selectedScheduleId,
    isCreateBlockModalOpen,
    setIsCreateBlockModalOpen,
    isTemplateModalOpen,
    setIsTemplateModalOpen,
    isPDFExportOpen,
    setIsPDFExportOpen,
    currentBlocks,
    setCurrentBlocks,
    practiceStarted,
    setPracticeStarted,
    lockedSchedule,
    setLockedSchedule,
    selectedSchedule,
    totalDurationMinutes,
  } = state;

  // API hooks
  const { addBlock, reorderBlocks, deleteBlock } =
    usePracticeBlocks(selectedScheduleId);
  const {
    startTimer,
    stopTimer,
    getTimeRemaining,
    getElapsedTime,
    formatTime,
  } = usePracticeTimer();

  // Custom handlers hook
  const handlers = usePracticePlannerHandlers({
    currentBlocks,
    setCurrentBlocks,
    setPracticeStarted,
    setLockedSchedule,
    lockedSchedule,
    selectedScheduleId,
    addBlock,
    reorderBlocks,
    deleteBlock,
    startTimer,
    stopTimer,
  });
  const {
    handleDragEnd,
    handleQuickAddBlock,
    handleDeleteBlock,
    handleStartPractice,
    handleStopPractice,
    handleUnlockSchedule,
  } = handlers;

  // Computed values hook
  const computed = usePracticePlannerComputed({
    selectedSchedule,
    currentBlocks,
    practiceStarted,
    formatTime,
    getElapsedTime,
    getTimeRemaining,
  });
  const {
    scheduleDateLabel,
    scheduleLocationLabel,
    practiceElapsed,
    practiceFinishEta,
    scrollToSection,
  } = computed;

  // PDF data hook
  const { preparePracticeDataForPDF } = usePracticePDFData({
    selectedSchedule,
    currentBlocks,
  });

  // Guard clauses
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

  // Handler for template selection
  const handleSelectTemplate = async (templateId: string) => {
    // TODO: Implement template loading
    console.log("Loading template:", templateId);
    setIsTemplateModalOpen(false);
  };

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
              <div className="flex items-center space-x-2 px-3 py-1 bg-jade-100 text-jade-800 rounded-lg">
                <div className="w-2 h-2 bg-jade-600 rounded-full animate-pulse"></div>
                <span className="font-mono text-sm">Practice Live</span>
              </div>
            )}
          </div>
        }
      >
        <div className="container-page container-padding py-8">
          {/* Hero Section with Aurora Tiles */}
          <PracticeHero
            currentBlocks={currentBlocks}
            totalDurationMinutes={totalDurationMinutes}
            practiceStarted={practiceStarted}
            practiceElapsed={practiceElapsed}
            practiceFinishEta={practiceFinishEta}
            scheduleDateLabel={scheduleDateLabel}
            scheduleLocationLabel={scheduleLocationLabel}
            scrollToSection={scrollToSection}
          />

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
                          className={`space-y-3 min-h-48 p-4 rounded-lg placeholder-zone transition-colors ${
                            snapshot.isDraggingOver
                              ? "border-component-badge-primary surface-subtle"
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
                                          className={`cursor-grab active:cursor-grabbing p-1 rounded-lg ${
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
                                            <span className="px-2 py-1 surface-subtle text-text-secondary rounded-lg text-sm font-mono">
                                              {block.duration}min
                                            </span>
                                            {practiceStarted && (
                                              <span className="px-2 py-1 bg-jade-100 text-jade-800 rounded-lg text-sm font-mono">
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
                          onClick={() => handleSelectTemplate(template.id)}
                          className="w-full justify-start text-left"
                        >
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
              </div>
            </div>
          </div>
        </div>

        {/* Modals (lazy loaded) */}
        <Suspense fallback={null}>
          <CreateBlockModal
            isOpen={isCreateBlockModalOpen}
            onClose={() => setIsCreateBlockModalOpen(false)}
            onSave={async (data) => {
              await addBlock(data);
              setIsCreateBlockModalOpen(false);
            }}
          />
        </Suspense>

        <Suspense fallback={null}>
          <TemplatesModal
            isOpen={isTemplateModalOpen}
            onClose={() => setIsTemplateModalOpen(false)}
            templates={templates}
            onSelectTemplate={handleSelectTemplate}
          />
        </Suspense>

        {/* PDF Export */}
        {isPDFExportOpen && preparePracticeDataForPDF() && (
          <PDFExportTrigger
            practiceData={preparePracticeDataForPDF()!}
            onClose={() => setIsPDFExportOpen(false)}
          />
        )}
      </PageLayout>
    </Aurora>
  );
}

export default PracticePlanner;
