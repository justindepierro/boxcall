/**
 * Formation Positioning Engine
 *
 * Professional NFL positioning standards and formation templates
 * Handles player placement, depth calculations, and formation validation
 */

import type { PlayerPosition, FormationCategory, FormationType, PersonnelGrouping, FormationPlayer, FormationData } from '../types/diagram';

// Local constants (imported from field types)
const POSITION_DEPTHS = {
  QB: 7,           // Shotgun depth (most common)
  QB_UNDER: 1,     // Under center (traditional)
  RB: 8,           // I-formation depth
  FB: 6,           // H-back/fullback depth
  SLOT: 1,         // 1 yard off LOS (eligible receivers)
  SPLIT_END: 0,    // On LOS (traditional split ends)
  TE: 0,           // On LOS (inline tight ends)
  DEFAULT: 5,      // Default depth for unknown positions
} as const;

// Remove local type definitions - use imported ones from diagram.ts
// type FieldPosition = { x: number; y: number };
// type PlayerPosition = 'QB' | 'RB' | 'FB' | 'TB' | 'TE' | 'LT' | 'LG' | 'C' | 'RG' | 'RT' | 'WR' | 'SLOT' | 'SE' | 'FL' | 'X' | 'Y' | 'Z' | 'H' | 'OTHER';
// type FormationCategory = 'spread' | 'pro' | 'power' | 'special' | 'goal_line' | 'short_yardage';
// type FormationType = 'I Formation' | 'Singleback' | 'Pistol' | 'Shotgun' | 'Empty' | 'Trips' | 'Bunch' | 'Stack' | 'Wing' | 'Other';
// type FormationDirection = 'left' | 'right' | null;
// type StrengthType = 'left' | 'right' | 'balanced';

// interface PersonnelGrouping {
//   rb: number;
//   te: number;
//   wr: number;
// }

// interface FormationPlayer {
//   id: string;
//   playerPosition: PlayerPosition;
//   role: string;
//   fieldPosition: FieldPosition;
//   label: string;
// }

// interface FormationData {
//   id: string;
//   name: string;
//   category: FormationCategory;
//   type: FormationType;
//   direction: FormationDirection;
//   strength: StrengthType;
//   personnel: PersonnelGrouping;
//   players: FormationPlayer[];

// ============================================================================
// FORMATION TEMPLATES
// ============================================================================

/** Formation template with default player positions */
export interface FormationTemplate {
  name: string;
  category: FormationCategory;
  type: FormationType;
  personnel: PersonnelGrouping;
  players: Omit<FormationPlayer, 'id'>[];
}

