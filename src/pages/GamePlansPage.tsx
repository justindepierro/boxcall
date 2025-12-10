import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  lazy,
  Suspense,
} from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button/Button";
import { Icon, type IconName } from "../components/ui/Icon";
import { Typography } from "../components/design-system/Typography";
import { SearchBar } from "../components/ui/SearchBar";
import { SortDropdown, type SortOption } from "../components/ui/SortDropdown";
import { AuroraTile } from "../components/ui/AuroraTile";
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
import { GamePlanPDFService } from "../services/gamePlanPdfService";
import {
  GamePlanService,
  type GamePlan as ServiceGamePlan,
} from "../services/gamePlanService";
import type { GamePlan as ModalGamePlan } from "../components/playbook/GamePlanModal/types";
import { useAuth } from "../app/auth-store";
import { useToast } from "../hooks/useToast";
import { useIsMobile } from "../hooks/useBreakpoint";
import { logError } from "../utils/logger";
import {
  exportGamePlans,
  downloadJSON,
  type ExportedGamePlan,
} from "../utils/gamePlanExport";

const GamePlansPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [gamePlans, setGamePlans] = useState<ModalGamePlan[]>([]);
  const [rawGamePlans, setRawGamePlans] = useState<ServiceGamePlan[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ModalGamePlan | undefined>(
    undefined
  );
  const [isLoading, setLoading] = useState(true);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Search & Sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");

  // Get active team ID from localStorage or user
  useEffect(() => {
    const teamId = localStorage.getItem("activeTeamId");
    setActiveTeamId(teamId);
  }, []);

  const loadGamePlans = useCallback(async () => {
    if (!user || !activeTeamId) return;

    setLoading(true);
    try {
      const plans = await GamePlanService.getGamePlans(activeTeamId, false);
      setRawGamePlans(plans);

      // Map to UI GamePlan type expected by modal/list components
      const mappedPlans: ModalGamePlan[] = plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        opponent: plan.opponent || "",
        gameDate: plan.gameDate,
        gameLocation: plan.gameLocation as
          | "Home"
          | "Away"
          | "Neutral"
          | undefined,
        situations: (plan.situations || []).map((sit) => ({
          id: sit.id,
          situationType: sit.situationType,
          plays: (sit.plays || []).map((p) => ({
            id: p.id,
            playId: p.playId,
            playName: p.play?.play_name || "Unknown Play",
            formation: p.play?.formation,
            personnel: p.play?.personnel,
            wristbandNumber: p.play?.wristband_number,
            priority: p.priority,
          })),
        })),
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
        isArchived: plan.isArchived,
      }));

      setGamePlans(mappedPlans);
    } catch (error) {
      logError("Failed to load game plans:", error);
      toast.error("Failed to load game plans");
    } finally {
      setLoading(false);
    }
  }, [user, activeTeamId, toast]);

  // Load game plans from database
  useEffect(() => {
    loadGamePlans();
  }, [loadGamePlans]);

  // Phase 1.3: Preload heavy modals during idle time
  useEffect(() => {
    if (isLoading || gamePlans.length === 0) return;

    // Preload modals after 2 seconds of idle time
    const timer = setTimeout(() => {
      console.debug(
        "[GamePlansPage] Preloading heavy modals during idle time..."
      );

      // Preload GamePlanModal
      import("../components/playbook/GamePlanModal").catch(() => {
        console.debug("GamePlanModal preload failed (will load on demand)");
      });

      // Preload ImportGamePlansModal
      import("../components/playbook/ImportGamePlansModal").catch(() => {
        console.debug(
          "ImportGamePlansModal preload failed (will load on demand)"
        );
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [isLoading, gamePlans.length]);

  const handleCreatePlan = useCallback(() => {
    setEditingPlan(undefined);
    setShowModal(true);
  }, []);

  const handleEditPlan = (plan: ModalGamePlan) => {
    setEditingPlan(plan);
    setShowModal(true);
  };

  const handleSavePlan = async (plan: ModalGamePlan) => {
    if (!activeTeamId) {
      toast.error("No active team found");
      return;
    }

    try {
      // 1. Show instant success feedback
      toast.success(editingPlan ? "Game plan updated!" : "Game plan created!");

      // 2. Optimistically update UI immediately
      if (editingPlan) {
        setGamePlans((prev) =>
          prev.map((p) =>
            p.id === plan.id ? { ...plan, updatedAt: new Date() } : p
          )
        );
      } else {
        // Create temporary ID for optimistic add
        const tempId = `temp-${Date.now()}`;
        const optimisticPlan: ModalGamePlan = {
          ...plan,
          id: tempId,
          createdAt: new Date(),
          updatedAt: new Date(),
          isArchived: false,
        };
        setGamePlans((prev) => [optimisticPlan, ...prev]);
      }

      // 3. Close modal instantly
      setShowModal(false);
      setEditingPlan(undefined);

      // 4. Sync with server in background (silent)
      if (editingPlan) {
        await GamePlanService.updateGamePlan(plan.id, {
          name: plan.name,
          opponent: plan.opponent,
          gameDate: plan.gameDate,
          gameLocation: plan.gameLocation,
        });
      } else {
        const newPlan = await GamePlanService.createGamePlan({
          teamId: activeTeamId,
          name: plan.name,
          opponent: plan.opponent,
          gameDate: plan.gameDate,
          gameLocation: plan.gameLocation,
        });

        // Replace temp ID with real ID from server
        setGamePlans((prev) =>
          prev.map((p) =>
            p.id.startsWith("temp-")
              ? {
                  ...p,
                  id: newPlan.id,
                  createdAt: newPlan.createdAt,
                  updatedAt: newPlan.updatedAt,
                }
              : p
          )
        );
        setRawGamePlans((prev) => [newPlan, ...prev]);
      }
    } catch (error) {
      logError("Failed to save game plan:", error);

      // 5. Rollback on error
      if (editingPlan) {
        // Revert to original from rawGamePlans
        const original = rawGamePlans.find((p) => p.id === plan.id);
        if (original) {
          const mappedOriginal: ModalGamePlan = {
            id: original.id,
            name: original.name,
            opponent: original.opponent || "",
            gameDate: original.gameDate,
            gameLocation: original.gameLocation as
              | "Home"
              | "Away"
              | "Neutral"
              | undefined,
            situations: [],
            createdAt: original.createdAt,
            updatedAt: original.updatedAt,
            isArchived: original.isArchived,
          };
          setGamePlans((prev) =>
            prev.map((p) => (p.id === plan.id ? mappedOriginal : p))
          );
        }
      } else {
        // Remove optimistic add
        setGamePlans((prev) => prev.filter((p) => !p.id.startsWith("temp-")));
      }

      toast.error("Failed to save game plan");
    }
  };

  const handleDuplicatePlan = async (plan: ModalGamePlan) => {
    try {
      const newName = `${plan.name} (Copy)`;
      const tempId = `temp-${Date.now()}`;

      // 1. Instant UI update
      const duplicatedPlan: ModalGamePlan = {
        ...plan,
        id: tempId,
        name: newName,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setGamePlans((prev) => [duplicatedPlan, ...prev]);
      toast.success("Game plan duplicated!");

      // 2. Background sync
      const newPlan = await GamePlanService.duplicateGamePlan(plan.id, newName);

      // 3. Replace temp with real ID
      setGamePlans((prev) =>
        prev.map((p) =>
          p.id === tempId
            ? { ...p, id: newPlan.id, createdAt: newPlan.createdAt }
            : p
        )
      );
      setRawGamePlans((prev) => [newPlan, ...prev]);
    } catch (error) {
      logError("Failed to duplicate game plan:", error);

      // Rollback
      setGamePlans((prev) => prev.filter((p) => !p.id.startsWith("temp-")));
      toast.error("Failed to duplicate game plan");
    }
  };

  const handleArchivePlan = async (plan: ModalGamePlan) => {
    const originalArchiveState = plan.isArchived;

    try {
      // 1. Instant UI update
      setGamePlans((prev) =>
        prev.map((p) =>
          p.id === plan.id ? { ...p, isArchived: !p.isArchived } : p
        )
      );
      toast.success(
        plan.isArchived ? "Game plan restored!" : "Game plan archived!"
      );

      // 2. Background sync
      if (plan.isArchived) {
        await GamePlanService.unarchiveGamePlan(plan.id);
      } else {
        await GamePlanService.archiveGamePlan(plan.id);
      }

      // Update rawGamePlans
      setRawGamePlans((prev) =>
        prev.map((p) =>
          p.id === plan.id ? { ...p, isArchived: !originalArchiveState } : p
        )
      );
    } catch (error) {
      logError("Failed to archive/unarchive game plan:", error);

      // Rollback
      setGamePlans((prev) =>
        prev.map((p) =>
          p.id === plan.id ? { ...p, isArchived: originalArchiveState } : p
        )
      );
      toast.error("Failed to update game plan");
    }
  };

  const handleExportPDF = async (plan: ModalGamePlan) => {
    try {
      await GamePlanPDFService.exportGamePlan(plan, "call-sheet");
      toast.success("PDF exported successfully");
    } catch (error) {
      logError("Failed to export PDF:", error);
      toast.error("Failed to export PDF");
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm("Are you sure you want to delete this game plan?")) return;

    const deletedPlan = gamePlans.find((p) => p.id === planId);
    const deletedRawPlan = rawGamePlans.find((p) => p.id === planId);

    try {
      // 1. Instant UI update
      setGamePlans((prev) => prev.filter((p) => p.id !== planId));
      setRawGamePlans((prev) => prev.filter((p) => p.id !== planId));
      toast.success("Game plan deleted!");

      // 2. Background sync
      await GamePlanService.deleteGamePlan(planId);
    } catch (error) {
      logError("Failed to delete game plan:", error);

      // Rollback
      if (deletedPlan) {
        setGamePlans((prev) => [...prev, deletedPlan]);
      }
      if (deletedRawPlan) {
        setRawGamePlans((prev) => [...prev, deletedRawPlan]);
      }
      toast.error("Failed to delete game plan");
    }
  };

  const handleExportJSON = () => {
    if (rawGamePlans.length === 0) {
      toast.error("No game plans to export");
      return;
    }

    try {
      const exportData = exportGamePlans(rawGamePlans);
      const filename = `game-plans-${new Date().toISOString().split("T")[0]}.json`;
      downloadJSON(exportData, filename);
      toast.success(
        `Exported ${rawGamePlans.length} game plan${rawGamePlans.length !== 1 ? "s" : ""}`
      );
    } catch (error) {
      logError("Failed to export game plans:", error);
      toast.error("Failed to export game plans");
    }
  };

  const handleImportPlans = async (data: ExportedGamePlan) => {
    if (!activeTeamId) {
      toast.error("No active team found");
      throw new Error("No active team");
    }

    try {
      let imported = 0;
      let failed = 0;

      for (const plan of data.plans) {
        try {
          // Create the game plan
          const newPlan = await GamePlanService.createGamePlan({
            name: plan.name,
            opponent: plan.opponent || undefined,
            gameDate: plan.gameDate || undefined,
            notes: plan.notes || undefined,
            teamId: activeTeamId,
          });

          // Group situations by situationName
          const situationsMap = new Map<
            string,
            Array<{ playId: string; orderIndex: number; notes: string | null }>
          >();

          for (const sit of plan.situations) {
            if (!situationsMap.has(sit.situationName)) {
              situationsMap.set(sit.situationName, []);
            }
            situationsMap.get(sit.situationName)!.push({
              playId: sit.playId,
              orderIndex: sit.orderIndex,
              notes: sit.notes,
            });
          }

          // Add plays to each situation
          for (const [situationName, plays] of situationsMap) {
            const targetSituation = newPlan.situations?.find(
              (situation) =>
                situation.situationType.toLowerCase() ===
                situationName.toLowerCase()
            );

            if (!targetSituation) {
              console.warn(
                `Skipping plays for unknown situation "${situationName}"`
              );
              continue;
            }

            for (const play of plays) {
              await GamePlanService.addPlayToSituation({
                situationId: targetSituation.id,
                playId: play.playId,
                priority: play.orderIndex + 1,
                notes: play.notes || undefined,
              });
            }
          }

          imported++;
        } catch (error) {
          logError(`Failed to import game plan "${plan.name}":`, error);
          failed++;
        }
      }

      await loadGamePlans();

      if (failed === 0) {
        toast.success(
          `Successfully imported ${imported} game plan${imported !== 1 ? "s" : ""}`
        );
      } else {
        toast.warning(
          `Imported ${imported} plan${imported !== 1 ? "s" : ""}, ${failed} failed`
        );
      }
    } catch (error) {
      logError("Failed to import game plans:", error);
      throw error;
    }
  };

  const getTotalPlays = (plan: ModalGamePlan) => {
    return plan.situations.reduce(
      (sum, situation) => sum + situation.plays.length,
      0
    );
  };

  const sortOptions: SortOption[] = [
    { id: "date-desc", label: "Newest First" },
    { id: "date-asc", label: "Oldest First" },
    { id: "name-asc", label: "Name (A-Z)" },
    { id: "name-desc", label: "Name (Z-A)" },
  ];

  // Apply search and sorting
  const filteredAndSortedPlans = useMemo(() => {
    let filtered = [...gamePlans];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (plan) =>
          plan.name.toLowerCase().includes(query) ||
          (plan.opponent || "").toLowerCase().includes(query)
      );
    }

    // Apply sorting
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

  // Filter active and archived plans
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
        iconClassName: "text-green-600",
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
        iconClassName: "text-purple-600",
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
                Dial in this week’s script
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

        {isLoading ? (
          <div className="space-y-4 py-10" aria-busy="true">
            <div className="h-32 rounded-xl bg-secondary animate-pulse" />
            <div className="h-32 rounded-xl bg-secondary animate-pulse" />
            <div className="h-32 rounded-xl bg-secondary animate-pulse" />
          </div>
        ) : activePlans.length === 0 &&
          archivedPlans.length === 0 &&
          !searchQuery ? (
          // Empty State
          <div className="py-16 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
              <Icon name="target" className="h-12 w-12 text-muted" />
            </div>
            <Typography variant="headline-md" className="mb-2 text-primary">
              No Game Plans Yet
            </Typography>
            <Typography
              variant="body-lg"
              className="mx-auto mb-8 max-w-md text-secondary"
            >
              Create your first game plan to strategize plays and formations for
              upcoming matches.
            </Typography>
            <div className="flex flex-col gap-4 justify-center sm:flex-row">
              <Button onClick={handleCreatePlan} variant="primary" size="lg">
                <Icon name="plus" className="mr-2 h-5 w-5" />
                Create New Plan
              </Button>
              <Button
                onClick={() => navigate("/playbook")}
                variant="secondary"
                size="lg"
              >
                <Icon name="book" className="mr-2 h-5 w-5" />
                Browse Playbook
              </Button>
            </div>
          </div>
        ) : (
          // Plans List
          <div className="space-y-6" id="game-plans-section">
            {/* Active Plans Section */}
            {activePlans.length > 0 && (
              <>
                {/* Header with Create Button */}
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

                {/* Plans Grid */}
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
                            <Typography
                              variant="headline-sm"
                              className="text-primary font-semibold leading-tight line-clamp-2"
                            >
                              {plan.name}
                            </Typography>
                            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
                              {plan.opponent && (
                                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-2.5 py-1 shadow-purple-sm">
                                  vs {plan.opponent}
                                </span>
                              )}
                              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-50 to-purple-100 text-purple-900 border border-purple-200 px-2.5 py-1">
                                {plan.gameDate
                                  ? new Date(plan.gameDate).toLocaleDateString()
                                  : "Date TBD"}
                              </span>
                              {plan.gameLocation && (
                                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-50 to-purple-100 text-purple-900 border border-purple-200 px-2.5 py-1">
                                  {plan.gameLocation}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 justify-end">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExportPDF(plan);
                              }}
                              className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted transition-colors hover:bg-muted hover:text-info focus:outline-none focus:ring-2 focus:ring-brand-jade focus:ring-offset-2"
                              title="Export PDF"
                              aria-label="Export plan as PDF"
                            >
                              <Icon name="download" className="h-5 w-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicatePlan(plan);
                              }}
                              className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted transition-colors hover:bg-muted hover:text-secondary focus:outline-none focus:ring-2 focus:ring-brand-jade focus:ring-offset-2"
                              title="Duplicate plan"
                              aria-label="Duplicate plan"
                            >
                              <Icon name="copy" className="h-5 w-5" />
                            </button>
                            {!isMobile && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditPlan(plan);
                                }}
                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted transition-colors hover:bg-muted hover:text-secondary focus:outline-none focus:ring-2 focus:ring-brand-jade focus:ring-offset-2"
                                title="Edit plan"
                                aria-label="Edit plan"
                              >
                                <Icon name="edit" className="h-5 w-5" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleArchivePlan(plan);
                              }}
                              className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted transition-colors hover:bg-muted hover:text-warning focus:outline-none focus:ring-2 focus:ring-brand-jade focus:ring-offset-2"
                              title="Archive plan"
                              aria-label="Archive plan"
                            >
                              <Icon name="folder" className="h-5 w-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePlan(plan.id);
                              }}
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
                    <div
                      key={plan.id}
                      className="bg-secondary/80 rounded-2xl border border-border p-5 opacity-90"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <Typography
                            variant="headline-sm"
                            className="text-primary font-semibold leading-tight line-clamp-2"
                          >
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
                          {plan.gameDate
                            ? new Date(plan.gameDate).toLocaleDateString()
                            : "Date TBD"}
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
      </div>
    </div>
  );
};

GamePlansPage.displayName = "GamePlansPage";

export default React.memo(GamePlansPage);
