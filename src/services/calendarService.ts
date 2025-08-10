/**
 * @deprecated CalendarService moved to src/legacy/calendar/calendarService.ts
 * Prefer React Query hooks in state/calendar/hooks.
 */
let __calendarServiceStubWarned = false;
if (process.env.NODE_ENV !== "production" && !__calendarServiceStubWarned) {
  console.warn("[DEPRECATED-STUB] services/calendarService.ts -> legacy/calendar/calendarService.ts");
  __calendarServiceStubWarned = true;
}
export * from "../legacy/calendar/calendarService";
