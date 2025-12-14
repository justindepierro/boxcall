import React, { useMemo, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button/Button";
import { Icon, type IconName } from "../../components/ui/Icon";
import { Typography } from "../../components/design-system/Typography";
import { AuroraTile } from "../../components/ui/AuroraTile";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal/ConfirmationModal";
import type { GamePlan as ModalGamePlan } from "../../components/playbook/GamePlanModal/types";

// Lazy loaded modals
const GamePlanModal = lazy(() =>
  import("../../components/playbook/GamePlanModal").then((module) => ({
    default: module.GamePlanModal,
  }))
);
const ImportGamePlansModal = lazy(() =>
  import("../../components/playbook/ImportGamePlansModal").then((module) => ({
    default: module.ImportGamePlansModal,
  }))
);

// Extracted hooks
import {
  useGamePlansData,
  useGamePlansCrud,
  useGamePlansExport,
} from "./hooks";

// Extracted components
import {
  GamePlansHeader,
  GamePlanCard,
  ArchivedPlanCard,
  GamePlansEmptyState,
  GamePlansLoadingState,
  GamePlansSearchBar,
} from "./components";

const getTotalPlays = (plan: ModalGamePlan) => {
  return plan.situations.reduce(
    (sum, situation) => sum + situation.plays.length,
    0
  );
};

const GamePlansPageContent: React.FC = () => {
  const navigate = useNavigate();

  // Data management hook
  const data = useGamePlansData();
  const {
    gamePlans,
    setGamePlans,
    rawGamePlans,
    setRawGamePlans,
    isLoading,
    activeTeamId,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    showModal,
    setShowModal,
    showImportModal,
    setShowImportModal,
    editingPlan,
    setEditingPlan,
    showDeleteConfirm,
    setShowDeleteConfirm,
    deletePlanId,
    setDeletePlanId,
    loadGamePlans,
    toast,
  } = data;

  // CRUD operations hook
  const crud = useGamePlansCrud({
    activeTeamId,
    gamePlans,
    rawGamePlans,
    editingPlan,
    setGamePlans,
    setRawGamePlans,
    setShowModal,
    setEditingPlan,
    setShowDeleteConfirm,
    setDeletePlanId,
    deletePlanId,
    toast,
  });
  const {
    handleCreatePlan,
    handleEditPlan,
    handleSavePlan,
    handleDuplicatePlan,
    handleArchivePlan,
    handleDeletePlan,
    confirmDeletePlan,
  } = crud;

  // Export operations hook
  const exportOps = useGamePlansExport({
    activeTeamId,
    rawGamePlans,
    loadGamePlans,
    toast,
  });
  const { handleExportPDF, handleExportJSON, handleImportPlans } = exportOps;

  // Apply search and sorting
  const filteredAndSortedPlans = useMemo(() => {
    let filtered = [...gamePlans];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (plan) =>
          plan.name.toLowerCase().includes(query) ||
          (plan.opponent || "").toLowerCase().includes(query)
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        case "date-asc":
          return (
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          );
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [gamePlans, searchQuery, sortBy]);

  const activePlans = filteredAndSortedPlans.filter((plan) => !plan.isArchived);
  const archivedPlans = filteredAndSortedPlans.filter(
    (plan) => plan.isArchived
  );

  const scrollToList = () => {
    if (typeof window === "undefined") return;
    const section = document.getElementById("game-plans-section");
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const tileConfigs = useMemo(
    () => [
      {
        key: "create",
        title: "Build New Plan",
        description: "Design scripted drives and install packages.",
        icon: "target" as IconName,
        accentOverlayClass: "bg-aurora-emerald",
        glowClassName: "glow-aurora-emerald",
        statusBadge: "Ready",
        iconClassName: "card-emerald-icon",
        footnote: "Start planning",
        onOpen: handleCreatePlan,
        body: (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-secondary">
              <span>Active plans</span>
              <span className="font-semibold text-primary">
                {activePlans.length}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-secondary">
              <span>Total plays</span>
              <span className="font-semibold text-primary">
                {activePlans.reduce((sum, p) => sum + getTotalPlays(p), 0)}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "film",
        title: "Film Script",
        description: "Tag cutups and align plays with opponent looks.",
        icon: "play" as IconName,
        accentOverlayClass: "bg-aurora-indigo",
        glowClassName: "glow-aurora-indigo",
        statusBadge: "Scouting",
        iconClassName: "text-sky-600",
        footnote: "Open board",
        onOpen: () => navigate("/playbook"),
        body: (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-secondary">
              <span>Playbook link</span>
              <span className="font-semibold text-primary">Ready</span>
            </div>
            <div className="flex items-center justify-between text-xs text-secondary">
              <span>Opponent focus</span>
              <span className="font-semibold text-primary">Set later</span>
            </div>
          </div>
        ),
      },
      {
        key: "share",
        title: "Share Packet",
        description: "Distribute call sheets to staff in one tap.",
        icon: "mail" as IconName,
        accentOverlayClass: "bg-aurora-violet",
        glowClassName: "glow-aurora-violet",
        statusBadge: "Collaborate",
        iconClassName: "card-purple-icon",
        footnote: "Jump to list",
        onOpen: scrollToList,
        body: (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-secondary">
              <span>Active plans</span>
              <span className="font-semibold text-primary">
                {activePlans.length}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-secondary">
              <span>Archived</span>
              <span className="font-semibold text-primary">
                {archivedPlans.length}
              </span>
            </div>
          </div>
        ),
      },
    ],
    [activePlans, archivedPlans, handleCreatePlan, navigate]
  );

  // Render content based on state
  const renderContent = () => {
    if (isLoading) {
      return <GamePlansLoadingState />;
    }

    if (
      activePlans.length === 0 &&
      archivedPlans.length === 0 &&
      !searchQuery
    ) {
      return <GamePlansEmptyState onCreatePlan={handleCreatePlan} />;
    }

    return (
      <div className="space-y-6" id="game-plans-section">
        {/* Active Plans Section */}
        {activePlans.length > 0 && (
          <>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Typography variant="headline-md" className="text-primary">
                Active Game Plans ({activePlans.length})
              </Typography>
              <Button
                onClick={handleCreatePlan}
                variant="primary"
                className="w-full sm:w-auto"
              >
                <Icon name="plus" className="h-4 w-4 mr-2" />
                New Plan
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
              {activePlans.map((plan) => (
                <GamePlanCard
                  key={plan.id}
                  plan={plan}
                  onEdit={handleEditPlan}
                  onDuplicate={handleDuplicatePlan}
                  onArchive={handleArchivePlan}
                  onDelete={handleDeletePlan}
                  onExportPDF={handleExportPDF}
                />
              ))}
            </div>
          </>
        )}

        {/* Archived Plans Section */}
        {archivedPlans.length > 0 && (
          <div className="mt-12">
            <Typography variant="headline-md" className="text-primary mb-4">
              Archived Game Plans ({archivedPlans.length})
            </Typography>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
              {archivedPlans.map((plan) => (
                <ArchivedPlanCard
                  key={plan.id}
                  plan={plan}
                  onRestore={handleArchivePlan}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-secondary p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <GamePlansHeader onCreatePlan={handleCreatePlan} />

        <div className="mb-8">
          <div className="rounded-xl bg-primary p-5 shadow-lg backdrop-blur-sm sm:p-6 xl:p-7">
            <div className="mb-6">
              <Typography variant="headline-sm" className="text-primary">
                Dial in this week's script
              </Typography>
              <Typography variant="body-sm" className="text-secondary mt-1">
                Launch the workspace you need for planning, film, and
                distribution.
              </Typography>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
              {tileConfigs.map((tile) => (
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

        {/* Search & Sort Section */}
        {gamePlans.length > 0 && (
          <GamePlansSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onImportClick={() => setShowImportModal(true)}
            onExportClick={handleExportJSON}
          />
        )}

        {/* Content States */}
        {renderContent()}

        {/* Game Plan Modal (lazy loaded) */}
        {showModal && (
          <Suspense fallback={null}>
            <GamePlanModal
              onClose={() => {
                setShowModal(false);
                setEditingPlan(undefined);
              }}
              onSave={handleSavePlan}
              initialGamePlan={editingPlan}
            />
          </Suspense>
        )}

        {/* Import Modal */}
        {showImportModal && (
          <Suspense fallback={<div>Loading...</div>}>
            <ImportGamePlansModal
              isOpen={showImportModal}
              onClose={() => setShowImportModal(false)}
              onImport={handleImportPlans}
            />
          </Suspense>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setDeletePlanId(null);
          }}
          onConfirm={confirmDeletePlan}
          title="Delete Game Plan"
          message="Are you sure you want to delete this game plan?"
          variant="danger"
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </div>
  );
};

GamePlansPageContent.displayName = "GamePlansPageContent";

export default React.memo(GamePlansPageContent);