/** Standard NFL formation templates */
export const FORMATION_TEMPLATES: Record<string, FormationTemplate> = {
  // I Formation variants
  'I-Formation-11': {
    name: 'I Formation (11 Personnel)',
    category: 'pro',
    type: 'I Formation',
    personnel: { rb: 1, te: 1, wr: 1 },
    players: [
      // Offensive Line (always at LOS)
      { playerPosition: 'LT', role: 'offensive_line', fieldPosition: { x: 48.5, y: 17.5 }, label: 'LT' },
      { playerPosition: 'LG', role: 'offensive_line', fieldPosition: { x: 50.5, y: 17.5 }, label: 'LG' },
      { playerPosition: 'C', role: 'offensive_line', fieldPosition: { x: 53.3, y: 17.5 }, label: 'C' },
      { playerPosition: 'RG', role: 'offensive_line', fieldPosition: { x: 55.5, y: 17.5 }, label: 'RG' },
      { playerPosition: 'RT', role: 'offensive_line', fieldPosition: { x: 57.5, y: 17.5 }, label: 'RT' },

      // QB (7 yards behind LOS)
      { playerPosition: 'QB', role: 'quarterback', fieldPosition: { x: 53.3, y: 24.5 }, label: 'Q' },

      // RB (8 yards behind LOS, between guards)
      { playerPosition: 'RB', role: 'running_back', fieldPosition: { x: 53.3, y: 25.5 }, label: 'H' },

      // TE (inline, at LOS)
      { playerPosition: 'TE', role: 'tight_end', fieldPosition: { x: 59.5, y: 17.5 }, label: 'Y' },

      // WR (split end, at LOS)
      { playerPosition: 'WR', role: 'wide_receiver', fieldPosition: { x: 47.3, y: 17.5 }, label: 'X' },

      // Slot WR (1 yard off LOS)
      { playerPosition: 'SLOT', role: 'slot_receiver', fieldPosition: { x: 51.3, y: 18.5 }, label: 'Z' },

      // Flanker (opposite side)
      { playerPosition: 'WR', role: 'wide_receiver', fieldPosition: { x: 59.5, y: 17.5 }, label: 'F' },
    ]
  },

  // Shotgun formations
  'Shotgun-11': {
    name: 'Shotgun (11 Personnel)',
    category: 'spread',
    type: 'Shotgun',
    personnel: { rb: 1, te: 1, wr: 1 },
    players: [
      // Offensive Line (at LOS)
      { playerPosition: 'LT', role: 'offensive_line', fieldPosition: { x: 48.5, y: 17.5 }, label: 'LT' },
      { playerPosition: 'LG', role: 'offensive_line', fieldPosition: { x: 50.5, y: 17.5 }, label: 'LG' },
      { playerPosition: 'C', role: 'offensive_line', fieldPosition: { x: 53.3, y: 17.5 }, label: 'C' },
      { playerPosition: 'RG', role: 'offensive_line', fieldPosition: { x: 55.5, y: 17.5 }, label: 'RG' },
      { playerPosition: 'RT', role: 'offensive_line', fieldPosition: { x: 57.5, y: 17.5 }, label: 'RT' },

      // QB (7 yards behind LOS in shotgun)
      { playerPosition: 'QB', role: 'quarterback', fieldPosition: { x: 53.3, y: 24.5 }, label: 'Q' },

      // RB (8 yards behind LOS)
      { playerPosition: 'RB', role: 'running_back', fieldPosition: { x: 53.3, y: 25.5 }, label: 'H' },

      // TE (inline)
      { playerPosition: 'TE', role: 'tight_end', fieldPosition: { x: 59.5, y: 17.5 }, label: 'Y' },

      // WRs (split)
      { playerPosition: 'WR', role: 'wide_receiver', fieldPosition: { x: 47.3, y: 17.5 }, label: 'X' },
      { playerPosition: 'WR', role: 'wide_receiver', fieldPosition: { x: 59.5, y: 17.5 }, label: 'Z' },

      // Slot
      { playerPosition: 'SLOT', role: 'slot_receiver', fieldPosition: { x: 51.3, y: 18.5 }, label: 'S' },
    ]
  },

  // Empty formations
  'Empty-10': {
    name: 'Empty (10 Personnel)',
    category: 'spread',
    type: 'Empty',
    personnel: { rb: 0, te: 1, wr: 2 },
    players: [
      // Offensive Line
      { playerPosition: 'LT', role: 'offensive_line', fieldPosition: { x: 48.5, y: 17.5 }, label: 'LT' },
      { playerPosition: 'LG', role: 'offensive_line', fieldPosition: { x: 50.5, y: 17.5 }, label: 'LG' },
      { playerPosition: 'C', role: 'offensive_line', fieldPosition: { x: 53.3, y: 17.5 }, label: 'C' },
      { playerPosition: 'RG', role: 'offensive_line', fieldPosition: { x: 55.5, y: 17.5 }, label: 'RG' },
      { playerPosition: 'RT', role: 'offensive_line', fieldPosition: { x: 57.5, y: 17.5 }, label: 'RT' },

      // QB (shotgun)
      { playerPosition: 'QB', role: 'quarterback', fieldPosition: { x: 53.3, y: 24.5 }, label: 'Q' },

      // TE
      { playerPosition: 'TE', role: 'tight_end', fieldPosition: { x: 59.5, y: 17.5 }, label: 'Y' },

      // WRs (3 receivers)
      { playerPosition: 'WR', role: 'wide_receiver', fieldPosition: { x: 47.3, y: 17.5 }, label: 'X' },
      { playerPosition: 'WR', role: 'wide_receiver', fieldPosition: { x: 59.5, y: 17.5 }, label: 'Z' },
      { playerPosition: 'SLOT', role: 'slot_receiver', fieldPosition: { x: 51.3, y: 18.5 }, label: 'H' },
    ]
  }
};

// ============================================================================
// POSITIONING ENGINE
// ============================================================================

