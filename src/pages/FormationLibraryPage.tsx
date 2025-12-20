/**
 * Formation Library Page
 *
 * Main page for managing formation library with grid view and intelligence panel.
 * Target: 300 lines max, modular design.
 */

import React, { useState, useEffect } from "react";
import { FormationLibraryService } from "../services/formationLibrary/FormationLibraryService";
import { FormationIntelligenceService } from "../services/formationLibrary/FormationIntelligenceService";
import type { Formation } from "../types/formation";
import type { IntelligenceAnalysis } from "../types/library";
import { Icon } from "../components/ui/Icon/Icon";
import { toast } from "sonner";
import { useTeamsData } from "../hooks/useTeamsData";
import { useActiveTeamStore } from "../stores/activeTeamStore";
import { supabase } from "../lib/supabase";
import { logError } from "../utils/logger";
import { readLocalString, storageKeys } from "../utils/storage";

export const FormationLibraryPage: React.FC = () => {
  const { playbooks } = useTeamsData();
  const { activeTeamId } = useActiveTeamStore();

  // Filter playbooks for active team (match PlaybookPage logic)
  const teamPlaybooks = React.useMemo(
    () => playbooks.filter((pb) => pb.team_id === activeTeamId && pb.is_active),
    [playbooks, activeTeamId]
  );

  // Get playbook ID from localStorage preference or first playbook with plays
  const savedPlaybookId = activeTeamId
    ? readLocalString(storageKeys.playbook.activePlaybookForTeam(activeTeamId))
    : null;

  // Use same logic as PlaybookPage: prefer saved, then playbook with plays, then first
  const activePlaybook = React.useMemo(() => {
    if (
      savedPlaybookId &&
      teamPlaybooks.some((pb) => pb.id === savedPlaybookId)
    ) {
      return teamPlaybooks.find((pb) => pb.id === savedPlaybookId);
    }
    // Default to first playbook with plays
    const playbookWithPlays = teamPlaybooks.find(
      (pb) => (pb.play_count || 0) > 0
    );
    return playbookWithPlays || teamPlaybooks[0];
  }, [teamPlaybooks, savedPlaybookId]);

  const playbookId = activePlaybook?.id || "";

  if (!playbookId) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <Icon
            name="alert-circle"
            size="xl"
            className="text-secondary mb-4 mx-auto"
          />
          <p className="text-secondary text-lg">No playbook selected</p>
        </div>
      </div>
    );
  }

  return <FormationLibraryPageContent playbookId={playbookId} />;
};

interface FormationLibraryPageContentProps {
  playbookId: string;
}

// Extracted stats component
interface FormationStatsProps {
  formations: Formation[];
}

const FormationStats: React.FC<FormationStatsProps> = ({ formations }) => (
  <div className="mt-8 bg-white rounded-lg border border-divider p-4">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div>
        <p className="text-sm text-secondary">Total Formations</p>
        <p className="text-2xl font-bold text-primary">{formations.length}</p>
      </div>
      <div>
        <p className="text-sm text-secondary">With Metadata</p>
        <p className="text-2xl font-bold text-primary">
          {formations.filter((f) => f.formation_type).length}
        </p>
      </div>
      <div>
        <p className="text-sm text-secondary">Linked Pairs</p>
        <p className="text-2xl font-bold text-primary">
          {formations.filter((f) => f.opposite_formation_id).length / 2}
        </p>
      </div>
      <div>
        <p className="text-sm text-secondary">Total Usage</p>
        <p className="text-2xl font-bold text-primary">
          {formations.reduce((sum, f) => sum + f.usage_count, 0)}
        </p>
      </div>
    </div>
  </div>
);

// Extracted header component
interface FormationLibraryHeaderProps {
  analyzing: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onImport: () => void;
  onAnalyze: () => void;
}

