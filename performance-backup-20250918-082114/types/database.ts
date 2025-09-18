/**
 * BoxCall Database Types
 * Re-export from modular structure for backward compatibility
 *
 * This file maintains backward compatibility while the codebase
 * gradually migrates to the new modular structure in ./database/
 */

// Re-export everything from the modular structure
export * from "./database/index";

// Maintain compatibility by re-exporting the main Database interface
export type { Database } from "./database/index";
