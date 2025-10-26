/**
 * Simple diagram types for the new simplified diagram editor
 * Starting fresh without complex Pixi.js dependencies
 */

import type { FormationPlayerPosition } from '../types/formation';

export interface DiagramDocument {
  version: number;
  players: FormationPlayerPosition[];
  lastModified: string;
}

export interface DiagramMetadata {
  title?: string;
  description?: string;
  createdBy?: string;
  createdAt?: string;
}

export interface Player {
  id: string;
  position: string;
  x: number;
  y: number;
  team: 'offense' | 'defense';
  role?: string;
}