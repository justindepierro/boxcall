import React, { useState, useEffect, useCallback } from "react";
import { Typography } from "../design-system/Typography";
import { Icon } from "../ui/Icon";
import { Button } from "../ui/Button/Button";
import { Badge } from "../ui/Badge";
import { PracticeScriptService, type PracticeScript } from "@services";
import { useToast } from "../../hooks/useToast";
import { debug, logError } from "../../utils/logger";
import { ConfirmationModal } from "../ui/ConfirmationModal/ConfirmationModal";
import { useAuth } from "../../app/auth-store";

interface PracticeScriptListProps {
  teamId: string;
  onEditScript?: (script: PracticeScript) => void;
  onCreateNew?: () => void;
}

const PracticeScriptListLoading: React.FC = () => (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-text-accent" />
    <Typography variant="body-sm" className="ml-3 text-secondary">
      Loading practice scripts...
    </Typography>
  </div>
);

PracticeScriptListLoading.displayName = "PracticeScriptListLoading";

const PracticeScriptListError: React.FC<{
  message: string;
  onRetry: () => void;
}> = ({ message, onRetry }) => (
  <div className="text-center py-12">
    <Icon name="alert-triangle" className="h-16 w-16 text-error mx-auto mb-4" />
    <Typography variant="headline-sm" className="text-secondary mb-2">
      Error Loading Scripts
    </Typography>
    <Typography variant="body-sm" className="text-muted mb-6">
      {message}
    </Typography>
    <Button onClick={onRetry} variant="outline">
      <Icon name="refresh-cw" className="h-4 w-4 mr-2" />
      Try Again
    </Button>
  </div>
);

PracticeScriptListError.displayName = "PracticeScriptListError";

const PracticeScriptListEmpty: React.FC<{
  onCreateNew?: () => void;
}> = ({ onCreateNew }) => (
  <div className="text-center py-12">
    <Icon name="file" className="h-16 w-16 text-muted mx-auto mb-4" />
    <Typography variant="headline-sm" className="text-secondary mb-2">
      No Practice Scripts Yet
    </Typography>
    <Typography variant="body-sm" className="text-muted mb-6">
      Create your first practice script to get started with organized practice
      planning.
    </Typography>
    <Button onClick={onCreateNew} variant="primary">
      <Icon name="plus" className="h-4 w-4 mr-2" />
      Create New Script
    </Button>
  </div>
);

PracticeScriptListEmpty.displayName = "PracticeScriptListEmpty";

