/**
 * RSVP Reminder Controls Component - Placeholder
 */

interface RSVPReminderControlsProps {
  eventId: string;
  onSendReminder: () => Promise<void>;
}

export function RSVPReminderControls({
  eventId,
  onSendReminder,
}: RSVPReminderControlsProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <h4 className="font-medium text-gray-900 mb-4">Reminder Controls</h4>
      <p className="text-sm text-gray-600 mb-2">
        Reminder controls for event {eventId}
      </p>
      <button
        onClick={onSendReminder}
        className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
      >
        Send Reminder
      </button>
    </div>
  );
}
