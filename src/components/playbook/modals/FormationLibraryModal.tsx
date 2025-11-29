/**
 * Formation Library Modal
 *
 * Slide-out modal for managing formation library with intelligent metadata.
 * Converted from full-page to modal for better integration with Playbook view.
 */

import React, { useState, useEffect } from "react";
import { FormationLibraryService } from "../../../services/formationLibrary/FormationLibraryService";
import { FormationIntelligenceService } from "../../../services/formationLibrary/FormationIntelligenceService";
import type { Formation } from "../../../types/formation";
import { Icon } from "../../ui/Icon/Icon";
import { toast } from "sonner";
import { supabase } from "../../../lib/supabase";

interface FormationLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  playbookId: string;
}

export const FormationLibraryModal: React.FC<FormationLibraryModalProps> = ({
  isOpen,
  onClose,
  playbookId,
}) => {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadFormations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, playbookId]);

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
      console.error("Error loading formations:", error);
      toast.error("Failed to load formations");
    } finally {
      setLoading(false);
    }
  };

  const handleImportFromPlays = async () => {
    try {
      setAnalyzing(true);
      toast.loading("Importing formations from plays...", { id: "import" });

      const { data: plays } = await supabase
        .from("plays")
        .select("formation")
        .eq("playbook_id", playbookId)
        .eq("is_archived", false);

      if (!plays || plays.length === 0) {
        toast.error("No plays found in playbook", { id: "import" });
        return;
      }

      const uniqueFormations = Array.from(
        new Set(
          plays
            .map((p) => p.formation?.trim())
            .filter((f): f is string => !!f)
            .map((f) => f.toLowerCase())
        )
      );

      let createdCount = 0;
      let errorCount = 0;
      for (const formationName of uniqueFormations) {
        const { data: existing } = await supabase
          .from("formations")
          .select("id")
          .eq("playbook_id", playbookId)
          .ilike("name", formationName)
          .limit(1);

        if (!existing || existing.length === 0) {
          const originalName = plays.find(
            (p) => p.formation?.trim().toLowerCase() === formationName
          )?.formation?.trim();

          const { error } = await supabase
            .from("formations")
            .insert({
              playbook_id: playbookId,
              name: originalName || formationName,
              is_standalone: true,
              direction: null,
            });

          if (error) {
            console.error(`Failed to create formation "${originalName || formationName}":`, error);
            errorCount++;
          } else {
            createdCount++;
          }
        }
      }

      if (errorCount > 0) {
        toast.error(`Imported ${createdCount} formations, ${errorCount} failed`, { id: "import" });
      } else {
        toast.success(`Imported ${createdCount} new formations`, { id: "import" });
      }
      await loadFormations();
    } catch (error) {
      console.error("Error importing formations:", error);
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

      const updatedCount =
        await FormationIntelligenceService.populateLibraryFromPlays(playbookId);

      toast.success(
        `Analyzed ${results.size} formations, updated ${updatedCount}`,
        {
          id: "analyze",
        }
      );

      await loadFormations();
    } catch (error) {
      console.error("Error analyzing formations:", error);
      toast.error("Failed to analyze formations", { id: "analyze" });
    } finally {
      setAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  const filteredFormations = formations.filter((f) =>
    searchQuery
      ? f.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const stats = {
    total: formations.length,
    withMetadata: formations.filter((f) => f.confidence_score && f.confidence_score > 0).length,
    linkedPairs: formations.filter((f) => f.opposite_formation_id).length,
    totalUsage: filteredFormations.reduce((sum, f) => sum + (f.usage_count || 0), 0),
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="fixed top-16 left-1/2 -translate-x-1/2 w-[95vw] md:w-[85vw] lg:w-[75vw] xl:w-[65vw] h-[calc(100vh-5rem)] bg-white dark:bg-gray-900 z-50 shadow-2xl rounded-lg overflow-hidden flex flex-col animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-jade-600 to-jade-700 p-4 sm:p-6 border-b border-divider shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Icon name="grid" size="lg" className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Formation Library</h2>
                <p className="text-sm text-white/80 mt-1">
                  Manage formations with intelligent metadata
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <Icon name="close" size="lg" className="text-white" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleImportFromPlays}
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
              onClick={() => {
                toast.info("Create Formation: Click 'Import from Plays' or add manually in Formation Builder");
              }}
              className="btn-primary flex items-center gap-2 bg-white text-jade-600 hover:bg-white/90"
            >
              <Icon name="plus" size="sm" />
              Create New
            </button>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="btn-secondary flex items-center gap-2 text-white border-white/30 hover:bg-white/10"
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
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div className="relative">
            <Icon
              name="search"
              size="sm"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-jade-500"
            />
            <input
              type="text"
              placeholder="Search formations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 focus:ring-2 focus:ring-jade-500/50 focus:border-jade-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-900">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Icon name="loader" size="xl" className="animate-spin text-secondary" />
            </div>
          ) : filteredFormations.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="grid" size="xl" className="text-secondary mb-4 mx-auto" />
              <p className="text-secondary text-lg">No formations found</p>
              <p className="text-tertiary text-sm mt-2">
                Click "Import from Plays" to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredFormations.map((formation) => (
                <div
                  key={formation.id}
                  className="card p-5 hover:shadow-xl hover:border-jade-500/30 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-primary">
                      {formation.name}
                    </h3>
                    {formation.opposite_formation_id && (
                      <span className="badge-info text-xs">Paired</span>
                    )}
                  </div>

                  {formation.run_strength || formation.pass_strength ? (
                    <div className="space-y-2 mb-3">
                      {formation.run_strength && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-secondary">Run:</span>
                          <span className="text-primary font-medium">
                            {formation.run_strength}
                          </span>
                        </div>
                      )}
                      {formation.pass_strength && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-secondary">Pass:</span>
                          <span className="text-primary font-medium">
                            {formation.pass_strength}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : null}

                  {formation.confidence_score !== null && formation.confidence_score > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-secondary">Confidence</span>
                        <span className="text-primary font-medium">
                          {formation.confidence_score}%
                        </span>
                      </div>
                      <div className="w-full bg-surface-muted rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-jade-500 to-jade-600"
                          style={{ width: `${formation.confidence_score}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-divider">
                    <span className="text-xs text-secondary">Usage</span>
                    <span className="text-sm font-medium text-primary">
                      {formation.usage_count || 0} plays
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 p-4 shadow-inner">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-xs text-secondary">Total Formations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{stats.withMetadata}</div>
              <div className="text-xs text-secondary">With Metadata</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{stats.linkedPairs}</div>
              <div className="text-xs text-secondary">Linked Pairs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{stats.totalUsage}</div>
              <div className="text-xs text-secondary">Total Usage</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