const FormationLibraryHeader: React.FC<FormationLibraryHeaderProps> = ({
  analyzing,
  searchQuery,
  onSearchChange,
  onImport,
  onAnalyze,
}) => (
  <div className="bg-white border-b border-divider sticky top-0 z-10">
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Formation Library</h1>
          <p className="text-sm text-secondary mt-1">
            Manage formations with intelligent metadata
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onImport}
            disabled={analyzing}
            className="btn-secondary flex items-center gap-2"
          >
            {analyzing ? (
              <>
                <Icon name="loader" size="sm" className="animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Icon name="download" size="sm" />
                Import from Plays
              </>
            )}
          </button>
          <button
            onClick={onAnalyze}
            disabled={analyzing}
            className="btn-primary flex items-center gap-2"
          >
            {analyzing ? (
              <>
                <Icon name="loader" size="sm" className="animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Icon name="sparkles" size="sm" />
                Analyze Plays
              </>
            )}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Icon
          name="search"
          size="sm"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
        />
        <input
          type="text"
          placeholder="Search formations..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="input-primary w-full pl-10"
        />
      </div>
    </div>
  </div>
);

const FormationLibraryPageContent: React.FC<
  FormationLibraryPageContentProps
> = ({ playbookId }) => {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyses, setAnalyses] = useState<Map<string, IntelligenceAnalysis>>(
    new Map()
  );

  useEffect(() => {
    loadFormations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playbookId]);

  const loadFormations = async () => {
    try {
      setLoading(true);
      const response = await FormationLibraryService.getFormations(playbookId, {
        search: searchQuery || undefined,
        sort_by: "usage",
        sort_order: "desc",
        limit: 100,
      });
      setFormations(response.items);
    } catch (error) {
      logError("Error loading formations:", error);
      toast.error("Failed to load formations");
    } finally {
      setLoading(false);
    }
  };

  const handleImportFromPlays = async () => {
    try {
      setAnalyzing(true);
      toast.loading("Importing formations from plays...", { id: "import" });

      // Get all unique formation names from plays
      const { data: plays } = await supabase
        .from("plays")
        .select("formation")
        .eq("playbook_id", playbookId)
        .eq("is_archived", false);

      if (!plays || plays.length === 0) {
        toast.error("No plays found in playbook", { id: "import" });
        return;
      }

      // Get unique formation names (case-insensitive)
      const uniqueFormations = Array.from(
        new Set(
          plays
            .map((p) => p.formation?.trim())
            .filter((f): f is string => !!f)
            .map((f) => f.toLowerCase())
        )
      );

      // Create formations that don't exist
      let createdCount = 0;
      let errorCount = 0;
      for (const formationName of uniqueFormations) {
        // Check if already exists
        const { data: existing } = await supabase
          .from("formations")
          .select("id")
          .eq("playbook_id", playbookId)
          .ilike("name", formationName)
          .limit(1);

        if (!existing || existing.length === 0) {
          // Preserve original casing from plays (don't force capitalize)
          const originalName = plays
            .find((p) => p.formation?.trim().toLowerCase() === formationName)
            ?.formation?.trim();

          // Create new formation
          const { error } = await supabase.from("formations").insert({
            playbook_id: playbookId,
            name: originalName || formationName,
            is_standalone: true,
            direction: null, // Required by validate_formation_data() trigger
          });

          if (error) {
            logError(
              `Failed to create formation "${originalName || formationName}":`,
              error
            );
            errorCount++;
          } else {
            createdCount++;
          }
        }
      }

      if (errorCount > 0) {
        toast.error(
          `Imported ${createdCount} formations, ${errorCount} failed`,
          { id: "import" }
        );
      } else {
        toast.success(`Imported ${createdCount} new formations`, {
          id: "import",
        });
      }
      await loadFormations();
    } catch (error) {
      logError("Error importing formations:", error);
      toast.error("Failed to import formations", { id: "import" });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      toast.loading("Analyzing plays to derive formation metadata...", {
        id: "analyze",
      });

      const results =
        await FormationIntelligenceService.analyzePlaybookFormations(
          playbookId
        );
      setAnalyses(results);

      const updatedCount =
        await FormationIntelligenceService.populateLibraryFromPlays(playbookId);

      toast.success(
        `Analyzed ${results.size} formations, updated ${updatedCount}`,
        {
          id: "analyze",
        }
      );

      await loadFormations(); // Refresh to show updated confidence scores
    } catch (error) {
      logError("Error analyzing formations:", error);
      toast.error("Failed to analyze formations", { id: "analyze" });
    } finally {
      setAnalyzing(false);
    }
  };

  const filteredFormations = formations.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <FormationLibraryHeader
        analyzing={analyzing}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onImport={handleImportFromPlays}
        onAnalyze={handleAnalyze}
      />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {(() => {
          if (loading) {
            return (
              <div className="flex items-center justify-center py-12">
                <Icon
                  name="loader"
                  size="lg"
                  className="animate-spin text-primary"
                />
              </div>
            );
          }
          if (filteredFormations.length === 0) {
            return (
              <div className="text-center py-12">
                <Icon
                  name="folder"
                  size="xl"
                  className="text-secondary mb-4 mx-auto"
                />
                <p className="text-secondary text-lg">No formations found</p>
                <p className="text-sm text-muted mt-2">
                  {searchQuery
                    ? "Try a different search term"
                    : "Create formations to see them here"}
                </p>
              </div>
            );
          }
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFormations.map((formation) => (
                <FormationCard
                  key={formation.id}
                  formation={formation}
                  analysis={analyses.get(formation.name.toLowerCase())}
                />
              ))}
            </div>
          );
        })()}

        {/* Stats */}
        {formations.length > 0 && <FormationStats formations={formations} />}
      </div>
    </div>
  );
};

