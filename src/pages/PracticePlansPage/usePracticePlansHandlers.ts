/**
 * usePracticePlansHandlers Hook
 *
 * Manages state and handlers for the Practice Plans page
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../app/auth-store";
import { useToast } from "../../hooks/useToast";
import { PracticeService } from "../../services/practiceService";
import type { PracticeScript } from "../../services/practiceService";
import {
  exportPracticeScripts,
  downloadJSON,
  type ExportedPracticeScript,
} from "../../utils/practiceScriptExport";
import { logError } from "../../utils/logger";

export function usePracticePlansHandlers() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  // State
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingScript, setEditingScript] = useState<
    PracticeScript | undefined
  >(undefined);
  const [practiceScripts, setPracticeScripts] = useState<PracticeScript[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
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

  // CRUD Handlers
  const handleCreateScript = useCallback(() => {
    console.log("Create script clicked - opening modal");
    setEditingScript(undefined);
    setShowModal(true);
  }, []);

  const handleEditScript = useCallback((script: PracticeScript) => {
    setEditingScript(script);
    setShowModal(true);
  }, []);

  const handleSaveScript = useCallback(
    (script: Partial<PracticeScript>) => {
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
    },
    [activeTeamId, editingScript, loadPracticeScripts, toast]
  );

  const handleDuplicateScript = useCallback(
    async (script: PracticeScript) => {
      try {
        const newName = `${script.title || script.name} (Copy)`;
        await PracticeService.duplicatePracticeScript(script.id, newName);
        await loadPracticeScripts();
        toast.success("Practice script duplicated successfully");
      } catch (error) {
        logError("Failed to duplicate script:", error);
        toast.error("Failed to duplicate script");
      }
    },
    [loadPracticeScripts, toast]
  );

  const handleArchiveScript = useCallback(
    async (script: PracticeScript) => {
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
    },
    [loadPracticeScripts, toast]
  );

  const handleDeleteScript = useCallback((scriptId: string) => {
    setDeleteScriptId(scriptId);
    setShowDeleteConfirm(true);
  }, []);

  const confirmDeleteScript = useCallback(async () => {
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
  }, [deleteScriptId, loadPracticeScripts, toast]);

  const cancelDeleteScript = useCallback(() => {
    setShowDeleteConfirm(false);
    setDeleteScriptId(null);
  }, []);

  // Import/Export handlers
  const handleExportScripts = useCallback(() => {
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
  }, [practiceScripts, toast]);

  const handleImportScripts = useCallback(
    async (data: ExportedPracticeScript) => {
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
    },
    [activeTeamId, loadPracticeScripts, toast]
  );

  // Filter/Sort handlers
  const handleToggleFilter = useCallback((filterId: string) => {
    setActiveFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId]
    );
  }, []);

  // Modal handlers
  const handleCloseModal = useCallback(() => {
    console.log("Modal close clicked");
    setShowModal(false);
    setEditingScript(undefined);
  }, []);

  const handleOpenImportModal = useCallback(() => {
    setShowImportModal(true);
  }, []);

  const handleCloseImportModal = useCallback(() => {
    setShowImportModal(false);
  }, []);

  // Navigation
  const handleNavigateToPlaybook = useCallback(() => {
    navigate("/playbook");
  }, [navigate]);

  // Computed values
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

  const activeScripts = useMemo(
    () => filteredAndSortedScripts.filter((s) => !s.isArchived),
    [filteredAndSortedScripts]
  );

  const archivedScripts = useMemo(
    () => filteredAndSortedScripts.filter((s) => s.isArchived),
    [filteredAndSortedScripts]
  );

  return {
    // State
    showModal,
    showImportModal,
    editingScript,
    practiceScripts,
    isLoading,
    searchQuery,
    activeFilters,
    sortBy,
    showDeleteConfirm,
    activeScripts,
    archivedScripts,
    // Setters
    setSearchQuery,
    setSortBy,
    // Handlers
    handleCreateScript,
    handleEditScript,
    handleSaveScript,
    handleDuplicateScript,
    handleArchiveScript,
    handleDeleteScript,
    confirmDeleteScript,
    cancelDeleteScript,
    handleExportScripts,
    handleImportScripts,
    handleToggleFilter,
    handleCloseModal,
    handleOpenImportModal,
    handleCloseImportModal,
    handleNavigateToPlaybook,
    // Toast for tile configs
    toast,
  };
}
