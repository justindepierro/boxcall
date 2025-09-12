import { logger } from "./logger";
// Lightweight telemetry dispatcher skeleton
// Provides enqueue + flush (console output for now); future: send to Supabase edge function or REST endpoint.

import type { TelemetryEvent } from "./types";

interface DispatcherOptions {
  flushIntervalMs?: number;
  maxBuffer?: number;
  onFlush?: (events: TelemetryEvent[]) => void;
}

export class TelemetryDispatcher {
  private buffer: TelemetryEvent[] = [];
  private timer: number | null = null;
  private readonly flushIntervalMs: number;
  private readonly maxBuffer: number;
  private readonly onFlush?: (events: TelemetryEvent[]) => void;

  constructor(opts: DispatcherOptions = {}) {
    this.flushIntervalMs = opts.flushIntervalMs ?? 5000;
    this.maxBuffer = opts.maxBuffer ?? 40;
    this.onFlush = opts.onFlush;
    if (typeof window !== "undefined") {
      const handler = () => this.flush();
      window.addEventListener("visibilitychange", handler);
      window.addEventListener("pagehide", handler);
      window.addEventListener("beforeunload", handler);
    }
  }

  enqueue(event: Omit<TelemetryEvent, "ts">) {
    const e: TelemetryEvent = { ...event, ts: Date.now() };
    this.buffer.push(e);
    if (this.buffer.length >= this.maxBuffer) {
      this.flush();
    } else if (this.timer == null) {
      this.timer = window.setTimeout(() => this.flush(), this.flushIntervalMs);
    }
  }

  flush() {
    if (!this.buffer.length) return;
    const toSend = this.buffer.splice(0, this.buffer.length);
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    // For now, just log; later replace with network send
    if (this.onFlush) {
      try {
        this.onFlush(toSend);
      } catch (err) {
        logger.warn("Telemetry onFlush failed", {
          err: (err as Error)?.message,
        });
      }
    } else {
      logger.debug("[telemetry:flush]", { count: toSend.length });
    }
  }

  shutdown() {
    this.flush();
  }
}

// Persistence injection to avoid import cycle
export type TelemetryPersist = (
  events: TelemetryEvent[]
) => Promise<void> | void;
let _persist: TelemetryPersist | null = null;
export function setTelemetryPersist(fn: TelemetryPersist) {
  _persist = fn;
}

export const telemetry = new TelemetryDispatcher({
  onFlush: (events) => {
    if (_persist) void _persist(events);
  },
});
