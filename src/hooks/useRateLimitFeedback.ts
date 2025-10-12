import { useState, useEffect } from "react";
import { rateLimiter, getUserRateLimitKey } from "../utils/rateLimiter";
import { useAuthUser } from "../app/auth-store";

interface RateLimitFeedback {
  remaining: number;
  total: number;
  resetTime: number | null;
  isNearLimit: boolean;
  isLimited: boolean;
  secondsUntilReset: number;
}

/**
 * Hook to provide real-time rate limit feedback to users
 * Shows remaining attempts and countdown timer
 *
 * @param action - The action being rate limited (e.g., 'play-create')
 * @param maxRequests - Maximum requests allowed in the time window (default: 10)
 * @returns Rate limit status and feedback
 *
 * @example
 * ```tsx
 * const { remaining, isNearLimit, secondsUntilReset } = useRateLimitFeedback('play-create', 10);
 *
 * {isNearLimit && (
 *   <Badge variant="warning">
 *     {remaining} creates remaining
 *   </Badge>
 * )}
 * ```
 */
export function useRateLimitFeedback(
  action: string,
  maxRequests: number = 10
): RateLimitFeedback {
  const user = useAuthUser();
  const [feedback, setFeedback] = useState<RateLimitFeedback>({
    remaining: maxRequests,
    total: maxRequests,
    resetTime: null,
    isNearLimit: false,
    isLimited: false,
    secondsUntilReset: 0,
  });

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const updateFeedback = () => {
      const key = getUserRateLimitKey(user.id, action);
      const remaining = rateLimiter.getRemaining(key, maxRequests);
      const resetTime = rateLimiter.getResetTime(key);

      const now = Date.now();
      const secondsUntilReset = resetTime
        ? Math.ceil((resetTime - now) / 1000)
        : 0;

      setFeedback({
        remaining,
        total: maxRequests,
        resetTime,
        isNearLimit: remaining <= 3 && remaining > 0,
        isLimited: remaining === 0,
        secondsUntilReset: Math.max(0, secondsUntilReset),
      });
    };

    // Update immediately
    updateFeedback();

    // Update every second for real-time countdown
    const interval = setInterval(updateFeedback, 1000);

    return () => clearInterval(interval);
  }, [user?.id, action, maxRequests]);

  return feedback;
}

/**
 * Format seconds into human-readable time
 * @example
 * formatCountdown(65) // "1:05"
 * formatCountdown(5) // "0:05"
 */
export function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Get a user-friendly message for rate limit status
 */
export function getRateLimitMessage(feedback: RateLimitFeedback): string {
  if (feedback.isLimited) {
    return `Rate limit reached. Try again in ${formatCountdown(feedback.secondsUntilReset)}.`;
  }

  if (feedback.isNearLimit) {
    return `${feedback.remaining} attempt${feedback.remaining === 1 ? "" : "s"} remaining this minute.`;
  }

  return "";
}
