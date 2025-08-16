/**
 * Profile Configuration Index
 *
 * Centralized export for all development profile configurations.
 * Combines modular profile definitions into a single configuration object.
 */

import { coreProfiles } from "./coreProfiles";
import { devRoleProfiles } from "./devRoleProfiles";
import { legacyProfiles } from "./legacyProfiles";

import type { DevMode, DevProfileConfig } from "../../../types/dev-profiles";

/**
 * Complete development profile configuration registry
 * Combines all profile categories into a single, type-safe configuration
 */
export const allProfileConfigs: Record<DevMode, DevProfileConfig> = {
  // Core profiles for production and development
  ...coreProfiles,

  // Development role profiles with realistic data
  ...devRoleProfiles,

  // Legacy profiles for backward compatibility
  ...legacyProfiles,
} as Record<DevMode, DevProfileConfig>;

/**
 * Get all available profile configurations
 * @returns Complete profile configuration registry
 */
export function getProfileConfigurations(): Record<DevMode, DevProfileConfig> {
  return allProfileConfigs;
}

/**
 * Get profile configuration by dev mode
 * @param devMode - The development mode
 * @returns Profile configuration or null if not found
 */
export function getProfileConfig(devMode: DevMode): DevProfileConfig | null {
  return allProfileConfigs[devMode] || null;
}

/**
 * Check if a dev mode has a valid configuration
 * @param devMode - The development mode to check
 * @returns True if configuration exists
 */
export function hasProfileConfig(devMode: DevMode): boolean {
  return devMode in allProfileConfigs;
}
