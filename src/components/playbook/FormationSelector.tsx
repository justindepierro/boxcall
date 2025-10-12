/**
 * FormationSelector
 * 
 * Dropdown selector for formations stored in database.
 * Replaces text-based formation input with proper database relationships.
 * 
 * Features:
 * - Loads formations from FormationService
 * - Groups by category or personnel
 * - Shows direction (Base/Left/Right) badges
 * - Filters by playbook
 * - Connected to everything!
 */

import { useState, useEffect } from 'react';
import { ChevronDown, Grid, Link2 } from 'lucide-react';
import { FormationService } from '../../services/formationService';
import type { Formation } from '../../types/formation';
import { FormationMatchingModal } from '../formations/FormationMatchingModal';

interface FormationSelectorProps {
  playbookId: string;
  value: string | null; // formation_id
  onChange: (formationId: string | null, formation: Formation | null) => void;
  className?: string;
  disabled?: boolean;
}

export function FormationSelector({
  playbookId,
  value,
  onChange,
  className = '',
  disabled = false,
}: FormationSelectorProps) {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showMatchingModal, setShowMatchingModal] = useState(false);
  const [formationToMatch, setFormationToMatch] = useState<Formation | null>(null);

  // Load formations for this playbook
  useEffect(() => {
    if (!playbookId) return;

    async function loadFormations() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await FormationService.getFormationsByPlaybook(playbookId);
        setFormations(data);
      } catch (err) {
        console.error('Error loading formations:', err);
        setError('Failed to load formations');
        setFormations([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadFormations();
  }, [playbookId]);

  // Get selected formation
  const selectedFormation = value ? formations.find((f) => f.id === value) : null;

  // Group formations by category
  const groupedFormations = formations.reduce(
    (acc, formation) => {
      const category = formation.category || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(formation);
      return acc;
    },
    {} as Record<string, Formation[]>
  );

  // Category labels
  const categoryLabels: Record<string, string> = {
    spread: 'Spread',
    pro: 'Pro',
    power: 'Power',
    special: 'Special',
    goal_line: 'Goal Line',
    short_yardage: 'Short Yardage',
    other: 'Other',
  };

  // Direction labels
  const getDirectionLabel = (direction: string) => {
    switch (direction) {
      case 'left':
        return '← Left';
      case 'right':
        return '→ Right';
      case 'base':
      default:
        return 'Base';
    }
  };

  // Handle selection
  const handleSelect = (formation: Formation) => {
    onChange(formation.id, formation);
    setIsOpen(false);
  };

  // Handle manage variants
  const handleManageVariants = (formation: Formation, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent dropdown from selecting
    setFormationToMatch(formation);
    setShowMatchingModal(true);
    setIsOpen(false);
  };

  // Reload formations after matching
  const handleMatchingSuccess = () => {
    if (playbookId) {
      FormationService.getFormationsByPlaybook(playbookId).then(setFormations);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Label */}
      <label className="block text-sm font-medium text-text-primary mb-spacing-xs">
        Formation *
      </label>

      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)}
        disabled={disabled || isLoading}
        className="w-full flex items-center justify-between px-spacing-md py-spacing-sm bg-surface-secondary border border-border-primary rounded-lg text-text-primary hover:border-border-accent focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <div className="flex items-center gap-spacing-sm">
          <Grid className="w-4 h-4 text-text-muted" />
          {isLoading ? (
            <span className="text-text-muted">Loading formations...</span>
          ) : selectedFormation ? (
            <div className="flex items-center gap-spacing-xs">
              <span className="font-medium">{selectedFormation.name}</span>
              <span className="text-xs text-text-muted">
                {getDirectionLabel(selectedFormation.direction)}
              </span>
              {selectedFormation.personnel_name && (
                <span className="px-2 py-0.5 bg-accent-500/20 text-accent-400 rounded text-xs">
                  {selectedFormation.personnel_name}
                </span>
              )}
            </div>
          ) : (
            <span className="text-text-muted">Select formation...</span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-xs text-error-500">{error}</p>
      )}

      {/* Dropdown Menu */}
      {isOpen && !isLoading && formations.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-surface-secondary border border-border-primary rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {Object.keys(groupedFormations).map((category) => (
            <div key={category}>
              {/* Category Header */}
              <div className="px-spacing-md py-spacing-xs bg-surface-tertiary border-b border-border-primary">
                <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
                  {categoryLabels[category] || category}
                </span>
              </div>

              {/* Formations in Category */}
              {groupedFormations[category].map((formation: Formation) => (
                <div
                  key={formation.id}
                  className={`w-full flex items-center justify-between hover:bg-surface-tertiary transition-colors ${
                    value === formation.id ? 'bg-accent-500/10' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(formation)}
                    className="flex-1 px-spacing-md py-spacing-sm flex items-center justify-between text-left"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-spacing-sm">
                        <span className="font-medium text-text-primary">
                          {formation.name}
                        </span>
                        <span className="text-xs text-text-muted">
                          {getDirectionLabel(formation.direction)}
                        </span>
                      </div>
                      {formation.description && (
                        <span className="text-xs text-text-muted line-clamp-1">
                          {formation.description}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-spacing-xs">
                      {formation.personnel_name && (
                        <span className="px-2 py-0.5 bg-accent-500/20 text-accent-400 rounded text-xs">
                          {formation.personnel_name}
                        </span>
                      )}
                      {formation.usage_count > 0 && (
                        <span className="text-xs text-text-muted">
                          {formation.usage_count}x
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Manage Variants Button */}
                  <button
                    type="button"
                    onClick={(e) => handleManageVariants(formation, e)}
                    className="px-spacing-sm py-spacing-sm hover:bg-surface-primary transition-colors group"
                    title="Manage formation variants"
                  >
                    <Link2 className="w-4 h-4 text-text-muted group-hover:text-accent-500" />
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* No Formations Message */}
      {isOpen && !isLoading && formations.length === 0 && (
        <div className="absolute z-50 mt-1 w-full bg-surface-secondary border border-border-primary rounded-lg shadow-lg p-spacing-lg text-center">
          <Grid className="w-8 h-8 text-text-muted mx-auto mb-spacing-sm" />
          <p className="text-sm text-text-muted mb-spacing-xs">
            No formations yet
          </p>
          <p className="text-xs text-text-muted">
            Create formations using the Formation Builder
          </p>
        </div>
      )}

      {/* Close dropdown on outside click */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Formation Linking Modal (Redesigned) */}
      {showMatchingModal && (
        <FormationMatchingModal
          isOpen={showMatchingModal}
          onClose={() => {
            setShowMatchingModal(false);
            setFormationToMatch(null);
          }}
          playbookId={playbookId}
          initialLeftFormation={formationToMatch}
          initialRightFormation={null}
          onSuccess={handleMatchingSuccess}
        />
      )}
    </div>
  );
}
