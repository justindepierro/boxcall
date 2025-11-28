import type { FormationAnalysis } from "@features/defense/types";
import type { FieldPosition } from "./FieldConstants";

/**
 * Magnetic zone for intelligent player positioning
 */
export interface MagneticZone {
  /** The point where the player will snap to */
  snapPoint: FieldPosition;
  /** Distance in yards where magnetic pull begins */
  magneticRadius: number;
  /** Distance in yards where visual feedback shows */
  visualThreshold: number;
  /** Priority for conflicting zones (higher = preferred) */
  priority: number;
  /** Player roles that can use this zone */
  validRoles: string[];
  /** Formations where this zone is active */
  activeInFormations: string[];
}

/**
 * Result of magnetic zone analysis
 */
export interface MagneticSnapResult {
  /** The zone that was snapped to (or null if none) */
  zone: MagneticZone | null;
  /** Whether to show visual feedback */
  showVisualFeedback: boolean;
  /** The snap position */
  snapPosition: FieldPosition;
}

/**
 * Formation-aware magnetic grid system
 * Generates dynamic snap zones based on detected formation type
 */
export class FormationAwareMagneticGrid {
  /**
   * Generate magnetic zones for the current formation
   */
  static generateMagneticZones(
    formationAnalysis: FormationAnalysis,
    _existingPlayers: Array<{ role: string; position: FieldPosition }>
  ): MagneticZone[] {
    const zones: MagneticZone[] = [];

    // Add formation-specific zones
    switch (formationAnalysis.type) {
      case "2x2":
        zones.push(...this.generate2x2Zones(formationAnalysis));
        break;
      case "3x1-left":
        zones.push(...this.generate3x1LeftZones(formationAnalysis));
        break;
      case "3x1-right":
        zones.push(...this.generate3x1RightZones(formationAnalysis));
        break;
      case "trips":
        zones.push(...this.generateTripsZones(formationAnalysis));
        break;
      case "empty":
        zones.push(...this.generateEmptyZones(formationAnalysis));
        break;
      case "doubles":
        zones.push(...this.generateDoublesZones(formationAnalysis));
        break;
      case "quads":
        zones.push(...this.generateQuadsZones(formationAnalysis));
        break;
      default:
        zones.push(...this.generate2x2Zones(formationAnalysis)); // fallback
    }

    // Add universal QB zones
    zones.push(...this.generateQBZones(formationAnalysis));

    return zones;
  }

  /**
   * Generate zones for 2x2 formation (balanced)
   */
  private static generate2x2Zones(
    _formationAnalysis: FormationAnalysis
  ): MagneticZone[] {
    return [
      // Left side WRs
      {
        snapPoint: { x: 8, y: 15 },
        magneticRadius: 3.0,
        visualThreshold: 2.0,
        priority: 1,
        validRoles: ["WR", "X", "Z"],
        activeInFormations: ["2x2"],
      },
      {
        snapPoint: { x: 17.5, y: 12 },
        magneticRadius: 3.0,
        visualThreshold: 2.0,
        priority: 1,
        validRoles: ["WR", "X", "Z"],
        activeInFormations: ["2x2"],
      },
      // Right side WRs
      {
        snapPoint: { x: 45, y: 15 },
        magneticRadius: 3.0,
        visualThreshold: 2.0,
        priority: 1,
        validRoles: ["WR", "X", "Z"],
        activeInFormations: ["2x2"],
      },
      {
        snapPoint: { x: 35.83, y: 12 },
        magneticRadius: 3.0,
        visualThreshold: 2.0,
        priority: 1,
        validRoles: ["WR", "X", "Z"],
        activeInFormations: ["2x2"],
      },
    ];
  }

