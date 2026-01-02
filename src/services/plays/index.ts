/**
 * Plays Domain Services - Barrel Export
 * Provides clean, modular access to all play-related services
 */

// Core services
export { PlayCrudService } from "./crudService";
export { PlaySuggestionService } from "./suggestionService";
export { PlaybookSearchService } from "./searchService";
export { PlayHelperService } from "./helperService";

// Shared types
export type {
  SearchResult,
  QuickFilter,
  SearchPreset,
  PlayQueryOptions,
  MergePlaybooksResult,
} from "./types";
