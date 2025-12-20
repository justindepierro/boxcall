/**
 * Secure Plays Service Wrapper
 *
 * Adds validation, rate limiting, and security monitoring to PlaysService
 * This wrapper should be used instead of calling PlaysService directly
 */

import { PlaysService } from "./playsService";
import {
  validatePlayCreate,
  validatePlayUpdate,
  type PlayCreateInput,
  type PlayUpdateInput,
} from "../validation-services/playSchemas";
import {
  rateLimiter,
  RateLimitPresets,
  getUserRateLimitKey,
  isRateLimitError,
} from "../utils/rateLimiter";
import { getCurrentUserId } from "../lib/auth-helpers";
import type { Play } from "../types/play";
import { ensureValidFormation } from "../utils/formationGuard";
import { debug, logError, warn } from "../utils/logger";

// ========================================
// Security Events Tracking
// ========================================

interface SecurityEvent {
  type:
    | "validation_error"
    | "rate_limit"
    | "auth_failure"
    | "rls_violation"
    | "suspicious_activity";
  severity: "low" | "medium" | "high";
  action: string;
  userId?: string;
  details: Record<string, any>;
  timestamp: Date;
}

const securityEvents: SecurityEvent[] = [];

type RateLimitPreset = (typeof RateLimitPresets)[keyof typeof RateLimitPresets];

function requireAuthenticatedUserForPlayAction(params: {
  action: SecurityEvent["action"];
  playId?: string;
  message: string;
}) {
  const userId = getCurrentUserId();
  if (userId) return userId;

  trackSecurityEvent({
    type: "auth_failure",
    severity: "high",
    action: params.action,
    details: {
      error: "Not authenticated",
      ...(params.playId ? { playId: params.playId } : null),
    },
  });

  throw new Error(params.message);
}

function buildRateLimitMessage(activity: string, seconds: number) {
  if (seconds > 60) {
    return `You're ${activity} too quickly. Please wait ${Math.ceil(seconds / 60)} minute(s) before trying again.`;
  }
  return `You're ${activity} too quickly. Please wait ${seconds} seconds before trying again.`;
}

function checkRateLimitOrThrow(params: {
  rateLimitKey: string;
  preset: RateLimitPreset;
  userId: string;
  action: SecurityEvent["action"];
  activity: string;
  playId?: string;
}) {
  try {
    rateLimiter.checkOrThrow(params.rateLimitKey, params.preset);
  } catch (error) {
    if (isRateLimitError(error)) {
      trackSecurityEvent({
        type: "rate_limit",
        severity: "medium",
        action: params.action,
        userId: params.userId,
        details: {
          ...(params.playId ? { playId: params.playId } : null),
          limit: params.preset.maxRequests,
          window: params.preset.windowMs,
          retryAfter: error.retryAfterSeconds,
        },
      });

      throw new Error(
        buildRateLimitMessage(params.activity, error.retryAfterSeconds)
      );
    }
    throw error;
  }
}

function validatePlayUpdateOrThrow(params: {
  id: string;
  updates: unknown;
  userId: string;
}): PlayUpdateInput {
  try {
    return validatePlayUpdate({
      ...(params.updates as Record<string, any>),
      id: params.id,
    });
  } catch (error: any) {
    trackSecurityEvent({
      type: "validation_error",
      severity: "low",
      action: "update_play",
      userId: params.userId,
      details: {
        playId: params.id,
        error: error.message,
        issues: error.issues || [],
      },
    });
    throw new Error(`Invalid update data: ${error.message}`);
  }
}

function trackSecurityEvent(event: Omit<SecurityEvent, "timestamp">) {
  const fullEvent: SecurityEvent = {
    ...event,
    timestamp: new Date(),
  };

  securityEvents.push(fullEvent);

  // Keep only last 1000 events
  if (securityEvents.length > 1000) {
    securityEvents.shift();
  }

  // Log based on severity
  const prefix = `[SECURITY:${event.severity.toUpperCase()}]`;
  const message = `${event.type} - ${event.action}`;

  switch (event.severity) {
    case "high":
      logError(prefix, message, event.details);
      break;
    case "medium":
      warn(prefix, message, event.details);
      break;
    case "low":
      debug(prefix, message, event.details);
      break;
  }
}

// ========================================
// Secure PlaysService Class
// ========================================