/** Formation positioning utilities and calculations */
export class FormationPositioningEngine {
  /**
   * Calculate professional depth for a player position
   */
  static getPlayerDepth(position: PlayerPosition, isShotgun: boolean = false): number {
    const upperPosition = position.toUpperCase();

    // QB depth depends on formation
    if (upperPosition.includes('QB')) {
      return isShotgun ? POSITION_DEPTHS.QB : POSITION_DEPTHS.QB_UNDER;
    }

    // Direct matches
    if (upperPosition in POSITION_DEPTHS) {
      return POSITION_DEPTHS[upperPosition as keyof typeof POSITION_DEPTHS];
    }

    // Pattern matching
    if (upperPosition.includes('RB') || upperPosition.includes('HB')) {
      return POSITION_DEPTHS.RB;
    }

    if (upperPosition.includes('FB')) {
      return POSITION_DEPTHS.FB;
    }

    if (upperPosition.includes('SLOT') || upperPosition.includes('X') || upperPosition.includes('Z')) {
      return POSITION_DEPTHS.SLOT;
    }

    if (upperPosition.includes('TE')) {
      return POSITION_DEPTHS.TE;
    }

    return POSITION_DEPTHS.DEFAULT;
  }

  /**
   * Position players in a formation using professional standards
   */
  static positionFormationPlayers(
    formation: FormationData,
    lineOfScrimmage: number = 20
  ): FormationPlayer[] {
    const template = this.findBestTemplate(formation);
    if (!template) {
      return this.generateBasicFormation(formation, lineOfScrimmage);
    }

    // Apply template with adjustments
    return template.players.map((templatePlayer, index) => ({
      ...templatePlayer,
      id: `player-${index}`,
      // Adjust Y position relative to line of scrimmage
      fieldPosition: {
        ...templatePlayer.fieldPosition,
        y: lineOfScrimmage + (templatePlayer.fieldPosition.y - 17.5) // 17.5 is template LOS
      }
    }));
  }

  /**
   * Find the best matching template for a formation
   */
  static findBestTemplate(formation: FormationData): FormationTemplate | null {
    // Find templates matching personnel
    const matchingTemplates = Object.values(FORMATION_TEMPLATES).filter(template =>
      template.personnel.rb === formation.personnel.rb &&
      template.personnel.te === formation.personnel.te &&
      template.personnel.wr === formation.personnel.wr
    );

    if (matchingTemplates.length === 0) return null;

    // Prefer templates matching formation type
    const typeMatch = matchingTemplates.find(t => t.type === formation.type);
    if (typeMatch) return typeMatch;

    // Otherwise return first match
    return matchingTemplates[0];
  }

  /**
   * Generate a basic formation when no template exists
   */
  static generateBasicFormation(
    formation: FormationData,
    lineOfScrimmage: number
  ): FormationPlayer[] {
    const players: FormationPlayer[] = [];

    // Always start with offensive line at LOS
    const olPositions = [
      { pos: 'LT', x: 48.5 },
      { pos: 'LG', x: 50.5 },
      { pos: 'C', x: 53.3 },
      { pos: 'RG', x: 55.5 },
      { pos: 'RT', x: 57.5 }
    ];

    olPositions.forEach(({ pos, x }) => {
      players.push({
        id: `ol-${pos}`,
        playerPosition: pos as PlayerPosition,
        role: 'offensive_line',
        fieldPosition: { x, y: lineOfScrimmage },
        label: pos
      });
    });

    // QB position
    const qbDepth = this.getPlayerDepth('QB', formation.type === 'Shotgun');
    players.push({
      id: 'qb',
      playerPosition: 'QB',
      role: 'quarterback',
      fieldPosition: { x: 53.3, y: lineOfScrimmage + qbDepth },
      label: 'Q'
    });

    // Skill players (RB, TE, WR)
    let _playerIndex = 6; // After OL + QB

    // RBs
    for (let i = 0; i < formation.personnel.rb; i++) {
      const depth = this.getPlayerDepth('RB');
      players.push({
        id: `rb-${i}`,
        playerPosition: 'RB',
        role: 'running_back',
        fieldPosition: { x: 53.3 + (i * 2), y: lineOfScrimmage + depth },
        label: i === 0 ? 'H' : `RB${i + 1}`
      });
      _playerIndex++;
    }

    // TEs
    for (let i = 0; i < formation.personnel.te; i++) {
      players.push({
        id: `te-${i}`,
        playerPosition: 'TE',
        role: 'tight_end',
        fieldPosition: { x: 59.5 + (i * 2), y: lineOfScrimmage },
        label: i === 0 ? 'Y' : `TE${i + 1}`
      });
      _playerIndex++;
    }

    // WRs
    const wrPositions = [
      { x: 47.3, label: 'X' }, // Left split end
      { x: 59.5, label: 'Z' }, // Right split end
      { x: 51.3, label: 'S' }, // Slot
      { x: 45.3, label: 'W' }, // Left flanker
      { x: 61.5, label: 'F' }  // Right flanker
    ];

    for (let i = 0; i < formation.personnel.wr; i++) {
      const pos = wrPositions[i] || { x: 53.3 + (i * 3), label: `WR${i + 1}` };
      const depth = pos.label === 'S' ? this.getPlayerDepth('SLOT') : this.getPlayerDepth('WR');

      players.push({
        id: `wr-${i}`,
        playerPosition: 'WR',
        role: 'wide_receiver',
        fieldPosition: { x: pos.x, y: lineOfScrimmage + depth },
        label: pos.label
      });
      _playerIndex++;
    }

    return players;
  }

