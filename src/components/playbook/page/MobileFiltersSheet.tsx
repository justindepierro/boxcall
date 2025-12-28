import React from "react";
import { Button } from "../../ui/Button/Button";
import { Icon } from "../../ui/Icon/Icon";
import { Typography } from "../../design-system/Typography";
import { BottomSheet } from "../../BottomSheet";
import { AdvancedFilters } from "../AdvancedFilters";
import { EMPTY_FILTERS, hasActiveFilters } from "../../../types/filters";
import type { PlaybookFilters } from "../../../types/filters";
import type { ButtonSize } from "../../ui/Button/Button.types";

interface MobileFiltersSheetProps {
  /** Whether the sheet is visible */
  isOpen: boolean;
  /** Callback to close the sheet */
  onClose: () => void;
  /** Current filter state */
  filters: PlaybookFilters;
  /** Callback when filters change */
  onFiltersChange: (filters: PlaybookFilters) => void;
  /** Primary button size */
  primaryButtonSize?: ButtonSize;
  /** Secondary button size */
  secondaryButtonSize?: ButtonSize;
}

/**
 * MobileFiltersSheet - Bottom sheet for mobile filter controls
 *
 * Features:
 * - Snap points for partial/full expansion (10%, 60%, 90%)
 * - Auto-close when minimized below 15%
 * - Clear all / Apply filter actions
 * - Shows "Filters active" indicator when filters applied
 *
 * @example
 * ```tsx
 * <MobileFiltersSheet
 *   isOpen={showFilters}
 *   onClose={() => setShowFilters(false)}
 *   filters={state.filters}
 *   onFiltersChange={(filters) => dispatch({ type: "SET_FILTERS", filters })}
 * />
 * ```
 */
export const MobileFiltersSheet: React.FC<MobileFiltersSheetProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  primaryButtonSize = "lg",
  secondaryButtonSize = "lg",
}) => {
  if (!isOpen) return null;

  const handleClearAll = () => {
    onFiltersChange({ ...EMPTY_FILTERS });
    onClose();
  };

  return (
    <BottomSheet
      snapPoints={[0.1, 0.6, 0.9]}
      initialSnapPoint={1}
      onSnapPointChange={(snapPoint) => {
        // Close when fully minimized
        if (snapPoint < 0.15) {
          onClose();
        }
      }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-muted">
          <Typography variant="headline-md" className="text-primary">
            Filters & Search
          </Typography>
          <Button onClick={onClose} variant="ghost" size="sm">
            <Icon name="close" className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable Filters Content */}
        <div className="flex-1 overflow-y-auto p-6 pb-20">
          <AdvancedFilters filters={filters} onFiltersChange={onFiltersChange} />
        </div>

        {/* Action Footer - Fixed at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-primary border-t border-muted shadow-lg">
          <div className="flex gap-3">
            <Button
              onClick={handleClearAll}
              variant="secondary"
              size={secondaryButtonSize}
              className="flex-1"
            >
              Clear All
            </Button>
            <Button
              onClick={onClose}
              variant="primary"
              size={primaryButtonSize}
              className="flex-1"
            >
              <Icon name="check" className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
          {hasActiveFilters(filters) && (
            <p className="text-center text-xs text-secondary mt-2">
              Filters active
            </p>
          )}
        </div>
      </div>
    </BottomSheet>
  );
};

export default MobileFiltersSheet;
