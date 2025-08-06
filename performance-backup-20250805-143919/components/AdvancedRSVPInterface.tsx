// Advanced RSVP Interface for Phase 2.3
// Enhanced RSVP system with conditional responses and detailed information
import React, { useState } from "react";
import {
  useAdvancedRSVP,
  useRSVPAnalytics,
} from "../hooks/useEnhancedCalendar";
import type {
  AdvancedRSVP,
  EmergencyContact,
  RSVPCondition,
  RSVPStatus,
} from "../types/enhanced-calendar";
interface AdvancedRSVPInterfaceProps {
  eventId: string;
  userId: string;
  userRole: "coach" | "player" | "parent";
  isRequired?: boolean;
  allowConditional?: boolean;
  allowDetailedResponse?: boolean;
  requireEmergencyContact?: boolean;
  allowGroupResponses?: boolean;
  deadline?: string;
}
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
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Event RSVP {isRequired && <span className="text-red-500">*</span>}
          </h3>
          {deadline && (
            <p className="text-sm text-gray-600">
              Deadline: {new Date(deadline).toLocaleDateString()} at{" "}
              {new Date(deadline).toLocaleTimeString()}
              {isDeadlinePassed && (
                <span className="text-red-600 ml-2">(Expired)</span>
              )}
            </p>
          )}
        </div>
        {canViewAnalytics && (
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showAnalytics ? "Hide" : "View"} Analytics
          </button>
        )}
      </div>
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-red-400 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
      {/* RSVP Form */}
      {canRespond && (
        <RSVPForm
          eventId={eventId}
          userId={userId}
          currentRSVP={rsvp}
          allowConditional={allowConditional}
          allowDetailedResponse={allowDetailedResponse}
          requireEmergencyContact={requireEmergencyContact}
          allowGroupResponses={allowGroupResponses}
          onUpdate={updateRSVP}
          loading={loading}
        />
      )}
      {/* Current RSVP Display */}
      {rsvp && !canRespond && <RSVPDisplay rsvp={rsvp} />}
      {/* Analytics Panel */}
      {showAnalytics && canViewAnalytics && (
        <RSVPAnalyticsPanel eventId={eventId} />
      )}
      {/* Reminder Controls */}
      {userRole === "coach" && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-900 mb-2">
            Coach Controls
          </h4>
          <button
            onClick={sendReminder}
            disabled={loading}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            Send RSVP Reminder
          </button>
        </div>
      )}
      {!canRespond && !rsvp && (
        <div className="text-center py-8 text-gray-500">
          {isDeadlinePassed
            ? "RSVP deadline has passed"
            : "No RSVP response yet"}
        </div>
      )}
    </div>
  );
}
// ============================================================================
// RSVP FORM
// ============================================================================
interface RSVPFormProps {
  eventId: string;
  userId: string;
  currentRSVP: AdvancedRSVP | null;
  allowConditional: boolean;
  allowDetailedResponse: boolean;
  requireEmergencyContact: boolean;
  allowGroupResponses: boolean;
  onUpdate: (rsvpData: Partial<AdvancedRSVP>) => Promise<AdvancedRSVP>;
  loading: boolean;
}
function RSVPForm({
  currentRSVP,
  allowConditional,
  allowDetailedResponse,
  requireEmergencyContact,
  allowGroupResponses,
  onUpdate,
  loading,
}: RSVPFormProps) {
  const [formData, setFormData] = useState<Partial<AdvancedRSVP>>({
    status: "no_response",
    response_type: "simple",
    confidence_level: 3,
    ...currentRSVP,
  });
  const [conditions, setConditions] = useState<RSVPCondition[]>(
    currentRSVP?.conditions || []
  );
  const [emergencyContact, setEmergencyContact] = useState<
    EmergencyContact | undefined
  >(currentRSVP?.emergency_contact);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rsvpData: Partial<AdvancedRSVP> = {
      ...formData,
      conditions:
        formData.response_type === "conditional" ? conditions : undefined,
      emergency_contact: requireEmergencyContact ? emergencyContact : undefined,
    };
    try {
      await onUpdate(rsvpData);
    } catch (error) {
      console.error("Failed to update RSVP:", error);
    }
  };
  const addCondition = () => {
    const newCondition: RSVPCondition = {
      id: `condition_${Date.now()}`,
      type: "custom",
      description: "",
      if_condition: "",
      then_status: "attending",
    };
    setConditions([...conditions, newCondition]);
  };
  const updateCondition = (index: number, updates: Partial<RSVPCondition>) => {
    setConditions((prev) =>
      prev.map((cond, i) => (i === index ? { ...cond, ...updates } : cond))
    );
  };
  const removeCondition = (index: number) => {
    setConditions((prev) => prev.filter((_, i) => i !== index));
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-lg p-6 space-y-6"
    >
      {/* Basic Response */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Will you attend this event?
        </label>
        <div className="space-y-2">
          {(
            [
              "attending",
              "not_attending",
              "maybe",
              "late",
              "early_departure",
            ] as RSVPStatus[]
          ).map((status) => (
            <label key={status} className="flex items-center">
              <input
                type="radio"
                name="status"
                value={status}
                checked={formData.status === status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as RSVPStatus,
                  }))
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-gray-700 capitalize">
                {status.replace("_", " ")}
              </span>
            </label>
          ))}
        </div>
      </div>
      {/* Response Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Response Type
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="response_type"
              value="simple"
              checked={formData.response_type === "simple"}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  response_type: e.target
                    .value as AdvancedRSVP["response_type"],
                }))
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-gray-700">Simple Response</span>
          </label>{" "}
          {allowConditional && (
            <label className="flex items-center">
              <input
                type="radio"
                name="response_type"
                value="conditional"
                checked={formData.response_type === "conditional"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    response_type: e.target
                      .value as AdvancedRSVP["response_type"],
                  }))
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-gray-700">Conditional Response</span>
            </label>
          )}
          {allowDetailedResponse && (
            <label className="flex items-center">
              <input
                type="radio"
                name="response_type"
                value="detailed"
                checked={formData.response_type === "detailed"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    response_type: e.target
                      .value as AdvancedRSVP["response_type"],
                  }))
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-gray-700">Detailed Response</span>
            </label>
          )}
        </div>
      </div>
      {/* Conditional Responses */}
      {formData.response_type === "conditional" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Conditional Responses
            </label>
            <button
              type="button"
              onClick={addCondition}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Condition
            </button>
          </div>
          <div className="space-y-4">
            {conditions.map((condition, index) => (
              <div
                key={condition.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Condition {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeCondition(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      If condition
                    </label>
                    <input
                      type="text"
                      value={condition.if_condition}
                      onChange={(e) =>
                        updateCondition(index, { if_condition: e.target.value })
                      }
                      placeholder="e.g., weather is good"
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Then I will
                    </label>
                    <select
                      value={condition.then_status}
                      onChange={(e) =>
                        updateCondition(index, {
                          then_status: e.target.value as RSVPStatus,
                        })
                      }
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="attending">Attend</option>
                      <option value="not_attending">Not Attend</option>
                      <option value="maybe">Maybe Attend</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Detailed Response Fields */}
      {formData.response_type === "detailed" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Arrival Time
              </label>
              <input
                type="time"
                value={formData.arrival_time || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    arrival_time: e.target.value,
                  }))
                }
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Departure Time
              </label>
              <input
                type="time"
                value={formData.departure_time || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    departure_time: e.target.value,
                  }))
                }
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transportation
            </label>
            <select
              value={formData.transportation || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  transportation: e.target
                    .value as AdvancedRSVP["transportation"],
                }))
              }
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Select transportation</option>
              <option value="driving">Driving</option>
              <option value="walking">Walking</option>
              <option value="bus">Bus</option>
              <option value="carpool">Carpool</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Special Requests or Dietary Restrictions
            </label>
            <textarea
              value={formData.special_requests || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  special_requests: e.target.value,
                }))
              }
              rows={3}
              placeholder="Any special accommodations needed..."
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>
      )}
      {/* Group Responses */}
      {allowGroupResponses && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Size (including yourself)
            </label>
            <input
              type="number"
              min="1"
              value={formData.group_size || 1}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  group_size: parseInt(e.target.value),
                }))
              }
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          {(formData.group_size || 0) > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Attendee Names
              </label>
              <textarea
                value={(formData.attendee_names || []).join(", ")}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    attendee_names: e.target.value
                      .split(",")
                      .map((name) => name.trim())
                      .filter(Boolean),
                  }))
                }
                rows={2}
                placeholder="Enter names separated by commas"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          )}
        </div>
      )}
      {/* Emergency Contact */}
      {requireEmergencyContact && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Emergency Contact
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={emergencyContact?.name || ""}
                onChange={(e) =>
                  setEmergencyContact(
                    (prev) =>
                      ({ ...prev, name: e.target.value }) as EmergencyContact
                  )
                }
                required
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Relationship
              </label>
              <input
                type="text"
                value={emergencyContact?.relationship || ""}
                onChange={(e) =>
                  setEmergencyContact(
                    (prev) =>
                      ({
                        ...prev,
                        relationship: e.target.value,
                      }) as EmergencyContact
                  )
                }
                placeholder="e.g., Parent, Spouse"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={emergencyContact?.phone || ""}
                onChange={(e) =>
                  setEmergencyContact(
                    (prev) =>
                      ({ ...prev, phone: e.target.value }) as EmergencyContact
                  )
                }
                required
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={emergencyContact?.email || ""}
                onChange={(e) =>
                  setEmergencyContact(
                    (prev) =>
                      ({ ...prev, email: e.target.value }) as EmergencyContact
                  )
                }
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        </div>
      )}
      {/* Confidence Level */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          How confident are you about your response? (
          {formData.confidence_level}/5)
        </label>
        <input
          type="range"
          min="1"
          max="5"
          value={formData.confidence_level || 3}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              confidence_level: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5,
            }))
          }
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Not sure</span>
          <span>Completely sure</span>
        </div>
      </div>
      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Additional Notes
        </label>
        <textarea
          value={formData.notes || ""}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, notes: e.target.value }))
          }
          rows={3}
          placeholder="Any additional information..."
          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      </div>
      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update RSVP"}
        </button>
      </div>
    </form>
  );
}
// ============================================================================
// RSVP DISPLAY
// ============================================================================
interface RSVPDisplayProps {
  rsvp: AdvancedRSVP;
}
function RSVPDisplay({ rsvp }: RSVPDisplayProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <h4 className="text-md font-medium text-gray-900 mb-4">
        Your RSVP Response
      </h4>
      <div className="space-y-3">
        <div>
          <span className="text-sm font-medium text-gray-700">Status: </span>
          <span
            className={`text-sm capitalize px-2 py-1 rounded-full ${
              rsvp.status === "attending"
                ? "bg-green-100 text-green-800"
                : rsvp.status === "not_attending"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {rsvp.status.replace("_", " ")}
          </span>
        </div>
        {rsvp.arrival_time && (
          <div>
            <span className="text-sm font-medium text-gray-700">Arrival: </span>
            <span className="text-sm text-gray-600">{rsvp.arrival_time}</span>
          </div>
        )}
        {rsvp.departure_time && (
          <div>
            <span className="text-sm font-medium text-gray-700">
              Departure:{" "}
            </span>
            <span className="text-sm text-gray-600">{rsvp.departure_time}</span>
          </div>
        )}
        {rsvp.transportation && (
          <div>
            <span className="text-sm font-medium text-gray-700">
              Transportation:{" "}
            </span>
            <span className="text-sm text-gray-600 capitalize">
              {rsvp.transportation}
            </span>
          </div>
        )}
        {rsvp.notes && (
          <div>
            <span className="text-sm font-medium text-gray-700">Notes: </span>
            <span className="text-sm text-gray-600">{rsvp.notes}</span>
          </div>
        )}
        {rsvp.confidence_level && (
          <div>
            <span className="text-sm font-medium text-gray-700">
              Confidence:{" "}
            </span>
            <span className="text-sm text-gray-600">
              {rsvp.confidence_level}/5
            </span>
          </div>
        )}
        <div className="text-xs text-gray-500 pt-2">
          Last updated: {new Date(rsvp.updated_at).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
// ============================================================================
// RSVP ANALYTICS PANEL
// ============================================================================
interface RSVPAnalyticsPanelProps {
  eventId: string;
}
function RSVPAnalyticsPanel({ eventId }: RSVPAnalyticsPanelProps) {
  const { analytics, loading, error, sendBulkReminders, exportData } =
    useRSVPAnalytics(eventId);
  const [exporting, setExporting] = useState(false);
  const handleExport = async (format: "csv" | "excel" | "json") => {
    setExporting(true);
    try {
      const url = await exportData(format);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setExporting(false);
    }
  };
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  if (error || !analytics) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-700">Failed to load RSVP analytics</p>
      </div>
    );
  }
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-medium text-gray-900">RSVP Analytics</h4>
        <div className="flex space-x-2">
          <button
            onClick={() => sendBulkReminders()}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Send Reminders
          </button>
          <button
            onClick={() => handleExport("csv")}
            disabled={exporting}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            Export CSV
          </button>
        </div>
      </div>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-900">
            {analytics.total_responded}
          </div>
          <div className="text-sm text-blue-700">Total Responses</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-900">
            {analytics.status_breakdown.attending || 0}
          </div>
          <div className="text-sm text-green-700">Attending</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-900">
            {analytics.status_breakdown.not_attending || 0}
          </div>
          <div className="text-sm text-red-700">Not Attending</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-900">
            {analytics.response_rate.toFixed(1)}%
          </div>
          <div className="text-sm text-yellow-700">Response Rate</div>
        </div>
      </div>
      {/* Status Breakdown */}
      <div className="mb-6">
        <h5 className="text-md font-medium text-gray-900 mb-3">
          Response Breakdown
        </h5>
        <div className="space-y-2">
          {Object.entries(analytics.status_breakdown).map(([status, count]) => {
            const percentage =
              analytics.total_invited > 0
                ? (count / analytics.total_invited) * 100
                : 0;
            return (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 capitalize">
                  {status.replace("_", " ")}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Average Confidence */}
      <div className="mb-6">
        <h5 className="text-md font-medium text-gray-900 mb-2">
          Average Confidence
        </h5>
        <div className="flex items-center space-x-3">
          <div className="flex-1 bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-600 h-3 rounded-full"
              style={{ width: `${(analytics.average_confidence / 5) * 100}%` }}
            />
          </div>
          <span className="text-sm text-gray-600">
            {analytics.average_confidence.toFixed(1)}/5
          </span>
        </div>
      </div>
      {/* Late Responders */}
      {analytics.late_responders.length > 0 && (
        <div>
          <h5 className="text-md font-medium text-gray-900 mb-2">
            Need Reminders
          </h5>
          <div className="text-sm text-gray-600">
            {analytics.late_responders.length} users haven't responded yet
          </div>
          <button
            onClick={() => sendBulkReminders(analytics.late_responders)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Send Targeted Reminders
          </button>
        </div>
      )}
    </div>
  );
}
