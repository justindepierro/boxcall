/**
 * RSVP Status Display Component
 */

import { Icon } from "../../ui/Icon";
import type { RSVPStatusDisplayProps } from "./types";

export function RSVPStatusDisplay({
  rsvp,
  userRole: _userRole,
}: RSVPStatusDisplayProps) {
  if (!rsvp) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "yes":
        return <Icon name="check-circle" className="text-green-500" />;
      case "no":
        return <Icon name="close" className="text-red-500" />;
      case "maybe":
        return <Icon name="warning" className="text-yellow-500" />;
      default:
        return <Icon name="clock" className="text-gray-500" />;
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h4 className="font-medium text-gray-900 mb-2">Current RSVP Status</h4>
      <div className="flex items-center gap-2">
        {getStatusIcon(rsvp.status)}
        <span className="capitalize">{rsvp.status}</span>
        {rsvp.updated_at && (
          <span className="text-sm text-gray-500 ml-2">
            Updated {new Date(rsvp.updated_at).toLocaleDateString()}
          </span>
        )}
      </div>
      {rsvp.notes && (
        <div className="mt-2">
          <p className="text-sm text-gray-600">Notes: {rsvp.notes}</p>
        </div>
      )}
    </div>
  );
}
