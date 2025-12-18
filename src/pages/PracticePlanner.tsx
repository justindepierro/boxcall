import { lazy, Suspense } from "react";
import { format } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import { Typography } from "../components/design-system/Typography";
import { Button } from "../components/ui/Button/Button";
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
import {
  usePracticePlannerState,
  usePracticePlannerHandlers,
  usePracticePlannerComputed,
  usePracticePDFData,
} from "./PracticePlanner/hooks";
import {
  PracticeHero,
  PracticeBlocksList,
  PracticeSidebar,
} from "./PracticePlanner/sections";

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
        <Typography variant="body-lg" className="text-secondary">
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
              className="text-secondary hover:text-primary"
            >
              ← Back to Team
            </Button>
            {selectedSchedule && (
              <div className="text-sm text-secondary">
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
            <PracticeBlocksList
              blocks={currentBlocks}
              practiceStarted={practiceStarted}
              lockedSchedule={lockedSchedule}
              teamRole={teamRole}
              teamId={teamId}
              onDragEnd={handleDragEnd}
              onDeleteBlock={handleDeleteBlock}
              onPDFExport={() => setIsPDFExportOpen(true)}
              onNavigateToSchedule={() =>
                navigate(`/teams/${teamId}/season-schedule`)
              }
              onStartPractice={handleStartPractice}
              onStopPractice={handleStopPractice}
              onUnlockSchedule={handleUnlockSchedule}
              formatTime={formatTime}
              getTimeRemaining={(endTime) =>
                getTimeRemaining(
                  endTime instanceof Date ? endTime : new Date(endTime)
                )
              }
            />

            {/* Sidebar - Quick Actions */}
            <PracticeSidebar
              templates={templates}
              lockedSchedule={lockedSchedule}
              onQuickAddBlock={handleQuickAddBlock}
              onCreateCustomBlock={() => setIsCreateBlockModalOpen(true)}
              onSelectTemplate={handleSelectTemplate}
              onViewAllTemplates={() => setIsTemplateModalOpen(true)}
            />
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
