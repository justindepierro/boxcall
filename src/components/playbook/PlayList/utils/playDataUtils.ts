/**
 * Play Data Utilities
 * Functions for converting and transforming play data
 */

import type { Play } from "../../../../types/play";

/**
 * Database play row type - using Record<string, unknown> since database types
 * use `null` for nullable fields while Play interface uses `undefined`.
 * This allows us to spread the database row and override specific fields.
 */
type DatabasePlayRow = Record<string, unknown> & {
  p_type: string;
  confidence_base?: number | null;
  times_called?: number | null;
  times_successful?: number | null;
  created_by?: string | null;
  created_at: string | null;
  updated_at: string | null;
};

/**
 * Convert database play data to full Play type
 * Pass through all database fields and add any missing defaults
 * 
 * Note: Database rows may have nullable fields that Play requires as non-null.
 * This function handles those conversions with appropriate defaults.
 */
export const mapDatabasePlayToFullPlay = (dbPlay: DatabasePlayRow): Play => ({
  ...(dbPlay as unknown as Play),
  p_type: dbPlay.p_type as "Pass" | "Run" | "RPO" | "Play Action",
  confidence_base: dbPlay.confidence_base ?? 70,
  times_called: dbPlay.times_called ?? 0,
  times_successful: dbPlay.times_successful ?? 0,
  created_by: dbPlay.created_by ?? "system",
  created_at: new Date(dbPlay.created_at ?? Date.now()),
  updated_at: new Date(dbPlay.updated_at ?? Date.now()),
});
