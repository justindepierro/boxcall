/**
 * PracticeHeader Component
 * 
 * Displays the practice planner header with:
 * - Title and event information
 * - User role display and switching
 * - Mode toggles (Time Allocation, Scaffold Mode)
 * - Close button
 * 
 * @component
 * @example
 * <PracticeHeader
 *   event={event}
 *   userRole="head_coach"
 *   timeAllocationMode={false}
 *   scaffoldMode={false}
 *   onUserRoleChange={setUserRole}
 *   onTimeAllocationModeToggle={() => setTimeAllocationMode(!timeAllocationMode)}
 *   onScaffoldModeToggle={() => setScaffoldMode(!scaffoldMode)}
 *   onClose={onClose}
 * />
 */

import React from "react";
import { Typography } from "../../design-system";
import type { PracticeHeaderProps } from "../types";

export const PracticeHeader: React.FC<PracticeHeaderProps> = ({
  event,
  userRole,
  timeAllocationMode,
  scaffoldMode,
  onUserRoleChange: _onUserRoleChange,
  onTimeAllocationModeToggle,
  onScaffoldModeToggle,
  onClose,
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <Typography variant="headline-lg" className="text-navy-900">
          📝 Practice Planner
        </Typography>
        <Typography variant="body-md" color="muted" className="mt-1">
          {event.title} - {new Date(event.start).toLocaleDateString()}
        </Typography>
        <div className="mt-2 flex items-center space-x-4">
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              userRole === "head_coach" 
                ? "bg-blue-100 text-blue-800" 
                : "bg-green-100 text-green-800"
            }`}
          >
            {userRole === "head_coach"
              ? "👨‍💼 Head Coach"
              : "🏃‍♂️ Position Coach"}
          </span>
          <Typography variant="body-sm" color="muted">
            {userRole === "head_coach"
              ? "Allocate time blocks and assign position coaches"
              : "Fill in detailed drills for your assigned time blocks"}
          </Typography>
          {userRole === "head_coach" && (
            <div className="flex space-x-2">
              <button
                onClick={onTimeAllocationModeToggle}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  timeAllocationMode
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {timeAllocationMode
                  ? "📊 Time Allocation Mode"
                  : "⏱️ Enable Time Allocation"}
              </button>
              <button
                onClick={onScaffoldModeToggle}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  scaffoldMode
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {scaffoldMode
                  ? "📋 Scaffold Mode"
                  : "🎯 Enable Practice Scaffold"}
              </button>
            </div>
          )}
        </div>
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors text-xl"
        aria-label="Close practice planner"
      >
        ✕
      </button>
    </div>
  );
};
