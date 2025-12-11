import type { UserProfile, ProfileCache } from "../types";
import { PROFILE_CACHE_TTL } from "../constants";

/**
 * In-memory profile cache with TTL support
 */
let profileCache: Map<string, ProfileCache> = new Map();

/**
 * Get a cached profile if it exists and hasn't expired
 *
 * @param userId - The user ID to look up
 * @returns The cached profile or null if not found/expired
 */
export function getCachedProfile(userId: string): UserProfile | null {
  const cached = profileCache.get(userId);
  const now = Date.now();

  if (cached && now - cached.timestamp < cached.ttl) {
    return cached.data;
  }

  return null;
}

/**
 * Cache a user profile with TTL
 *
 * @param userId - The user ID to cache
 * @param profile - The profile data to cache
 */
export function cacheProfile(userId: string, profile: UserProfile): void {
  profileCache.set(userId, {
    data: profile,
    timestamp: Date.now(),
    ttl: PROFILE_CACHE_TTL,
  });
}

/**
 * Invalidate (remove) a specific user's profile from cache
 *
 * @param userId - The user ID to invalidate
 */
export function invalidateProfileCache(userId: string): void {
  profileCache.delete(userId);
}

/**
 * Clear all cached profiles
 */
export function clearAllProfileCache(): void {
  profileCache.clear();
}

/**
 * Get the raw profile cache (for testing/debugging)
 * @internal
 */
export function getProfileCache(): Map<string, ProfileCache> {
  return profileCache;
}
