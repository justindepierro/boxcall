// src/domain/practiceDomainService.ts
// PracticeDomainService: Example event bus integration for domain isolation

import { eventBus } from "../lib/eventBus";

export type PracticeCreatedPayload = {
  practiceId: string;
  teamId: string;
  date: string;
};

export function publishPracticeCreated(payload: PracticeCreatedPayload) {
  eventBus.publish({ type: "practice:created", payload });
}

export function subscribeToPracticeCreated(
  handler: (payload: PracticeCreatedPayload) => void
) {
  return eventBus.subscribe("practice:created", (event) => {
    if (event.payload && typeof event.payload === "object") {
      handler(event.payload as PracticeCreatedPayload);
    }
  });
}

// Usage:
// publishPracticeCreated({ practiceId, teamId, date });
// subscribeToPracticeCreated((payload) => { ... });