export class SecurePlaysService {
  /**
   * Create a new play with validation and rate limiting
   */
  static async createPlay(playData: unknown): Promise<Play> {
    try {
      // Get current user for rate limiting
      const userId = getCurrentUserId();

      if (!userId) {
        trackSecurityEvent({
          type: "auth_failure",
          severity: "high",
          action: "create_play",
          details: { error: "Not authenticated" },
        });
        throw new Error("Authentication required to create plays");
      }

      // Rate limit check
      const rateLimitKey = getUserRateLimitKey(userId, "play-create");
      try {
        rateLimiter.checkOrThrow(rateLimitKey, RateLimitPresets.PLAY_CREATE);
      } catch (error) {
        if (isRateLimitError(error)) {
          trackSecurityEvent({
            type: "rate_limit",
            severity: "medium",
            action: "create_play",
            userId,
            details: {
              limit: RateLimitPresets.PLAY_CREATE.maxRequests,
              window: RateLimitPresets.PLAY_CREATE.windowMs,
              retryAfter: error.retryAfterSeconds,
            },
          });

          // Enhance error message with retry time
          const seconds = error.retryAfterSeconds;
          const message =
            seconds > 60
              ? `You're creating plays too quickly. Please wait ${Math.ceil(seconds / 60)} minute(s) before trying again.`
              : `You're creating plays too quickly. Please wait ${seconds} seconds before trying again.`;
          throw new Error(message);
        }
        throw error;
      }

      // Validate input
      let validated: PlayCreateInput;
      try {
        const playDataObj: Record<string, unknown> =
          playData && typeof playData === "object" && !Array.isArray(playData)
            ? (playData as Record<string, unknown>)
            : {};

        // Clean up empty strings/null before validation
        const cleanedData = Object.fromEntries(
          Object.entries(playDataObj)
            .map(([key, value]) => [
              key,
              value === "" || value === null ? undefined : value,
            ])
            .filter(([_, value]) => value !== undefined)
        );

        validated = validatePlayCreate(cleanedData);
      } catch (error: any) {
        trackSecurityEvent({
          type: "validation_error",
          severity: "low",
          action: "create_play",
          userId,
          details: {
            error: error.message,
            issues: error.issues || [],
          },
        });
        throw new Error(`Invalid play data: ${error.message}`);
      }

      // Validate formation & personnel
      const formationResult = await ensureValidFormation({
        playbookId: validated.playbook_id,
        formationId: validated.formation_id,
        formationName: validated.formation,
        personnel: validated.personnel,
        allowCustom: true,
      });

      if (formationResult.formationId) {
        validated.formation_id = formationResult.formationId;
      }

      if (formationResult.formationName) {
        validated.formation = formationResult.formationName;
      }

      // Call underlying service
      return await PlaysService.createPlay(validated);
    } catch (error) {
      // Track RLS violations
      if (
        error instanceof Error &&
        (error.message.includes("policy") ||
          error.message.includes("permission"))
      ) {
        const catchUserId = getCurrentUserId();
        trackSecurityEvent({
          type: "rls_violation",
          severity: "high",
          action: "create_play",
          userId: catchUserId ?? undefined,
          details: {
            error: error.message,
          },
        });
      }
      throw error;
    }
  }

  /**
   * Update an existing play with validation and rate limiting
   */
  static async updatePlay(id: string, updates: unknown): Promise<Play> {
    try {
      // Get current user for rate limiting
      const userId = requireAuthenticatedUserForPlayAction({
        action: "update_play",
        playId: id,
        message: "Authentication required to update plays",
      });

      // Rate limit check
      const rateLimitKey = getUserRateLimitKey(userId, "play-update");
      checkRateLimitOrThrow({
        rateLimitKey,
        preset: RateLimitPresets.PLAY_UPDATE,
        userId,
        action: "update_play",
        activity: "updating plays",
        playId: id,
      });

      // Validate input (add id to updates for validation)
      const validated = validatePlayUpdateOrThrow({ id, updates, userId });

      const existingPlay = await PlaysService.getPlay(id);
      if (!existingPlay) {
        throw new Error("Play not found");
      }

      const formationResult = await ensureValidFormation({
        playbookId: existingPlay.playbook_id,
        formationId:
          validated.formation_id ?? existingPlay.formation_id ?? undefined,
        formationName:
          validated.formation ?? existingPlay.formation ?? undefined,
        personnel: validated.personnel ?? undefined,
        allowCustom: true,
      });

      if (formationResult.formationId) {
        validated.formation_id = formationResult.formationId;
      }

      if (formationResult.formationName && !validated.formation) {
        validated.formation = formationResult.formationName;
      }

      // Call underlying service
      return await PlaysService.updatePlay(id, validated);
    } catch (error) {
      // Track RLS violations
      if (
        error instanceof Error &&
        (error.message.includes("policy") ||
          error.message.includes("permission"))
      ) {
        const catchUserId = getCurrentUserId();
        trackSecurityEvent({
          type: "rls_violation",
          severity: "high",
          action: "update_play",
          userId: catchUserId ?? undefined,
          details: {
            playId: id,
            error: error.message,
          },
        });
      }
      throw error;
    }
  }

