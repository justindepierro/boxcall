// Enhanced Calendar Hooks for Phase 2.3 Features
// React hooks for polling, advanced RSVP, permissions, and bulk operations

import { useCallback, useEffect, useState } from "react";
import { enhancedCalendarService } from "../services/enhancedCalendarService";
import type {
  AdvancedRSVP,
  BulkOperation,
  BulkOperationTemplate,
  BulkOperationType,
  CalendarPermission,
  CalendarPermissions,
  CalendarRole,
  CalendarSystemConfig,
  CalendarWebhook,
  EnhancedCalendarEvent,
  EnhancedCalendarQuery,
  EventPoll,
  PermissionCheck,
  PermissionResult,
  PollResponse,
  PollResults,
  RSVPAnalytics,
} from "../types/enhanced-calendar";

// ============================================================================
// EVENT POLLING HOOKS
// ============================================================================

export function useEventPolls(eventId: string) {
  const [polls, setPolls] = useState<EventPoll[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPolls = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const eventPolls =
        await enhancedCalendarService.polling.getEventPolls(eventId);
      setPolls(eventPolls);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch polls");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  const createPoll = useCallback(
    async (pollData: Partial<EventPoll>) => {
      setLoading(true);
      setError(null);
      try {
        const newPoll = await enhancedCalendarService.polling.createPoll(
          eventId,
          pollData
        );
        setPolls((prev) => [...prev, newPoll]);
        return newPoll;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create poll");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [eventId]
  );

  const submitResponse = useCallback(
    async (
      pollId: string,
      userId: string,
      responseData: Partial<PollResponse>
    ) => {
      setLoading(true);
      setError(null);
      try {
        const response =
          await enhancedCalendarService.polling.submitPollResponse(
            pollId,
            userId,
            responseData
          );
        return response;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to submit response"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const closePoll = useCallback(async (pollId: string) => {
    setLoading(true);
    setError(null);
    try {
      await enhancedCalendarService.polling.closePoll(pollId);
      setPolls((prev) =>
        prev.map((poll) =>
          poll.id === pollId ? { ...poll, is_active: false } : poll
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to close poll");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (eventId) {
      fetchPolls();
    }
  }, [eventId, fetchPolls]);

  return {
    polls,
    loading,
    error,
    refetch: fetchPolls,
    createPoll,
    submitResponse,
    closePoll,
  };
}

export function usePollResults(pollId: string) {
  const [results, setResults] = useState<PollResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    if (!pollId) return;

    setLoading(true);
    setError(null);
    try {
      const pollResults =
        await enhancedCalendarService.polling.getPollResults(pollId);
      setResults(pollResults);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch poll results"
      );
    } finally {
      setLoading(false);
    }
  }, [pollId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return {
    results,
    loading,
    error,
    refetch: fetchResults,
  };
}

// ============================================================================
// ADVANCED RSVP HOOKS
// ============================================================================

export function useAdvancedRSVP(eventId: string, userId: string) {
  const [rsvp, setRsvp] = useState<AdvancedRSVP | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateRSVP = useCallback(
    async (rsvpData: Partial<AdvancedRSVP>) => {
      setLoading(true);
      setError(null);
      try {
        const updatedRSVP = await enhancedCalendarService.rsvp.updateRSVP(
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
      await enhancedCalendarService.rsvp.sendRSVPReminders(eventId, [userId]);
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

export function useRSVPAnalytics(eventId: string) {
  const [analytics, setAnalytics] = useState<RSVPAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rsvpAnalytics =
        await enhancedCalendarService.rsvp.getRSVPAnalytics(eventId);
      setAnalytics(rsvpAnalytics);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch RSVP analytics"
      );
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  const sendBulkReminders = useCallback(
    async (userIds?: string[]) => {
      setLoading(true);
      setError(null);
      try {
        await enhancedCalendarService.rsvp.sendRSVPReminders(eventId, userIds);
        await fetchAnalytics(); // Refresh analytics after sending reminders
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to send reminders"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [eventId, fetchAnalytics]
  );

  const exportData = useCallback(
    async (format: "csv" | "excel" | "json") => {
      setLoading(true);
      setError(null);
      try {
        const exportUrl = await enhancedCalendarService.rsvp.exportRSVPData(
          eventId,
          format
        );
        return exportUrl;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to export data");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [eventId]
  );

  useEffect(() => {
    if (eventId) {
      fetchAnalytics();
    }
  }, [eventId, fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
    sendBulkReminders,
    exportData,
  };
}

// ============================================================================
// PERMISSIONS HOOKS
// ============================================================================

export function useCalendarPermissions(userId: string, teamId: string) {
  const [permissions, setPermissions] = useState<CalendarPermissions | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userPermissions =
        await enhancedCalendarService.permissions.getUserPermissions(
          userId,
          teamId
        );
      setPermissions(userPermissions);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch permissions"
      );
    } finally {
      setLoading(false);
    }
  }, [userId, teamId]);

  const updatePermissions = useCallback(
    async (role: CalendarRole, customPermissions?: CalendarPermission[]) => {
      setLoading(true);
      setError(null);
      try {
        const updatedPermissions =
          await enhancedCalendarService.permissions.updateUserPermissions(
            userId,
            teamId,
            role,
            customPermissions
          );
        setPermissions(updatedPermissions);
        return updatedPermissions;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update permissions"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userId, teamId]
  );

  const revokePermissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await enhancedCalendarService.permissions.revokeUserPermissions(
        userId,
        teamId
      );
      setPermissions(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to revoke permissions"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, teamId]);

  useEffect(() => {
    if (userId && teamId) {
      fetchPermissions();
    }
  }, [userId, teamId, fetchPermissions]);

  return {
    permissions,
    loading,
    error,
    refetch: fetchPermissions,
    updatePermissions,
    revokePermissions,
  };
}

export function usePermissionCheck() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkPermission = useCallback(
    async (check: PermissionCheck): Promise<PermissionResult> => {
      setLoading(true);
      setError(null);
      try {
        const result =
          await enhancedCalendarService.permissions.checkPermission(check);
        return result;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to check permission"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    checkPermission,
  };
}

// ============================================================================
// BULK OPERATIONS HOOKS
// ============================================================================

export function useBulkOperations(teamId: string) {
  const [operations, setOperations] = useState<BulkOperation[]>([]);
  const [templates, setTemplates] = useState<BulkOperationTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const bulkTemplates =
        await enhancedCalendarService.bulkOperations.getBulkOperationTemplates(
          teamId
        );
      setTemplates(bulkTemplates);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch templates"
      );
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  const executeBulkOperation = useCallback(
    async (
      type: BulkOperationType,
      targetIds: string[],
      operationData: Record<string, string | number | boolean | string[]>
    ) => {
      setLoading(true);
      setError(null);
      try {
        const operation =
          await enhancedCalendarService.bulkOperations.executeBulkOperation({
            type,
            target_type: "events", // Default, could be parameterized
            target_ids: targetIds,
            operation_data: operationData,
            team_id: teamId,
            initiated_by: "current_user", // TODO: Get from auth context
            status: "pending",
            total_items: targetIds.length,
            processed_items: 0,
            successful_items: 0,
            failed_items: 0,
          });

        setOperations((prev) => [...prev, operation]);
        return operation;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to execute bulk operation"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [teamId]
  );

  const getOperationStatus = useCallback(async (operationId: string) => {
    setLoading(true);
    setError(null);
    try {
      const operation =
        await enhancedCalendarService.bulkOperations.getBulkOperationStatus(
          operationId
        );
      if (operation) {
        setOperations((prev) =>
          prev.map((op) => (op.id === operationId ? operation : op))
        );
      }
      return operation;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get operation status"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelOperation = useCallback(async (operationId: string) => {
    setLoading(true);
    setError(null);
    try {
      const success =
        await enhancedCalendarService.bulkOperations.cancelBulkOperation(
          operationId
        );
      if (success) {
        setOperations((prev) =>
          prev.map((op) =>
            op.id === operationId ? { ...op, status: "cancelled" } : op
          )
        );
      }
      return success;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to cancel operation"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTemplate = useCallback(
    async (
      template: Omit<BulkOperationTemplate, "id" | "created_at" | "usage_count">
    ) => {
      setLoading(true);
      setError(null);
      try {
        const newTemplate =
          await enhancedCalendarService.bulkOperations.createBulkOperationTemplate(
            template
          );
        setTemplates((prev) => [...prev, newTemplate]);
        return newTemplate;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create template"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (teamId) {
      fetchTemplates();
    }
  }, [teamId, fetchTemplates]);

  return {
    operations,
    templates,
    loading,
    error,
    refetchTemplates: fetchTemplates,
    executeBulkOperation,
    getOperationStatus,
    cancelOperation,
    createTemplate,
  };
}

// ============================================================================
// ENHANCED CALENDAR HOOKS
// ============================================================================

export function useEnhancedCalendar(teamId?: string) {
  const [events, setEvents] = useState<EnhancedCalendarEvent[]>([]);
  const [systemConfig, setSystemConfig] = useState<CalendarSystemConfig | null>(
    null
  );
  const [webhooks, setWebhooks] = useState<CalendarWebhook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryEvents = useCallback(async (query: EnhancedCalendarQuery) => {
    setLoading(true);
    setError(null);
    try {
      const enhancedEvents =
        await enhancedCalendarService.queryEnhancedEvents(query);
      setEvents(enhancedEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to query events");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSystemConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const config = await enhancedCalendarService.getSystemConfig();
      setSystemConfig(config);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch system config"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWebhooks = useCallback(async () => {
    if (!teamId) return;

    setLoading(true);
    setError(null);
    try {
      const teamWebhooks =
        await enhancedCalendarService.getTeamWebhooks(teamId);
      setWebhooks(teamWebhooks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch webhooks");
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  const createWebhook = useCallback(
    async (webhookData: Omit<CalendarWebhook, "id" | "created_at">) => {
      setLoading(true);
      setError(null);
      try {
        const newWebhook =
          await enhancedCalendarService.createWebhook(webhookData);
        setWebhooks((prev) => [...prev, newWebhook]);
        return newWebhook;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create webhook"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteWebhook = useCallback(async (webhookId: string) => {
    setLoading(true);
    setError(null);
    try {
      await enhancedCalendarService.deleteWebhook(webhookId);
      setWebhooks((prev) => prev.filter((webhook) => webhook.id !== webhookId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete webhook");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSystemConfig();
  }, [fetchSystemConfig]);

  useEffect(() => {
    if (teamId) {
      fetchWebhooks();
    }
  }, [teamId, fetchWebhooks]);

  return {
    events,
    systemConfig,
    webhooks,
    loading,
    error,
    queryEvents,
    refetchConfig: fetchSystemConfig,
    refetchWebhooks: fetchWebhooks,
    createWebhook,
    deleteWebhook,
  };
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

// Hook for managing multiple poll responses in a single form
export function usePollResponseForm(polls: EventPoll[]) {
  const [responses, setResponses] = useState<
    Record<string, Partial<PollResponse>>
  >({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize responses for all polls
  useEffect(() => {
    const initialResponses: Record<string, Partial<PollResponse>> = {};
    polls.forEach((poll) => {
      if (!responses[poll.id]) {
        initialResponses[poll.id] = {};
      }
    });
    if (Object.keys(initialResponses).length > 0) {
      setResponses((prev) => ({ ...prev, ...initialResponses }));
    }
  }, [polls, responses]);

  const updateResponse = useCallback(
    (pollId: string, responseData: Partial<PollResponse>) => {
      setResponses((prev) => ({
        ...prev,
        [pollId]: { ...prev[pollId], ...responseData },
      }));
    },
    []
  );

  const submitResponse = useCallback(
    async (pollId: string, userId: string) => {
      const responseData = responses[pollId];
      if (!responseData) return;

      setSubmitting((prev) => ({ ...prev, [pollId]: true }));
      setErrors((prev) => ({ ...prev, [pollId]: "" }));

      try {
        await enhancedCalendarService.polling.submitPollResponse(
          pollId,
          userId,
          responseData
        );
        // Clear the response after successful submission
        setResponses((prev) => ({ ...prev, [pollId]: {} }));
      } catch (err) {
        setErrors((prev) => ({
          ...prev,
          [pollId]:
            err instanceof Error ? err.message : "Failed to submit response",
        }));
        throw err;
      } finally {
        setSubmitting((prev) => ({ ...prev, [pollId]: false }));
      }
    },
    [responses]
  );

  const submitAllResponses = useCallback(
    async (userId: string) => {
      const pollIds = Object.keys(responses);
      const results = await Promise.allSettled(
        pollIds.map((pollId) => submitResponse(pollId, userId))
      );

      return results.map((result, index) => ({
        pollId: pollIds[index],
        success: result.status === "fulfilled",
        error: result.status === "rejected" ? result.reason : null,
      }));
    },
    [responses, submitResponse]
  );

  return {
    responses,
    submitting,
    errors,
    updateResponse,
    submitResponse,
    submitAllResponses,
  };
}
