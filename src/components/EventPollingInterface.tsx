// Event Polling Interface for Phase 2.3
// Team-wide polling system with real-time results
import React, { useState } from "react";
import { useEventPolls, usePollResults } from "../hooks/useEnhancedCalendar";
import type {
  EventPoll,
  OptionResult,
  PollComment,
  PollOption,
  PollResponse,
  PollResults,
} from "../types/enhanced-calendar";
interface EventPollingInterfaceProps {
  eventId: string;
  userId: string;
  userRole: "coach" | "player" | "parent";
  canCreatePolls?: boolean;
}
export function EventPollingInterface({
  eventId,
  userId,
  userRole,
  canCreatePolls = false,
}: EventPollingInterfaceProps) {
  const { polls, loading, error, createPoll, submitResponse, closePoll } =
    useEventPolls(eventId);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const handleCreatePoll = () => {
    setShowCreateForm(true);
  };
  const handlePollCreated = () => {
    setShowCreateForm(false);
  };
  if (loading && polls.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading polls
            </h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Event Polls</h3>
          <p className="text-sm text-gray-600">
            {polls.length === 0
              ? "No polls created yet"
              : `${polls.length} poll${polls.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        {canCreatePolls && (
          <button
            onClick={handleCreatePoll}
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Poll
          </button>
        )}
      </div>
      {/* Create Poll Form */}
      {showCreateForm && (
        <CreatePollForm
          eventId={eventId}
          onCancel={() => setShowCreateForm(false)}
          onCreate={handlePollCreated}
          createPoll={createPoll}
        />
      )}
      {/* Polls List */}
      {polls.length > 0 && (
        <div className="space-y-4">
          {polls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              userId={userId}
              userRole={userRole}
              canManagePolls={canCreatePolls}
              onSubmitResponse={submitResponse}
              onClosePoll={closePoll}
            />
          ))}
        </div>
      )}
      {polls.length === 0 && !showCreateForm && (
        <div className="text-center py-12">
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No polls yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {canCreatePolls
              ? "Get started by creating a poll to gather team feedback."
              : "Polls will appear here when coaches create them."}
          </p>
        </div>
      )}
    </div>
  );
}
// ============================================================================
// CREATE POLL FORM
// ============================================================================
interface CreatePollFormProps {
  eventId: string;
  onCancel: () => void;
  onCreate: () => void;
  createPoll: (pollData: Partial<EventPoll>) => Promise<EventPoll>;
}
function CreatePollForm({
  eventId,
  onCancel,
  onCreate,
  createPoll,
}: CreatePollFormProps) {
  const [formData, setFormData] = useState<{
    title: string;
    question: string;
    poll_type: EventPoll["poll_type"];
    is_anonymous: boolean;
    allow_comments: boolean;
    deadline: string;
  }>({
    title: "",
    question: "",
    poll_type: "single_choice",
    is_anonymous: false,
    allow_comments: true,
    deadline: "",
  });
  const [options, setOptions] = useState<Omit<PollOption, "id" | "poll_id">[]>([
    { text: "", order_index: 0 },
    { text: "", order_index: 1 },
  ]);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const validOptions = options.filter((opt) => opt.text.trim() !== "");
      await createPoll({
        ...formData,
        event_id: eventId,
        options: validOptions as PollOption[],
        created_by: "current_user", // TODO: Get from auth context
      });
      onCreate();
    } catch (error) {
      console.error("Failed to create poll:", error);
    } finally {
      setLoading(false);
    }
  };
  const addOption = () => {
    setOptions((prev) => [...prev, { text: "", order_index: prev.length }]);
  };
  const updateOption = (index: number, text: string) => {
    setOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, text } : opt))
    );
  };
  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions((prev) => prev.filter((_, i) => i !== index));
    }
  };
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h4 className="text-lg font-medium text-gray-900 mb-4">
        Create New Poll
      </h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label
            htmlFor="poll-title"
            className="block text-sm font-medium text-gray-700"
          >
            Poll Title
          </label>
          <input
            type="text"
            id="poll-title"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., Game Day Attendance"
            required
          />
        </div>
        {/* Question */}
        <div>
          <label
            htmlFor="poll-question"
            className="block text-sm font-medium text-gray-700"
          >
            Question
          </label>
          <textarea
            id="poll-question"
            value={formData.question}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, question: e.target.value }))
            }
            rows={2}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., Can you attend Saturday's game?"
            required
          />
        </div>
        {/* Poll Type */}
        <div>
          <label
            htmlFor="poll-type"
            className="block text-sm font-medium text-gray-700"
          >
            Poll Type
          </label>
          <select
            id="poll-type"
            value={formData.poll_type}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                poll_type: e.target.value as EventPoll["poll_type"],
              }))
            }
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="single_choice">Single Choice</option>
            <option value="multiple_choice">Multiple Choice</option>
            <option value="yes_no">Yes/No</option>
            <option value="rating">Rating (1-5)</option>
            <option value="text_response">Text Response</option>
          </select>
        </div>
        {/* Options (for choice-based polls) */}
        {["single_choice", "multiple_choice"].includes(formData.poll_type) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Answer Options
            </label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder={`Option ${index + 1}`}
                    required
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addOption}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Option
              </button>
            </div>
          </div>
        )}
        {/* Settings */}
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              id="anonymous"
              type="checkbox"
              checked={formData.is_anonymous}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  is_anonymous: e.target.checked,
                }))
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
              Anonymous responses
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="comments"
              type="checkbox"
              checked={formData.allow_comments}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  allow_comments: e.target.checked,
                }))
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="comments" className="ml-2 text-sm text-gray-700">
              Allow comments
            </label>
          </div>
        </div>
        {/* Deadline */}
        <div>
          <label
            htmlFor="deadline"
            className="block text-sm font-medium text-gray-700"
          >
            Response Deadline (Optional)
          </label>
          <input
            type="datetime-local"
            id="deadline"
            value={formData.deadline}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, deadline: e.target.value }))
            }
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Poll"}
          </button>
        </div>
      </form>
    </div>
  );
}
// ============================================================================
// POLL CARD
// ============================================================================
interface PollCardProps {
  poll: EventPoll;
  userId: string;
  userRole: "coach" | "player" | "parent";
  canManagePolls: boolean;
  onSubmitResponse: (
    pollId: string,
    userId: string,
    responseData: Partial<PollResponse>
  ) => Promise<PollResponse>;
  onClosePoll: (pollId: string) => Promise<void>;
}
function PollCard({
  poll,
  userId,
  canManagePolls,
  onSubmitResponse,
  onClosePoll,
}: PollCardProps) {
  const { results, loading: resultsLoading } = usePollResults(poll.id);
  const [showResults, setShowResults] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [textResponse, setTextResponse] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmitResponse(poll.id, userId, {
        selected_options: selectedOptions,
        text_response: textResponse || undefined,
        comment: comment || undefined,
        is_anonymous: poll.is_anonymous,
      });
      // Reset form after successful submission
      setSelectedOptions([]);
      setTextResponse("");
      setComment("");
    } catch (error) {
      console.error("Failed to submit response:", error);
    } finally {
      setSubmitting(false);
    }
  };
  const handleOptionSelect = (optionId: string) => {
    if (poll.poll_type === "single_choice" || poll.poll_type === "yes_no") {
      setSelectedOptions([optionId]);
    } else if (poll.poll_type === "multiple_choice") {
      setSelectedOptions((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      );
    }
  };
  const isDeadlinePassed =
    poll.deadline && new Date(poll.deadline) < new Date();
  const canRespond = poll.is_active && !isDeadlinePassed;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Poll Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-lg font-medium text-gray-900">{poll.title}</h4>
          <p className="text-gray-600 mt-1">{poll.question}</p>
          {poll.deadline && (
            <p className="text-sm text-gray-500 mt-2">
              Deadline: {new Date(poll.deadline).toLocaleDateString()} at{" "}
              {new Date(poll.deadline).toLocaleTimeString()}
              {isDeadlinePassed && (
                <span className="text-red-600 ml-2">(Expired)</span>
              )}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              poll.is_active
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {poll.is_active ? "Active" : "Closed"}
          </span>
          {canManagePolls && (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setShowResults(!showResults)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                {showResults ? "Hide" : "Show"} Results
              </button>
              {poll.is_active && (
                <button
                  onClick={() => onClosePoll(poll.id)}
                  className="text-red-600 hover:text-red-800 text-sm ml-2"
                >
                  Close Poll
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Poll Response Form */}
      {canRespond && !showResults && (
        <div className="mb-4">
          {/* Choice-based polls */}
          {["single_choice", "multiple_choice", "yes_no"].includes(
            poll.poll_type
          ) && (
            <div className="space-y-2">
              {poll.options.map((option) => (
                <label key={option.id} className="flex items-center">
                  <input
                    type={
                      poll.poll_type === "single_choice" ||
                      poll.poll_type === "yes_no"
                        ? "radio"
                        : "checkbox"
                    }
                    name={`poll-${poll.id}`}
                    value={option.id}
                    checked={selectedOptions.includes(option.id)}
                    onChange={() => handleOptionSelect(option.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-gray-700">{option.text}</span>
                </label>
              ))}
            </div>
          )}
          {/* Text response */}
          {poll.poll_type === "text_response" && (
            <textarea
              value={textResponse}
              onChange={(e) => setTextResponse(e.target.value)}
              placeholder="Your response..."
              rows={3}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          )}
          {/* Comments */}
          {poll.allow_comments && (
            <div className="mt-3">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment (optional)..."
                rows={2}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
          {/* Submit Button */}
          <div className="mt-4">
            <button
              onClick={handleSubmit}
              disabled={
                submitting ||
                (poll.poll_type !== "text_response" &&
                  selectedOptions.length === 0)
              }
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Response"}
            </button>
          </div>
        </div>
      )}
      {/* Poll Results */}
      {showResults && (
        <PollResults
          pollId={poll.id}
          results={results}
          loading={resultsLoading}
          isAnonymous={poll.is_anonymous}
        />
      )}
      {!canRespond && !showResults && (
        <div className="text-center py-4 text-gray-500">
          {isDeadlinePassed ? "This poll has expired" : "This poll is closed"}
        </div>
      )}
    </div>
  );
}
// ============================================================================
// POLL RESULTS
// ============================================================================
interface PollResultsProps {
  pollId: string;
  results: PollResults | null;
  loading: boolean;
  isAnonymous: boolean;
}
function PollResults({ results, loading, isAnonymous }: PollResultsProps) {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }
  if (!results) return null;
  return (
    <div className="border-t border-gray-200 pt-4">
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-md font-medium text-gray-900">Results</h5>
        <span className="text-sm text-gray-500">
          {results.total_responses}/{results.total_eligible} responses (
          {results.response_rate.toFixed(1)}%)
        </span>
      </div>
      {/* Option Results */}
      {results.option_results && results.option_results.length > 0 && (
        <div className="space-y-3 mb-4">
          {results.option_results.map((result: OptionResult) => (
            <div key={result.option.id}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{result.option.text}</span>
                <span className="text-gray-500">
                  {result.count} ({result.percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${result.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Text Responses */}
      {results.text_responses && results.text_responses.length > 0 && (
        <div className="mb-4">
          <h6 className="text-sm font-medium text-gray-900 mb-2">
            Text Responses
          </h6>
          <div className="space-y-2">
            {results.text_responses.map((response: string, index: number) => (
              <div
                key={index}
                className="bg-gray-50 rounded p-2 text-sm text-gray-700"
              >
                "{response}"
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Comments */}
      {results.comments && results.comments.length > 0 && (
        <div>
          <h6 className="text-sm font-medium text-gray-900 mb-2">Comments</h6>
          <div className="space-y-2">
            {results.comments.map((comment: PollComment) => (
              <div key={comment.id} className="bg-gray-50 rounded p-2">
                <div className="text-sm text-gray-700">"{comment.comment}"</div>
                {!isAnonymous && comment.user_name && (
                  <div className="text-xs text-gray-500 mt-1">
                    — {comment.user_name}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