  /**
   * Delete a play with rate limiting
   */
  static async deletePlay(id: string): Promise<void> {
    try {
      // Get current user for rate limiting
      const userId = getCurrentUserId();

      if (!userId) {
        trackSecurityEvent({
          type: "auth_failure",
          severity: "high",
          action: "delete_play",
          details: { error: "Not authenticated", playId: id },
        });
        throw new Error("Authentication required to delete plays");
      }

      // Rate limit check
      const rateLimitKey = getUserRateLimitKey(userId, "play-delete");
      try {
        rateLimiter.checkOrThrow(rateLimitKey, RateLimitPresets.PLAY_DELETE);
      } catch (error) {
        if (isRateLimitError(error)) {
          trackSecurityEvent({
            type: "rate_limit",
            severity: "medium",
            action: "delete_play",
            userId,
            details: {
              playId: id,
              limit: RateLimitPresets.PLAY_DELETE.maxRequests,
              window: RateLimitPresets.PLAY_DELETE.windowMs,
            },
          });
        }
        throw error;
      }

      // Call underlying service
      await PlaysService.deletePlay(id);
    } catch (error) {
      // Track RLS violations
      if (
        error instanceof Error &&
        (error.message.includes("policy") ||
          error.message.includes("permission"))
      ) {
        const catchUserId = getCurrentUserId();
        trackSecurityEvent({
          type: "rls_violation",
          severity: "high",
          action: "delete_play",
          userId: catchUserId ?? undefined,
          details: {
            playId: id,
            error: error.message,
          },
        });
      }
      throw error;
    }
  }

  /**
   * Safe create play with detailed validation errors
   */
  static async safeCreatePlay(playData: unknown): Promise<{
    success: boolean;
    data?: Play;
    error?: string;
    validationErrors?: any[];
  }> {
    try {
      const play = await this.createPlay(playData);
      return { success: true, data: play };
    } catch (error: any) {
      if (error.issues) {
        // Zod validation error
        return {
          success: false,
          error: "Validation failed",
          validationErrors: error.issues,
        };
      }
      if (isRateLimitError(error)) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: error.message || "Failed to create play",
      };
    }
  }

  /**
   * Get plays by playbook (no rate limit, read-only)
   */
  static async getPlaysByPlaybook(playbookId: string): Promise<Play[]> {
    return PlaysService.getPlaysByPlaybook(playbookId);
  }

  /**
   * Get single play (no rate limit, read-only)
   */
  static async getPlay(id: string): Promise<Play | null> {
    return PlaysService.getPlay(id);
  }

  /**
   * Get security events (for monitoring dashboard)
   */
  static getSecurityEvents(): SecurityEvent[] {
    return [...securityEvents];
  }

  /**
   * Get security events by type
   */
  static getSecurityEventsByType(type: SecurityEvent["type"]): SecurityEvent[] {
    return securityEvents.filter((event) => event.type === type);
  }

  /**
   * Get recent security events (last N events)
   */
  static getRecentSecurityEvents(count: number = 10): SecurityEvent[] {
    return securityEvents.slice(-count);
  }

  /**
   * Clear security events log
   */
  static clearSecurityEvents(): void {
    securityEvents.length = 0;
  }
}

// Export as default for convenience
export default SecurePlaysService;

// Also re-export validation types
export type {
  PlayCreateInput,
  PlayUpdateInput,
} from "../validation-services/playSchemas";
export { isRateLimitError, RateLimitError } from "../utils/rateLimiter";
