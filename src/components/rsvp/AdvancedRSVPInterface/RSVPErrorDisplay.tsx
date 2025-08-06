/**
 * RSVP Error Display Component
 */

import { Icon } from "../../ui/Icon";

interface RSVPErrorDisplayProps {
  error: string | null;
}

export function RSVPErrorDisplay({ error }: RSVPErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center">
        <Icon name="alert" size="sm" className="text-red-400 mr-3" />
        <p className="text-sm text-red-700">{error}</p>
      </div>
    </div>
  );
}