  /**
   * Generate zones for 3x1-left formation
   */
  private static generate3x1LeftZones(
    _formationAnalysis: FormationAnalysis
  ): MagneticZone[] {
    return [
      // Strong side (left) - 3 WRs
      {
        snapPoint: { x: 8, y: 15 },
        magneticRadius: 3.0,
        visualThreshold: 2.0,
        priority: 2,
        validRoles: ["WR", "X", "Z"],
        activeInFormations: ["3x1-left"],
      },
      {
        snapPoint: { x: 17.5, y: 12 },
        magneticRadius: 3.0,
        visualThreshold: 2.0,
        priority: 2,
        validRoles: ["WR", "X", "Z"],
        activeInFormations: ["3x1-left"],
      },
      {
        snapPoint: { x: 12, y: 8 },
        magneticRadius: 3.0,
        visualThreshold: 2.0,
        priority: 2,
        validRoles: ["WR", "X", "Z"],
        activeInFormations: ["3x1-left"],
      },
      // Weak side (right) - 1 WR
      {
        snapPoint: { x: 45, y: 15 },
        magneticRadius: 3.0,
        visualThreshold: 2.0,
        priority: 1,
        validRoles: ["WR", "X", "Z"],
        activeInFormations: ["3x1-left"],
      },
    ];
  }

  /**
   * Generate zones for 3x1-right formation
   */
  private static generate3x1RightZones(
    _formationAnalysis: FormationAnalysis
  ): MagneticZone[] {
    return [
      // Strong side (right) - 3 WRs
      {
        snapPoint: { x: 45, y: 15 },
        magneticRadius: 3.0,
        visualThreshold: 2.0,
        priority: 2,
        validRoles: ["WR", "X", "Z"],
        activeInFormations: ["3x1-right"],
      },
      {
        snapPoint: { x: 35.83, y: 12 },
        magneticRadius: 3.0,
        visualThreshold: 2.0,
        priority: 2,
        validRoles: ["WR", "X", "Z"],
        activeInFormations: ["3x1-right"],
      },
      {
        snapPoint: { x: 41, y: 8 },
        magneticRadius: 3.0,
        visualThreshold: 2.0,
        priority: 2,
        validRoles: ["WR", "X", "Z"],
        activeInFormations: ["3x1-right"],
      },
      // Weak side (left) - 1 WR
      {
        snapPoint: { x: 8, y: 15 },
        magneticRadius: 3.0,
        visualThreshold: 2.0,
        priority: 1,
        validRoles: ["WR", "X", "Z"],
        activeInFormations: ["3x1-right"],
      },
    ];
  }

  /**
   * Generate zones for trips formation
   */
  private static generateTripsZones(
    formationAnalysis: FormationAnalysis
  ): MagneticZone[] {
    const zones: MagneticZone[] = [];

    if (formationAnalysis.strengthSide === "left") {
      // Trips left - 3 WRs on left, 1 on right
      zones.push(
        {
          snapPoint: { x: 8, y: 15 },
          magneticRadius: 3.0,
          visualThreshold: 2.0,
          priority: 2,
          validRoles: ["WR", "X", "Z"],
          activeInFormations: ["trips"],
        },
        {
          snapPoint: { x: 17.5, y: 12 },
          magneticRadius: 3.0,
          visualThreshold: 2.0,
          priority: 2,
          validRoles: ["WR", "X", "Z"],
          activeInFormations: ["trips"],
        },
        {
          snapPoint: { x: 12, y: 8 },
          magneticRadius: 3.0,
          visualThreshold: 2.0,
          priority: 2,
          validRoles: ["WR", "X", "Z"],
          activeInFormations: ["trips"],
        },
        {
          snapPoint: { x: 45, y: 15 },
          magneticRadius: 3.0,
          visualThreshold: 2.0,
          priority: 1,
          validRoles: ["WR", "X", "Z"],
          activeInFormations: ["trips"],
        }
      );
    } else {
      // Trips right - 3 WRs on right, 1 on left
      zones.push(
        {
          snapPoint: { x: 45, y: 15 },
          magneticRadius: 3.0,
          visualThreshold: 2.0,
          priority: 2,
          validRoles: ["WR", "X", "Z"],
          activeInFormations: ["trips"],
        },
        {
          snapPoint: { x: 35.83, y: 12 },
          magneticRadius: 3.0,
          visualThreshold: 2.0,
          priority: 2,
          validRoles: ["WR", "X", "Z"],
          activeInFormations: ["trips"],
        },
        {
          snapPoint: { x: 41, y: 8 },
          magneticRadius: 3.0,
          visualThreshold: 2.0,
          priority: 2,
          validRoles: ["WR", "X", "Z"],
          activeInFormations: ["trips"],
        },
        {
          snapPoint: { x: 8, y: 15 },
          magneticRadius: 3.0,
          visualThreshold: 2.0,
          priority: 1,
          validRoles: ["WR", "X", "Z"],
          activeInFormations: ["trips"],
        }
      );
    }

    return zones;
  }