interface FormationCardProps {
  formation: Formation;
  analysis?: IntelligenceAnalysis;
}

const FormationCard: React.FC<FormationCardProps> = ({
  formation,
  analysis,
}) => {
  const getConfidenceColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 70) return "text-warning";
    return "text-error";
  };

  return (
    <div className="bg-white rounded-lg border border-divider p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-primary text-lg">
            {formation.name}
          </h3>
          {formation.description && (
            <p className="text-sm text-secondary mt-1">
              {formation.description}
            </p>
          )}
        </div>
        {formation.opposite_formation_id && (
          <div className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
            Paired
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="space-y-2 mb-3">
        {formation.formation_type && (
          <div className="flex items-center gap-2 text-sm">
            <Icon name="grid" size="xs" className="text-secondary" />
            <span className="text-secondary">Type:</span>
            <span className="font-medium text-primary">
              {formation.formation_type}
            </span>
          </div>
        )}
        {formation.run_strength && (
          <div className="flex items-center gap-2 text-sm">
            <Icon name="arrow-right" size="xs" className="text-secondary" />
            <span className="text-secondary">Run:</span>
            <span className="font-medium text-primary capitalize">
              {formation.run_strength}
            </span>
          </div>
        )}
        {formation.pass_strength && (
          <div className="flex items-center gap-2 text-sm">
            <Icon name="target" size="xs" className="text-secondary" />
            <span className="text-secondary">Pass:</span>
            <span className="font-medium text-primary capitalize">
              {formation.pass_strength}
            </span>
          </div>
        )}
      </div>

      {/* Confidence Score */}
      {formation.confidence_score > 0 && (
        <div className="flex items-center justify-between pt-3 border-t border-divider">
          <span className="text-sm text-secondary">Confidence</span>
          <span
            className={`text-sm font-bold ${getConfidenceColor(formation.confidence_score)}`}
          >
            {formation.confidence_score}%
          </span>
        </div>
      )}

      {/* Usage */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-sm text-secondary">Usage</span>
        <span className="text-sm font-medium text-primary">
          {formation.usage_count}{" "}
          {formation.usage_count === 1 ? "play" : "plays"}
        </span>
      </div>

      {/* Analysis Details */}
      {analysis && (
        <div className="mt-3 pt-3 border-t border-divider">
          <p className="text-xs text-secondary mb-2">Intelligence Analysis:</p>
          <div className="space-y-1 text-xs">
            {analysis.formation_type && (
              <div className="flex justify-between">
                <span className="text-secondary">Type:</span>
                <span className="text-primary font-medium">
                  {analysis.formation_type.value} (
                  {analysis.formation_type.percentage}%)
                </span>
              </div>
            )}
            {analysis.warnings.length > 0 && (
              <div className="flex items-start gap-1 text-warning mt-2">
                <Icon
                  name="alert-triangle"
                  size="xs"
                  className="mt-0.5 flex-shrink-0"
                />
                <span className="text-xs">{analysis.warnings[0]}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
