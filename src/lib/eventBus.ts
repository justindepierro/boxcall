// src/lib/eventBus.ts
// Domain Event Bus for Practice/Game/Playbook isolation

export type DomainEvent = {
  type: string;
  payload?: unknown;
};

export type EventHandler = (event: DomainEvent) => void;

class EventBus {
  private handlers: { [type: string]: EventHandler[] } = {};

  subscribe(type: string, handler: EventHandler) {
    if (!this.handlers[type]) {
      this.handlers[type] = [];
    }
    this.handlers[type].push(handler);
    return () => this.unsubscribe(type, handler);
  }

  unsubscribe(type: string, handler: EventHandler) {
    if (!this.handlers[type]) return;
    this.handlers[type] = this.handlers[type].filter((h) => h !== handler);
  }

  publish(event: DomainEvent) {
    const { type } = event;
    if (this.handlers[type]) {
      this.handlers[type].forEach((handler) => handler(event));
    }
  }
}

export const eventBus = new EventBus();

// Usage Example:
// eventBus.subscribe('practice:created', (event) => { ... });
// eventBus.publish({ type: 'practice:created', payload: { ... } });
