/**
 * usePlayFieldValues Hook
 * 
 * Extracts unique values from existing plays for validation
 * Ensures database stays Clean AF by encouraging reuse of existing values
 */

import { useMemo } from 'react';
import type { Play } from '../../../../types/play';

interface PlayFieldValues {
  formations: string[];
  playNames: string[];
  personnel: string[];
  formationTypes: string[];
  backfieldAlignments: string[];
  shifts: string[];
  motions: string[];
  runStrengths: string[];
  passStrengths: string[];
  protections: string[];
  oneWordPlays: string[];
  wristbandNumbers: string[];
}

/**
 * Extract unique non-empty values from plays
 */
function extractUniqueValues(plays: Play[], field: keyof Play): string[] {
  const values = plays
    .map(play => play[field])
    .filter((value): value is string => 
      typeof value === 'string' && value.trim().length > 0
    );
  
  return Array.from(new Set(values)).sort();
}

export function usePlayFieldValues(plays: Play[] = []): PlayFieldValues {
  return useMemo(() => ({
    formations: extractUniqueValues(plays, 'formation'),
    playNames: extractUniqueValues(plays, 'play_name'),
    personnel: extractUniqueValues(plays, 'personnel'),
    formationTypes: extractUniqueValues(plays, 'f_type'),
    backfieldAlignments: extractUniqueValues(plays, 'back_align'),
    shifts: extractUniqueValues(plays, 'shift'),
    motions: extractUniqueValues(plays, 'motion'),
    runStrengths: extractUniqueValues(plays, 'r_str'),
    passStrengths: extractUniqueValues(plays, 'p_str'),
    protections: extractUniqueValues(plays, 'protection'),
    oneWordPlays: extractUniqueValues(plays, 'one_word_play'),
    wristbandNumbers: extractUniqueValues(plays, 'wristband_number'),
  }), [plays]);
}
