/**
 * RSVP Form Component
 *
 * Professional form component for handling RSVP responses
 */

import { useState } from "react";
import type { RSVPFormProps } from "./types";
import type { RSVPStatus } from "../../../types/enhanced-calendar";

export function RSVPForm({
  rsvp,
  onUpdate,
  canRespond,
  allowConditional,
  allowDetailedResponse,
  requireEmergencyContact: _requireEmergencyContact,
  allowGroupResponses: _allowGroupResponses,
  userRole: _userRole,
}: RSVPFormProps) {
  const [status, setStatus] = useState<RSVPStatus>(
    rsvp?.status || "no_response"
  );
  const [responseType, setResponseType] = useState<
    "simple" | "conditional" | "detailed"
  >(rsvp?.response_type || "simple");
  const [notes, setNotes] = useState(rsvp?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canRespond || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onUpdate({
        status,
        response_type: responseType,
        notes: notes.trim() || undefined,
        responded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to update RSVP:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canRespond) {
    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">RSVP Response</h4>
        <p className="text-sm text-gray-600">
          You cannot respond to this event at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <h4 className="font-medium text-gray-900 mb-4">Your RSVP Response</h4>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Response Type Selection */}
        {(allowConditional || allowDetailedResponse) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Response Type
            </label>
            <select
              value={responseType}
              onChange={(e) =>
                setResponseType(
                  e.target.value as "simple" | "conditional" | "detailed"
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="simple">Simple Response</option>
              {allowConditional && (
                <option value="conditional">Conditional Response</option>
              )}
              {allowDetailedResponse && (
                <option value="detailed">Detailed Response</option>
              )}
            </select>
          </div>
        )}

        {/* Status Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attendance Status *
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(
              ["attending", "not_attending", "maybe", "late"] as RSVPStatus[]
            ).map((statusOption) => (
              <button
                key={statusOption}
                type="button"
                onClick={() => setStatus(statusOption)}
                className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                  status === statusOption
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {statusOption
                  .replace("_", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Notes {responseType === "detailed" && "(Optional)"}
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional information..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting || status === "no_response"}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              isSubmitting || status === "no_response"
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {isSubmitting ? "Updating..." : "Update RSVP"}
          </button>
        </div>
      </form>
    </div>
  );
}
