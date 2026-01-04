/**
 * Practice Domain Services - Barrel Export
 * Provides clean, modular access to all practice-related services
 */

// Core services
export { PracticeScriptService } from "./scriptService";
export { PracticeScheduleService } from "./scheduleService";
export { PracticeTemplateService } from "./templateService";
export { PracticeSearchService } from "./searchService";

// Shared types
export type {
  PracticeScript,
  PracticeScriptPlay,
  CreatePracticeScriptData,
  AddPlayToPracticeScriptData,
  PracticeTemplate,
  CreatePracticeTemplateData,
  PracticeSearchResult,
} from "../../types/practice-service";
