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
import { FilterChips } from "../components/ui/FilterChips";
import { SortDropdown, type SortOption } from "../components/ui/SortDropdown";
const PracticeScriptModal = lazy(() =>
  import("../components/practice/PracticeScriptModal").then((module) => ({
    default: module.PracticeScriptModal,
  }))
);
const ImportPracticeScriptsModal = lazy(() =>
  import("../components/practice/ImportPracticeScriptsModal").then(
    (module) => ({
      default: module.ImportPracticeScriptsModal,
    })
  )
);
import { AuroraTile } from "../components/ui/AuroraTile";
import { PracticeService } from "../services/practiceService";
import { useAuth } from "../app/auth-store";
import { useToast } from "../hooks/useToast";
import {
  exportPracticeScripts,
  downloadJSON,
  type ExportedPracticeScript,
} from "../utils/practiceScriptExport";

import type { PracticeScript } from "../services/practiceService";
import { logError } from "../utils/logger";
import { ConfirmationModal } from "../components/ui/ConfirmationModal/ConfirmationModal";

const PracticePlansPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingScript, setEditingScript] = useState<
    PracticeScript | undefined
  >(undefined);
  const [practiceScripts, setPracticeScripts] = useState<PracticeScript[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("date-desc");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteScriptId, setDeleteScriptId] = useState<string | null>(null);

  // Get active team ID from localStorage
  useEffect(() => {
    const teamId = localStorage.getItem("activeTeamId");
    setActiveTeamId(teamId);
  }, []);

  // Load practice scripts from database
  const loadPracticeScripts = useCallback(async () => {
    if (!user || !activeTeamId) return;

    setLoading(true);
    try {
      const scripts = await PracticeService.getPracticeScripts(activeTeamId);
      setPracticeScripts(scripts);
    } catch (error) {
      logError("Failed to load practice scripts:", error);
      toast.error("Failed to load practice scripts");
    } finally {
      setLoading(false);
    }
  }, [user, activeTeamId, toast]);

  useEffect(() => {
    loadPracticeScripts();
  }, [loadPracticeScripts]);

  const handleCreateScript = useCallback(() => {
    console.log("Create script clicked - opening modal");
    setEditingScript(undefined);
    setShowModal(true);
  }, []);

  const handleEditScript = useCallback((script: PracticeScript) => {
    setEditingScript(script);
    setShowModal(true);
  }, []);

  const handleSaveScript = (script: Partial<PracticeScript>) => {
    if (!activeTeamId) {
      toast.error("No active team found");
      return;
    }

    void (async () => {
      try {
        if (editingScript) {
          if (!script.id) {
            throw new Error("Missing script ID for update");
          }
          await PracticeService.updatePracticeScript(script.id, {
            name: script.title || script.name || "Untitled Script",
            description: script.description,
            tags: script.tags,
          });
          toast.success("Practice script updated successfully");
        } else {
          await PracticeService.createPracticeScript({
            name: script.title || script.name || "Untitled Script",
            description: script.description,
            teamId: activeTeamId,
            tags: script.tags,
          });
          toast.success("Practice script created successfully");
        }

        await loadPracticeScripts();
        setShowModal(false);
        setEditingScript(undefined);
      } catch (error) {
        logError("Failed to save practice script:", error);
        toast.error("Failed to save practice script");
      }
    })();
  };

  const handleDuplicateScript = async (script: PracticeScript) => {
    try {
      const newName = `${script.title || script.name} (Copy)`;
      await PracticeService.duplicatePracticeScript(script.id, newName);
      await loadPracticeScripts();
      toast.success("Practice script duplicated successfully");
    } catch (error) {
      logError("Failed to duplicate script:", error);
      toast.error("Failed to duplicate script");
    }
  };

  const handleArchiveScript = async (script: PracticeScript) => {
    try {
      if (script.isArchived) {
        await PracticeService.unarchivePracticeScript(script.id);
        toast.success("Practice script restored");
      } else {
        await PracticeService.archivePracticeScript(script.id);
        toast.success("Practice script archived");
      }
      await loadPracticeScripts();
    } catch (error) {
      logError("Failed to archive/unarchive script:", error);
      toast.error("Failed to update script");
    }
  };

  const handleDeleteScript = async (scriptId: string) => {
    setDeleteScriptId(scriptId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteScript = async () => {
    if (!deleteScriptId) return;

    try {
      await PracticeService.deletePracticeScript(deleteScriptId);
      await loadPracticeScripts();
      toast.success("Practice script deleted successfully");
    } catch (error) {
      logError("Failed to delete script:", error);
      toast.error("Failed to delete script");
    } finally {
      setShowDeleteConfirm(false);
      setDeleteScriptId(null);
    }
  };

  const handleExportScripts = () => {
    if (practiceScripts.length === 0) {
      toast.error("No practice scripts to export");
      return;
    }

    try {
      const exportData = exportPracticeScripts(practiceScripts);
      const filename = `practice-scripts-${new Date().toISOString().split("T")[0]}.json`;
      downloadJSON(exportData, filename);
      toast.success(
        `Exported ${practiceScripts.length} practice script${practiceScripts.length !== 1 ? "s" : ""}`
      );
    } catch (error) {
      logError("Failed to export practice scripts:", error);
      toast.error("Failed to export practice scripts");
    }
  };

  const handleImportScripts = async (data: ExportedPracticeScript) => {
    if (!activeTeamId) {
      toast.error("No active team found");
      throw new Error("No active team");
    }

    try {
      let imported = 0;
      let failed = 0;

      for (const script of data.scripts) {
        try {
          await PracticeService.createPracticeScript({
            name: script.name,
            description: script.description || undefined,
            teamId: activeTeamId,
            tags: script.tags || undefined,
          });
          imported++;
        } catch (error) {
          logError(`Failed to import script "${script.name}":`, error);
          failed++;
        }
      }

      await loadPracticeScripts();

      if (failed === 0) {
        toast.success(
          `Successfully imported ${imported} practice script${imported !== 1 ? "s" : ""}`
        );
      } else {
        toast.warning(
          `Imported ${imported} script${imported !== 1 ? "s" : ""}, ${failed} failed`
        );
      }
    } catch (error) {
      logError("Failed to import practice scripts:", error);
      throw error;
    }
  };

  // Filter options
  const filterOptions = [
    {
      id: "has-tags",
      label: "Has Tags",
      active: activeFilters.includes("has-tags"),
    },
    {
      id: "no-tags",
      label: "No Tags",
      active: activeFilters.includes("no-tags"),
    },
  ];

  const sortOptions: SortOption[] = [
    { id: "date-desc", label: "Newest First" },
    { id: "date-asc", label: "Oldest First" },
    { id: "name-asc", label: "Name (A-Z)" },
    { id: "name-desc", label: "Name (Z-A)" },
  ];

  const handleToggleFilter = (filterId: string) => {
    setActiveFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId]
    );
  };

  // Apply search, filters, and sorting
  const filteredAndSortedScripts = useMemo(() => {
    let filtered = [...practiceScripts];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (script) =>
          (script.title || script.name || "").toLowerCase().includes(query) ||
          (script.description || "").toLowerCase().includes(query) ||
          (script.tags || []).some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply filters
    if (activeFilters.includes("has-tags")) {
      filtered = filtered.filter(
        (script) => script.tags && script.tags.length > 0
      );
    }
    if (activeFilters.includes("no-tags")) {
      filtered = filtered.filter(
        (script) => !script.tags || script.tags.length === 0
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "date-asc":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "name-asc":
          return (a.title || a.name || "").localeCompare(
            b.title || b.name || ""
          );
        case "name-desc":
          return (b.title || b.name || "").localeCompare(
            a.title || a.name || ""
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [practiceScripts, searchQuery, activeFilters, sortBy]);

  const activeScripts = filteredAndSortedScripts.filter((s) => !s.isArchived);
  const archivedScripts = filteredAndSortedScripts.filter((s) => s.isArchived);

  const scrollToList = () => {
    if (typeof window === "undefined") return;
    const section = document.getElementById("practice-scripts-section");
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const tileConfigs = useMemo(
    () => [
      {
        key: "plan",
        title: "Build Script",
        description: "Craft install-ready periods with reps and notes.",
        icon: "target" as IconName,
        accentOverlayClass: "bg-aurora-emerald",
        glowClassName: "glow-aurora-emerald",
        statusBadge: "Creator",
        iconClassName: "text-emerald-600",
        footnote: "Start new",
        onOpen: handleCreateScript,
        body: (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-secondary">
              <span>Total scripts</span>
              <span className="font-semibold text-primary">
                {activeScripts.length}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-secondary">
              <span>Latest build</span>
              <span className="font-semibold text-primary">
                {activeScripts[0]?.updatedAt
                  ? new Date(activeScripts[0].updatedAt).toLocaleDateString()
                  : "—"}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "templates",
        title: "Template Library",
        description: "Reuse favorite period groups for faster installs.",
        icon: "grid" as IconName,
        accentOverlayClass: "bg-aurora-indigo",
        glowClassName: "glow-aurora-indigo",
        statusBadge: "Library",
        iconClassName: "text-sky-600",
        footnote: "Coming soon",
        onOpen: () => toast.info("Template library coming soon!"),
        body: (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-secondary">
              <span>Quick add</span>
              <span className="font-semibold text-primary">Soon</span>
            </div>
            <div className="flex items-center justify-between text-xs text-secondary">
              <span>Most used</span>
              <span className="font-semibold text-primary">—</span>
            </div>
          </div>
        ),
      },
      {
        key: "share",
        title: "View Scripts",
        description: "See all your practice scripts and templates.",
        icon: "mail" as IconName,
        accentOverlayClass: "bg-aurora-violet",
        glowClassName: "glow-aurora-violet",
        statusBadge: "Browse",
        iconClassName: "text-purple-600",
        footnote: "View list",
        onOpen: scrollToList,
        body: (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-secondary">
              <span>Active scripts</span>
              <span className="font-semibold text-primary">
                {activeScripts.length}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-secondary">
              <span>Archived</span>
              <span className="font-semibold text-primary">
                {archivedScripts.length}
              </span>
            </div>
          </div>
        ),
      },
    ],
    [activeScripts, archivedScripts, handleCreateScript, toast]
  );

  return (
    <div className="min-h-screen bg-secondary p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-6">
          <Typography variant="headline-lg" className="text-primary mb-1">
            Practice Plans
          </Typography>
          <Typography variant="body" className="text-secondary">
            Create and manage practice scripts for your team's training sessions
          </Typography>
          <div className="flex items-center gap-3 mt-4">
            <Button
              onClick={() => navigate("/playbook")}
              variant="secondary"
              size="sm"
            >
              <Icon name="arrow-left" className="h-4 w-4 mr-2" />
              Back to Playbook
            </Button>
            <Button onClick={handleCreateScript} variant="primary" size="sm">
              <Icon name="plus" className="h-4 w-4 mr-2" />
              New Script
            </Button>
          </div>
        </header>
        {/* Aurora Dashboard Tiles */}
        <div className="mb-8">
          <div className="rounded-xl bg-primary p-5 shadow-lg backdrop-blur-sm sm:p-6 xl:p-7">
            <div className="mb-6">
              <Typography variant="headline-sm" className="text-primary">
                Set the tone for practice
              </Typography>
              <Typography variant="body-sm" className="text-secondary mt-1">
                Launch scripts, pull templates, or share the agenda in seconds.
              </Typography>
            </div>
            <div className="grid-dashboard gap-4 md:gap-5">
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

        {/* Search & Filter Section */}
        {practiceScripts.length > 0 && !isLoading && (
          <div className="mb-6 space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search scripts..."
                className="w-full sm:flex-1 sm:max-w-2xl"
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
                  onClick={handleExportScripts}
                  variant="secondary"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Icon name="download" className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <FilterChips
                chips={filterOptions}
                onToggle={handleToggleFilter}
              />
              <SortDropdown
                options={sortOptions}
                value={sortBy}
                onChange={setSortBy}
                className="w-full sm:w-auto"
              />
            </div>
          </div>
        )}

        {(() => {
          if (isLoading) {
            return (
              <div className="space-y-4 py-10" aria-busy="true">
                <div className="h-32 rounded-xl bg-secondary animate-pulse" />
                <div className="h-32 rounded-xl bg-secondary animate-pulse" />
                <div className="h-32 rounded-xl bg-secondary animate-pulse" />
              </div>
            );
          }
          if (
            activeScripts.length === 0 &&
            archivedScripts.length === 0 &&
            !searchQuery &&
            activeFilters.length === 0
          ) {
            return (
              <div className="py-16 text-center">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                  <Icon name="file" className="h-12 w-12 text-muted" />
                </div>
                <Typography variant="headline-md" className="mb-2 text-primary">
                  No Practice Scripts Yet
                </Typography>
                <Typography
                  variant="body-lg"
                  className="mx-auto mb-8 max-w-md text-secondary"
                >
                  Create your first practice script to organize plays for your
                  team's training sessions.
                </Typography>
                <div className="flex flex-col gap-4 justify-center sm:flex-row">
                  <Button
                    onClick={handleCreateScript}
                    variant="primary"
                    size="lg"
                  >
                    <Icon name="plus" className="mr-2 h-5 w-5" />
                    Create New Script
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
            );
          }
          return (
            <div className="space-y-6" id="practice-scripts-section">
              {/* Header with Create Button */}
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Typography
                    variant="headline-md"
                    className="text-primary font-semibold"
                  >
                    Your Practice Scripts
                  </Typography>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-secondary">
                    <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1">
                      {activeScripts.length} Active
                    </span>
                    {archivedScripts.length > 0 && (
                      <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1">
                        {archivedScripts.length} Archived
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  onClick={handleCreateScript}
                  variant="primary"
                  className="w-full sm:w-auto"
                >
                  <Icon name="plus" className="h-4 w-4 mr-2" />
                  New Script
                </Button>
              </div>

              {/* Scripts Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeScripts.map((script) => (
                  <div
                    key={script.id}
                    className="bg-primary rounded-2xl border border-border p-5 shadow-orange-md hover:shadow-orange-lg hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 hover:border-hover cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <Typography
                          variant="headline-sm"
                          className="text-primary font-semibold leading-tight line-clamp-2"
                        >
                          {script.title || script.name || "Untitled Script"}
                        </Typography>
                        {script.description && (
                          <Typography
                            variant="body-sm"
                            className="text-secondary line-clamp-2"
                          >
                            {script.description}
                          </Typography>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-secondary">
                      <span className="inline-flex items-center gap-2">
                        <Icon name="play" className="h-4 w-4" />
                        {script.plays?.length || 0} plays
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Icon name="clock" className="h-4 w-4" />
                        {script.duration || 120} min
                      </span>
                    </div>

                    {/* Tags */}
                    {script.tags && script.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {script.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs rounded-full bg-gradient-to-r from-orange-50 to-orange-100 text-orange-900 border border-orange-200"
                          >
                            {tag}
                          </span>
                        ))}
                        {script.tags.length > 3 && (
                          <span className="px-2 py-1 text-xs rounded bg-secondary text-muted">
                            +{script.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <Typography variant="body-sm" className="text-muted">
                        {new Date(script.updatedAt).toLocaleDateString()}
                      </Typography>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditScript(script)}
                          className="p-2 text-muted hover:text-primary hover:bg-secondary rounded transition-colors"
                          title="Edit script"
                        >
                          <Icon name="edit" className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicateScript(script)}
                          className="p-2 text-muted hover:text-primary hover:bg-secondary rounded transition-colors"
                          title="Duplicate script"
                        >
                          <Icon name="copy" className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleArchiveScript(script)}
                          className="p-2 text-muted hover:text-primary hover:bg-secondary rounded transition-colors"
                          title="Archive script"
                        >
                          <Icon name="folder" className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteScript(script.id)}
                          className="p-2 text-muted hover:text-error-600 hover:bg-error-50 rounded transition-colors"
                          title="Delete script"
                        >
                          <Icon name="delete" className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Archived Scripts Section */}
              {archivedScripts.length > 0 && (
                <div className="mt-12">
                  <Typography
                    variant="headline-sm"
                    className="text-secondary mb-4"
                  >
                    Archived Scripts ({archivedScripts.length})
                  </Typography>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {archivedScripts.map((script) => (
                      <div
                        key={script.id}
                        className="bg-muted/50 rounded-lg border border-border p-4 opacity-60"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <Typography
                            variant="body-md"
                            className="text-secondary truncate flex-1"
                          >
                            {script.title || script.name || "Untitled Script"}
                          </Typography>
                          <button
                            onClick={() => handleArchiveScript(script)}
                            className="p-1 text-muted hover:text-primary rounded transition-colors"
                            title="Restore script"
                          >
                            <Icon name="inbox" className="h-4 w-4" />
                          </button>
                        </div>
                        <Typography variant="body-sm" className="text-muted">
                          {script.plays?.length || 0} plays • Archived
                        </Typography>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Practice Script Modal */}
        {showModal && (
          <Suspense
            fallback={
              <div className="fixed inset-0 bg-backdrop flex items-center justify-center z-modal">
                <div className="text-white">Loading modal...</div>
              </div>
            }
          >
            <PracticeScriptModal
              editingScript={editingScript}
              onClose={() => {
                console.log("Modal close clicked");
                setShowModal(false);
                setEditingScript(undefined);
              }}
              onSave={handleSaveScript}
            />
          </Suspense>
        )}

        {/* Import Modal */}
        {showImportModal && (
          <Suspense fallback={<div>Loading...</div>}>
            <ImportPracticeScriptsModal
              isOpen={showImportModal}
              onClose={() => setShowImportModal(false)}
              onImport={handleImportScripts}
            />
          </Suspense>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setDeleteScriptId(null);
          }}
          onConfirm={confirmDeleteScript}
          title="Delete Practice Script"
          message="Are you sure you want to delete this practice script? This cannot be undone."
          variant="danger"
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </div>
  );
};

PracticePlansPage.displayName = "PracticePlansPage";

export default React.memo(PracticePlansPage);
