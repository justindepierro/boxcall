/**
 * RSVP Analytics Component - Placeholder
 */

import type { RSVPAnalyticsProps } from "./types";

export function RSVPAnalytics({
  eventId,
  visible,
  onToggle,
}: RSVPAnalyticsProps) {
  if (!visible) return null;

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <h4 className="font-medium text-gray-900 mb-4">RSVP Analytics</h4>
      <p className="text-sm text-gray-600">
        Analytics component for event {eventId} to be implemented...
      </p>
      <button onClick={onToggle} className="mt-2 text-blue-600 text-sm">
        Hide Analytics
      </button>
    </div>
  );
}
