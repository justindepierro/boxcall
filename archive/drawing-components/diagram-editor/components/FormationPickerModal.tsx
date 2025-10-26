/**
 * FormationPickerModal - Select formation to load into diagram
 *
 * Allows coaches to:
 * 1. Browse formations from current playbook
 * 2. Search/filter formations
 * 3. Preview formation before loading
 * 4. Choose "Replace" or "Merge" mode
 */

import React, { useState, useMemo } from "react";
import { Modal } from "../../../ui/Modal";
import { Input } from "../../../ui/Input";
import { Button } from "../../../ui/Button/Button";
import { Icon } from "../../../ui/Icon/Icon";
import { Typography } from "../../../design-system/Typography";
import { triggerHapticFeedback } from "../../../../lib/hapticFeedback";
import type { FormationListItem } from "../../../../types/formation";

export interface FormationPickerModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Close modal callback */
  onClose: () => void;
  /** All formations from current playbook */
  formations: FormationListItem[];
  /** Callback when formation is selected - receives formation ID and mode */
  onSelectFormation: (formationId: string, mode: "replace" | "merge") => void;
  /** Whether diagram has existing content (affects default mode) */
  hasExistingContent: boolean;
}

export const FormationPickerModal: React.FC<FormationPickerModalProps> = ({
  isOpen,
  onClose,
  formations,
  onSelectFormation,
  hasExistingContent,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormation, setSelectedFormation] =
    useState<FormationListItem | null>(null);
  const [loadMode, setLoadMode] = useState<"replace" | "merge">(
    hasExistingContent ? "merge" : "replace"
  );

  // Filter formations by search query
  const filteredFormations = useMemo(() => {
    if (!searchQuery.trim()) return formations;

    const query = searchQuery.toLowerCase();
    return formations.filter(
      (formation) =>
        formation.name.toLowerCase().includes(query) ||
        formation.category?.toLowerCase().includes(query) ||
        formation.personnel_name?.toLowerCase().includes(query)
    );
  }, [formations, searchQuery]);

  // Group formations by category
  const formationsByCategory = useMemo(() => {
    const grouped = new Map<string, FormationListItem[]>();

    filteredFormations.forEach((formation) => {
      const category = formation.category || "Uncategorized";
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(formation);
    });

    return grouped;
  }, [filteredFormations]);

  const handleFormationClick = (formation: FormationListItem) => {
    triggerHapticFeedback("selection");
    setSelectedFormation(formation);
  };

  const handleLoadFormation = () => {
    if (!selectedFormation) return;

    triggerHapticFeedback("success");
    onSelectFormation(selectedFormation.id, loadMode);
    onClose();

    // Reset state
    setSearchQuery("");
    setSelectedFormation(null);
  };

  const handleCancel = () => {
    triggerHapticFeedback("light");
    onClose();
    setSearchQuery("");
    setSelectedFormation(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Load Formation"
      size="xl"
    >
      <div className="flex flex-col" style={{ height: "600px" }}>
        {/* Search Bar */}
        <div className="px-6 pt-4 pb-3 border-b border-border">
          <Input
            type="text"
            placeholder="Search formations by name, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Icon name="search" size="sm" />}
            rightIcon={
              searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-content-secondary hover:text-content-primary"
                >
                  <Icon name="close" size="sm" />
                </button>
              ) : undefined
            }
          />

          {/* Results count */}
          <div className="mt-2 text-xs text-content-secondary">
            {filteredFormations.length} formation
            {filteredFormations.length !== 1 ? "s" : ""} found
          </div>
        </div>

        {/* Formation List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filteredFormations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Icon
                name="grid"
                size="lg"
                className="text-content-tertiary mb-3"
              />
              <Typography variant="body" className="text-content-secondary">
                {searchQuery
                  ? "No formations match your search"
                  : "No formations in this playbook"}
              </Typography>
              {searchQuery && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  onClick={() => setSearchQuery("")}
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {Array.from(formationsByCategory.entries()).map(
                ([category, categoryFormations]) => (
                  <div key={category}>
                    {/* Category Header */}
                    <Typography
                      variant="label"
                      className="text-content-secondary mb-3 uppercase tracking-wider"
                    >
                      {category}
                    </Typography>

                    {/* Formation Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {categoryFormations.map((formation) => (
                        <button
                          key={formation.id}
                          onClick={() => handleFormationClick(formation)}
                          className={`
                            p-4 rounded-lg border-2 text-left transition-all
                            ${
                              selectedFormation?.id === formation.id
                                ? "border-jade-500 bg-jade-500/10"
                                : "border-border bg-surface-card hover:border-jade-300 hover:bg-surface-secondary"
                            }
                          `}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <Typography
                              variant="body"
                              className="text-content-primary font-semibold"
                            >
                              {formation.name}
                            </Typography>
                            {selectedFormation?.id === formation.id && (
                              <Icon
                                name="check-circle"
                                size="sm"
                                className="text-jade-500 flex-shrink-0"
                              />
                            )}
                          </div>

                          {/* Formation metadata */}
                          <div className="mt-3 flex items-center gap-3 text-xs text-content-tertiary">
                            {formation.personnel_name && (
                              <span className="flex items-center gap-1">
                                <Icon name="users" size="xs" />
                                {formation.personnel_name}
                              </span>
                            )}
                            {formation.direction && (
                              <span className="flex items-center gap-1">
                                <Icon name="arrow-right" size="xs" />
                                {formation.direction}
                              </span>
                            )}
                            {formation.usage_count > 0 && (
                              <span className="flex items-center gap-1">
                                <Icon name="check-circle" size="xs" />
                                {formation.usage_count} plays
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Load Mode Selection */}
        {hasExistingContent && selectedFormation && (
          <div className="px-6 py-3 border-t border-border bg-surface-secondary">
            <Typography variant="label" className="text-content-secondary mb-2">
              Load Mode
            </Typography>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  triggerHapticFeedback("selection");
                  setLoadMode("merge");
                }}
                className={`
                  flex-1 px-4 py-3 rounded-lg border-2 text-left transition-all
                  ${
                    loadMode === "merge"
                      ? "border-jade-500 bg-jade-500/10"
                      : "border-border bg-surface-card hover:border-jade-300"
                  }
                `}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon
                    name={loadMode === "merge" ? "check-circle" : "circle"}
                    size="sm"
                    className={
                      loadMode === "merge"
                        ? "text-jade-500"
                        : "text-content-tertiary"
                    }
                  />
                  <Typography variant="body" className="font-semibold">
                    Merge (Safe)
                  </Typography>
                </div>
                <Typography
                  variant="caption"
                  className="text-content-secondary"
                >
                  Keep existing routes, update player positions
                </Typography>
              </button>

              <button
                onClick={() => {
                  triggerHapticFeedback("selection");
                  setLoadMode("replace");
                }}
                className={`
                  flex-1 px-4 py-3 rounded-lg border-2 text-left transition-all
                  ${
                    loadMode === "replace"
                      ? "border-jade-500 bg-jade-500/10"
                      : "border-border bg-surface-card hover:border-jade-300"
                  }
                `}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon
                    name={loadMode === "replace" ? "check-circle" : "circle"}
                    size="sm"
                    className={
                      loadMode === "replace"
                        ? "text-jade-500"
                        : "text-content-tertiary"
                    }
                  />
                  <Typography variant="body" className="font-semibold">
                    Replace (Clean)
                  </Typography>
                </div>
                <Typography
                  variant="caption"
                  className="text-content-secondary"
                >
                  Clear diagram, start fresh with formation
                </Typography>
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleLoadFormation}
            disabled={!selectedFormation}
          >
            <Icon name="download" className="mr-2" />
            Load Formation
          </Button>
        </div>
      </div>
    </Modal>
  );
};
