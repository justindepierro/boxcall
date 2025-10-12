/**
 * Formation → Diagram Template Helpers
 * 
 * Utilities for importing formation player positions into diagram editor.
 * When a user selects a formation in the play builder, these functions
 * convert formation.player_positions into diagram_data.players for the canvas.
 * 
 * Phase 7 of Formation System Integration
 */

import type { Formation, FormationPlayerPosition } from '../types/formation';
import type { DiagramDocument } from '../components/playbook/diagram-editor/types/DiagramTypes';
import type { Player } from '../components/playbook/diagram-editor/types/Player';
import { v4 as uuidv4 } from 'uuid';

/**
 * Convert formation player positions to diagram players
 * 
 * Maps formation coordinate system to diagram coordinate system:
 * - Formation: x (0-53.3 yards width), y (0-50 yards depth)
 * - Diagram: Same coordinate system (both use yards)
 * 
 * @param formation - Formation with player_positions array
 * @returns Array of Player objects for diagram editor
 */
export function convertFormationToDiagramPlayers(
  formation: Formation
): Player[] {
  if (!formation.player_positions || formation.player_positions.length === 0) {
    return [];
  }

  return formation.player_positions.map((pos: FormationPlayerPosition) => {
    // Use position code as jersey number if not provided
    const jerseyNumber = pos.jerseyNumber || pos.position || pos.label || '?';
    
    // Determine if this is center position (for square shape)
    const isCenter = pos.position?.toUpperCase() === 'C';
    
    return {
      id: uuidv4(),
      x: pos.x,
      y: pos.y,
      jerseyNumber,
      team: 'offense' as const,
      role: pos.role,
      position: isCenter ? ('center' as const) : ('regular' as const),
      // Could add color customization based on pos.label if desired
    };
  });
}

/**
 * Create diagram document from formation
 * 
 * Generates a complete DiagramDocument with formation players pre-populated.
 * User can then add routes, annotations, defense, etc.
 * 
 * @param formation - Formation to import
 * @returns Complete DiagramDocument ready for editor
 */
export function importFormationAsTemplate(
  formation: Formation
): DiagramDocument {
  const players = convertFormationToDiagramPlayers(formation);
  
  return {
    version: 2,
    players,
    meta: {
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  };
}

/**
 * Merge formation players into existing diagram
 * 
 * Adds formation players to an existing diagram without removing
 * existing players (e.g., defense, custom offense additions).
 * 
 * Use case: User has already drawn defense, then selects a formation
 * 
 * @param existingDiagram - Current diagram document
 * @param formation - Formation to merge in
 * @returns Updated DiagramDocument with formation players added
 */
export function mergeFormationIntoDiagram(
  existingDiagram: DiagramDocument,
  formation: Formation
): DiagramDocument {
  const formationPlayers = convertFormationToDiagramPlayers(formation);
  
  // Remove existing offense players, keep defense
  const nonOffensePlayers = existingDiagram.players.filter(
    p => p.team !== 'offense'
  );
  
  return {
    ...existingDiagram,
    players: [...formationPlayers, ...nonOffensePlayers],
    meta: {
      createdAt: existingDiagram.meta?.createdAt || Date.now(),
      updatedAt: Date.now(),
    },
  };
}

/**
 * Check if diagram already has formation players
 * 
 * Helper to detect if diagram was populated from a formation.
 * Useful for UI decisions (show "Replace" vs "Import" button).
 * 
 * @param diagram - Diagram document to check
 * @returns True if diagram has offense players
 */
export function diagramHasFormation(diagram: DiagramDocument): boolean {
  return diagram.players.some(p => p.team === 'offense');
}

/**
 * Clear formation players from diagram
 * 
 * Removes all offense players, keeps defense/annotations.
 * Useful for "Reset Formation" functionality.
 * 
 * @param diagram - Current diagram document
 * @returns Updated diagram with offense players removed
 */
export function clearFormationFromDiagram(
  diagram: DiagramDocument
): DiagramDocument {
  return {
    ...diagram,
    players: diagram.players.filter(p => p.team !== 'offense'),
    meta: {
      createdAt: diagram.meta?.createdAt || Date.now(),
      updatedAt: Date.now(),
    },
  };
}

/**
 * Get formation player count from diagram
 * 
 * @param diagram - Diagram document
 * @returns Number of offense players in diagram
 */
export function getFormationPlayerCount(diagram: DiagramDocument): number {
  return diagram.players.filter(p => p.team === 'offense').length;
}
