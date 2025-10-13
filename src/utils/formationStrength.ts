/**
 * Formation Strength Calculation Utilities
 * 
 * Calculates effective run/pass strength for plays based on:
 * - Formation base strength
 * - Play-level modifiers (back position relative to QB)
 */

import type { Formation, StrengthType, FormationType } from '../types/formation';
import type { Play } from '../types/play';

/**
 * Calculate effective run strength for a play
 * 
 * Base strength comes from formation, modified by back position relative to QB:
 * - Back left of QB → shifts strength left
 * - Back right of QB → shifts strength right
 * - Both or neither → use formation default
 * 
 * @param formation - Formation entity with run_strength
 * @param play - Play with back position modifiers
 * @returns Calculated run strength (left, right, or balanced)
 */
export function calculateRunStrength(
  formation: Formation | null,
  play: Play
): StrengthType {
  // No formation → use play's legacy field or default to balanced
  if (!formation) {
    if (play.r_str) {
      const normalized = play.r_str.toLowerCase();
      if (normalized === 'left' || normalized === 'right' || normalized === 'balanced') {
        return normalized as StrengthType;
      }
    }
    return 'balanced';
  }
  
  // Get base strength from formation (default to balanced)
  let strength: StrengthType = formation.run_strength || 'balanced';
  
  // Apply back position modifiers
  const backLeft = play.back_left_of_qb === true;
  const backRight = play.back_right_of_qb === true;
  
  // Both checked or neither checked → use formation default (no modification)
  if ((backLeft && backRight) || (!backLeft && !backRight)) {
    return strength;
  }
  
  // Only back left checked → shifts strength left
  if (backLeft) {
    if (strength === 'right') return 'balanced';  // Right → Balanced
    return 'left';                                 // Balanced → Left, Left → Left
  }
  
  // Only back right checked → shifts strength right
  if (backRight) {
    if (strength === 'left') return 'balanced';    // Left → Balanced
    return 'right';                                // Balanced → Right, Right → Right
  }
  
  return strength;
}

/**
 * Calculate effective pass strength for a play
 * 
 * Currently just returns formation strength (no modifiers implemented yet)
 * 
 * Future: Could add modifiers for receiver alignment, motion, etc.
 * 
 * @param formation - Formation entity with pass_strength
 * @param play - Play (for future modifiers)
 * @returns Calculated pass strength (left, right, or balanced)
 */
export function calculatePassStrength(
  formation: Formation | null,
  play: Play
): StrengthType {
  // No formation → use play's legacy field or default to balanced
  if (!formation) {
    if (play.p_str) {
      const normalized = play.p_str.toLowerCase();
      if (normalized === 'left' || normalized === 'right' || normalized === 'balanced') {
        return normalized as StrengthType;
      }
    }
    return 'balanced';
  }
  
  // Return formation's pass strength (no modifiers yet)
  return formation.pass_strength || 'balanced';
}

/**
 * Get formation type for display
 * 
 * Prefers formation metadata, falls back to legacy play field
 * 
 * @param formation - Formation entity with formation_type
 * @param play - Play with legacy f_type field
 * @returns Formation type string or null
 */
export function getFormationType(
  formation: Formation | null,
  play: Play
): FormationType | string | null {
  // Prefer formation metadata
  if (formation?.formation_type) {
    return formation.formation_type;
  }
  
  // Fallback to legacy play field
  return play.f_type || null;
}

/**
 * Get display text for strength value
 * 
 * @param strength - Strength type
 * @returns Human-readable text with arrow
 */
export function getStrengthDisplayText(strength: StrengthType): string {
  switch (strength) {
    case 'left':
      return '← Left';
    case 'right':
      return 'Right →';
    case 'balanced':
      return '⚖️ Balanced';
    default:
      return 'Unknown';
  }
}

/**
 * Get CSS class for strength indicator
 * 
 * @param strength - Strength type
 * @returns Tailwind CSS classes
 */
export function getStrengthColorClass(strength: StrengthType): string {
  switch (strength) {
    case 'left':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'right':
      return 'bg-purple-100 text-purple-700 border-purple-300';
    case 'balanced':
      return 'bg-gray-100 text-gray-700 border-gray-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
}

/**
 * Check if play has modifiers affecting inherited strength
 * 
 * @param play - Play with back position modifiers
 * @returns True if modifiers are active
 */
export function hasStrengthModifiers(play: Play): boolean {
  return (play.back_left_of_qb === true) !== (play.back_right_of_qb === true);
}
