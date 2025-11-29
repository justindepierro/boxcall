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
          .from("plays")
          .select("formation")
          .eq("playbook_id", playbookId)
          .order("formation");

        if (queryError) throw queryError;

        // Extract unique formation names
        const uniqueFormations = [
          ...new Set((plays || []).map((p) => p.formation).filter(Boolean)),
        ] as string[];

        setFormations(uniqueFormations);
        console.log(
          `[FormationSelector] Loaded ${uniqueFormations.length} unique formations from plays table`
        );
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
    if (lowerName.endsWith(" left")) return "left";
    if (lowerName.endsWith(" right")) return "right";
    return null;
  };

  // Direction labels
  const getDirectionLabel = (formationName: string) => {
    const direction = getDirectionFromName(formationName);
    if (!direction) return "";
    switch (directionDisplayFormat) {
      case "full":
        return direction === "left" ? "← Left" : "→ Right";
      case "abbrev":
        return direction === "left" ? "← Lt" : "→ Rt";
      case "letter":
        return direction === "left" ? "← L" : "→ R";
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
          <label className="block text-sm font-medium mb-2">Formation *</label>

          {/* Text Input with Dropdown */}
          <input
            type="text"
            value={selectedFormation || ""}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => !disabled && setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            disabled={disabled}
            placeholder="e.g., Shotgun, Empty, Pistol"
            className="w-full border border-secondary rounded-lg focus:ring-2 focus:ring-text-info focus:border-bg-primary/0 px-sm py-xs disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </>
      )}

      {/* Error Message */}
      {error && <p className="mt-1 text-xs text-error-500">{error}</p>}

      {/* Dropdown Menu - matches Play field style */}
      {isOpen && !isLoading && formations.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-primary/95 dark:bg-secondary/95 backdrop-blur-md border border-stroke rounded-lg shadow-2xl z-popover max-h-60 overflow-y-auto mt-1">
          {formations.map((formationName) => (
            <button
              key={formationName}
              type="button"
              onClick={() => handleSelect(formationName)}
              className="w-full text-left px-sm py-xs hover:bg-secondary/50 first:rounded-t-lg last:rounded-b-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">{formationName}</span>
                {getDirectionLabel(formationName) && (
                  <span className="text-xs text-muted">
                    {getDirectionLabel(formationName)}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Formations Message */}
      {isOpen && !isLoading && formations.length === 0 && (
        <div className="absolute top-full left-0 right-0 bg-primary/95 dark:bg-secondary/95 backdrop-blur-md border border-stroke rounded-lg shadow-2xl z-popover p-4 mt-1 text-center">
          <p className="text-sm text-muted">
            No formations yet - just start typing
          </p>
        </div>
      )}

      {/* Close dropdown on outside click */}
      {isOpen && (
        <div
          className="fixed inset-0 z-modal-backdrop"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
