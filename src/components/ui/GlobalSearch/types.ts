/**
 * GlobalSearch Types
 *
 * Type definitions for the global search component including
 * search results, props, and internal state.
 */

import { debug } from "../../../utils/logger";

// Debug logging flag
export const DEBUG_SEARCH = false;

export const debugLog = DEBUG_SEARCH
  ? (...args: unknown[]) => debug("[GlobalSearch]", ...args)
  : () => {};

/**
 * Props for the GlobalSearch component
 */
export interface GlobalSearchProps {
  className?: string;
}

/**
 * Result type categories for search
 */
export type SearchResultType =
  | "play"
  | "formation"
  | "player"
  | "announcement"
  | "game_plan"
  | "practice_script"
  | "calendar_event"
  | "equipment";

/**
 * A single search result item
 */
export interface SearchResult {
  type: SearchResultType;
  id: string;
  title: string;
  subtitle: string;
  url: string;
}

/**
 * Props for the SearchResultItem component
 */
export interface SearchResultItemProps {
  result: SearchResult;
  index: number;
  selectedIndex: number;
  getTypeIcon: (type: SearchResultType) => string;
  getTypeColor: (type: SearchResultType) => string;
  onClick: (result: SearchResult) => void;
}

/**
 * Props for the DesktopSearchField component
 */
export interface DesktopSearchFieldProps {
  query: string;
  isOpen: boolean;
  isLoading: boolean;
  results: SearchResult[];
  selectedIndex: number;
  recentSearches: string[];
  inputRef: React.RefObject<HTMLInputElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onFocus: () => void;
  onBlur: () => void;
  onClear: () => void;
  onResultClick: (result: SearchResult) => void;
  onRecentSearchClick: (query: string) => void;
  onClearHistory: () => void;
  getTypeIcon: (type: SearchResultType) => string;
  getTypeColor: (type: SearchResultType) => string;
  className?: string;
  inputId?: string;
  inputName?: string;
}

/**
 * Props for the MobileSearchModal component
 */
export interface MobileSearchModalProps {
  isOpen: boolean;
  query: string;
  isLoading: boolean;
  results: SearchResult[];
  selectedIndex: number;
  recentSearches: string[];
  inputRef: React.RefObject<HTMLInputElement | null>;
  onClose: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onClear: () => void;
  onResultClick: (result: SearchResult) => void;
  onRecentSearchClick: (query: string) => void;
  onClearHistory: () => void;
  getTypeIcon: (type: SearchResultType) => string;
  getTypeColor: (type: SearchResultType) => string;
}

/**
 * Props for the SearchResults component
 */
export interface SearchResultsProps {
  isLoading: boolean;
  results: SearchResult[];
  query: string;
  selectedIndex: number;
  getTypeIcon: (type: SearchResultType) => string;
  getTypeColor: (type: SearchResultType) => string;
  onResultClick: (result: SearchResult) => void;
  recentSearches?: string[];
  onRecentSearchClick?: (query: string) => void;
  onClearHistory?: () => void;
  emptyMessage?: string;
}

/**
 * Props for the MobileSearchButton component
 */
export interface MobileSearchButtonProps {
  onClick: () => void;
  className?: string;
}

/**
 * Internal state shape for the search hook
 */
export interface GlobalSearchState {
  query: string;
  results: SearchResult[];
  isOpen: boolean;
  isLoading: boolean;
  selectedIndex: number;
  isMobileModalOpen: boolean;
}
