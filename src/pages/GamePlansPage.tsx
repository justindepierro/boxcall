import React, { useMemo, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button/Button";
import { Icon, type IconName } from "../components/ui/Icon";
import { Typography } from "../components/design-system/Typography";
import { SearchBar } from "../components/ui/SearchBar";
import { SortDropdown, type SortOption } from "../components/ui/SortDropdown";
import { AuroraTile } from "../components/ui/AuroraTile";
import { useIsMobile } from "../hooks/useBreakpoint";
import { ConfirmationModal } from "../components/ui/ConfirmationModal/ConfirmationModal";
import type { GamePlan as ModalGamePlan } from "../components/playbook/GamePlanModal/types";

// Lazy loaded modals
const GamePlanModal = lazy(() =>
  import("../components/playbook/GamePlanModal").then((module) => ({
    default: module.GamePlanModal,
  }))
);
const ImportGamePlansModal = lazy(() =>
  import("../components/playbook/ImportGamePlansModal").then((module) => ({
    default: module.ImportGamePlansModal,
  }))
);

// Extracted hooks
import {
  useGamePlansData,
  useGamePlansCrud,
  useGamePlansExport,
} from "./GamePlansPage/hooks";

const sortOptions: SortOption[] = [
  { id: "date-desc", label: "Newest First" },
  { id: "date-asc", label: "Oldest First" },
  { id: "name-asc", label: "Name (A-Z)" },
  { id: "name-desc", label: "Name (Z-A)" },
];

const getTotalPlays = (plan: ModalGamePlan) => {
  return plan.situations.reduce(
    (sum, situation) => sum + situation.plays.length,
    0
  );
};

const GamePlansPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "date-asc":
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
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
  const archivedPlans = filteredAndSortedPlans.filter((plan) => plan.isArchived);

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
              <span className="font-semibold text-primary">{activePlans.length}</span>
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
              <span className="font-semibold text-primary">{activePlans.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-secondary">
              <span>Archived</span>
              <span className="font-semibold text-primary">{archivedPlans.length}</span>
            </div>
          </div>
        ),
      },
    ],
    [activePlans, archivedPlans, handleCreatePlan, navigate]
  );

  return (
    <div className="min-h-screen bg-secondary p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-6">
          <Typography variant="headline-lg" className="text-primary mb-1">
            Game Plans
          </Typography>
          <Typography variant="body" className="text-secondary">
            Create and manage strategic game plans for upcoming matches
          </Typography>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center mt-4">
            <Button
              onClick={() => navigate("/playbook")}
              variant="secondary"
              size="sm"
              className="w-full sm:w-auto"
            >
              <Icon name="arrow-left" className="h-4 w-4 mr-2" />
              Back to Playbook
            </Button>
            <Button
              onClick={handleCreatePlan}
              variant="primary"
              size="sm"
              className="w-full sm:w-auto"
            >
              <Icon name="plus" className="h-4 w-4 mr-2" />
              New Plan
            </Button>
          </div>
        </header>

        <div className="mb-8">
          <div className="rounded-xl bg-primary p-5 shadow-lg backdrop-blur-sm sm:p-6 xl:p-7">
            <div className="mb-6">
              <Typography variant="headline-sm" className="text-primary">
                Dial in this week's script
              </Typography>
              <Typography variant="body-sm" className="text-secondary mt-1">
                Launch the workspace you need for planning, film, and distribution.
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
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search game plans by name or opponent..."
              className="w-full md:flex-1 md:max-w-2xl"
            />
            <div className="flex flex-col gap-3 sm:w-full sm:flex-row sm:items-center md:w-auto">
              <SortDropdown
                options={sortOptions}
                value={sortBy}
                onChange={setSortBy}
                className="w-full sm:w-auto"
              />
              <Button
                onClick={() => setShowImportModal(true)}
                variant="secondary"
                size="sm"
                className="w-full sm:w-auto"
              >
                <Icon name="upload" className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button
                onClick={handleExportJSON}
                variant="secondary"
                size="sm"
                className="w-full sm:w-auto"
              >
                <Icon name="download" className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        )}

        {/* Content States */}
        {isLoading ? (
          <div className="space-y-4 py-10" aria-busy="true">
            <div className="h-32 rounded-xl bg-secondary animate-pulse" />
            <div className="h-32 rounded-xl bg-secondary animate-pulse" />
            <div className="h-32 rounded-xl bg-secondary animate-pulse" />
          </div>
        ) : activePlans.length === 0 && archivedPlans.length === 0 && !searchQuery ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
              <Icon name="target" className="h-12 w-12 text-muted" />
            </div>
            <Typography variant="headline-md" className="mb-2 text-primary">
              No Game Plans Yet
            </Typography>
            <Typography variant="body-lg" className="mx-auto mb-8 max-w-md text-secondary">
              Create your first game plan to strategize plays and formations for upcoming matches.
            </Typography>
            <div className="flex flex-col gap-4 justify-center sm:flex-row">
              <Button onClick={handleCreatePlan} variant="primary" size="lg">
                <Icon name="plus" className="mr-2 h-5 w-5" />
                Create New Plan
              </Button>
              <Button onClick={() => navigate("/playbook")} variant="secondary" size="lg">
                <Icon name="book" className="mr-2 h-5 w-5" />
                Browse Playbook
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6" id="game-plans-section">
            {/* Active Plans Section */}
            {activePlans.length > 0 && (
              <>
                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Typography variant="headline-md" className="text-primary">
                    Active Game Plans ({activePlans.length})
                  </Typography>
                  <Button onClick={handleCreatePlan} variant="primary" className="w-full sm:w-auto">
                    <Icon name="plus" className="h-4 w-4 mr-2" />
                    New Plan
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
                  {activePlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="bg-primary rounded-2xl border border-border p-5 shadow-purple-md hover:shadow-purple-lg hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                      onClick={() => handleEditPlan(plan)}
                    >
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <Typography variant="headline-sm" className="text-primary font-semibold leading-tight line-clamp-2">
                              {plan.name}
                            </Typography>
                            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
                              {plan.opponent && (
                                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-2.5 py-1 shadow-purple-sm">
                                  vs {plan.opponent}
                                </span>
                              )}
                              <span className="badge-purple inline-flex items-center rounded-full px-2.5 py-1">
                                {plan.gameDate ? new Date(plan.gameDate).toLocaleDateString() : "Date TBD"}
                              </span>
                              {plan.gameLocation && (
                                <span className="badge-purple inline-flex items-center rounded-full px-2.5 py-1">
                                  {plan.gameLocation}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 justify-end">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleExportPDF(plan); }}
                              className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted transition-colors hover:bg-muted hover:text-info focus:outline-none focus:ring-2 focus:ring-brand-jade focus:ring-offset-2"
                              title="Export PDF"
                              aria-label="Export plan as PDF"
                            >
                              <Icon name="download" className="h-5 w-5" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDuplicatePlan(plan); }}
                              className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted transition-colors hover:bg-muted hover:text-secondary focus:outline-none focus:ring-2 focus:ring-brand-jade focus:ring-offset-2"
                              title="Duplicate plan"
                              aria-label="Duplicate plan"
                            >
                              <Icon name="copy" className="h-5 w-5" />
                            </button>
                            {!isMobile && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleEditPlan(plan); }}
                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted transition-colors hover:bg-muted hover:text-secondary focus:outline-none focus:ring-2 focus:ring-brand-jade focus:ring-offset-2"
                                title="Edit plan"
                                aria-label="Edit plan"
                              >
                                <Icon name="edit" className="h-5 w-5" />
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleArchivePlan(plan); }}
                              className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted transition-colors hover:bg-muted hover:text-warning focus:outline-none focus:ring-2 focus:ring-brand-jade focus:ring-offset-2"
                              title="Archive plan"
                              aria-label="Archive plan"
                            >
                              <Icon name="folder" className="h-5 w-5" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeletePlan(plan.id); }}
                              className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted transition-colors hover:bg-muted hover:text-error focus:outline-none focus:ring-2 focus:ring-brand-jade focus:ring-offset-2"
                              title="Delete plan"
                              aria-label="Delete plan"
                            >
                              <Icon name="delete" className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-secondary">
                        <span className="inline-flex items-center gap-2 font-medium">
                          <Icon name="list" className="h-4 w-4" />
                          {getTotalPlays(plan)} plays
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Icon name="clock" className="h-4 w-4" />
                          {new Date(plan.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
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
                    <div key={plan.id} className="bg-secondary/80 rounded-2xl border border-border p-5 opacity-90">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <Typography variant="headline-sm" className="text-primary font-semibold leading-tight line-clamp-2">
                            {plan.name}
                          </Typography>
                        </div>
                        <button
                          onClick={() => handleArchivePlan(plan)}
                          className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-muted transition-colors hover:bg-muted hover:text-primary focus:outline-none focus:ring-2 focus:ring-brand-jade focus:ring-offset-2"
                          title="Restore plan"
                          aria-label="Restore plan"
                        >
                          <Icon name="inbox" className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="mt-4 space-y-2 text-sm text-secondary">
                        <span className="inline-flex items-center gap-2">
                          <Icon name="list" className="h-4 w-4" />
                          {getTotalPlays(plan)} plays
                        </span>
                        {plan.opponent && (
                          <span className="inline-flex items-center gap-2">
                            <Icon name="users" className="h-4 w-4" />
                            vs {plan.opponent}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-2">
                          <Icon name="calendar" className="h-4 w-4" />
                          {plan.gameDate ? new Date(plan.gameDate).toLocaleDateString() : "Date TBD"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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

GamePlansPage.displayName = "GamePlansPage";

export default React.memo(GamePlansPage);
