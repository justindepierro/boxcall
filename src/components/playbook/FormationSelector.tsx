/**
 * FormationSelector
 *
 * Dropdown selector for formations from plays table.
 * Queries plays.formation directly - no separate formations table needed!
 *
 * Features:
 * - Loads unique formation names from plays table
 * - Simple text-based selection (no complex relationships)
 * - Filters by playbook
 * - Auto-detects directional variants (Left/Right)
 */

import { useState, useEffect } from "react";
import { ChevronDown, Grid, Plus } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { FormationSelectorSkeleton } from "./FormationSelectorSkeleton";

interface FormationSelectorProps {
  playbookId: string;
  value: string | null; // formation name (TEXT)
  onChange: (formationName: string | null) => void; // Simplified - just pass formation name
  onCreateNew?: () => void; // Callback to open Formation Builder
  className?: string;
  disabled?: boolean;
  directionDisplayFormat?: "full" | "abbrev" | "letter"; // Direction display format
}

export function FormationSelector({
  playbookId,
  value,
  onChange,
  onCreateNew,
  className = "",
  disabled = false,
  directionDisplayFormat = "full",
}: FormationSelectorProps) {
  const [formations, setFormations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Load unique formation names from plays table
  useEffect(() => {
    if (!playbookId) return;

    async function loadFormations() {
      setIsLoading(true);
      setError(null);
      try {
        // Query plays table for unique formation names
        const { data: plays, error: queryError } = await supabase
          .from('plays')
          .select('formation')
          .eq('playbook_id', playbookId)
          .order('formation');

        if (queryError) throw queryError;

        // Extract unique formation names
        const uniqueFormations = [
          ...new Set((plays || []).map(p => p.formation).filter(Boolean)),
        ] as string[];

        setFormations(uniqueFormations);
        console.log(`[FormationSelector] Loaded ${uniqueFormations.length} unique formations from plays table`);
      } catch (err) {
        console.error("Error loading formations:", err);
        setError("Failed to load formations");
        setFormations([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadFormations();
  }, [playbookId]);

  // Get selected formation name
  const selectedFormation = value || null;

  // Detect direction from formation name
  const getDirectionFromName = (formationName: string) => {
    const lowerName = formationName.toLowerCase();
    if (lowerName.endsWith(' left')) return 'left';
    if (lowerName.endsWith(' right')) return 'right';
    return null;
  };

  // Direction labels
  const getDirectionLabel = (formationName: string) => {
    const direction = getDirectionFromName(formationName);
    if (!direction) return "";
    switch (directionDisplayFormat) {
      case "full":
        return direction === 'left' ? "← Left" : "→ Right";
      case "abbrev":
        return direction === 'left' ? "← Lt" : "→ Rt";
      case "letter":
        return direction === 'left' ? "← L" : "→ R";
      default:
        return "";
    }
  };

  // Handle selection
  const handleSelect = (formationName: string) => {
    onChange(formationName);
    setIsOpen(false);
  };

  // Note: Formation variants (Left/Right) are automatically detected from formation names
  // No separate matching modal needed with the simplified text-based approach

  return (
    <div className={`relative ${className}`}>
      {/* 🚀 PERFORMANCE: Skeleton loader while formations load */}
      {isLoading ? (
        <FormationSelectorSkeleton />
      ) : (
        <>
          {/* Label */}
          <label className="block text-sm font-medium text-primary mb-xs">
            Formation *
          </label>

          {/* Dropdown Button */}
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className="w-full flex items-center justify-between px-4 py-3 bg-surface-card border-2 border-divider rounded-lg text-primary hover:border-info hover:shadow-md focus:outline-none focus:ring-2 focus:ring-info focus:border-info disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <Grid className="w-5 h-5 text-info" />
              {selectedFormation ? (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-base">{selectedFormation}</span>
                  {getDirectionLabel(selectedFormation) && (
                    <span className="text-xs font-medium text-info bg-info/10 px-2 py-0.5 rounded">
                      {getDirectionLabel(selectedFormation)}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-muted font-medium">Select formation...</span>
              )}
            </div>
            <ChevronDown
              className={`w-5 h-5 text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </button>
        </>
      )}

      {/* Error Message */}
      {error && <p className="mt-1 text-xs text-error-500">{error}</p>}

      {/* Dropdown Menu */}
      {isOpen && !isLoading && formations.length > 0 && (
        <div className="absolute z-[100] mt-2 w-full bg-white dark:bg-gray-900 border-2 border-info/30 rounded-xl shadow-2xl max-h-96 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Create New Formation Button */}
          {onCreateNew && (
            <button
              type="button"
              onClick={() => {
                onCreateNew();
                setIsOpen(false);
              }}
              className="w-full px-4 py-4 flex items-center gap-3 bg-gradient-to-r from-info/10 to-info/5 hover:from-info/20 hover:to-info/10 transition-all duration-200 border-b-2 border-info/20 group"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-info/20 group-hover:bg-info/30 transition-colors">
                <Plus className="w-5 h-5 text-info" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-bold text-info text-sm">
                  Create New Formation
                </span>
                <span className="text-xs text-muted mt-0.5">
                  Open Formation Builder to design a new formation
                </span>
              </div>
            </button>
          )}

          {/* Formations List */}
          <div className="max-h-80 overflow-y-auto">
            {formations.map((formationName, index) => (
              <button
                key={formationName}
                type="button"
                onClick={() => handleSelect(formationName)}
                className={`w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-info/5 hover:shadow-sm transition-all duration-150 group ${
                  value === formationName 
                    ? "bg-info/10 border-l-4 border-info shadow-inner" 
                    : index > 0 ? "border-t border-divider/50" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    value === formationName ? "bg-info" : "bg-muted/30 group-hover:bg-info/50"
                  } transition-colors`} />
                  <span className={`font-semibold text-sm ${
                    value === formationName ? "text-info" : "text-primary group-hover:text-info"
                  } transition-colors`}>
                    {formationName}
                  </span>
                  {getDirectionLabel(formationName) && (
                    <span className="text-xs font-medium text-info bg-info/10 px-2 py-0.5 rounded group-hover:bg-info/20 transition-colors">
                      {getDirectionLabel(formationName)}
                    </span>
                  )}
                </div>
                {value === formationName && (
                  <div className="flex items-center text-info">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Formations Message */}
      {isOpen && !isLoading && formations.length === 0 && (
        <div className="absolute z-[100] mt-2 w-full bg-white dark:bg-gray-900 border-2 border-info/30 rounded-xl shadow-2xl p-8 text-center animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-info/10 mx-auto mb-4">
            <Grid className="w-8 h-8 text-info" />
          </div>
          <p className="text-base font-semibold text-primary mb-2">
            No formations yet
          </p>
          <p className="text-sm text-muted mb-6">
            Create your first play to add a formation to your playbook
          </p>
          {onCreateNew && (
            <button
              type="button"
              onClick={() => {
                onCreateNew();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 bg-gradient-to-r from-info to-info/90 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold text-sm flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create First Formation
            </button>
          )}
        </div>
      )}

      {/* Close dropdown on outside click */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