const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const PracticeScriptListRow: React.FC<{
  script: PracticeScript;
  onEditScript?: (script: PracticeScript) => void;
  onExportPDF: (script: PracticeScript) => void;
  onDuplicate: (script: PracticeScript) => void;
  onDelete: (scriptId: string, scriptName: string) => void;
}> = ({ script, onEditScript, onExportPDF, onDuplicate, onDelete }) => (
  <div className="bg-primary rounded-lg border border-muted p-4 hover:border-light transition-all hover:shadow-sm">
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Typography
            variant="headline-sm"
            className="text-primary truncate"
            title={script.title || script.name}
          >
            {script.title || script.name}
          </Typography>
          {script.isTemplate && (
            <Badge variant="neutral" size="sm">
              Template
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-secondary">
          <div className="flex items-center gap-1">
            <Icon name="clock" className="h-4 w-4" />
            <span>{formatDuration(script.duration)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon name="list" className="h-4 w-4" />
            <span>{script.plays?.length || 0} plays</span>
          </div>
          <Typography variant="caption" className="text-muted">
            Updated {formatDate(script.updatedAt)}
          </Typography>
        </div>

        {script.description && (
          <Typography
            variant="body-sm"
            className="text-secondary mt-2 line-clamp-1"
            title={script.description}
          >
            {script.description}
          </Typography>
        )}

        {script.tags && script.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {script.tags.slice(0, 5).map((tag) => (
              <Badge key={tag} variant="neutral" size="sm">
                {tag}
              </Badge>
            ))}
            {script.tags.length > 5 && (
              <Badge variant="neutral" size="sm">
                +{script.tags.length - 5} more
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          onClick={() => onExportPDF(script)}
          variant="primary"
          size="sm"
          title="Export to PDF"
        >
          <Icon name="download" className="h-4 w-4 mr-1" />
          PDF
        </Button>
        <Button
          onClick={() => onEditScript?.(script)}
          variant="secondary"
          size="sm"
          title="Edit script"
        >
          <Icon name="edit" className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button
          onClick={() => onDuplicate(script)}
          variant="outline"
          size="sm"
          title="Duplicate script"
        >
          <Icon name="copy" className="h-4 w-4" />
        </Button>
        <Button
          onClick={() =>
            onDelete(script.id, script.title || script.name || "Untitled")
          }
          variant="outline"
          size="sm"
          className="text-error-600 hover:text-error-700"
          aria-label="Delete script"
        >
          <Icon name="trash-2" className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
);

PracticeScriptListRow.displayName = "PracticeScriptListRow";

export const PracticeScriptList: React.FC<PracticeScriptListProps> = ({
  teamId,
  onEditScript,
  onCreateNew,
}) => {
  const [scripts, setScripts] = useState<PracticeScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { success, error: toastError } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { session } = useAuth(); // Wait for auth to be ready
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const loadScripts = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(null);
      debug(
        "📋 [PracticeScriptList] Starting to load scripts for team:",
        teamId
      );
      const fetchedScripts =
        await PracticeScriptService.getPracticeScripts(teamId);
      debug("📋 [PracticeScriptList] Loaded scripts:", {
        count: fetchedScripts.length,
        scripts: fetchedScripts.map((s) => ({
          id: s.id,
          title: s.title,
          playCount: s.plays?.length || 0,
        })),
      });
      setScripts(fetchedScripts);
    } catch (err) {
      logError("Failed to load practice scripts:", err);
      setFetchError("Failed to load practice scripts");
      toastError("Failed to load practice scripts", "Please try again");
    } finally {
      setLoading(false);
    }
  }, [teamId, toastError]);

  useEffect(() => {
    // Only load scripts when we have a valid session
    if (session?.access_token) {
      debug("📋 [PracticeScriptList] Session ready, loading scripts...");
      loadScripts();
    } else {
      debug("📋 [PracticeScriptList] Waiting for session...");
    }
  }, [loadScripts, session?.access_token]);

  const handleDeleteScript = async (scriptId: string, scriptName: string) => {
    setDeleteTarget({ id: scriptId, name: scriptName });
    setShowDeleteConfirm(true);
  };

  const confirmDeleteScript = async () => {
    if (!deleteTarget) return;

    try {
      await PracticeScriptService.deletePracticeScript(deleteTarget.id);
      success(`Deleted "${deleteTarget.name}"`);
      await loadScripts(); // Refresh the list
    } catch (err) {
      logError("Failed to delete practice script:", err);
      toastError("Failed to delete practice script", "Please try again");
    } finally {
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  const handleDuplicateScript = async (script: PracticeScript) => {
    try {
      const copyName = `${script.name} (Copy)`;
      const duplicatedScript =
        await PracticeScriptService.duplicatePracticeScript(
          script.id,
          copyName
        );
      success(`Duplicated as "${duplicatedScript.name}"`);
      await loadScripts(); // Refresh the list
    } catch (err) {
      logError("Failed to duplicate practice script:", err);
      toastError("Failed to duplicate practice script", "Please try again");
    }
  };

  const handleExportPDF = useCallback(
    async (script: PracticeScript) => {
      // Automatically use ultra-compact format (best for 50+ play scripts)
      try {
        const { PDFExportService } = await import(
          "../../services/pdfExportService"
        );
        await PDFExportService.exportPracticeScript(script, "ultra-compact");
        success(`PDF downloaded: "${script.name}"`);
      } catch (err) {
        logError("Failed to export PDF:", err);
        toastError("Failed to export PDF", "Please try again");
      }
    },
    [success, toastError]
  );

  if (loading) {
    return <PracticeScriptListLoading />;
  }

  if (fetchError) {
    return (
      <PracticeScriptListError message={fetchError} onRetry={loadScripts} />
    );
  }

  if (scripts.length === 0) {
    return <PracticeScriptListEmpty onCreateNew={onCreateNew} />;
  }

  return (
    <>
      <div className="space-y-2">
        {scripts.map((script) => (
          <PracticeScriptListRow
            key={script.id}
            script={script}
            onEditScript={onEditScript}
            onExportPDF={handleExportPDF}
            onDuplicate={handleDuplicateScript}
            onDelete={handleDeleteScript}
          />
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteTarget(null);
        }}
        onConfirm={confirmDeleteScript}
        title="Delete Practice Script"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        variant="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};