  /**
   * Generate zones for empty formation (5 WRs)
   */
  private static generateEmptyZones(
    _formationAnalysis: FormationAnalysis
  ): MagneticZone[] {
    return [
      // Left side
      {
        snapPoint: { x: 8, y: 15 },
        magneticRadius: 3.0,
        visualThreshold: 2.0,
        priority: 1,
        validRoles: ["WR", "X", "Z"],
        activeInFormations: ["empty"],
      },
      {
        snapPoint: { x: 17.5, y: 12 },
        magneticRadius: 3.0,
        visualThreshold: 2.0,
        priority: 1,
        validRoles: ["WR", "X", "Z"],
        activeInFormations: ["empty"],
      },
      {
        snapPoint: { x: 12, y: 8 },
        magneticRadius: 3.0,
        visualThreshold: 2.0,
        priority: 1,
        validRoles: ["WR", "X", "Z"],
        activeInFormations: ["empty"],
      },
      // Right side
      {
        snapPoint: { x: 45, y: 15 },
        magneticRadius: 3.0,
        visualThreshold: 2.0,
        priority: 1,
        validRoles: ["WR", "X", "Z"],
        activeInFormations: ["empty"],
      },
      {
        snapPoint: { x: 35.83, y: 12 },
        magneticRadius: 3.0,
        visualThreshold: 2.0,
        priority: 1,
        validRoles: ["WR", "X", "Z"],
        activeInFormations: ["empty"],
      },
    ];
  }

  /**
   * Generate zones for doubles formation
   */
  private static generateDoublesZones(
    _formationAnalysis: FormationAnalysis
  ): MagneticZone[] {
    return [
      // Two TEs
      {
        snapPoint: { x: 17.5, y: 18 },
        magneticRadius: 3.0,
        visualThreshold: 2.0,
        priority: 2,
        validRoles: ["TE", "Y"],
        activeInFormations: ["doubles"],
      },
      {
        snapPoint: { x: 35.83, y: 18 },
        magneticRadius: 3.0,
        visualThreshold: 2.0,
        priority: 2,
        validRoles: ["TE", "Y"],
        activeInFormations: ["doubles"],
      },
      // Two WRs
      {
        snapPoint: { x: 8, y: 15 },
        magneticRadius: 3.0,
        visualThreshold: 2.0,
        priority: 1,
        validRoles: ["WR", "X", "Z"],
        activeInFormations: ["doubles"],
      },
      {
        snapPoint: { x: 45, y: 15 },
        magneticRadius: 3.0,
        visualThreshold: 2.0,
        priority: 1,
        validRoles: ["WR", "X", "Z"],
        activeInFormations: ["doubles"],
      },
    ];
  }

