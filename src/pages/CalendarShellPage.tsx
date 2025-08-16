import React from "react";

import { CalendarShell } from "../components/calendar/CalendarShell";

// CalendarShellPage: final calendar page after legacy removal
// Provides a stable route-level wrapper if future layout concerns arise.
export const CalendarShellPage: React.FC = () => {
  return <CalendarShell />;
};

export default CalendarShellPage;
