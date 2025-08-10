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
import { Button } from "../../ui/Button";
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
              name={userRole === "head_coach" ? "user" : "users"}
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
              <Button
                onClick={onTimeAllocationModeToggle}
                variant={timeAllocationMode ? "primary" : "outline"}
                size="xs"
                className="flex items-center gap-1"
                icon={
                  <Icon
                    name={timeAllocationMode ? "bar-chart" : "clock"}
                    size="sm"
                    className={
                      timeAllocationMode ? "text-white" : "text-text-secondary"
                    }
                  />
                }
                iconPosition="left"
              >
                {timeAllocationMode
                  ? "Time Allocation Mode"
                  : "Enable Time Allocation"}
              </Button>
              <Button
                onClick={onScaffoldModeToggle}
                variant={scaffoldMode ? "primary" : "outline"}
                size="xs"
                className="flex items-center gap-1"
                icon={
                  <Icon
                    name={scaffoldMode ? "file" : "target"}
                    size="sm"
                    className={
                      scaffoldMode ? "text-white" : "text-text-secondary"
                    }
                  />
                }
                iconPosition="left"
              >
                {scaffoldMode ? "Scaffold Mode" : "Enable Practice Scaffold"}
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-3">
        {/* PDF Export Button */}
        <Button
          onClick={onPDFExport}
          variant="success"
          size="sm"
          icon={<Icon name="pdf" size="sm" className="text-text-primary" />}
          iconPosition="left"
          className="shadow-lg"
        >
          Print Practice to PDF
        </Button>
        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="xs"
          aria-label="Close practice planner"
          className="p-2 text-text-muted hover:text-text-primary h-auto"
          icon={
            <Icon
              name="close"
              size="sm"
              className="text-text-muted hover:text-text-primary"
            />
          }
          iconPosition="only"
        />
      </div>
    </div>
  );
};