  /**
   * Validate formation completeness and positioning
   */
  static validateFormation(formation: FormationData): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check player count
    const totalPlayers = formation.players.length;
    if (totalPlayers !== 11) {
      errors.push(`Formation must have 11 players (has ${totalPlayers})`);
    }

    // Check offensive line
    const olPlayers = formation.players.filter(p => p.role === 'offensive_line');
    if (olPlayers.length !== 5) {
      errors.push(`Formation must have 5 offensive linemen (has ${olPlayers.length})`);
    }

    // Check QB
    const qbPlayers = formation.players.filter(p => p.playerPosition === 'QB');
    if (qbPlayers.length !== 1) {
      errors.push(`Formation must have exactly 1 QB (has ${qbPlayers.length})`);
    }

    // Check personnel matches
    const rbCount = formation.players.filter(p => p.playerPosition === 'RB').length;
    const teCount = formation.players.filter(p => p.playerPosition === 'TE').length;
    const wrCount = formation.players.filter(p =>
      p.playerPosition === 'WR' || p.playerPosition === 'SLOT'
    ).length;

    if (rbCount !== formation.personnel.rb) {
      warnings.push(`RB count (${rbCount}) doesn't match personnel (${formation.personnel.rb})`);
    }
    if (teCount !== formation.personnel.te) {
      warnings.push(`TE count (${teCount}) doesn't match personnel (${formation.personnel.te})`);
    }
    if (wrCount !== formation.personnel.wr) {
      warnings.push(`WR count (${wrCount}) doesn't match personnel (${formation.personnel.wr})`);
    }

    // Check positioning (players should be below LOS)
    const lineOfScrimmage = 20; // Assume standard LOS
    const playersAboveLOS = formation.players.filter(p => p.fieldPosition.y < lineOfScrimmage);
    if (playersAboveLOS.length > 0) {
      warnings.push(`${playersAboveLOS.length} players positioned in defensive territory`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Mirror formation left/right
   */
  static mirrorFormation(formation: FormationData): FormationData {
    const mirroredPlayers = formation.players.map(player => ({
      ...player,
      fieldPosition: {
        x: 106.6 - player.fieldPosition.x, // Mirror across field center
        y: player.fieldPosition.y
      }
    }));

    return {
      ...formation,
      direction: formation.direction === 'left' ? 'right' : 'left',
      players: mirroredPlayers
    };
  }

  /**
   * Adjust formation for field position
   */
  static adjustForFieldPosition(
    formation: FormationData,
    _fieldPosition: number // yards from own goal
  ): FormationData {
    // Shift formation based on field position
    // Closer to goal line = more conservative formations
    // Red zone adjustments, etc.

    const adjustedPlayers = formation.players.map(player => ({
      ...player,
      // Could adjust player positioning based on field position
      // For now, just return as-is
    }));

    return {
      ...formation,
      players: adjustedPlayers
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get all available formation templates
 */
export function getFormationTemplates(): FormationTemplate[] {
  return Object.values(FORMATION_TEMPLATES);
}

/**
 * Get templates for specific personnel
 */
export function getTemplatesForPersonnel(personnel: PersonnelGrouping): FormationTemplate[] {
  return Object.values(FORMATION_TEMPLATES).filter(template =>
    template.personnel.rb === personnel.rb &&
    template.personnel.te === personnel.te &&
    template.personnel.wr === personnel.wr
  );
}

/**
 * Create formation from template
 */
export function createFormationFromTemplate(
  templateKey: string,
  customizations?: Partial<FormationData>
): FormationData | null {
  const template = FORMATION_TEMPLATES[templateKey];
  if (!template) return null;

  const formation: FormationData = {
    id: `formation-${Date.now()}`,
    name: template.name,
    category: template.category,
    type: template.type,
    direction: 'left',
    strength: 'balanced',
    personnel: { ...template.personnel },
    players: template.players.map((player, index) => ({
      ...player,
      id: `player-${index}`
    })),
    ...customizations
  };

  return formation;
}