import React from "react";
import CalendarPage from "./CalendarPage";
import { CalendarShell } from "../components/calendar/CalendarShell";

// Temporary migration wrapper: renders new state-driven shell above legacy page.
// Allows QA comparison before fully decomposing CalendarPage.
export const CalendarPageShell: React.FC = () => {
  return (
    <div className="space-y-8 p-4">
      <div className="rounded-md border border-dashed border-gray-300 p-4 bg-gray-50">
        <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-2">
          New Calendar Shell (State Hooks)
        </p>
        <CalendarShell />
      </div>
      <div className="rounded-md border border-gray-200">
        <CalendarPage />
      </div>
    </div>
  );
};

export default CalendarPageShell;
