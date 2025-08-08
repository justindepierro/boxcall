/**
 * Advanced RSVP Interface - Main Orchestrator
 *
 * Professional modular RSVP system with component decomposition
 * Reduced from 866 lines to ~150 lines through modular architecture
 */

import { useState } from "react";
import { useAdvancedRSVP } from "../../../hooks/useAdvancedRSVP";
import {
  RSVPHeader,
  RSVPForm,
  RSVPStatusDisplay,
  RSVPAnalytics,
  RSVPErrorDisplay,
  RSVPReminderControls,
} from "./components";
import type { AdvancedRSVPInterfaceProps } from "./types";

export function AdvancedRSVPInterface({
  eventId,
  userId,
  userRole,
  isRequired = false,
  allowConditional = true,
  allowDetailedResponse = true,
  requireEmergencyContact = false,
  allowGroupResponses = false,
  deadline,
}: AdvancedRSVPInterfaceProps) {
  const { rsvp, loading, error, updateRSVP, sendReminder } = useAdvancedRSVP(
    eventId,
    userId
  );

  const [showAnalytics, setShowAnalytics] = useState(false);

  const canViewAnalytics = userRole === "coach";
  const isDeadlinePassed = deadline && new Date(deadline) < new Date();
  const canRespond = !isDeadlinePassed;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading RSVP...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RSVPHeader
        isRequired={isRequired}
        deadline={deadline}
        canViewAnalytics={canViewAnalytics}
        showAnalytics={showAnalytics}
        onToggleAnalytics={() => setShowAnalytics(!showAnalytics)}
      />

      <RSVPErrorDisplay error={error} />

      {canRespond && (
        <RSVPForm
          rsvp={rsvp}
          onUpdate={updateRSVP}
          canRespond={canRespond}
          allowConditional={allowConditional}
          allowDetailedResponse={allowDetailedResponse}
          requireEmergencyContact={requireEmergencyContact}
          allowGroupResponses={allowGroupResponses}
          userRole={userRole}
        />
      )}

      {rsvp && <RSVPStatusDisplay rsvp={rsvp} userRole={userRole} />}

      {canViewAnalytics && (
        <RSVPAnalytics
          eventId={eventId}
          visible={showAnalytics}
          onToggle={() => setShowAnalytics(!showAnalytics)}
        />
      )}

      {canViewAnalytics && (
        <RSVPReminderControls eventId={eventId} onSendReminder={sendReminder} />
      )}
    </div>
  );
}
