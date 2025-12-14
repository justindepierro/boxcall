/**
 * PracticePlansPage Types
 *
 * Type definitions for the Practice Plans page
 */

import type { IconName } from "../../components/ui/Icon";
import type { PracticeScript } from "../../services/practiceService";
import type { SortOption } from "../../components/ui/SortDropdown";

/**
 * Props for the script card component
 */
export interface ScriptCardProps {
  script: PracticeScript;
  onEdit: (script: PracticeScript) => void;
  onDuplicate: (script: PracticeScript) => void;
  onArchive: (script: PracticeScript) => void;
  onDelete: (scriptId: string) => void;
  isArchived?: boolean;
}

/**
 * Tile configuration for aurora dashboard
 */
export interface TileConfig {
  key: string;
  title: string;
  description: string;
  icon: IconName;
  accentOverlayClass: string;
  glowClassName: string;
  statusBadge: string;
  iconClassName: string;
  footnote: string;
  onOpen: () => void;
  body: React.ReactNode;
}

/**
 * Filter option for filter chips
 */
export interface FilterOption {
  id: string;
  label: string;
  active: boolean;
}

/**
 * State for the practice plans page
 */
export interface PracticePlansState {
  showModal: boolean;
  showImportModal: boolean;
  editingScript: PracticeScript | undefined;
  practiceScripts: PracticeScript[];
  isLoading: boolean;
  activeTeamId: string | null;
  searchQuery: string;
  activeFilters: string[];
  sortBy: string;
  showDeleteConfirm: boolean;
  deleteScriptId: string | null;
}

/**
 * Sort options for practice scripts
 */
export const SORT_OPTIONS: SortOption[] = [
  { id: "date-desc", label: "Newest First" },
  { id: "date-asc", label: "Oldest First" },
  { id: "name-asc", label: "Name (A-Z)" },
  { id: "name-desc", label: "Name (Z-A)" },
];

/**
 * Filter options for practice scripts
 */
export const getFilterOptions = (activeFilters: string[]): FilterOption[] => [
  {
    id: "has-tags",
    label: "Has Tags",
    active: activeFilters.includes("has-tags"),
  },
  {
    id: "no-tags",
    label: "No Tags",
    active: activeFilters.includes("no-tags"),
  },
];
