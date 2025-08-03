// Bulk Operations Interface for Phase 2.3
// Mass operations on calendar events, RSVPs, and polls

import React, { useState } from "react";
import { useBulkOperations } from "../hooks/useEnhancedCalendar";
import Icon from "./ui/Icon/Icon";
import type {
  BulkOperation,
  BulkOperationTemplate,
  BulkOperationType,
} from "../types/enhanced-calendar";

interface BulkOperationsInterfaceProps {
  teamId: string;
  selectedEventIds: string[];
  userRole: "coach" | "player" | "parent";
}

export function BulkOperationsInterface({
  teamId,
  selectedEventIds,
  userRole,
}: BulkOperationsInterfaceProps) {
  const {
    operations,
    templates,
    loading,
    executeBulkOperation,
    getOperationStatus,
    cancelOperation,
    createTemplate,
  } = useBulkOperations(teamId);
  const [showCreateOperation, setShowCreateOperation] = useState(false);
  const [activeOperation, setActiveOperation] = useState<BulkOperation | null>(
    null
  );

  const canPerformBulkOperations = userRole === "coach";

  if (!canPerformBulkOperations) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg
            className="h-5 w-5 text-yellow-400 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <p className="text-sm text-yellow-700">
            Bulk operations are only available to coaches.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Bulk Operations
          </h3>
          <p className="text-sm text-gray-600">
            {selectedEventIds.length > 0
              ? `${selectedEventIds.length} event${selectedEventIds.length !== 1 ? "s" : ""} selected`
              : "Select events to perform bulk operations"}
          </p>
        </div>
        {selectedEventIds.length > 0 && (
          <button
            onClick={() => setShowCreateOperation(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            Create Operation
          </button>
        )}
      </div>

      {/* Quick Actions */}
      {selectedEventIds.length > 0 && (
        <QuickActionsPanel
          selectedEventIds={selectedEventIds}
          onExecute={executeBulkOperation}
          loading={loading}
        />
      )}

      {/* Templates */}
      <BulkOperationTemplates
        templates={templates}
        selectedEventIds={selectedEventIds}
        onExecute={executeBulkOperation}
        onCreateTemplate={createTemplate}
        loading={loading}
      />

      {/* Active Operations */}
      <ActiveOperations
        operations={operations}
        onViewOperation={setActiveOperation}
        onCancelOperation={cancelOperation}
        onRefreshStatus={getOperationStatus}
      />

      {/* Create Operation Modal */}
      {showCreateOperation && (
        <CreateBulkOperationModal
          selectedEventIds={selectedEventIds}
          teamId={teamId}
          onClose={() => setShowCreateOperation(false)}
          onExecute={async (type, data) => {
            const operation = await executeBulkOperation(
              type,
              selectedEventIds,
              data
            );
            setActiveOperation(operation);
            setShowCreateOperation(false);
          }}
          loading={loading}
        />
      )}

      {/* Operation Details Modal */}
      {activeOperation && (
        <OperationDetailsModal
          operation={activeOperation}
          onClose={() => setActiveOperation(null)}
          onCancel={() => cancelOperation(activeOperation.id)}
        />
      )}
    </div>
  );
}

// ============================================================================
// QUICK ACTIONS PANEL
// ============================================================================

interface QuickActionsPanelProps {
  selectedEventIds: string[];
  onExecute: (
    type: BulkOperationType,
    targetIds: string[],
    data: Record<string, string | number | boolean | string[]>
  ) => Promise<BulkOperation>;
  loading: boolean;
}

function QuickActionsPanel({
  selectedEventIds,
  onExecute,
  loading,
}: QuickActionsPanelProps) {
  const quickActions = [
    {
      type: "send_reminders" as BulkOperationType,
      title: "Send RSVP Reminders",
      description: "Send reminder notifications to all invitees",
      icon: "mail",
      data: { reminder_type: "rsvp_reminder" as string },
    },
    {
      type: "update_events" as BulkOperationType,
      title: "Update Event Details",
      description: "Bulk update event information",
      icon: "edit",
      data: { update_type: "bulk_edit" as string },
    },
    {
      type: "create_polls_for_events" as BulkOperationType,
      title: "Create Polls",
      description: "Create attendance polls for all events",
      icon: "bar-chart",
      data: {
        poll_type: "attendance" as string,
        question: "Can you attend this event?" as string,
      },
    },
    {
      type: "export_rsvp_data" as BulkOperationType,
      title: "Export RSVP Data",
      description: "Download RSVP responses as spreadsheet",
      icon: "download",
      data: { format: "csv" as string },
    },
  ];

  const handleQuickAction = async (action: (typeof quickActions)[0]) => {
    try {
      // Filter out undefined values to match the expected Record type
      const cleanData = Object.fromEntries(
        Object.entries(action.data).filter(([, value]) => value !== undefined)
      ) as Record<string, string | number | boolean | string[]>;

      await onExecute(action.type, selectedEventIds, cleanData);
    } catch (error) {
      console.error("Quick action failed:", error);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h4 className="text-md font-medium text-gray-900 mb-3">Quick Actions</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <button
            key={action.type}
            onClick={() => handleQuickAction(action)}
            disabled={loading}
            className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors disabled:opacity-50"
          >
            <div className="flex items-center space-x-2 mb-2">
              <Icon name={action.icon as any} size="lg" className="text-gray-600" />
              <span className="text-sm font-medium text-gray-900">
                {action.title}
              </span>
            </div>
            <p className="text-xs text-gray-600">{action.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// BULK OPERATION TEMPLATES
// ============================================================================

interface BulkOperationTemplatesProps {
  templates: BulkOperationTemplate[];
  selectedEventIds: string[];
  onExecute: (
    type: BulkOperationType,
    targetIds: string[],
    data: Record<string, string | number | boolean | string[]>
  ) => Promise<BulkOperation>;
  onCreateTemplate: (
    template: Omit<BulkOperationTemplate, "id" | "created_at" | "usage_count">
  ) => Promise<BulkOperationTemplate>;
  loading: boolean;
}

function BulkOperationTemplates({
  templates,
  selectedEventIds,
  onExecute,
  loading,
}: BulkOperationTemplatesProps) {
  const handleUseTemplate = async (template: BulkOperationTemplate) => {
    try {
      await onExecute(
        template.operation_type,
        selectedEventIds,
        template.default_data
      );
    } catch (error) {
      console.error("Template execution failed:", error);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-md font-medium text-gray-900">
          Operation Templates
        </h4>
        <button
          onClick={() => console.log("Create template feature coming soon")}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Create Template
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-sm text-gray-500 mt-2">No templates available</p>
          <p className="text-xs text-gray-400">
            Create templates for commonly used bulk operations
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
            >
              <div>
                <h5 className="text-sm font-medium text-gray-900">
                  {template.name}
                </h5>
                <p className="text-xs text-gray-600">{template.description}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-xs text-gray-500">
                    Used {template.usage_count} times
                  </span>
                  <span className="text-xs text-gray-500 capitalize">
                    {template.operation_type.replace("_", " ")}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleUseTemplate(template)}
                disabled={loading || selectedEventIds.length === 0}
                className="px-3 py-1 text-sm border border-blue-300 text-blue-700 rounded hover:bg-blue-50 disabled:opacity-50"
              >
                Use Template
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ACTIVE OPERATIONS
// ============================================================================

interface ActiveOperationsProps {
  operations: BulkOperation[];
  onViewOperation: (operation: BulkOperation) => void;
  onCancelOperation: (operationId: string) => Promise<boolean>;
  onRefreshStatus: (operationId: string) => Promise<BulkOperation | null>;
}

function ActiveOperations({
  operations,
  onViewOperation,
  onCancelOperation,
  onRefreshStatus,
}: ActiveOperationsProps) {
  if (operations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h4 className="text-md font-medium text-gray-900 mb-3">
        Recent Operations
      </h4>
      <div className="space-y-3">
        {operations
          .slice(-5)
          .reverse()
          .map((operation) => (
            <div
              key={operation.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {operation.type.replace("_", " ")}
                  </span>
                  <OperationStatusBadge status={operation.status} />
                </div>
                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                  <span>{operation.total_items} items</span>
                  <span>{operation.successful_items} successful</span>
                  {operation.failed_items > 0 && (
                    <span className="text-red-600">
                      {operation.failed_items} failed
                    </span>
                  )}
                  <span>
                    {new Date(operation.initiated_at).toLocaleDateString()}
                  </span>
                </div>
                {operation.status === "in_progress" && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{
                          width: `${(operation.processed_items / operation.total_items) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {operation.processed_items}/{operation.total_items}{" "}
                      processed
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {operation.status === "in_progress" && (
                  <button
                    onClick={() => onCancelOperation(operation.id)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => onViewOperation(operation)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Details
                </button>
                {["pending", "in_progress"].includes(operation.status) && (
                  <button
                    onClick={() => onRefreshStatus(operation.id)}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Refresh
                  </button>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

// ============================================================================
// OPERATION STATUS BADGE
// ============================================================================

interface OperationStatusBadgeProps {
  status: BulkOperation["status"];
}

function OperationStatusBadge({ status }: OperationStatusBadgeProps) {
  const config = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
    in_progress: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      label: "In Progress",
    },
    completed: {
      bg: "bg-green-100",
      text: "text-green-800",
      label: "Completed",
    },
    failed: { bg: "bg-red-100", text: "text-red-800", label: "Failed" },
    cancelled: { bg: "bg-gray-100", text: "text-gray-800", label: "Cancelled" },
  };

  const { bg, text, label } = config[status] || config.pending;

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${bg} ${text}`}
    >
      {label}
    </span>
  );
}

// ============================================================================
// CREATE BULK OPERATION MODAL
// ============================================================================

interface CreateBulkOperationModalProps {
  selectedEventIds: string[];
  teamId: string;
  onClose: () => void;
  onExecute: (
    type: BulkOperationType,
    data: Record<string, string | number | boolean | string[]>
  ) => Promise<void>;
  loading: boolean;
}

function CreateBulkOperationModal({
  selectedEventIds,
  onClose,
  onExecute,
  loading,
}: CreateBulkOperationModalProps) {
  const [operationType, setOperationType] =
    useState<BulkOperationType>("update_events");
  const [operationData, setOperationData] = useState<
    Record<string, string | number | boolean | string[]>
  >({});

  const operationTypes: Array<{
    type: BulkOperationType;
    title: string;
    description: string;
    fields: Array<{
      key: string;
      label: string;
      type: "text" | "number" | "boolean" | "select";
      options?: string[];
      defaultValue?: string | number | boolean;
    }>;
  }> = [
    {
      type: "update_events",
      title: "Update Events",
      description: "Bulk update event properties",
      fields: [
        { key: "location", label: "Location", type: "text" },
        { key: "description", label: "Description", type: "text" },
      ],
    },
    {
      type: "send_rsvp_reminders",
      title: "Send RSVP Reminders",
      description: "Send reminder notifications",
      fields: [
        {
          key: "reminder_type",
          label: "Reminder Type",
          type: "select",
          options: ["rsvp_reminder", "event_reminder", "urgent_reminder"],
          defaultValue: "rsvp_reminder",
        },
      ],
    },
    {
      type: "create_polls_for_events",
      title: "Create Polls",
      description: "Create polls for selected events",
      fields: [
        {
          key: "question",
          label: "Poll Question",
          type: "text",
          defaultValue: "Can you attend this event?",
        },
        {
          key: "poll_type",
          label: "Poll Type",
          type: "select",
          options: ["single_choice", "multiple_choice", "yes_no"],
          defaultValue: "yes_no",
        },
      ],
    },
  ];

  const currentOperation = operationTypes.find(
    (op) => op.type === operationType
  )!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onExecute(operationType, operationData);
    } catch (error) {
      console.error("Failed to execute bulk operation:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Create Bulk Operation
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Operation Type
                  </label>
                  <select
                    value={operationType}
                    onChange={(e) => {
                      setOperationType(e.target.value as BulkOperationType);
                      setOperationData({});
                    }}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    {operationTypes.map((op) => (
                      <option key={op.type} value={op.type}>
                        {op.title}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-600 mt-1">
                    {currentOperation.description}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    This operation will affect{" "}
                    <strong>{selectedEventIds.length}</strong> selected events.
                  </p>
                </div>

                {currentOperation.fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    {field.type === "select" ? (
                      <select
                        value={String(
                          operationData[field.key] || field.defaultValue || ""
                        )}
                        onChange={(e) =>
                          setOperationData((prev) => ({
                            ...prev,
                            [field.key]: e.target.value,
                          }))
                        }
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        {field.options?.map((option) => (
                          <option key={option} value={option}>
                            {option.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "boolean" ? (
                      <input
                        type="checkbox"
                        checked={Boolean(
                          operationData[field.key] ||
                            field.defaultValue ||
                            false
                        )}
                        onChange={(e) =>
                          setOperationData((prev) => ({
                            ...prev,
                            [field.key]: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={String(
                          operationData[field.key] || field.defaultValue || ""
                        )}
                        onChange={(e) =>
                          setOperationData((prev) => ({
                            ...prev,
                            [field.key]:
                              field.type === "number"
                                ? parseInt(e.target.value)
                                : e.target.value,
                          }))
                        }
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {loading ? "Executing..." : "Execute Operation"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// OPERATION DETAILS MODAL
// ============================================================================

interface OperationDetailsModalProps {
  operation: BulkOperation;
  onClose: () => void;
  onCancel: () => Promise<boolean>;
}

function OperationDetailsModal({
  operation,
  onClose,
  onCancel,
}: OperationDetailsModalProps) {
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await onCancel();
      onClose();
    } catch (error) {
      console.error("Failed to cancel operation:", error);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Bulk Operation Details
              </h3>
              <OperationStatusBadge status={operation.status} />
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Operation Type
                  </label>
                  <p className="text-sm text-gray-900 capitalize">
                    {operation.type.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Target Type
                  </label>
                  <p className="text-sm text-gray-900 capitalize">
                    {operation.target_type}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Total Items
                  </label>
                  <p className="text-sm text-gray-900">
                    {operation.total_items}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Progress
                  </label>
                  <p className="text-sm text-gray-900">
                    {operation.processed_items}/{operation.total_items}(
                    {(
                      (operation.processed_items / operation.total_items) *
                      100
                    ).toFixed(1)}
                    %)
                  </p>
                </div>
              </div>

              {operation.status === "in_progress" && (
                <div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(operation.processed_items / operation.total_items) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Successful
                  </label>
                  <p className="text-sm text-green-600">
                    {operation.successful_items}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Failed
                  </label>
                  <p className="text-sm text-red-600">
                    {operation.failed_items}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Started
                </label>
                <p className="text-sm text-gray-900">
                  {new Date(operation.initiated_at).toLocaleString()}
                </p>
              </div>

              {operation.completed_at && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Completed
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(operation.completed_at).toLocaleString()}
                  </p>
                </div>
              )}

              {operation.summary && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Summary
                  </label>
                  <p className="text-sm text-gray-900">{operation.summary}</p>
                </div>
              )}

              {operation.error_log && operation.error_log.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Errors
                  </label>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {operation.error_log.map((error, index) => (
                      <div
                        key={index}
                        className="text-sm bg-red-50 text-red-700 p-2 rounded"
                      >
                        <strong>{error.item_id}:</strong> {error.error_message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {operation.status === "in_progress" && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Cancel Operation"}
              </button>
            )}
            <button
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
