/**
 * useFormationDropdowns Hook
 * Manages dropdown state for formation, defense, and coverage dropdowns
 */

import * as React from "react";

export function useFormationDropdowns() {
  const [isFormationDropdownOpen, setIsFormationDropdownOpen] = React.useState(false);
  const [isDefenseDropdownOpen, setIsDefenseDropdownOpen] = React.useState(false);
  const [isCoverageDropdownOpen, setIsCoverageDropdownOpen] = React.useState(false);

  return {
    isFormationDropdownOpen,
    setIsFormationDropdownOpen,
    isDefenseDropdownOpen,
    setIsDefenseDropdownOpen,
    isCoverageDropdownOpen,
    setIsCoverageDropdownOpen,
  };
}
