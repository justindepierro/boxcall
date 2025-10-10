/**
 * Smart Defense System - Main Barrel Export
 *
 * Central export point for all defense features
 */

// Formation Analyzer
export { analyzeFormation } from "./analyzers/formationAnalyzer";

export {
  analyzeTightEnds,
  isTightEndInBox,
} from "./analyzers/tightEndProximityDetector";

export {
  detectFieldBoundary,
  getCenterXForHash,
} from "./analyzers/fieldBoundaryDetector";

// Utilities
export {
  getEligibleReceivers,
  getWideReceivers,
  countWideReceiversLeft,
  countWideReceiversRight,
} from "./utils/eligibleReceiverFilter";

// Types
export type {
  FormationAnalysis,
  FormationType,
  RBPosition,
  FormationStrength,
  HashAlignment,
  TightEndPosition,
  TightEndAnalysis,
} from "./types/formationTypes";

export type {
  DefensiveSchemeType,
  DefensivePosition,
  DLineAlignment,
  LBAlignment,
  CoverageType,
  FieldBoundaryInfo,
} from "./types/schemeTypes";

// Schemes
export {
  createNickel425Formation,
  getCenterXForAlignment,
  convertToPlayers,
  type DefensivePlayerPosition,
  type Nickel425Params,
} from "./schemes";

// Engines
export {
  adjustCoverage,
  type CoverageAdjustmentParams,
  type PlayerAdjustment,
  type CoverageAdjustmentResult,
} from "./engines";
