// CSV import types matching the provided CSV structure
export interface CSVPlayData {
  personnel: string;
  formation: string;
  formDir: string;
  fTag1: string;
  fTag2: string;
  fTag3: string;
  backAlign: string;
  shift: string;
  motion: string;
  action: string;
  protection: string;
  play: string; // Maps to play_name
  playDir: string;
  backsideRoute: string;
  oneWordPlay: string; // Critical for audibles!
  pTag1: string;
  pTag2: string;
  backRoute: string;
  checkInto1: string;
  checkInto2: string;
  keyPlayer1: string;
  keyPlayer2: string;
  hAlign: string;
  zAlign: string;
  playType: string;
  formType: string;
  passStr: string;
  runStr: string;
  prefHash: string;
  prefDown: string;
  prefDis: string;
  prefFieldPos: string;
  prefDFront: string;
  prefDCov: string;
  PrefDBlitz: string;
  prefSituation: string;
  diagramPath: string;
  conf: string; // Confidence
}
// Mapping configuration for CSV import
export interface CSVColumnMapping {
  csvColumn: string;
  dbField: string;
  transform?: (value: string) => string | number | boolean;
  required?: boolean;
}
// Default mapping based on CSV structure
export const DEFAULT_CSV_MAPPING: CSVColumnMapping[] = [
  { csvColumn: "personnel", dbField: "personnel" },
  { csvColumn: "formation", dbField: "formation", required: true },
  { csvColumn: "formDir", dbField: "f_dir" },
  { csvColumn: "fTag1", dbField: "ftag1" },
  { csvColumn: "fTag2", dbField: "ftag2" },
  { csvColumn: "backAlign", dbField: "back_align" },
  { csvColumn: "shift", dbField: "shift" },
  { csvColumn: "motion", dbField: "motion" },
  { csvColumn: "protection", dbField: "protection" },
  { csvColumn: "play", dbField: "play_name", required: true },
  { csvColumn: "playDir", dbField: "p_dir" },
  { csvColumn: "oneWordPlay", dbField: "one_word_play" },
  { csvColumn: "pTag1", dbField: "p_tag1" },
  { csvColumn: "pTag2", dbField: "p_tag2" },
  { csvColumn: "checkInto1", dbField: "check_into" },
  { csvColumn: "keyPlayer1", dbField: "key_player1" },
  { csvColumn: "keyPlayer2", dbField: "key_player2" },
  {
    csvColumn: "playType",
    dbField: "p_type",
    required: true,
    transform: mapPlayType,
  },
  { csvColumn: "formType", dbField: "f_type" },
  { csvColumn: "passStr", dbField: "p_str" },
  { csvColumn: "runStr", dbField: "r_str" },
  { csvColumn: "prefHash", dbField: "pref_hash" },
  { csvColumn: "prefDown", dbField: "pref_down" },
  { csvColumn: "prefDis", dbField: "pref_dis" },
  { csvColumn: "prefDFront", dbField: "pref_front" },
  { csvColumn: "prefDCov", dbField: "pref_cov" },
  { csvColumn: "diagramPath", dbField: "diagram_url" },
  { csvColumn: "conf", dbField: "confidence_base", transform: parseFloat },
];
// Transform functions for CSV data
function mapPlayType(value: string): "Pass" | "Run" | "RPO" {
  const normalized = value.toLowerCase().trim();
  if (
    normalized.includes("pass") ||
    normalized === "drop" ||
    normalized === "quick"
  )
    return "Pass";
  if (normalized.includes("run")) return "Run";
  if (normalized.includes("rpo")) return "RPO";
  return "Pass"; // Default fallback
}
// CSV import validation rules
export interface CSVValidationRule {
  field: string;
  validate: (value: unknown) => boolean;
  message: string;
}
export const CSV_VALIDATION_RULES: CSVValidationRule[] = [
  {
    field: "play_name",
    validate: (value) => typeof value === "string" && value.length > 0,
    message: "Play name is required",
  },
  {
    field: "formation",
    validate: (value) => typeof value === "string" && value.length > 0,
    message: "Formation is required",
  },
  {
    field: "p_type",
    validate: (value) =>
      typeof value === "string" && ["Pass", "Run", "RPO"].includes(value),
    message: "Play type must be Pass, Run, or RPO",
  },
  {
    field: "confidence_base",
    validate: (value) =>
      typeof value === "number" && !isNaN(value) && value >= 0 && value <= 100,
    message: "Confidence must be a number between 0 and 100",
  },
];
// Import result tracking
export interface CSVImportResult {
  totalRows: number;
  successfulImports: number;
  failedImports: number;
  errors: CSVImportError[];
  warnings: CSVImportWarning[];
}
export interface CSVImportError {
  row: number;
  field?: string;
  message: string;
  data?: Record<string, unknown>;
}
export interface CSVImportWarning {
  row: number;
  field?: string;
  message: string;
  data?: Record<string, unknown>;
}
