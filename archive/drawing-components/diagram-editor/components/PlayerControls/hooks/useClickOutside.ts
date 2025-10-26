/**
 * useClickOutside Hook
 * Handles closing dropdowns when clicking outside their container
 */

import * as React from "react";

interface UseClickOutsideProps {
  isFormationDropdownOpen: boolean;
  isDefenseDropdownOpen: boolean;
  isCoverageDropdownOpen: boolean;
  setIsFormationDropdownOpen: (open: boolean) => void;
  setIsDefenseDropdownOpen: (open: boolean) => void;
  setIsCoverageDropdownOpen: (open: boolean) => void;
}

export function useClickOutside(props: UseClickOutsideProps) {
  const {
    isFormationDropdownOpen,
    isDefenseDropdownOpen,
    isCoverageDropdownOpen,
    setIsFormationDropdownOpen,
    setIsDefenseDropdownOpen,
    setIsCoverageDropdownOpen,
  } = props;

  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const defenseDropdownRef = React.useRef<HTMLDivElement>(null);
  const coverageDropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsFormationDropdownOpen(false);
      }
      if (
        defenseDropdownRef.current &&
        !defenseDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDefenseDropdownOpen(false);
      }
      if (
        coverageDropdownRef.current &&
        !coverageDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCoverageDropdownOpen(false);
      }
    };

    if (
      isFormationDropdownOpen ||
      isDefenseDropdownOpen ||
      isCoverageDropdownOpen
    ) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [
    isFormationDropdownOpen,
    isDefenseDropdownOpen,
    isCoverageDropdownOpen,
    setIsFormationDropdownOpen,
    setIsDefenseDropdownOpen,
    setIsCoverageDropdownOpen,
  ]);

  return {
    dropdownRef,
    defenseDropdownRef,
    coverageDropdownRef,
  };
}