  /**
   * Generate zones for quads formation
   */
  private static generateQuadsZones(
    _formationAnalysis: FormationAnalysis
  ): MagneticZone[] {
    return [
      // Four TEs
      {
        snapPoint: { x: 17.5, y: 18 },
        magneticRadius: 3.0,
        visualThreshold: 2.0,
        priority: 2,
        validRoles: ["TE", "Y"],
        activeInFormations: ["quads"],
      },
      {
        snapPoint: { x: 35.83, y: 18 },
        magneticRadius: 3.0,
        visualThreshold: 2.0,
        priority: 2,
        validRoles: ["TE", "Y"],
        activeInFormations: ["quads"],
      },
      {
        snapPoint: { x: 12, y: 15 },
        magneticRadius: 3.0,
        visualThreshold: 2.0,
        priority: 2,
        validRoles: ["TE", "Y"],
        activeInFormations: ["quads"],
      },
      {
        snapPoint: { x: 41, y: 15 },
        magneticRadius: 3.0,
        visualThreshold: 2.0,
        priority: 2,
        validRoles: ["TE", "Y"],
        activeInFormations: ["quads"],
      },
    ];
  }

  /**
   * Generate universal QB zones
   */
  private static generateQBZones(
    formationAnalysis: FormationAnalysis
  ): MagneticZone[] {
    const zones: MagneticZone[] = [];

    // Under center
    zones.push({
      snapPoint: { x: 26.67, y: 20 },
      magneticRadius: 2.0,
      visualThreshold: 1.5,
      priority: 10, // High priority for QB
      validRoles: ["QB"],
      activeInFormations: [
        "2x2",
        "3x1-left",
        "3x1-right",
        "trips",
        "empty",
        "doubles",
        "quads",
      ],
    });

    // Shotgun
    zones.push({
      snapPoint: { x: 26.67, y: 15 },
      magneticRadius: 2.0,
      visualThreshold: 1.5,
      priority: 10,
      validRoles: ["QB"],
      activeInFormations: [
        "2x2",
        "3x1-left",
        "3x1-right",
        "trips",
        "empty",
        "doubles",
        "quads",
      ],
    });

    // Pistol (if RB position indicates pistol)
    if (formationAnalysis.rbPosition === "pistol") {
      zones.push({
        snapPoint: { x: 26.67, y: 12 },
        magneticRadius: 2.0,
        visualThreshold: 1.5,
        priority: 10,
        validRoles: ["QB"],
        activeInFormations: [
          "2x2",
          "3x1-left",
          "3x1-right",
          "trips",
          "empty",
          "doubles",
          "quads",
        ],
      });
    }

    return zones;
  }

  /**
   * Find the nearest magnetic zone for a player position
   */
  static findNearestMagneticZone(
    playerX: number,
    playerY: number,
    playerRole: string,
    zones: MagneticZone[]
  ): MagneticSnapResult {
    let nearestZone: MagneticZone | null = null;
    let nearestDistance = Infinity;
    let showVisualFeedback = false;

    for (const zone of zones) {
      // Check if this zone is valid for the player role
      if (!zone.validRoles.includes(playerRole)) {
        continue;
      }

      // Calculate distance to zone
      const distance = Math.sqrt(
        Math.pow(playerX - zone.snapPoint.x, 2) +
          Math.pow(playerY - zone.snapPoint.y, 2)
      );

      // Check if within visual threshold
      if (distance <= zone.visualThreshold) {
        showVisualFeedback = true;
      }

      // Check if within magnetic radius and closer than current nearest
      if (distance <= zone.magneticRadius && distance < nearestDistance) {
        nearestZone = zone;
        nearestDistance = distance;
      }
    }

    return {
      zone: nearestZone,
      showVisualFeedback,
      snapPosition: nearestZone
        ? nearestZone.snapPoint
        : { x: playerX, y: playerY },
    };
  }
}

// Export static methods as standalone functions for backward compatibility
export const generateMagneticZones =
  FormationAwareMagneticGrid.generateMagneticZones;
export const findNearestMagneticZone =
  FormationAwareMagneticGrid.findNearestMagneticZone;
