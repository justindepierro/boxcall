import { useMemo } from "react";

import type { CalendarEvent } from "../../../domain/calendar/types";

interface SuggestionContext {
  events: CalendarEvent[];
  userRole?: string;
}

export interface EventSuggestion {
  id: string;
  title: string;
  type: "practice" | "game" | "meeting";
  suggestedDate: Date;
  suggestedTime: string;
  duration: number; // minutes
  confidence: number; // 0-1
  reasoning: string;
  conflicts: string[];
  benefits: string[];
}

/**
 * useAISuggestions - Analyzes calendar patterns and team schedules to suggest optimal event times
 */
export function useAISuggestions({ events, userRole }: SuggestionContext) {
  const suggestions = useMemo((): EventSuggestion[] => {
    if (!events.length || userRole !== "coach") return [];

    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Analyze existing patterns
    const practiceEvents = events.filter((e) => e.type === "practice");
    const gameEvents = events.filter((e) => e.type === "game");

    // Find common practice days/times
    const practicePatterns = analyzePracticePatterns(practiceEvents);
    const gamePatterns = analyzeGamePatterns(gameEvents);

    const suggestions: EventSuggestion[] = [];

    // Suggest practice sessions for gaps in schedule
    const practiceSuggestions = generatePracticeSuggestions(
      practicePatterns,
      events,
      now,
      nextWeek
    );
    suggestions.push(...practiceSuggestions);

    // Suggest optimal game times based on team performance patterns
    const gameSuggestions = generateGameSuggestions(
      gamePatterns,
      events,
      now,
      nextWeek
    );
    suggestions.push(...gameSuggestions);

    // Sort by confidence and filter top suggestions
    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
  }, [events, userRole]);

  return {
    suggestions,
    hasSuggestions: suggestions.length > 0,
  };
}

