/**
 * useRosterFilters Hook
 * 
 * Manages roster filtering logic and URL persistence
 * - Filter state (position, grade level, status, search)
 * - Filter toggle functions
 * - Computed filtered players list (with debounced search)
 * - URL persistence for shareable filter states
 * 
 * Performance:
 * - Search input is debounced (300ms) to prevent expensive filtering on every keystroke
 * - Filter computation is memoized to prevent unnecessary recalculations
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import type { RosterPlayerView } from '../../../services/rosterService';

export interface UseRosterFiltersReturn {
  // Filter state
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  positionFilters: string[];
  setPositionFilters: React.Dispatch<React.SetStateAction<string[]>>;
  gradeLevelFilters: string[];
  setGradeLevelFilters: React.Dispatch<React.SetStateAction<string[]>>;
  statusFilter: string;
  setStatusFilter: React.Dispatch<React.SetStateAction<string>>;
  
  // Computed values
  filteredPlayers: RosterPlayerView[];
  hasActiveFilters: boolean;
  
  // Filter actions
  togglePositionFilter: (position: string) => void;
  toggleGradeLevelFilter: (grade: string) => void;
  clearAllFilters: () => void;
}

export const useRosterFilters = (
  players: RosterPlayerView[]
): UseRosterFiltersReturn => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm, 300); // Debounce expensive filtering
  const [positionFilters, setPositionFilters] = useState<string[]>([]);
  const [gradeLevelFilters, setGradeLevelFilters] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Read filters from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    const urlPositions = params.get("positions")?.split(",").filter(Boolean) || [];
    const urlGrades = params.get("grades")?.split(",").filter(Boolean) || [];
    const urlStatus = params.get("status") || "";
    const urlSearch = params.get("search") || "";
    
    if (urlPositions.length > 0) setPositionFilters(urlPositions);
    if (urlGrades.length > 0) setGradeLevelFilters(urlGrades);
    if (urlStatus) setStatusFilter(urlStatus);
    if (urlSearch) setSearchTerm(urlSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (positionFilters.length > 0) params.set("positions", positionFilters.join(","));
    if (gradeLevelFilters.length > 0) params.set("grades", gradeLevelFilters.join(","));
    if (statusFilter) params.set("status", statusFilter);
    if (searchTerm) params.set("search", searchTerm);
    
    const newSearch = params.toString();
    const currentSearch = location.search.slice(1);
    
    if (newSearch !== currentSearch) {
      navigate(`?${newSearch}`, { replace: true });
    }
  }, [positionFilters, gradeLevelFilters, statusFilter, searchTerm, navigate, location.search]);

  // Filter toggle functions
  const togglePositionFilter = (position: string) => {
    setPositionFilters((prev) =>
      prev.includes(position)
        ? prev.filter((p) => p !== position)
        : [...prev, position]
    );
  };

  const toggleGradeLevelFilter = (grade: string) => {
    setGradeLevelFilters((prev) =>
      prev.includes(grade)
        ? prev.filter((g) => g !== grade)
        : [...prev, grade]
    );
  };

  const clearAllFilters = () => {
    setPositionFilters([]);
    setGradeLevelFilters([]);
    setStatusFilter("");
    setSearchTerm("");
  };

  // Computed filtered players with proper OR/AND logic
  const filteredPlayers = useMemo(() => {
    // Performance monitoring
    if (import.meta.env.DEV) {
      console.time('Filter Calculation');
    }

    const result = players.filter((player) => {
      // Search matches name, nickname, position, or jersey number (uses debounced value for performance)
      const matchesSearch =
        !debouncedSearch ||
        `${player.first_name} ${player.last_name}`
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase()) ||
        player.nickname?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        player.position?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        player.jersey_number?.toString().includes(debouncedSearch);

      // Multi-select position filter (OR logic within positions)
      const matchesPosition =
        positionFilters.length === 0 ||
        (player.position &&
          player.position
            .split(",")
            .map((p) => p.trim())
            .some((pos) => positionFilters.includes(pos)));

      // Multi-select grade level filter (OR logic within grades)
      const matchesGradeLevel =
        gradeLevelFilters.length === 0 ||
        (player.grade_level && gradeLevelFilters.includes(player.grade_level));

      // Status filter
      const matchesStatus =
        !statusFilter || player.is_active === (statusFilter === "active");

      // Combine with AND logic
      return matchesSearch && matchesPosition && matchesGradeLevel && matchesStatus;
    });

    // Performance monitoring
    if (import.meta.env.DEV) {
      console.timeEnd('Filter Calculation');
      console.log(`Filtered ${players.length} → ${result.length} players`);
    }

    return result;
  }, [players, debouncedSearch, positionFilters, gradeLevelFilters, statusFilter]);

  // Check if any filters are active
  const hasActiveFilters =
    positionFilters.length > 0 ||
    gradeLevelFilters.length > 0 ||
    statusFilter !== "" ||
    searchTerm !== "";

  return {
    searchTerm,
    setSearchTerm,
    positionFilters,
    setPositionFilters,
    gradeLevelFilters,
    setGradeLevelFilters,
    statusFilter,
    setStatusFilter,
    filteredPlayers,
    hasActiveFilters,
    togglePositionFilter,
    toggleGradeLevelFilter,
    clearAllFilters,
  };
};
