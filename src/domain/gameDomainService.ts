// src/domain/gameDomainService.ts
// GameDomainService: Example event bus integration for domain isolation

import { eventBus } from "../lib/eventBus";

export type GameCreatedPayload = {
  gameId: string;
  teamId: string;
  opponent: string;
  date: string;
};

export function publishGameCreated(payload: GameCreatedPayload) {
  eventBus.publish({ type: "game:created", payload });
}

export function subscribeToGameCreated(
  handler: (payload: GameCreatedPayload) => void
) {
  return eventBus.subscribe("game:created", (event) => {
    if (event.payload && typeof event.payload === "object") {
      handler(event.payload as GameCreatedPayload);
    }
  });
}

// Usage:
// publishGameCreated({ gameId, teamId, opponent, date });
// subscribeToGameCreated((payload) => { ... });
