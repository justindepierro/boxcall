/**
 * Calendar Icons Category
 * 
 * Icons for calendar, time, and scheduling functionality
 * Tree-shakeable icon category - only loads when calendar icons are used
 */

import {
  Calendar,
  Clock,
  Timer,
  CalendarDays,
  CalendarClock,
  CalendarPlus,
  CalendarX,
  CalendarCheck,
  CalendarHeart,
  CalendarRange,
  AlarmClock,
  Hourglass,
  Watch,
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
} from "lucide-react";

import { registerIconCategory } from "../registry";

// Calendar icon names type
export type CalendarIconName =
  | "calendar"
  | "calendar-days"
  | "calendar-clock"
  | "calendar-plus"
  | "calendar-x"
  | "calendar-check"
  | "calendar-heart"
  | "calendar-range"
  | "clock"
  | "alarm-clock"
  | "watch"
  | "timer"
  | "hourglass"
  | "play"
  | "pause"
  | "stop"
  | "skip-forward"
  | "skip-back";

// Calendar icons mapping
const calendarIcons = {
  calendar: Calendar,
  "calendar-days": CalendarDays,
  "calendar-clock": CalendarClock,
  "calendar-plus": CalendarPlus,
  "calendar-x": CalendarX,
  "calendar-check": CalendarCheck,
  "calendar-heart": CalendarHeart,
  "calendar-range": CalendarRange,
  clock: Clock,
  "alarm-clock": AlarmClock,
  watch: Watch,
  timer: Timer,
  hourglass: Hourglass,
  play: Play,
  pause: Pause,
  stop: Square,
  "skip-forward": SkipForward,
  "skip-back": SkipBack,
};

// Register calendar icons on module load
registerIconCategory("calendar", calendarIcons);
