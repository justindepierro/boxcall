/**
 * Streamlined RSVP Hook
 * Extracted from massive useEnhancedCalendar to keep only what's used
 */
import { useCallback, useState } from "react";
import { rsvpService } from "../services/rsvpService";
import type { AdvancedRSVP } from "../types/rsvp";

export function useAdvancedRSVP(eventId: string, userId: string) {
  const [rsvp, setRsvp] = useState<AdvancedRSVP | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateRSVP = useCallback(
    async (rsvpData: Partial<AdvancedRSVP>) => {
      setLoading(true);
      setError(null);
      try {
        const updatedRSVP = await rsvpService.updateRSVP(
          eventId,
          userId,
          rsvpData
        );
        setRsvp(updatedRSVP);
        return updatedRSVP;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update RSVP");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [eventId, userId]
  );

  const sendReminder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await rsvpService.sendRSVPReminders(eventId, [userId]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reminder");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [eventId, userId]);

  return {
    rsvp,
    loading,
    error,
    updateRSVP,
    sendReminder,
  };
}
