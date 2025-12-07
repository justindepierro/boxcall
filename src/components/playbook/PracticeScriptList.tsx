import React, { useState, useEffect, useCallback } from "react";
import { Typography } from "../design-system/Typography";
import { Icon } from "../ui/Icon";
import { Button } from "../ui/Button/Button";
import { Badge } from "../ui/Badge";
import { PracticeScriptService, type PracticeScript } from "@services";
import { useToast } from "../../hooks/useToast";
import { PDFExportService } from "../../services/pdfExportService";

interface PracticeScriptListProps {
  teamId: string;
  onEditScript?: (script: PracticeScript) => void;
  onCreateNew?: () => void;
}

export const PracticeScriptList: React.FC<PracticeScriptListProps> = ({
  teamId,
  onEditScript,
  onCreateNew,
}) => {
  const [scripts, setScripts] = useState<PracticeScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { success, error: toastError } = useToast();

  const loadScripts = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const fetchedScripts =
        await PracticeScriptService.getPracticeScripts(teamId);
      setScripts(fetchedScripts);
    } catch (err) {
      console.error("Failed to load practice scripts:", err);
      setFetchError("Failed to load practice scripts");
      toastError("Failed to load practice scripts", "Please try again");
    } finally {
      setLoading(false);
    }
  }, [teamId, toastError]);

  useEffect(() => {
    loadScripts();
  }, [loadScripts]);

  const handleDeleteScript = async (scriptId: string, scriptName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${scriptName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await PracticeScriptService.deletePracticeScript(scriptId);
      success(`Deleted "${scriptName}"`);
      await loadScripts(); // Refresh the list
    } catch (err) {
      console.error("Failed to delete practice script:", err);
      toastError("Failed to delete practice script", "Please try again");
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
      console.error("Failed to duplicate practice script:", err);
      toastError("Failed to duplicate practice script", "Please try again");
    }
  };

  const handleExportPDF = useCallback(
    async (script: PracticeScript) => {
      // Automatically use ultra-compact format (best for 50+ play scripts)
      try {
        await PDFExportService.exportPracticeScript(script, "ultra-compact");
        success(`PDF downloaded: "${script.name}"`);
      } catch (err) {
        console.error("Failed to export PDF:", err);
        toastError("Failed to export PDF", "Please try again");
      }
    },
    [success, toastError]
  );

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-text-accent"></div>
        <Typography variant="body-sm" className="ml-3 text-secondary">
          Loading practice scripts...
        </Typography>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="text-center py-12">
        <Icon
          name="alert-triangle"
          className="h-16 w-16 text-error mx-auto mb-4"
        />
        <Typography variant="headline-sm" className="text-secondary mb-2">
          Error Loading Scripts
        </Typography>
        <Typography variant="body-sm" className="text-muted mb-6">
          {fetchError}
        </Typography>
        <Button onClick={loadScripts} variant="outline">
          <Icon name="refresh-cw" className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (scripts.length === 0) {
    return (
      <div className="text-center py-12">
        <Icon name="file" className="h-16 w-16 text-muted mx-auto mb-4" />
        <Typography variant="headline-sm" className="text-secondary mb-2">
          No Practice Scripts Yet
        </Typography>
        <Typography variant="body-sm" className="text-muted mb-6">
          Create your first practice script to get started with organized
          practice planning.
        </Typography>
        <Button onClick={onCreateNew} variant="primary">
          <Icon name="plus" className="h-4 w-4 mr-2" />
          Create New Script
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {scripts.map((script) => (
          <div
            key={script.id}
            className="bg-primary rounded-lg border border-muted p-6 hover:border-light transition-all hover:shadow-md flex flex-col min-h-72"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <Typography
                  variant="headline-sm"
                  className="text-primary truncate mb-1"
                  title={script.title || script.name}
                >
                  {script.title || script.name}
                </Typography>
                {script.description && (
                  <Typography
                    variant="body-sm"
                    className="text-secondary line-clamp-2"
                    title={script.description}
                  >
                    {script.description}
                  </Typography>
                )}
              </div>
              {script.isTemplate && (
                <Badge variant="neutral" size="sm" className="ml-2 shrink-0">
                  Template
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 mb-4 text-sm text-secondary">
              <div className="flex items-center gap-1">
                <Icon name="clock" className="h-4 w-4" />
                <span>{formatDuration(script.duration)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Icon name="list" className="h-4 w-4" />
                <span>{script.plays?.length || 0} plays</span>
              </div>
            </div>

            {script.tags && script.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {script.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="neutral" size="sm">
                    {tag}
                  </Badge>
                ))}
                {script.tags.length > 3 && (
                  <Badge variant="neutral" size="sm">
                    +{script.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            <div className="mt-auto pt-4 border-t border-muted">
              <div className="flex items-center justify-between mb-3">
                <Typography variant="caption" className="text-muted">
                  Updated {formatDate(script.updatedAt)}
                </Typography>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <Button
                  onClick={() => handleExportPDF(script)}
                  variant="primary"
                  size="sm"
                  className="w-full"
                  title="Export to PDF"
                >
                  <Icon name="download" className="h-4 w-4 mr-1" />
                  PDF
                </Button>
                <Button
                  onClick={() => onEditScript?.(script)}
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  title="Edit script"
                >
                  <Icon name="edit" className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  onClick={() => handleDuplicateScript(script)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  title="Duplicate script"
                >
                  <Icon name="copy" className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() =>
                    handleDeleteScript(
                      script.id,
                      script.title || script.name || "Untitled"
                    )
                  }
                  variant="outline"
                  size="sm"
                  className="text-error-600 hover:text-error-700"
                  aria-label="Delete script"
                >
                  <Icon name="delete" size="sm" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
