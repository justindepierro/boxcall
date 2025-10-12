/**
 * Formation Matching Modal
 * 
 * Allows coaches to manually link formations as Left/Right variants
 * Shows side-by-side preview and dropdown selectors
 * Can link existing formations or create new variants
 */

import React, { useState, useEffect } from 'react';
import { FormationService } from '../../services/formationService';
import type { Formation } from '../../types/formation';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { useToast } from '../../hooks/useToast';

interface FormationMatchingModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseFormation: Formation;
  onSuccess?: () => void;
}

export const FormationMatchingModal: React.FC<FormationMatchingModalProps> = ({
  isOpen,
  onClose,
  baseFormation,
  onSuccess,
}) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [suggestedMatches, setSuggestedMatches] = useState<Formation[]>([]);
  const [variantFamily, setVariantFamily] = useState<{
    base: Formation | null;
    left: Formation | null;
    right: Formation | null;
  }>({ base: null, left: null, right: null });

  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [selectedRightId, setSelectedRightId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load suggested matches and current variant family
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load suggested matches
        const matches = await FormationService.getSuggestedMatches(baseFormation.id);
        setSuggestedMatches(matches);

        // Load current variant family
        const family = await FormationService.getFormationVariantFamily(baseFormation.id);
        setVariantFamily(family);

        // Pre-select current variants
        setSelectedLeftId(family.left?.id || null);
        setSelectedRightId(family.right?.id || null);
      } catch (error) {
        console.error('Failed to load formation data:', error);
        toast.error(error instanceof Error ? error.message : 'Unknown error', 'Failed to load formations');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen, baseFormation.id, toast, refreshTrigger]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Use the base formation from the family (handles case where modal opened on variant)
      const baseId = variantFamily.base?.id || baseFormation.id;

      await FormationService.linkFormations(
        baseId,
        selectedLeftId || undefined,
        selectedRightId || undefined
      );

      toast.success('Variants linked!', 'Formation variants updated successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to link formations:', error);
      toast.error('Failed to link formations', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkLeft = async () => {
    if (!variantFamily.left) return;

    setLoading(true);
    try {
      await FormationService.unlinkVariant(variantFamily.left.id);
      toast.success('Left variant unlinked', 'Unlinked');
      setRefreshTrigger((prev) => prev + 1); // Trigger reload
    } catch (error) {
      console.error('Failed to unlink left variant:', error);
      toast.error('Failed to unlink', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkRight = async () => {
    if (!variantFamily.right) return;

    setLoading(true);
    try {
      await FormationService.unlinkVariant(variantFamily.right.id);
      toast.success('Right variant unlinked', 'Unlinked');
      setRefreshTrigger((prev) => prev + 1); // Trigger reload
    } catch (error) {
      console.error('Failed to unlink right variant:', error);
      toast.error('Failed to unlink', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableMatchesForLeft = () => {
    return suggestedMatches.filter(
      (f) => 
        f.id !== selectedRightId && // Can't be same as right variant
        (f.direction === 'base' || f.direction === 'left' || !f.base_formation_id) // Only independent or left formations
    );
  };

  const getAvailableMatchesForRight = () => {
    return suggestedMatches.filter(
      (f) => 
        f.id !== selectedLeftId && // Can't be same as left variant
        (f.direction === 'base' || f.direction === 'right' || !f.base_formation_id) // Only independent or right formations
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Match Formation Variants"
      size="xl"
    >
      <div className="space-y-6">
        {/* Base Formation Display */}
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Base Formation
          </h3>
          <div className="bg-surface-secondary rounded-lg p-4 border border-border-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-text-primary">{variantFamily.base?.name || baseFormation.name}</p>
                <p className="text-sm text-text-secondary">
                  {variantFamily.base?.personnel_name || baseFormation.personnel_name} Personnel
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                  Base
                </span>
                {variantFamily.base?.usage_count !== undefined && (
                  <span className="text-sm text-text-muted">
                    {variantFamily.base.usage_count} plays
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Left Variant Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-text-primary">
              Left Variant
            </h3>
            {variantFamily.left && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleUnlinkLeft}
                disabled={loading}
              >
                <Icon name="link" className="w-4 h-4" />
                Unlink
              </Button>
            )}
          </div>
          
          <select
            value={selectedLeftId || ''}
            onChange={(e) => setSelectedLeftId(e.target.value || null)}
            disabled={loading}
            className="w-full px-3 py-2 border border-border-primary rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">-- Select Left Variant --</option>
            {getAvailableMatchesForLeft().map((formation) => (
              <option key={formation.id} value={formation.id}>
                {formation.name}
                {formation.direction !== 'base' && ` (${formation.direction})`}
                {formation.usage_count > 0 && ` - ${formation.usage_count} plays`}
              </option>
            ))}
          </select>

          {selectedLeftId && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Icon name="arrow-left" className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {suggestedMatches.find((f) => f.id === selectedLeftId)?.name}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Variant Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-text-primary">
              Right Variant
            </h3>
            {variantFamily.right && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleUnlinkRight}
                disabled={loading}
              >
                <Icon name="link" className="w-4 h-4" />
                Unlink
              </Button>
            )}
          </div>
          
          <select
            value={selectedRightId || ''}
            onChange={(e) => setSelectedRightId(e.target.value || null)}
            disabled={loading}
            className="w-full px-3 py-2 border border-border-primary rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">-- Select Right Variant --</option>
            {getAvailableMatchesForRight().map((formation) => (
              <option key={formation.id} value={formation.id}>
                {formation.name}
                {formation.direction !== 'base' && ` (${formation.direction})`}
                {formation.usage_count > 0 && ` - ${formation.usage_count} plays`}
              </option>
            ))}
          </select>

          {selectedRightId && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Icon name="arrow-right" className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {suggestedMatches.find((f) => f.id === selectedRightId)?.name}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="bg-info-50 border border-info-200 rounded-lg p-4">
          <div className="flex gap-3">
            <Icon name="info" className="w-5 h-5 text-info-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-info-900">
              <p className="font-medium mb-1">How Formation Matching Works</p>
              <ul className="list-disc list-inside space-y-1 text-info-800">
                <li>Link formations that mirror each other (e.g., "Twins Right" ↔ "Twins Left")</li>
                <li>Only formations with the same personnel are suggested</li>
                <li>You can unlink variants to make them independent again</li>
                <li>Linked formations work with Duplicate & Flip feature</li>
              </ul>
            </div>
          </div>
        </div>

        {/* No Matches Warning */}
        {!loading && suggestedMatches.length === 0 && (
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
            <div className="flex gap-3">
              <Icon name="alert-triangle" className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-warning-900">
                <p className="font-medium mb-1">No Suggested Matches</p>
                <p className="text-warning-800">
                  There are no other formations in this playbook with the same personnel.
                  You'll need to create new formations to link as variants.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border-primary">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || (!selectedLeftId && !selectedRightId)}
            loading={loading}
          >
            <Icon name="check" className="w-4 h-4" />
            Save Matches
          </Button>
        </div>
      </div>
    </Modal>
  );
};
