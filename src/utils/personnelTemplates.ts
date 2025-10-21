/**
 * Personnel Configuration Templates
 * 
 * Standard personnel packages with default player positions
 * for quick playbook initialization.
 */

import type { PersonnelPlayer } from '../types/personnel';

export interface PersonnelTemplate {
  name: string;
  description: string;
  players: Pick<PersonnelPlayer, 'player_position' | 'label' | 'sort_order' | 'is_wildcat_qb'>[];
}

/**
 * Standard NFL Personnel Packages
 */
export const PERSONNEL_TEMPLATES: Record<string, PersonnelTemplate> = {
  '11': {
    name: '11',
    description: '1 RB, 1 TE, 3 WR - Balanced spread formation',
    players: [
      { player_position: 'QB', label: 'Q', sort_order: 0, is_wildcat_qb: false },
      { player_position: 'RB', label: 'X', sort_order: 1, is_wildcat_qb: false },
      { player_position: 'TE', label: 'Y', sort_order: 2, is_wildcat_qb: false },
      { player_position: 'WR', label: 'Z', sort_order: 3, is_wildcat_qb: false },
      { player_position: 'WR', label: 'H', sort_order: 4, is_wildcat_qb: false },
      { player_position: 'WR', label: 'F', sort_order: 5, is_wildcat_qb: false },
    ],
  },
  '12': {
    name: '12',
    description: '1 RB, 2 TE, 2 WR - Heavy run formation',
    players: [
      { player_position: 'QB', label: 'Q', sort_order: 0, is_wildcat_qb: false },
      { player_position: 'RB', label: 'X', sort_order: 1, is_wildcat_qb: false },
      { player_position: 'TE', label: 'Y', sort_order: 2, is_wildcat_qb: false },
      { player_position: 'TE', label: 'H', sort_order: 3, is_wildcat_qb: false },
      { player_position: 'WR', label: 'Z', sort_order: 4, is_wildcat_qb: false },
      { player_position: 'WR', label: 'F', sort_order: 5, is_wildcat_qb: false },
    ],
  },
  '21': {
    name: '21',
    description: '2 RB, 1 TE, 2 WR - Traditional I-formation',
    players: [
      { player_position: 'QB', label: 'Q', sort_order: 0, is_wildcat_qb: false },
      { player_position: 'RB', label: 'X', sort_order: 1, is_wildcat_qb: false },
      { player_position: 'RB', label: 'H', sort_order: 2, is_wildcat_qb: false },
      { player_position: 'TE', label: 'Y', sort_order: 3, is_wildcat_qb: false },
      { player_position: 'WR', label: 'Z', sort_order: 4, is_wildcat_qb: false },
      { player_position: 'WR', label: 'F', sort_order: 5, is_wildcat_qb: false },
    ],
  },
  '22': {
    name: '22',
    description: '2 RB, 2 TE, 1 WR - Power run formation',
    players: [
      { player_position: 'QB', label: 'Q', sort_order: 0, is_wildcat_qb: false },
      { player_position: 'RB', label: 'X', sort_order: 1, is_wildcat_qb: false },
      { player_position: 'RB', label: 'H', sort_order: 2, is_wildcat_qb: false },
      { player_position: 'TE', label: 'Y', sort_order: 3, is_wildcat_qb: false },
      { player_position: 'TE', label: 'F', sort_order: 4, is_wildcat_qb: false },
      { player_position: 'WR', label: 'Z', sort_order: 5, is_wildcat_qb: false },
    ],
  },
  '10': {
    name: '10',
    description: '1 RB, 0 TE, 4 WR - Empty spread/air raid',
    players: [
      { player_position: 'QB', label: 'Q', sort_order: 0, is_wildcat_qb: false },
      { player_position: 'RB', label: 'X', sort_order: 1, is_wildcat_qb: false },
      { player_position: 'WR', label: 'Y', sort_order: 2, is_wildcat_qb: false },
      { player_position: 'WR', label: 'Z', sort_order: 3, is_wildcat_qb: false },
      { player_position: 'WR', label: 'H', sort_order: 4, is_wildcat_qb: false },
      { player_position: 'WR', label: 'F', sort_order: 5, is_wildcat_qb: false },
    ],
  },
  '13': {
    name: '13',
    description: '1 RB, 3 TE, 1 WR - Heavy jumbo package',
    players: [
      { player_position: 'QB', label: 'Q', sort_order: 0, is_wildcat_qb: false },
      { player_position: 'RB', label: 'X', sort_order: 1, is_wildcat_qb: false },
      { player_position: 'TE', label: 'Y', sort_order: 2, is_wildcat_qb: false },
      { player_position: 'TE', label: 'H', sort_order: 3, is_wildcat_qb: false },
      { player_position: 'TE', label: 'F', sort_order: 4, is_wildcat_qb: false },
      { player_position: 'WR', label: 'Z', sort_order: 5, is_wildcat_qb: false },
    ],
  },
  '00': {
    name: '00',
    description: '0 RB, 0 TE, 5 WR - Empty backfield',
    players: [
      { player_position: 'QB', label: 'Q', sort_order: 0, is_wildcat_qb: false },
      { player_position: 'WR', label: 'X', sort_order: 1, is_wildcat_qb: false },
      { player_position: 'WR', label: 'Y', sort_order: 2, is_wildcat_qb: false },
      { player_position: 'WR', label: 'Z', sort_order: 3, is_wildcat_qb: false },
      { player_position: 'WR', label: 'H', sort_order: 4, is_wildcat_qb: false },
      { player_position: 'WR', label: 'F', sort_order: 5, is_wildcat_qb: false },
    ],
  },
  '20': {
    name: '20',
    description: '2 RB, 0 TE, 3 WR - Dual back spread',
    players: [
      { player_position: 'QB', label: 'Q', sort_order: 0, is_wildcat_qb: false },
      { player_position: 'RB', label: 'X', sort_order: 1, is_wildcat_qb: false },
      { player_position: 'RB', label: 'H', sort_order: 2, is_wildcat_qb: false },
      { player_position: 'WR', label: 'Y', sort_order: 3, is_wildcat_qb: false },
      { player_position: 'WR', label: 'Z', sort_order: 4, is_wildcat_qb: false },
      { player_position: 'WR', label: 'F', sort_order: 5, is_wildcat_qb: false },
    ],
  },
};

/**
 * Get default personnel templates for initialization
 * Returns most commonly used packages
 */
export function getDefaultTemplates(): PersonnelTemplate[] {
  return [
    PERSONNEL_TEMPLATES['11'],
    PERSONNEL_TEMPLATES['12'],
    PERSONNEL_TEMPLATES['21'],
    PERSONNEL_TEMPLATES['10'],
  ];
}

/**
 * Get all available templates
 */
export function getAllTemplates(): PersonnelTemplate[] {
  return Object.values(PERSONNEL_TEMPLATES);
}

/**
 * Get template by name
 */
export function getTemplateByName(name: string): PersonnelTemplate | undefined {
  return PERSONNEL_TEMPLATES[name];
}

/**
 * Check if a template exists
 */
export function hasTemplate(name: string): boolean {
  return name in PERSONNEL_TEMPLATES;
}