function analyzePracticePatterns(events: CalendarEvent[]) {
  const dayCounts: Record<number, number> = {};
  const timeCounts: Record<string, number> = {};

  events.forEach((event) => {
    const date = new Date(event.start);
    const dayOfWeek = date.getDay();
    const timeSlot = `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;

    dayCounts[dayOfWeek] = (dayCounts[dayOfWeek] || 0) + 1;
    timeCounts[timeSlot] = (timeCounts[timeSlot] || 0) + 1;
  });

  const preferredDays = Object.entries(dayCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([day]) => parseInt(day));

  const preferredTimes = Object.entries(timeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([time]) => time);

  return { preferredDays, preferredTimes };
}

function analyzeGamePatterns(events: CalendarEvent[]) {
  // Analyze game scheduling patterns
  const weekendGames = events.filter((e) => {
    const day = new Date(e.start).getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  });

  const weekdayGames = events.filter((e) => {
    const day = new Date(e.start).getDay();
    return day >= 1 && day <= 5; // Monday to Friday
  });

  return {
    prefersWeekends: weekendGames.length > weekdayGames.length,
    weekendRatio: weekendGames.length / Math.max(events.length, 1),
  };
}

function generatePracticeSuggestions(
  patterns: { preferredDays: number[]; preferredTimes: string[] },
  allEvents: CalendarEvent[],
  startDate: Date,
  endDate: Date
): EventSuggestion[] {
  const suggestions: EventSuggestion[] = [];

  // Check each preferred day/time combination
  patterns.preferredDays.forEach((dayOfWeek) => {
    patterns.preferredTimes.forEach((timeSlot) => {
      const [hours, minutes] = timeSlot.split(":").map(Number);

      // Generate suggestions for the next 2 weeks
      for (let week = 0; week < 2; week++) {
        const suggestedDate = new Date(startDate);
        suggestedDate.setDate(startDate.getDate() + week * 7);

        // Find the next occurrence of the preferred day
        while (suggestedDate.getDay() !== dayOfWeek) {
          suggestedDate.setDate(suggestedDate.getDate() + 1);
        }

        suggestedDate.setHours(hours, minutes, 0, 0);

        if (suggestedDate >= startDate && suggestedDate <= endDate) {
          // Check for conflicts
          const conflicts = findConflicts(suggestedDate, 90, allEvents); // 90 min practice

          const confidence = calculatePracticeConfidence(
            suggestedDate,
            patterns,
            conflicts.length
          );

          if (confidence > 0.3) {
            // Only suggest if reasonably confident
            suggestions.push({
              id: `practice-${suggestedDate.getTime()}`,
              title: "Suggested Practice Session",
              type: "practice",
              suggestedDate,
              suggestedTime: timeSlot,
              duration: 90,
              confidence,
              reasoning: generatePracticeReasoning(
                suggestedDate,
                patterns,
                conflicts
              ),
              conflicts: conflicts.map((c) => c.title),
              benefits: [
                "Follows established team routine",
                "Optimizes player availability",
                "Maintains consistent training schedule",
              ],
            });
          }
        }
      }
    });
  });

  return suggestions;
}

function generateGameSuggestions(
  patterns: { prefersWeekends: boolean; weekendRatio: number },
  allEvents: CalendarEvent[],
  startDate: Date,
  endDate: Date
): EventSuggestion[] {
  const suggestions: EventSuggestion[] = [];

  // Suggest games on preferred days
  const preferredDays = patterns.prefersWeekends ? [0, 6] : [5, 6]; // Sat/Sun or Fri/Sat

  preferredDays.forEach((dayOfWeek) => {
    // Check afternoon/evening slots
    [14, 15, 16, 17, 18, 19].forEach((hour) => {
      // 2 PM to 7 PM
      const suggestedDate = new Date(startDate);
      suggestedDate.setHours(hour, 0, 0, 0);

      // Find next occurrence of preferred day
      while (suggestedDate.getDay() !== dayOfWeek) {
        suggestedDate.setDate(suggestedDate.getDate() + 1);
      }

      if (suggestedDate >= startDate && suggestedDate <= endDate) {
        const conflicts = findConflicts(suggestedDate, 120, allEvents); // 2 hour games

        const confidence = calculateGameConfidence(
          suggestedDate,
          patterns,
          conflicts.length
        );

        if (confidence > 0.4) {
          suggestions.push({
            id: `game-${suggestedDate.getTime()}`,
            title: "Suggested Game Time",
            type: "game",
            suggestedDate,
            suggestedTime: `${hour}:00`,
            duration: 120,
            confidence,
            reasoning: generateGameReasoning(
              suggestedDate,
              patterns,
              conflicts
            ),
            conflicts: conflicts.map((c) => c.title),
            benefits: [
              "Aligns with team's preferred game schedule",
              "Maximizes attendance potential",
              "Follows historical game timing patterns",
            ],
          });
        }
      }
    });
  });

  return suggestions;
}

function findConflicts(
  proposedStart: Date,
  durationMinutes: number,
  events: CalendarEvent[]
): CalendarEvent[] {
  const proposedEnd = new Date(
    proposedStart.getTime() + durationMinutes * 60 * 1000
  );

  return events.filter((event) => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end || event.start);

    // Check for overlap
    return proposedStart < eventEnd && proposedEnd > eventStart;
  });
}

function calculatePracticeConfidence(
  date: Date,
  patterns: { preferredDays: number[]; preferredTimes: string[] },
  conflictCount: number
): number {
  let confidence = 0.5; // Base confidence

  // Boost for preferred days
  if (patterns.preferredDays.includes(date.getDay())) {
    confidence += 0.2;
  }

  // Boost for preferred times
  const timeSlot = `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
  if (patterns.preferredTimes.includes(timeSlot)) {
    confidence += 0.2;
  }

  // Reduce for conflicts
  confidence -= conflictCount * 0.1;

  // Reduce for weekends (practices are usually weekdays)
  if (date.getDay() === 0 || date.getDay() === 6) {
    confidence -= 0.1;
  }

  return Math.max(0, Math.min(1, confidence));
}

function calculateGameConfidence(
  date: Date,
  patterns: { prefersWeekends: boolean; weekendRatio: number },
  conflictCount: number
): number {
  let confidence = 0.6; // Base confidence

  // Boost for preferred weekend/weekday pattern
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  if (patterns.prefersWeekends === isWeekend) {
    confidence += 0.2;
  }

  // Boost based on historical weekend ratio
  if (isWeekend && patterns.weekendRatio > 0.5) {
    confidence += 0.1;
  }

  // Reduce for conflicts
  confidence -= conflictCount * 0.15;

  // Reduce for very early morning or late night
  const hour = date.getHours();
  if (hour < 9 || hour > 21) {
    confidence -= 0.2;
  }

  return Math.max(0, Math.min(1, confidence));
}

function generatePracticeReasoning(
  date: Date,
  patterns: { preferredDays: number[]; preferredTimes: string[] },
  conflicts: CalendarEvent[]
): string {
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayName = dayNames[date.getDay()];

  let reasoning = `Suggested ${dayName} practice based on team's routine. `;

  if (patterns.preferredDays.includes(date.getDay())) {
    reasoning += `This is one of your most common practice days. `;
  }

  if (conflicts.length > 0) {
    reasoning += `Note: ${conflicts.length} potential conflict(s) detected. `;
  } else {
    reasoning += `No scheduling conflicts found. `;
  }

  return reasoning;
}

function generateGameReasoning(
  date: Date,
  patterns: { prefersWeekends: boolean; weekendRatio: number },
  conflicts: CalendarEvent[]
): string {
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayName = dayNames[date.getDay()];

  let reasoning = `Suggested ${dayName} game time aligns with team's scheduling preferences. `;

  if (patterns.prefersWeekends) {
    reasoning += `Your team typically plays on weekends. `;
  } else {
    reasoning += `Your team often schedules games on weekdays. `;
  }

  if (conflicts.length > 0) {
    reasoning += `Note: ${conflicts.length} potential conflict(s) detected. `;
  } else {
    reasoning += `No scheduling conflicts found. `;
  }

  return reasoning;
}
