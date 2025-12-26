import React from "react";
import { BottomSheet } from "../../components/BottomSheet";
import { AdvancedFilters } from "../../components/playbook/AdvancedFilters";
import { Button } from "../../components/ui/Button/Button";
import { Icon } from "../../components/ui/Icon";
import { Typography } from "../../components/design-system/Typography";
import type { PlaybookFilters } from "../../types/filters";
import { hasActiveFilters, EMPTY_FILTERS } from "../../types/filters";

interface MobileFiltersBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: PlaybookFilters;
  onFiltersChange: (filters: PlaybookFilters) => void;
  mobileButtonSize: "sm" | "md" | "lg";
  mobileSecondaryButtonSize: "sm" | "md" | "lg";
}

export const MobileFiltersBottomSheet: React.FC<
  MobileFiltersBottomSheetProps
> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  mobileButtonSize,
  mobileSecondaryButtonSize,
}) => {
  if (!isOpen) return null;

  const hasFilters = hasActiveFilters(filters);

  const handleClearAll = () => {
    onFiltersChange({ ...EMPTY_FILTERS });
    onClose();
  };

  return (
    <BottomSheet
      snapPoints={[0.1, 0.6, 0.9]}
      initialSnapPoint={1}
      onSnapPointChange={(snapPoint) => {
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
          <AdvancedFilters
            filters={filters}
            onFiltersChange={onFiltersChange}
          />
        </div>

        {/* Action Footer - Fixed at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-primary border-t border-muted shadow-lg">
          <div className="flex gap-3">
            <Button
              onClick={handleClearAll}
              variant="secondary"
              size={mobileSecondaryButtonSize}
              className="flex-1"
            >
              Clear All
            </Button>
            <Button
              onClick={onClose}
              variant="primary"
              size={mobileButtonSize}
              className="flex-1"
            >
              <Icon name="check" className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
          {hasFilters && (
            <p className="text-center text-xs text-secondary mt-2">
              Filters active
            </p>
          )}
        </div>
      </div>
    </BottomSheet>
  );
};

MobileFiltersBottomSheet.displayName = "MobileFiltersBottomSheet";
