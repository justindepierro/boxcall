import React from "react";
import CalendarPage from "./CalendarPage";
import { CalendarShell } from "../components/calendar/CalendarShell";

// Phase 4: Experimental CalendarPageShell
// Enabled via VITE_CALENDAR_SHELL=1 build env flag (see AppRouter).
// Renders new modular shell and legacy page side-by-side for QA parity checks.

// Temporary migration wrapper: renders new state-driven shell above legacy page.
// Allows QA comparison before fully decomposing CalendarPage.
export const CalendarPageShell: React.FC = () => {
  // Temporary escape hatch: append ?legacy=1 to also render legacy below for ad-hoc comparison.
  const showLegacy = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("legacy") === "1";
  return (
    <div className="space-y-8 p-4">
      <div className="rounded-md border border-dashed border-gray-300 p-4 bg-gray-50">
        <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-2">
          Calendar Shell
        </p>
        <CalendarShell />
      </div>
      {showLegacy && (
        <div className="rounded-md border border-gray-200">
          <p className="text-[10px] uppercase tracking-wide font-semibold text-gray-400 px-3 py-2 border-b bg-gray-50">Legacy CalendarPage (temporary)</p>
          <CalendarPage />
        </div>
      )}
    </div>
  );
};

export default CalendarPageShell;
