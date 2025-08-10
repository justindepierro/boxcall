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
import type { PracticeHeaderProps } from "../types";
import { Typography } from "../../design-system/Typography";
import Icon from "../../ui/Icon/Icon";
export const PracticeHeader: React.FC<PracticeHeaderProps> = ({
  event,
  userRole,
  timeAllocationMode,
  scaffoldMode,
  onUserRoleChange: _onUserRoleChange,
  onTimeAllocationModeToggle,
  onScaffoldModeToggle,
  onPDFExport,
  onClose,
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <div className="flex items-center gap-2">
          <Icon name="file" size="lg" className="text-navy-700" />
          <Typography variant="headline-lg" className="text-navy-900">
            Practice Planner
          </Typography>
        </div>
        <Typography variant="body-md" color="muted" className="mt-1">
          {event.title} - {new Date(event.start).toLocaleDateString()}
        </Typography>
        <div className="mt-2 flex items-center space-x-4">
          <span
            className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
              userRole === "head_coach"
                ? "bg-blue-100 text-blue-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            <Icon
              name={userRole === "head_coach" ? "user-check" : "users"}
              size="sm"
              className={
                userRole === "head_coach" ? "text-blue-600" : "text-green-600"
              }
            />
            {userRole === "head_coach" ? "Head Coach" : "Position Coach"}
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
                className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                  timeAllocationMode
                    ? "bg-jade-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <Icon
                  name={timeAllocationMode ? "bar-chart" : "clock"}
                  size="sm"
                  className={
                    timeAllocationMode ? "text-white" : "text-gray-600"
                  }
                />
                {timeAllocationMode
                  ? "Time Allocation Mode"
                  : "Enable Time Allocation"}
              </button>
              <button
                onClick={onScaffoldModeToggle}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                  scaffoldMode
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <Icon
                  name={scaffoldMode ? "file" : "target"}
                  size="sm"
                  className={scaffoldMode ? "text-white" : "text-gray-600"}
                />
                {scaffoldMode ? "Scaffold Mode" : "Enable Practice Scaffold"}
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-3">
        {/* PDF Export Button */}
        <button
          onClick={onPDFExport}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors shadow-lg flex items-center gap-2"
        >
          <Icon name="pdf" size="lg" className="text-white" />
          Print Practice to PDF
        </button>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors p-2"
          aria-label="Close practice planner"
        >
          <Icon
            name="close"
            size="lg"
            className="text-gray-500 hover:text-gray-700"
          />
        </button>
      </div>
    </div>
  );
};
