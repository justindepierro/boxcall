/**
 * Play Data Utilities
 * Functions for converting and transforming play data
 */

import type { Play } from "../../../../types/play";

/**
 * Convert database play data to full Play type
 * Pass through all database fields and add any missing defaults
 */
export const mapDatabasePlayToFullPlay = (dbPlay: any): Play => ({
  ...dbPlay, // Pass through all fields from database
  p_type: dbPlay.p_type as "Pass" | "Run" | "RPO" | "Play Action",
  confidence_base: dbPlay.confidence_base ?? 70,
  times_called: dbPlay.times_called ?? 0,
  times_successful: dbPlay.times_successful ?? 0,
  created_by: dbPlay.created_by ?? "system",
  created_at: new Date(dbPlay.created_at),
  updated_at: new Date(dbPlay.updated_at),
});
